// utils/serp.ts — DuckDuckGo SERP + Jina Reader for competitor content analysis

export interface SERPResult {
  title: string;
  url: string;
  snippet: string;
  domain: string;
  content?: string; // fetched via Jina
}

export interface CompetitorAnalysis {
  topResults: SERPResult[];
  competitorTopics: string[];
  serpGaps: string[];
  painPoints: string[];
  dominantDomains: string[];
}

// ── Step 1: DuckDuckGo — get top URLs ─────────────────────
export async function scrapeDDG(keyword: string, maxResults = 6): Promise<SERPResult[]> {
  try {
    const query = encodeURIComponent(keyword);
    const url = `https://html.duckduckgo.com/html/?q=${query}`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "en-US,en;q=0.9",
      },
    });

    if (!res.ok) throw new Error(`DDG fetch failed: ${res.status}`);
    const html = await res.text();

    const results: SERPResult[] = [];

    // Extract result links and snippets via regex
    const linkPattern = /class="result__a"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/g;
    const snippetPattern = /class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;

    const links: { url: string; title: string }[] = [];
    let m;
    while ((m = linkPattern.exec(html)) !== null) {
      let href = m[1];
      const title = m[2].replace(/<[^>]+>/g, "").trim();

      // Decode DDG redirect URLs
      if (href.includes("uddg=")) {
        href = decodeURIComponent(href.split("uddg=")[1]?.split("&")[0] || "");
      }
      if (href.startsWith("http") && title) {
        links.push({ url: href, title });
      }
    }

    const snippets: string[] = [];
    while ((m = snippetPattern.exec(html)) !== null) {
      snippets.push(m[1].replace(/<[^>]+>/g, "").trim());
    }

    for (let i = 0; i < Math.min(links.length, maxResults); i++) {
      const { url, title } = links[i];
      const domainMatch = url.match(/https?:\/\/(?:www\.)?([^/]+)/);
      const domain = domainMatch ? domainMatch[1] : "";
      results.push({ title, url, snippet: snippets[i] || "", domain });
    }

    return results;
  } catch (err) {
    console.error("[SERP] DDG scrape failed:", err);
    return [];
  }
}

// ── Step 2: Jina Reader — fetch clean content from URLs ───
export async function fetchWithJina(url: string, jinaApiKey?: string): Promise<string> {
  try {
    const jinaUrl = `https://r.jina.ai/${url}`;
    const headers: Record<string, string> = {
      "Accept": "text/plain",
      "X-Return-Format": "text",
    };
    if (jinaApiKey) headers["Authorization"] = `Bearer ${jinaApiKey}`;

    const res = await fetch(jinaUrl, {
      headers,
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`Jina fetch failed: ${res.status}`);
    const text = await res.text();
    // Return first 2000 chars — enough for topic analysis
    return text.slice(0, 2000);
  } catch (err) {
    console.error(`[Jina] Failed to fetch ${url}:`, err);
    return "";
  }
}

// ── Step 3: AI analysis of competitor content ─────────────
export async function analyzeCompetitors(
  keyword: string,
  serpResults: SERPResult[],
  ourBlogContent: string,
  callAI: (prompt: string, system: string) => Promise<string>
): Promise<CompetitorAnalysis> {
  const dominantDomains = [...new Set(serpResults.map(r => r.domain))].slice(0, 5);

  if (serpResults.length === 0) {
    return { topResults: [], competitorTopics: [], serpGaps: [], painPoints: [], dominantDomains: [] };
  }

  // Build competitor summary from fetched content + snippets
  const competitorSummary = serpResults.map((r, i) => {
    const contentPreview = r.content
      ? `Content: ${r.content.slice(0, 600)}`
      : `Snippet: ${r.snippet}`;
    return `${i + 1}. [${r.domain}] ${r.title}\n${contentPreview}`;
  }).join("\n\n---\n\n");

  const prompt = `Keyword: "${keyword}"

Top competitor pages:
${competitorSummary}

Our blog (first 1200 chars):
${ourBlogContent.slice(0, 1200)}

Analyze and return ONLY this JSON:
{
  "competitorTopics": ["5 main topics competitors cover"],
  "serpGaps": ["4 important topics competitors cover that our blog is MISSING"],
  "painPoints": ["4 user pain points or questions these blogs address that we should cover"]
}`;

  try {
    const raw = await callAI(prompt, "You are an expert SEO analyst. Analyze competitor content and identify gaps. Return only valid JSON.");
    const match = raw.match(/\{[\s\S]*\}/);
    if (match) {
      const parsed = JSON.parse(match[0]);
      return {
        topResults: serpResults,
        competitorTopics: parsed.competitorTopics || [],
        serpGaps: parsed.serpGaps || [],
        painPoints: parsed.painPoints || [],
        dominantDomains,
      };
    }
  } catch (err) {
    console.error("[SERP] AI analysis failed:", err);
  }

  return { topResults: serpResults, competitorTopics: [], serpGaps: [], painPoints: [], dominantDomains };
}
