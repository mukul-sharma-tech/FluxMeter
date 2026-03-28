// app/api/inngest/route.ts
import { inngest } from "@/lib/inngest";
import { serve } from "inngest/next";
import { createClient } from "@/utils/supabase/server";
import { traceable } from "langsmith/traceable";
import * as esbuild from "esbuild";

import { SYSTEM_PROMPT } from "@/utils/supabase/SYSTEM_PROMPT";
import { getSEOScore } from "@/utils/seo";

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

async function _callOllama(prompt: string, systemPrompt: string): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3",
      messages: [{ role: "system", content: systemPrompt }, { role: "user", content: prompt }],
      stream: false,
    }),
  });
  if (!res.ok) throw new Error(`Ollama error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.message?.content || "";
}

async function _callGroq(prompt: string, systemPrompt: string): Promise<string> {
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
    console.log("[AI] Trying Ollama llama3...");
    const result = await _callOllama(prompt, systemPrompt);
    if (!result) throw new Error("Ollama returned empty response");
    return result;
  } catch (err) {
    console.warn("[AI] Ollama failed, falling back to Groq:", err);
    if (!GROQ_API_KEY) throw new Error("Ollama failed and GROQ_API_KEY is not set");
    return _callGroq(prompt, systemPrompt);
  }
}

const getSupabaseClient = () => createClient();

if (!process.env.LANGCHAIN_API_KEY) {
  console.warn("LANGCHAIN_API_KEY is not set - LangSmith tracing will be disabled");
}

function expandPrompt(outline: string): string {
  const templates = [
    (t: string) => `Create an interactive React lesson teaching "${t}" in a fun, visual way with quizzes or sliders. Fully responsive.`,
    (t: string) => `Design a self-contained React lesson for "${t}" with interactivity and visual feedback. Mobile-first.`,
    (t: string) => `Generate a mini interactive React component explaining "${t}" with examples and dynamic visuals.`,
    (t: string) => `Teach "${t}" as a friendly AI tutor using React interactivity. Ensure responsive layout.`,
  ];
  return templates[Math.floor(Math.random() * templates.length)](outline);
}

const validateTsxSyntax = async (tsxCode: string): Promise<{ isValid: boolean; error?: string }> => {
  try {
    await esbuild.transform(tsxCode, { loader: "tsx", target: "es2020", jsx: "transform" });
    if (tsxCode.includes("require(")) throw new Error("Uses require() instead of import.");
    if (!tsxCode.includes("import React") || !tsxCode.includes("const LessonComponent") || !tsxCode.includes("render(<LessonComponent />)")) {
      throw new Error("Missing required markers.");
    }
    return { isValid: true };
  } catch (e) {
    return { isValid: false, error: e instanceof Error ? e.message : String(e) };
  }
};

const generateWithAI = traceable(
  async (outline: string, systemPrompt: string) => callAI(outline, systemPrompt),
  { name: "generate-lesson-code" }
);

const generateBlogWithAI = traceable(
  async (prompt: string, systemPrompt: string) => callAI(prompt, systemPrompt),
  { name: "generate-blog-content" }
);

const AI_SEO_REVIEW_PROMPT = `You are an expert SEO consultant. Review the blog post and return ONLY a JSON object:
{
  "suggestions": ["suggestion 1", "suggestion 2", "suggestion 3"],
  "improvedIntro": "A better opening paragraph",
  "missingTopics": ["topic 1", "topic 2"]
}`;

const reviewBlogSEO = traceable(
  async (blogContent: string, keyword: string) =>
    callAI(`Keyword: "${keyword}"\n\nBlog Content:\n${blogContent.slice(0, 3000)}`, AI_SEO_REVIEW_PROMPT),
  { name: "review-blog-seo" }
);

const generateLessonFn = inngest.createFunction(
  { id: "generate-lesson-fn" },
  { event: "lesson/generate" },
  async ({ event }: { event: { data: { lessonId: string; outline: string } } }) => {
    const { lessonId, outline } = event.data;
    const supabase = await getSupabaseClient();
    console.log(`[Lesson] Generating ${lessonId}`);
    try {
      const MAX_ATTEMPTS = 3;
      let tsxContent = "";
      let validation: { isValid: boolean; error?: string } = { isValid: false, error: "No attempts." };
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        const code = await generateWithAI(expandPrompt(outline), SYSTEM_PROMPT);
        if (!code) { validation = { isValid: false, error: "Empty content." }; continue; }
        validation = await validateTsxSyntax(code);
        if (validation.isValid) { tsxContent = code; break; }
        console.warn(`[Lesson] Attempt ${attempt} failed: ${validation.error}`);
      }
      if (!tsxContent) throw new Error(`Failed after attempts. Last: ${validation.error}`);
      const { error } = await supabase.from("lessons").update({ content: tsxContent, status: "generated" }).eq("id", lessonId);
      if (error) throw new Error(`Supabase: ${error.message}`);
      return { success: true, lessonId };
    } catch (err: unknown) {
      console.error("[Lesson] Failed:", err instanceof Error ? err.message : err);
      await supabase.from("lessons").update({ status: "failed" }).eq("id", lessonId);
      throw err;
    }
  }
);

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

const generateBlogFn = inngest.createFunction(
  { id: "generate-blog-fn" },
  { event: "blog/generate" },
  async ({ event }: { event: { data: { blogId: string; keyword: string; trendScore: number; trendDirection: string } } }) => {
    const { blogId, keyword, trendScore, trendDirection } = event.data;
    const supabase = await getSupabaseClient();
    console.log(`[Blog] Generating ${blogId} for: "${keyword}"`);
    try {
      const MAX_ATTEMPTS = 3;
      const SEO_THRESHOLD = 60;
      let blogContent = "";
      let seoResult: import("@/utils/seo").SEOResult = {
        score: 0, suggestions: [],
        breakdown: { keywordDensity: 0, headings: 0, faq: 0, length: 0, lists: 0, readability: 0, meta: 0 },
      };
      for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
        console.log(`[Blog] Attempt ${attempt}/${MAX_ATTEMPTS}`);
        const generated = await generateBlogWithAI(`Write a comprehensive SEO blog post about: "${keyword}".`, BLOG_SYSTEM_PROMPT);
        if (!generated || generated.length < 500) { console.warn(`[Blog] Attempt ${attempt}: too short`); continue; }
        if (!generated.includes("#")) { console.warn(`[Blog] Attempt ${attempt}: no headings`); continue; }
        blogContent = generated;
        for (let s = 1; s <= MAX_ATTEMPTS; s++) {
          seoResult = getSEOScore(blogContent, keyword);
          console.log(`[Blog] SEO attempt ${s}: ${seoResult.score}`);
          if (seoResult.score >= SEO_THRESHOLD) break;
          if (s < MAX_ATTEMPTS) {
            const improved = await generateBlogWithAI(`Fix SEO issues:\n${seoResult.suggestions.join("\n")}\n\nBlog:\n${blogContent}`, BLOG_SYSTEM_PROMPT);
            if (improved && improved.length > 500) blogContent = improved;
          }
        }
        if (seoResult.score >= SEO_THRESHOLD) break;
      }
      if (!blogContent) throw new Error("Failed to generate blog after all attempts");
      let aiSuggestions = "";
      try {
        const raw = await reviewBlogSEO(blogContent, keyword);
        const match = raw.match(/\{[\s\S]*\}/);
        aiSuggestions = match ? JSON.stringify(JSON.parse(match[0])) : JSON.stringify({ suggestions: [raw.slice(0, 500)] });
      } catch { aiSuggestions = JSON.stringify({ suggestions: seoResult.suggestions }); }
      const { error } = await supabase.from("blogs").update({
        content: blogContent, status: "generated",
        seo_score: seoResult.score, trend_score: trendScore,
        ai_suggestions: aiSuggestions, attempts: MAX_ATTEMPTS,
      }).eq("id", blogId);
      if (error) throw new Error(`Supabase: ${error.message}`);
      console.log(`[Blog] Done ${blogId} SEO:${seoResult.score} Trend:${trendScore}`);
      return { success: true, blogId, seoScore: seoResult.score, trendScore, trendDirection };
    } catch (err: unknown) {
      console.error(`[Blog] Failed:`, err instanceof Error ? err.message : err);
      await supabase.from("blogs").update({ status: "failed" }).eq("id", blogId);
      throw err;
    }
  }
);

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [generateLessonFn, generateBlogFn],
});
