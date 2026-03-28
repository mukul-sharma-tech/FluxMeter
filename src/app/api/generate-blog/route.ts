// app/api/generate-blog/route.ts
import { createClient } from "@/utils/supabase/server";
import { analyzeTrends } from "@/utils/trends";
import { getSEOScore } from "@/utils/seo";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

async function _callOllama(prompt: string, systemPrompt: string): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }],
        stream: false,
      }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Ollama error ${res.status}`);
    const data = await res.json();
    return data.message?.content || "";
  } finally {
    clearTimeout(timeout);
  }
}

async function _callGroq(prompt: string, systemPrompt: string): Promise<string> {
  if (!GROQ_API_KEY) throw new Error("GROQ_API_KEY is not set in .env.local");
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }],
      temperature: 0.1,
      max_tokens: 4096,
    }),
  });
  if (!res.ok) throw new Error(`Groq error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callAI(prompt: string, systemPrompt: string): Promise<string> {
  try {
    const result = await _callOllama(prompt, systemPrompt);
    if (!result) throw new Error("Empty response from Ollama");
    return result;
  } catch {
    return _callGroq(prompt, systemPrompt);
  }
}

import * as esbuild from "esbuild";

// TS/content validation for blog markdown — uses esbuild to compile any code blocks
async function validateBlogContent(content: string): Promise<{ isValid: boolean; error?: string; cleaned: string }> {
  let cleaned = content;

  // Strip markdown code fences and collect any TS/TSX/JS blocks for esbuild validation
  const codeBlockRegex = /```(tsx?|jsx?|javascript|typescript)?\n([\s\S]*?)```/g;
  const codeBlocks: string[] = [];
  let match;
  while ((match = codeBlockRegex.exec(content)) !== null) {
    codeBlocks.push(match[2]);
  }

  // Run esbuild on any extracted code blocks
  for (const block of codeBlocks) {
    try {
      await esbuild.transform(block, { loader: "tsx", target: "es2020", jsx: "transform" });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      return { isValid: false, error: `Code block failed compilation: ${msg}`, cleaned };
    }
  }

  // Strip all code fences from final content
  cleaned = cleaned.replace(/```[\w]*\n[\s\S]*?```/g, "");

  // Strip stray import/require lines
  cleaned = cleaned.replace(/^import\s+.+from\s+['"].+['"];?\s*/gm, "");
  cleaned = cleaned.replace(/^const\s+\w+\s*=\s*require\(.+\);?\s*/gm, "");

  // Reject if AI hallucinated render() calls or JSX components outside code blocks
  if (/render\(</.test(cleaned)) {
    return { isValid: false, error: "Blog contains render() calls outside code blocks", cleaned };
  }
  if (/<[A-Z][a-zA-Z]+\s*\/>|<[A-Z][a-zA-Z]+\s+[^>]*>/.test(cleaned)) {
    return { isValid: false, error: "Blog contains JSX components outside code blocks", cleaned };
  }

  // Must still have markdown headings
  if (!cleaned.includes("#")) {
    return { isValid: false, error: "Blog missing headings after cleanup", cleaned };
  }

  if (cleaned.trim().length < 500) {
    return { isValid: false, error: `Blog too short after cleanup (${cleaned.trim().length} chars)`, cleaned };
  }

  return { isValid: true, cleaned: cleaned.trim() };
}

const BLOG_SYSTEM_PROMPT = `You are an expert SEO content writer. Generate a comprehensive blog post in Markdown format.
Requirements:
- H1 title, H2 main sections, H3 subsections
- At least 5 H2 sections
- FAQ section at the end with 3-5 questions
- Bullet point lists throughout
- Keyword used 5-20 times naturally
- Meta description at the top: "Meta Description: ..."
- At least 1200 characters
- Output ONLY Markdown, no code fences`;

const AI_SEO_REVIEW_PROMPT = `You are an expert SEO consultant. Review the blog post and return ONLY a JSON object:
{
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "improvedIntro": "A better opening paragraph",
  "missingTopics": ["topic 1", "topic 2"]
}`;

export async function POST(req: Request): Promise<Response> {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    async start(controller) {
      function send(step: string, message: string, progress: number, error?: string) {
        const payload = JSON.stringify({ step, message, progress, error }) + "\n";
        controller.enqueue(encoder.encode(payload));
      }

      try {
        const body = await req.json();
        if (!body.keyword || typeof body.keyword !== "string") {
          send("error", "Keyword is required", 0, "Keyword is required");
          controller.close();
          return;
        }

        const keyword: string = body.keyword;

        // Step 1: Trends
        send("trends", "Analyzing Google Trends...", 10);
        const trends = analyzeTrends(keyword);
        send("trends", `Trend score: ${trends.trendScore}/100 — ${trends.direction}`, 20);

        // Step 2: Insert DB row
        send("saving", "Creating blog entry...", 25);
        const supabase = await createClient();
        const { data, error: insertError } = await supabase
          .from("blogs")
          .insert([{ keyword, status: "generating", trend_score: trends.trendScore }])
          .select("id")
          .single();

        if (insertError || !data) {
          send("error", "Failed to create blog entry", 25, insertError?.message || "DB insert failed");
          controller.close();
          return;
        }

        const blogId = data.id;

        // Step 3: Generate blog
        send("generating", "Generating blog content with AI...", 35);
        const MAX_ATTEMPTS = 3;
        const SEO_THRESHOLD = 60;
        let blogContent = "";
        let seoResult = getSEOScore("", keyword);

        for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
          send("generating", `AI writing blog (attempt ${attempt}/${MAX_ATTEMPTS})...`, 35 + attempt * 10);
          try {
            const generated = await callAI(
              `Write a comprehensive, SEO-optimized blog post about: "${keyword}". Make it detailed and engaging.`,
              BLOG_SYSTEM_PROMPT
            );

            if (!generated || generated.length < 500) {
              send("generating", `Attempt ${attempt}: content too short, retrying...`, 35 + attempt * 10);
              continue;
            }

            // TS/content validation
            send("validation", `Attempt ${attempt}: running esbuild + content validation...`, 35 + attempt * 10);
            const validation = await validateBlogContent(generated);
            if (!validation.isValid) {
              send("validation", `Attempt ${attempt}: validation failed (${validation.error}), retrying...`, 35 + attempt * 10);
              continue;
            }

            blogContent = validation.cleaned;
            send("validation", `Content validation passed ✓`, 60);
            break;
          } catch (aiErr) {
            const msg = aiErr instanceof Error ? aiErr.message : String(aiErr);
            if (attempt === MAX_ATTEMPTS) {
              send("error", `AI generation failed: ${msg}`, 35 + attempt * 10, msg);
              await supabase.from("blogs").update({ status: "failed" }).eq("id", blogId);
              controller.close();
              return;
            }
            send("generating", `Attempt ${attempt} failed: ${msg}. Retrying...`, 35 + attempt * 10);
          }
        }

        if (!blogContent) {
          send("error", "Failed to generate blog content after all attempts", 60, "All generation attempts failed");
          await supabase.from("blogs").update({ status: "failed" }).eq("id", blogId);
          controller.close();
          return;
        }

        // Step 4: SEO validation
        send("seo", "Running SEO analysis...", 65);
        for (let s = 1; s <= 2; s++) {
          seoResult = getSEOScore(blogContent, keyword);
          send("seo", `SEO score: ${seoResult.score}/100${seoResult.score < SEO_THRESHOLD ? " — improving..." : " ✓"}`, 65 + s * 5);
          if (seoResult.score >= SEO_THRESHOLD) break;
          if (s < 2) {
            try {
              const improved = await callAI(
                `Improve this blog to fix SEO issues:\n${seoResult.suggestions.join("\n")}\n\nBlog:\n${blogContent}`,
                BLOG_SYSTEM_PROMPT
              );
              if (improved && improved.length > 500) {
                const v = await validateBlogContent(improved);
                if (v.isValid) blogContent = v.cleaned;
              }
            } catch { break; }
          }
        }

        // Step 5: AI SEO review
        send("review", "Running AI SEO review...", 80);
        let aiSuggestions = "";
        try {
          const raw = await callAI(
            `Keyword: "${keyword}"\n\nBlog Content:\n${blogContent.slice(0, 3000)}`,
            AI_SEO_REVIEW_PROMPT
          );
          const match = raw.match(/\{[\s\S]*\}/);
          aiSuggestions = match
            ? JSON.stringify(JSON.parse(match[0]))
            : JSON.stringify({ suggestions: [raw.slice(0, 500)] });
          send("review", "AI SEO review complete ✓", 88);
        } catch {
          aiSuggestions = JSON.stringify({ suggestions: seoResult.suggestions });
          send("review", "AI review skipped, using internal suggestions", 88);
        }

        // Step 6: Save
        send("saving", "Saving blog to database...", 92);
        await supabase.from("blogs").update({
          content: blogContent,
          status: "generated",
          seo_score: seoResult.score,
          trend_score: trends.trendScore,
          ai_suggestions: aiSuggestions,
          attempts: MAX_ATTEMPTS,
        }).eq("id", blogId);

        send("done", `Blog generated! SEO: ${seoResult.score}/100, Trend: ${trends.trendScore}/100`, 100);
        controller.enqueue(encoder.encode(JSON.stringify({ done: true, blogId, seoScore: seoResult.score, trendScore: trends.trendScore }) + "\n"));

      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("[generate-blog]", msg);
        send("error", msg, 0, msg);
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: { "Content-Type": "text/plain; charset=utf-8", "X-Content-Type-Options": "nosniff" },
  });
}
