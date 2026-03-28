// app/api/chat-blog/route.ts
import { NextResponse } from "next/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

async function callGroq(messages: { role: string; content: string }[]): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages,
      temperature: 0.3,
      max_tokens: 4096,
    }),
  });
  if (!res.ok) throw new Error(`Groq error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callOllama(messages: { role: string; content: string }[]): Promise<string> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "llama3", messages, stream: false }),
      signal: controller.signal,
    });
    if (!res.ok) throw new Error(`Ollama error ${res.status}`);
    const data = await res.json();
    return data.message?.content || "";
  } finally {
    clearTimeout(timeout);
  }
}

async function callAI(messages: { role: string; content: string }[]): Promise<string> {
  try {
    const r = await callOllama(messages);
    if (!r) throw new Error("empty");
    return r;
  } catch {
    return callGroq(messages);
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { blogContent, userMessage, history } = await req.json();

    if (!blogContent || !userMessage) {
      return NextResponse.json({ error: "blogContent and userMessage required" }, { status: 400 });
    }

    const systemPrompt = `You are an expert blog editor and SEO specialist. The user has a blog post and wants to make changes or improvements to it.

When the user asks you to modify the blog:
1. Return the COMPLETE updated blog in Markdown format inside <blog> tags
2. Also provide a brief explanation of what you changed outside the tags

When the user asks questions or wants advice (not actual edits):
1. Just answer conversationally — do NOT return <blog> tags unless you're making actual changes

Current blog content:
---
${blogContent.slice(0, 6000)}
---`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...(history || []),
      { role: "user", content: userMessage },
    ];

    const response = await callAI(messages);

    // Extract updated blog if present
    const blogMatch = response.match(/<blog>([\s\S]*?)<\/blog>/);
    const updatedBlog = blogMatch ? blogMatch[1].trim() : null;
    const explanation = response.replace(/<blog>[\s\S]*?<\/blog>/g, "").trim();

    return NextResponse.json({ reply: explanation || response, updatedBlog }, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
