// utils/trends.ts — Google Trends CSV parser & scoring engine

import * as fs from "fs";
import * as path from "path";

export interface TrendsResult {
  trendScore: number; // 0–100
  direction: "rising" | "stable" | "declining";
  topRegions: string[];
  relatedQueries: string[];
  relatedEntities: string[];
  recommendation: string;
}

// Google Trends exports have metadata lines at the top before the actual CSV data
// e.g. "Category: All categories\n\n<blank>\nWeek,<term>: (Worldwide)\n..."
function parseCSV(filePath: string): Record<string, string>[] {
  try {
    const raw = fs.readFileSync(filePath, "utf-8");
    const lines = raw.split("\n").map((l) => l.trim()).filter((l) => l.length > 0);

    // Find the first line that looks like a CSV header (has a comma, no colon-only metadata)
    let headerIdx = -1;
    for (let i = 0; i < lines.length; i++) {
      const l = lines[i];
      // Skip metadata lines like "Category: All categories" or "Interest over time"
      if (l.includes(":") && !l.includes(",")) continue;
      if (!l.includes(",")) continue;
      headerIdx = i;
      break;
    }

    if (headerIdx === -1) return [];

    const headers = lines[headerIdx]
      .split(",")
      .map((h) => h.trim().replace(/^"|"$/g, "").toLowerCase());

    const rows: Record<string, string>[] = [];
    for (let i = headerIdx + 1; i < lines.length; i++) {
      const vals = lines[i].split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      if (vals.length < headers.length) continue;
      const row: Record<string, string> = {};
      headers.forEach((h, idx) => { row[h] = vals[idx] ?? ""; });
      rows.push(row);
    }

    return rows;
  } catch {
    return [];
  }
}

// Normalize header keys — Google Trends uses varied column names
function getVal(row: Record<string, string>, ...keys: string[]): string {
  for (const k of keys) {
    const found = Object.keys(row).find((r) => r.toLowerCase().includes(k.toLowerCase()));
    if (found && row[found]) return row[found];
  }
  return "";
}

export function analyzeTrends(keyword: string): TrendsResult {
  const trendsDir = path.join(process.cwd(), "public", "trends");

  const timeline = parseCSV(path.join(trendsDir, "multiTimeline.csv"));
  const geoMap = parseCSV(path.join(trendsDir, "geoMap.csv"));
  const relatedQueriesData = parseCSV(path.join(trendsDir, "relatedQueries.csv"));
  const relatedEntitiesData = parseCSV(path.join(trendsDir, "relatedEntities.csv"));

  // --- Trend direction from timeline ---
  let direction: "rising" | "stable" | "declining" = "stable";
  if (timeline.length >= 4) {
    const values = timeline.map((r) => {
      const v = getVal(r, "value", keyword, "interest", "score");
      return parseFloat(v || "0");
    });
    const recent = values.slice(-4);
    const older = values.slice(-8, -4);
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.length ? older.reduce((a, b) => a + b, 0) / older.length : recentAvg;
    if (recentAvg > olderAvg * 1.1) direction = "rising";
    else if (recentAvg < olderAvg * 0.9) direction = "declining";
  }

  // --- Trend score from latest timeline value ---
  const latestRow = timeline[timeline.length - 1];
  const latestRaw = latestRow ? getVal(latestRow, "value", keyword, "interest", "score") : "50";
  const trendScore = Math.min(100, Math.round(parseFloat(latestRaw || "50")));

  // --- Top regions ---
  const topRegions = [...geoMap]
    .sort((a, b) => {
      const av = parseFloat(getVal(a, "value", "interest", "score") || "0");
      const bv = parseFloat(getVal(b, "value", "interest", "score") || "0");
      return bv - av;
    })
    .slice(0, 3)
    .map((r) => getVal(r, "region", "country", "subregion", "city", "metro") || "");

  // --- Related queries ---
  const kw = keyword.toLowerCase();
  const allQueries = relatedQueriesData.map((r) => getVal(r, "query", "top", "rising", "term")).filter(Boolean);
  const matchedQueries = allQueries.filter((q) => q.toLowerCase().includes(kw) || kw.includes(q.toLowerCase()));
  const relatedQueries = (matchedQueries.length ? matchedQueries : allQueries).slice(0, 5);

  // --- Related entities ---
  const relatedEntities = relatedEntitiesData
    .slice(0, 5)
    .map((r) => getVal(r, "topic", "entity", "term", "query", "related") || "")
    .filter(Boolean);

  // --- Recommendation ---
  let recommendation = "";
  if (trendScore >= 80 && direction === "rising") {
    recommendation = `"${keyword}" is trending strongly. High priority — write this blog now.`;
  } else if (trendScore >= 60) {
    recommendation = `"${keyword}" has solid search interest. Good candidate for a blog post.`;
  } else if (trendScore >= 40) {
    recommendation = `"${keyword}" has moderate interest. Consider a niche angle to stand out.`;
  } else {
    recommendation = `"${keyword}" has low trend score. Consider a more popular related topic.`;
  }

  return { trendScore, direction, topRegions, relatedQueries, relatedEntities, recommendation };
}
