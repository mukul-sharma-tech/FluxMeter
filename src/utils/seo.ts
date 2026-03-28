// utils/seo.ts — Internal SEO scoring engine

export interface SEOResult {
  score: number;
  breakdown: {
    keywordDensity: number;
    headings: number;
    faq: number;
    length: number;
    lists: number;
    readability: number;
    meta: number;
  };
  suggestions: string[];
}

export function getSEOScore(content: string, keyword: string): SEOResult {
  let score = 0;
  const suggestions: string[] = [];
  const breakdown = {
    keywordDensity: 0,
    headings: 0,
    faq: 0,
    length: 0,
    lists: 0,
    readability: 0,
    meta: 0,
  };

  // Keyword density — scaled by content length
  const wordCount = content.split(/\s+/).length;
  const idealMax = Math.max(20, Math.floor(wordCount / 50)); // ~1 per 50 words
  const count = content.toLowerCase().split(keyword.toLowerCase()).length - 1;
  if (count >= 5 && count <= idealMax) {
    score += 20;
    breakdown.keywordDensity = 20;
  } else if (count > 0 && count < 5) {
    score += 10;
    breakdown.keywordDensity = 10;
    suggestions.push(`Use the keyword "${keyword}" more frequently (currently ${count} times, aim for 5–${idealMax}).`);
  } else if (count > idealMax) {
    score += 15; // still good, just slightly over
    breakdown.keywordDensity = 15;
    suggestions.push(`Keyword "${keyword}" is slightly overused (${count} times). Ideal range: 5–${idealMax}.`);
  } else {
    suggestions.push(`Keyword "${keyword}" not found in content. Add it naturally throughout.`);
  }

  // Headings (## = H2 sections)
  const headingCount = (content.match(/##/g) || []).length;
  if (headingCount >= 5) {
    score += 20;
    breakdown.headings = 20;
  } else {
    score += headingCount * 4;
    breakdown.headings = headingCount * 4;
    suggestions.push(`Add more H2 headings (currently ${headingCount}, aim for 5+).`);
  }

  // FAQ section
  if (content.includes("FAQ") || content.includes("Frequently Asked")) {
    score += 15;
    breakdown.faq = 15;
  } else {
    suggestions.push("Add a FAQ section to improve SEO and featured snippet chances.");
  }

  // Content length
  if (content.length > 1200) {
    score += 15;
    breakdown.length = 15;
  } else {
    suggestions.push(`Content is too short (${content.length} chars). Aim for 1200+ characters.`);
  }

  // Lists
  if (content.includes("- ") || content.includes("* ")) {
    score += 10;
    breakdown.lists = 10;
  } else {
    suggestions.push("Add bullet point lists to improve readability and SEO structure.");
  }

  // Readability (sentence count)
  const sentenceCount = content.split(".").length;
  if (sentenceCount > 25) {
    score += 10;
    breakdown.readability = 10;
  } else {
    suggestions.push(`Expand content with more sentences (currently ~${sentenceCount}, aim for 25+).`);
  }

  // Meta description mention
  if (
    content.toLowerCase().includes("meta description") ||
    content.toLowerCase().includes("meta:") ||
    /^meta\s/im.test(content)
  ) {
    score += 10;
    breakdown.meta = 10;
  } else {
    suggestions.push("Include a meta description suggestion in the blog content.");
  }

  return { score, breakdown, suggestions };
}
