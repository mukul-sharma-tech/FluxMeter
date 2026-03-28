// utils/metrics.ts — Advanced blog quality metrics

export interface AdvancedMetrics {
  aiDetectionScore: number;       // 0-100, higher = more AI-like (bad)
  naturalnessScore: number;       // 0-100, higher = more natural (good)
  snippetReadiness: number;       // 0-100
  trafficPotential: { low: number; high: number; label: string };
  internalLinkSuggestions: { keyword: string; anchor: string }[];
  keywordClusters: string[];
  promptClarity: number;          // 0-100
}

// ── AI Detection Heuristic ─────────────────────────────────
// Checks patterns common in AI-generated text
export function scoreAIDetection(content: string): { aiScore: number; naturalnessScore: number } {
  let aiSignals = 0;
  let total = 0;

  const sentences = content.split(/[.!?]+/).filter(s => s.trim().length > 10);
  if (sentences.length === 0) return { aiScore: 50, naturalnessScore: 50 };

  // 1. Sentence length variance (AI tends to be uniform)
  const lengths = sentences.map(s => s.trim().split(/\s+/).length);
  const avgLen = lengths.reduce((a, b) => a + b, 0) / lengths.length;
  const variance = lengths.reduce((a, b) => a + Math.pow(b - avgLen, 2), 0) / lengths.length;
  total += 20;
  if (variance < 15) aiSignals += 20; // very uniform = AI-like
  else if (variance < 30) aiSignals += 10;

  // 2. Overused AI transition phrases
  const aiPhrases = [
    "in conclusion", "it is worth noting", "it is important to note",
    "furthermore", "moreover", "in summary", "to summarize",
    "delve into", "dive into", "in the realm of", "it's crucial to",
    "as we navigate", "in today's world", "in today's digital age",
    "leverage", "utilize", "facilitate", "comprehensive", "robust"
  ];
  const lowerContent = content.toLowerCase();
  const phraseHits = aiPhrases.filter(p => lowerContent.includes(p)).length;
  total += 25;
  if (phraseHits >= 5) aiSignals += 25;
  else if (phraseHits >= 3) aiSignals += 15;
  else if (phraseHits >= 1) aiSignals += 8;

  // 3. Passive voice ratio
  const passiveMatches = content.match(/\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi) || [];
  const passiveRatio = passiveMatches.length / sentences.length;
  total += 15;
  if (passiveRatio > 0.4) aiSignals += 15;
  else if (passiveRatio > 0.2) aiSignals += 8;

  // 4. Repetitive sentence starters
  const starters = sentences.map(s => s.trim().split(/\s+/)[0]?.toLowerCase() || "");
  const starterCounts: Record<string, number> = {};
  starters.forEach(s => { starterCounts[s] = (starterCounts[s] || 0) + 1; });
  const maxRepeat = Math.max(...Object.values(starterCounts));
  total += 15;
  if (maxRepeat > sentences.length * 0.25) aiSignals += 15;
  else if (maxRepeat > sentences.length * 0.15) aiSignals += 8;

  // 5. Lack of personal anecdotes / first person
  const firstPerson = (content.match(/\b(I|we|our|my|us)\b/gi) || []).length;
  total += 10;
  if (firstPerson === 0) aiSignals += 10;
  else if (firstPerson < 3) aiSignals += 5;

  // 6. Overly structured (every paragraph same length)
  const paragraphs = content.split(/\n\n+/).filter(p => p.trim().length > 50);
  if (paragraphs.length > 3) {
    const pLengths = paragraphs.map(p => p.length);
    const pAvg = pLengths.reduce((a, b) => a + b, 0) / pLengths.length;
    const pVariance = pLengths.reduce((a, b) => a + Math.pow(b - pAvg, 2), 0) / pLengths.length;
    total += 15;
    if (pVariance < 500) aiSignals += 15;
    else if (pVariance < 1500) aiSignals += 7;
  }

  const aiScore = Math.round((aiSignals / total) * 100);
  const naturalnessScore = Math.max(0, 100 - aiScore);
  return { aiScore, naturalnessScore };
}

// ── Snippet Readiness ──────────────────────────────────────
export function scoreSnippetReadiness(content: string): number {
  let score = 0;

  // Has FAQ section (40pts)
  if (content.includes("FAQ") || content.includes("Frequently Asked")) score += 40;

  // Has question-format headings (30pts)
  const questionHeadings = (content.match(/#{1,3}\s+.+\?/g) || []).length;
  if (questionHeadings >= 3) score += 30;
  else if (questionHeadings >= 1) score += 15;

  // Has concise answers (short paragraphs after headings) (20pts)
  const lines = content.split("\n");
  let conciseAnswers = 0;
  for (let i = 0; i < lines.length - 1; i++) {
    if (lines[i].startsWith("#") && lines[i + 1]?.trim().length > 0 && lines[i + 1]?.trim().length < 200) {
      conciseAnswers++;
    }
  }
  if (conciseAnswers >= 3) score += 20;
  else if (conciseAnswers >= 1) score += 10;

  // Has numbered lists (10pts — good for "how to" snippets)
  if (/^\d+\.\s/m.test(content)) score += 10;

  return Math.min(100, score);
}

// ── Traffic Potential ──────────────────────────────────────
export function estimateTraffic(trendScore: number, keyword: string): { low: number; high: number; label: string } {
  // Base monthly search volume estimate from trend score
  // trendScore 100 = ~50k searches/month (rough heuristic)
  const baseVolume = Math.round((trendScore / 100) * 50000);

  // CTR for position 1-3 averages ~15-30%
  const low = Math.round(baseVolume * 0.05);   // conservative (pos 5-10)
  const high = Math.round(baseVolume * 0.25);  // optimistic (pos 1-3)

  // Keyword length modifier (long-tail = lower volume but higher intent)
  const words = keyword.trim().split(/\s+/).length;
  const modifier = words >= 4 ? 0.3 : words >= 3 ? 0.6 : words >= 2 ? 0.8 : 1.0;

  const label = trendScore >= 80 ? "High" : trendScore >= 50 ? "Medium" : "Low";

  return {
    low: Math.round(low * modifier),
    high: Math.round(high * modifier),
    label,
  };
}

// ── Internal Linking Suggestions ──────────────────────────
export function suggestInternalLinks(
  currentKeyword: string,
  allBlogKeywords: string[],
  blogContent: string
): { keyword: string; anchor: string }[] {
  const suggestions: { keyword: string; anchor: string }[] = [];
  const lowerContent = blogContent.toLowerCase();

  for (const kw of allBlogKeywords) {
    if (kw.toLowerCase() === currentKeyword.toLowerCase()) continue;
    // Check if the keyword or its words appear in the content
    const kwWords = kw.toLowerCase().split(/\s+/);
    const appears = kwWords.some(w => w.length > 4 && lowerContent.includes(w));
    if (appears) {
      suggestions.push({ keyword: kw, anchor: kw });
    }
  }

  return suggestions.slice(0, 5);
}

// ── Keyword Clusters ──────────────────────────────────────
export function extractKeywordClusters(keyword: string, content: string): string[] {
  // Extract noun phrases and related terms from content
  const words = content.toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter(w => w.length > 4);

  const freq: Record<string, number> = {};
  words.forEach(w => { freq[w] = (freq[w] || 0) + 1; });

  // Filter stopwords
  const stopwords = new Set(["about", "above", "after", "again", "their", "there", "these", "those", "which", "while", "where", "would", "could", "should", "being", "having", "doing", "other", "every", "first", "since", "under", "until", "using", "often", "might", "still", "also", "more", "most", "some", "such", "than", "that", "this", "with", "from", "they", "have", "will", "been", "when", "your", "into", "each", "both", "very", "just", "over", "even", "back", "only", "well", "make", "like", "time", "know", "take", "people", "year", "good", "come", "give", "most", "between"]);

  const clusters = Object.entries(freq)
    .filter(([w, c]) => c >= 2 && !stopwords.has(w) && !keyword.toLowerCase().includes(w))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([w]) => w);

  return clusters;
}

// ── Prompt Architecture Clarity ───────────────────────────
export function scorePromptClarity(content: string, keyword: string): number {
  let score = 0;

  // Has clear title (H1)
  if (/^#\s+.+/m.test(content)) score += 20;

  // Has meta description
  if (/meta description/i.test(content)) score += 15;

  // Has structured sections (5+ H2s)
  const h2Count = (content.match(/^##\s+/gm) || []).length;
  if (h2Count >= 5) score += 20;
  else if (h2Count >= 3) score += 10;

  // Keyword in title
  const titleMatch = content.match(/^#\s+(.+)/m);
  if (titleMatch && titleMatch[1].toLowerCase().includes(keyword.toLowerCase())) score += 15;

  // Has introduction (first paragraph before first H2)
  const beforeFirstH2 = content.split(/^##\s+/m)[0];
  if (beforeFirstH2 && beforeFirstH2.length > 200) score += 15;

  // Has conclusion
  if (/conclusion|summary|final thoughts|wrapping up/i.test(content)) score += 15;

  return Math.min(100, score);
}
