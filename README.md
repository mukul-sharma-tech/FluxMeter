# FluxMeter — AI SEO Blog Engine

> A scalable, AI-powered blog generation engine that converts keyword intent into high-ranking, SEO-optimized, competitor-analyzed blogs through a structured multi-stage pipeline.

Built for the **DTU Hackathon — Part 1: AI Blog Engine Architecture**

---

## Overview

FluxMeter is not just a blog generator. It is a complete **content intelligence system** that:

1. Analyzes search trends before writing anything
2. Generates structured, SEO-compliant blog content using AI
3. Validates content quality through multiple automated checks
4. Scrapes real competitor pages to identify what you're missing
5. Scores your blog across 10 measurable dimensions
6. Lets you edit and improve the blog with an AI chat editor — live

The entire pipeline runs in ~30 seconds per blog, is fully repeatable for any keyword, and stores everything in a real-time database.

---

## Features

### Blog Generation Pipeline
- **Keyword-to-blog in one click** — enter any keyword and get a complete, structured blog post
- **Streaming progress bar** — live step-by-step updates as the pipeline runs (trends → generating → validation → SEO → review → saving)
- **3-attempt retry loop** — if generation fails validation, it automatically retries up to 3 times
- **esbuild content validation** — detects and rejects hallucinated code blocks, JSX components, or malformed content inside the blog
- **Ollama → Groq fallback** — uses local Ollama llama3 first; falls back to Groq llama-3.3-70b-versatile automatically if Ollama is unavailable

### SEO Engine (7 Dimensions)
- **Keyword density compliance** — dynamic range based on content word count, penalizes both under-use and keyword stuffing
- **Heading structure** — checks for 5+ H2 sections
- **FAQ detection** — rewards FAQ sections for featured snippet eligibility
- **Content length** — enforces 1200+ character minimum
- **List usage** — checks for bullet/numbered lists
- **Readability** — sentence count analysis
- **Meta description** — checks for meta description inclusion
- **SEO improvement loop** — if score < 60, asks AI to fix specific issues and re-scores (up to 2 improvement passes)

### Google Trends Integration
- **CSV upload** — upload up to 4 Google Trends export files directly in the sidebar
- **Auto-detection by content** — file type is detected by reading headers/content, not filename (works with any export name)
- **4 data sources** — multiTimeline (trend direction), geoMap (top regions), relatedQueries, relatedEntities
- **Trend score** — calculated from latest timeline value, shown on every blog
- **Trend direction** — rising / stable / declining based on recent vs older averages

### SERP & Competitor Analysis
- **DuckDuckGo scraping** — fetches top organic results for the keyword without any API key
- **Jina Reader integration** — fetches clean readable text from top 3 competitor pages (`r.jina.ai`)
- **AI competitor analysis** — identifies what topics competitors cover that your blog is missing
- **SERP gap identification** — specific subtopics you should add to outrank competitors
- **User pain points** — extracts the real questions and problems users are searching for
- **Persistent results** — metrics saved to DB on first run, loads instantly on revisit — no re-run needed

### Advanced Metrics (10 Hackathon Criteria)
- **Prompt Architecture Clarity** — scores H1, meta description, H2 count, keyword in title, intro, conclusion
- **Keyword Clustering** — extracts high-frequency related terms from content
- **SERP Gap Identification** — AI-powered gap analysis from real competitor content
- **Projected Traffic Potential** — trend score × CTR model → estimated monthly visit range (low/high)
- **SEO Optimization %** — 7-dimension internal scoring engine
- **AI Detection % & Naturalness Score** — detects sentence uniformity, AI phrases, passive voice, repetitive starters, lack of first-person
- **Snippet Readiness Probability** — FAQ presence, question-format headings, concise answers, numbered lists
- **Keyword Density Compliance** — dynamic range, not a fixed cap
- **Internal Linking Logic** — cross-references all blogs in your DB to suggest natural anchor opportunities
- **Scalability** — entire pipeline is keyword-in → blog-out, repeatable for any topic

### AI Chat Editor
- **Right-panel chat** — ask the AI to rewrite sections, improve SEO, change tone, add content, fix grammar
- **Live preview updates** — edits reflect instantly in the blog viewer without page reload
- **Quick action chips** — one-click prompts: "Improve SEO", "Fix grammar", "Make it shorter", "Add FAQ", "Change tone to casual"
- **Save to DB** — persist AI edits back to Supabase with one click
- **Conversation history** — last 6 messages sent as context so the AI remembers what was discussed

### Blog Viewer
- **Preview tab** — rendered Markdown with full image support, inline links, headings, lists
- **Markdown tab** — fully editable raw Markdown with live sync to preview and save button
- **Metrics tab** — all 10 hackathon metrics in one panel with score bars, traffic estimates, SERP gaps, competitor list
- **SEO + Trend score badges** — visible on every blog at a glance

### UI & Experience
- **3-panel dark layout** — sidebar (generate + blog list) / middle (blog viewer) / right (AI editor)
- **Collapsible sidebar** — toggle button at the top
- **Real-time blog list** — Supabase Realtime updates the sidebar instantly when a blog is generated
- **Toast notifications** — auto-dismiss after 4.5 seconds
- **Generating panel** — animated step tracker with progress percentage shown in the main window while generating
- **Auto-open on completion** — blog opens automatically in the viewer when generation finishes, no manual click needed

---

## Hackathon Criteria Coverage

| Criteria | Score | Implementation |
|---|---|---|
| Prompt Architecture Clarity | ✅ | `scorePromptClarity()` in `metrics.ts` |
| Keyword Clustering Logic | ✅ | `extractKeywordClusters()` in `metrics.ts` |
| SERP Gap Identification | ✅ | DuckDuckGo + Jina + AI in `serp.ts` |
| Projected Traffic Potential | ✅ | `estimateTraffic()` in `metrics.ts` |
| SEO Optimization % | ✅ | `getSEOScore()` in `seo.ts` |
| AI Detection % & Naturalness | ✅ | `scoreAIDetection()` in `metrics.ts` |
| Snippet Readiness Probability | ✅ | `scoreSnippetReadiness()` in `metrics.ts` |
| Keyword Density Compliance | ✅ | Dynamic range in `getSEOScore()` |
| Internal Linking Logic | ✅ | `suggestInternalLinks()` in `metrics.ts` |
| Scalability & Replicability | ✅ | Full pipeline, any keyword, any scale |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Server Components) |
| Database | Supabase (PostgreSQL + Realtime subscriptions) |
| Primary AI | Ollama llama3 (local inference) |
| Fallback AI | Groq llama-3.3-70b-versatile (cloud) |
| SERP Scraping | DuckDuckGo HTML search (no API key needed) |
| Content Fetching | Jina Reader API (`r.jina.ai`) |
| Content Validation | esbuild (transpilation-based validation) |
| Observability | LangSmith tracing |
| Background Jobs | Inngest |
| Styling | Tailwind CSS v4 |
| Language | TypeScript |

---

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── generate-blog/     # Streaming blog generation pipeline
│   │   ├── analyze-serp/      # DuckDuckGo + Jina + AI competitor analysis
│   │   ├── chat-blog/         # AI editor chat endpoint
│   │   ├── update-blog/       # Save edited blog content to DB
│   │   ├── upload-trends/     # Google Trends CSV upload + auto-detection
│   │   └── generate-story/    # 3D avatar story narration
│   ├── components/
│   │   ├── Dashboard.tsx      # Full 3-panel UI with all state management
│   │   └── MetricsPanel.tsx   # 10-metric analysis display panel
│   ├── layout.tsx
│   └── page.tsx
├── utils/
│   ├── seo.ts                 # 7-dimension SEO scoring engine
│   ├── metrics.ts             # AI detection, snippet readiness, traffic, clusters, internal links
│   ├── serp.ts                # DuckDuckGo scraper + Jina Reader + AI competitor analysis
│   └── trends.ts              # Google Trends CSV parser with content-based type detection
public/
└── trends/                    # Uploaded Google Trends CSVs stored here
```

---

## Setup

### 1. Install dependencies

```bash
npm install
# or
bun install
```

### 2. Environment variables

Create `.env.local` in the root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Ollama (primary AI — runs locally)
OLLAMA_BASE_URL=http://localhost:11434

# Groq (fallback AI)
GROQ_API_KEY=your_groq_api_key

# Jina Reader (competitor content fetching)
# Free tier works without a key. Get one at https://jina.ai for higher limits.
JINA_API_KEY=your_jina_api_key

# LangSmith tracing
LANGCHAIN_API_KEY=your_langsmith_api_key
LANGCHAIN_PROJECT=fluxmeter
LANGCHAIN_TRACING_V2=true

# Inngest
INNGEST_DEV=1
INNGEST_EVENT_KEY=your_inngest_event_key
```

### 3. Supabase — create the blogs table

Run in your Supabase SQL editor:

```sql
create table public.blogs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamptz default now() not null,
  keyword text not null,
  status text default 'generating' not null,
  content text,
  seo_score integer,
  trend_score integer,
  ai_suggestions text,
  attempts integer
);

alter publication supabase_realtime add table public.blogs;

alter table public.blogs enable row level security;
create policy "Allow all" on public.blogs
  for all using (true) with check (true);
```

### 4. Ollama (optional)

If you want local inference:

```bash
ollama pull llama3
ollama serve
```

If Ollama is not running, all AI calls automatically fall back to Groq.

### 5. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## API Reference

| Route | Method | Description |
|---|---|---|
| `/api/generate-blog` | POST | Streaming blog generation — returns newline-delimited JSON progress events |
| `/api/analyze-serp` | POST | Full SERP + competitor analysis, saves results to DB |
| `/api/chat-blog` | POST | AI editor — takes blog content + user message, returns reply + optional updated blog |
| `/api/update-blog` | POST | Saves edited blog content back to Supabase |
| `/api/upload-trends` | POST | Accepts multipart CSV files, auto-detects type, saves to `public/trends/` |
| `/api/generate-story` | POST | Generates story-format explanation for 3D avatar narration |

---

## AI Fallback Chain

Every AI call in the system follows this pattern:

```
Ollama llama3 (local, 3s timeout)
        ↓ on failure
Groq llama-3.3-70b-versatile (cloud)
```

This applies to: blog generation, SEO improvement, AI SEO review, competitor analysis, and the chat editor.

---

## How Google Trends Works

1. Export CSVs from [trends.google.com](https://trends.google.com) for your keyword
2. You get up to 4 files: Interest over time, Interest by region, Related queries, Related topics
3. Upload all of them at once in the sidebar — FluxMeter reads the CSV headers to detect which file is which, regardless of filename
4. On next blog generation, the trend score and direction are calculated from your real data

---

## Live Demo Flow (for presentation)

1. Upload Google Trends CSVs for a keyword
2. Type the keyword → Generate Blog → watch the live progress
3. Blog opens automatically — show SEO score + trend score
4. Switch to Metrics tab → Run Analysis → show SERP gaps, competitor list, traffic potential, AI detection score
5. Use the AI chat to make a live edit ("make the intro more engaging")
6. Switch to Markdown tab — show the raw editable content
7. Save — show it persists
