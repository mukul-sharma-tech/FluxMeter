// app/api/analyze-serp/route.ts
import { NextResponse } from "next/server";
import { scrapeDDG, fetchWithJina, analyzeCompetitors } from "@/utils/serp";
import { scoreAIDetection, scoreSnippetReadiness, estimateTraffic, suggestInternalLinks, extractKeywordClusters, scorePromptClarity } from "@/utils/metrics";
import { createClient } from "@/utils/supabase/server";

const GROQ_API_KEY = process.env.GROQ_API_KEY || "";
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
const JINA_API_KEY = process.env.JINA_API_KEY || ""; // optional — works without key too

async function callAI(prompt: string, system: string): Promise<string> {
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ model: "llama3", messages: [{ role: "system", content: system }, { role: "user", content: prompt }], stream: false }),
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) throw new Error("Ollama failed");
    const d = await res.json();
    return d.message?.content || "";
  } catch {
    const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${GROQ_API_KEY}` },
      body: JSON.stringify({ model: "llama-3.3-70b-versatile", messages: [{ role: "system", content: system }, { role: "user", content: prompt }], temperature: 0.1, max_tokens: 1024 }),
    });
    const d = await res.json();
    return d.choices?.[0]?.message?.content || "";
  }
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { blogId, keyword } = await req.json();
    if (!blogId || !keyword) return NextResponse.json({ error: "blogId and keyword required" }, { status: 400 });

    const supabase = await createClient();

    const { data: blog } = await supabase.from("blogs").select("content, trend_score").eq("id", blogId).single();
    const { data: allBlogs } = await supabase.from("blogs").select("keyword").neq("id", blogId);

    const content = blog?.content || "";
    const trendScore = blog?.trend_score || 50;
    const allKeywords = (allBlogs || []).map((b: { keyword: string }) => b.keyword).filter(Boolean);

    // Step 1: DuckDuckGo — get top competitor URLs
    console.log("[SERP] Scraping DuckDuckGo for:", keyword);
    const serpResults = await scrapeDDG(keyword, 5);
    console.log(`[SERP] Found ${serpResults.length} results`);

    // Step 2: Jina Reader — fetch actual content from top 3 competitor pages
    const enrichedResults = await Promise.all(
      serpResults.slice(0, 3).map(async (r) => {
        console.log(`[Jina] Fetching: ${r.url}`);
        const fetchedContent = await fetchWithJina(r.url, JINA_API_KEY || undefined);
        return { ...r, content: fetchedContent };
      })
    );
    // Keep remaining results without content
    const allResults = [...enrichedResults, ...serpResults.slice(3)];

    // Step 3: AI competitor analysis using real content
    console.log("[SERP] Running AI competitor analysis...");
    const competitorAnalysis = await analyzeCompetitors(keyword, allResults, content, callAI);

    // Step 4: All other metrics
    const aiDetection = scoreAIDetection(content);
    const snippetReadiness = scoreSnippetReadiness(content);
    const trafficPotential = estimateTraffic(trendScore, keyword);
    const internalLinks = suggestInternalLinks(keyword, allKeywords, content);
    const keywordClusters = extractKeywordClusters(keyword, content);
    const promptClarity = scorePromptClarity(content, keyword);

    const metrics = {
      aiDetectionScore: aiDetection.aiScore,
      naturalnessScore: aiDetection.naturalnessScore,
      snippetReadiness,
      trafficPotential,
      internalLinkSuggestions: internalLinks,
      keywordClusters,
      promptClarity,
      serpGaps: competitorAnalysis.serpGaps,
      competitorTopics: competitorAnalysis.competitorTopics,
      painPoints: competitorAnalysis.painPoints,
      topSERPResults: competitorAnalysis.topResults.slice(0, 5),
      dominantDomains: competitorAnalysis.dominantDomains,
    };

    // Save metrics back to DB — merge with existing ai_suggestions
    const { data: existing } = await supabase.from("blogs").select("ai_suggestions").eq("id", blogId).single();
    let existingData: Record<string, unknown> = {};
    try { if (existing?.ai_suggestions) existingData = JSON.parse(existing.ai_suggestions); } catch { /* */ }

    await supabase.from("blogs").update({
      ai_suggestions: JSON.stringify({ ...existingData, metrics }),
    }).eq("id", blogId);

    return NextResponse.json(metrics, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[analyze-serp]", msg);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
