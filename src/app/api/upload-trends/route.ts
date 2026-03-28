// app/api/upload-trends/route.ts
import { NextResponse } from "next/server";
import * as fs from "fs";
import * as path from "path";

// Detect CSV type by inspecting headers and content
function detectCsvType(content: string): string | null {
  const lines = content.trim().split("\n");
  if (lines.length < 2) return null;

  const header = lines[0].toLowerCase();
  const firstRow = lines[1]?.toLowerCase() ?? "";

  // multiTimeline: has a "week" or "day" or "month" date column + numeric value
  if (
    header.includes("week") ||
    header.includes("day") ||
    header.includes("month") ||
    /\d{4}-\d{2}-\d{2}/.test(firstRow)
  ) return "multiTimeline.csv";

  // geoMap: has "region" or "country" or "subregion" or "city"
  if (
    header.includes("region") ||
    header.includes("country") ||
    header.includes("subregion") ||
    header.includes("city") ||
    header.includes("metro")
  ) return "geoMap.csv";

  // relatedQueries: has "query" or "top queries" or "rising queries"
  if (
    header.includes("query") ||
    header.includes("queries") ||
    header.includes("top queries") ||
    header.includes("rising queries")
  ) return "relatedQueries.csv";

  // relatedEntities / relatedTopics: has "topic" or "entity" or "related topics"
  if (
    header.includes("topic") ||
    header.includes("entity") ||
    header.includes("entities") ||
    header.includes("related topics") ||
    header.includes("related searches")
  ) return "relatedEntities.csv";

  // Fallback: check column count and value patterns
  const cols = lines[0].split(",").length;
  if (cols === 2) {
    // 2-col with date-like first col → timeline
    if (/\d{4}/.test(firstRow)) return "multiTimeline.csv";
    // 2-col with text first col → geoMap
    return "geoMap.csv";
  }

  return null; // unknown
}

export async function POST(req: Request): Promise<NextResponse> {
  try {
    const formData = await req.formData();
    const saved: { original: string; savedAs: string }[] = [];
    const unrecognized: string[] = [];

    const trendsDir = path.join(process.cwd(), "public", "trends");
    if (!fs.existsSync(trendsDir)) fs.mkdirSync(trendsDir, { recursive: true });

    for (const [, file] of formData.entries()) {
      if (!(file instanceof File)) continue;

      const content = await file.text();
      const detected = detectCsvType(content);

      if (!detected) {
        unrecognized.push(file.name);
        continue;
      }

      const dest = path.join(trendsDir, detected);
      fs.writeFileSync(dest, content, "utf-8");
      saved.push({ original: file.name, savedAs: detected });
    }

    return NextResponse.json({ saved, unrecognized }, { status: 200 });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
