import { NextResponse } from "next/server";

interface GenerateStoryRequestBody {
  content: string;
  topic: string;
  language: string;
}

const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const GROQ_API_KEY = process.env.GROQ_API_KEY || "";

async function callOllama(prompt: string): Promise<string> {
  const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "llama3",
      messages: [{ role: "user", content: prompt }],
      stream: false,
    }),
  });
  if (!res.ok) throw new Error(`Ollama error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.message?.content || "";
}

async function callGroq(prompt: string): Promise<string> {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1024,
    }),
  });
  if (!res.ok) throw new Error(`Groq error ${res.status}: ${await res.text()}`);
  const data = await res.json();
  return data.choices?.[0]?.message?.content || "";
}

async function callAI(prompt: string): Promise<string> {
  try {
    const result = await callOllama(prompt);
    if (!result) throw new Error("Empty response from Ollama");
    return result;
  } catch {
    if (!GROQ_API_KEY) throw new Error("Ollama failed and GROQ_API_KEY is not set");
    return callGroq(prompt);
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const body: GenerateStoryRequestBody = await req.json();

    if (!body.content || !body.topic || !body.language) {
      return NextResponse.json(
        { error: "Content, topic, and language are required" },
        { status: 400 }
      );
    }

    const languageMap: Record<string, string> = {
      english: "English",
      hindi: "Hindi (हिंदी)",
      hinglish: "Hinglish (mix of Hindi and English)",
    };
    const languageName = languageMap[body.language.toLowerCase()] || body.language;

    const prompt = `You are a friendly teacher explaining a topic in a story-like format.

IMPORTANT: You MUST write the ENTIRE response in ${languageName} language. Do not use English unless the language is English or Hinglish.

Topic: "${body.topic}"
Content to explain: "${body.content}"

Instructions:
1. Write the ENTIRE explanation in ${languageName} language only.
2. Use a simple, engaging, and story-like format suitable for beginners.
3. Use friendly storytelling with examples and analogies.
4. Avoid technical jargon - explain in simple terms.
5. Make it feel like a human teacher is explaining naturally.
6. Keep it engaging and easy to understand.
7. Use real-world examples when possible.

Now, write the explanation story in ${languageName}:`;

    const story = await callAI(prompt);
    return NextResponse.json({ story }, { status: 200 });

  } catch (error) {
    const msg = error instanceof Error ? error.message : "Unknown error occurred";
    return NextResponse.json({ error: `Failed to generate story: ${msg}` }, { status: 500 });
  }
}
