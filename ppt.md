# FluxMeter — Slide Deck Content

---

## COVER SLIDE

**Title:** FluxMeter
**Subtitle:** AI-Powered SEO Blog Engine
**Tagline:** From keyword intent to ranked content — in 30 seconds.
**Team / Event:** DTU Hackathon — Part 1: AI Blog Engine Architecture

---

## SLIDE 1 — The Problem & Our Approach

**Title:** Why Most AI Blog Tools Fail at SEO

**Problem Statement:**
Most AI content tools generate text — but not content that ranks.
They ignore three critical signals:
- What competitors are already covering (SERP landscape)
- What users are actually searching for (trend data)
- Whether the content is structurally sound for search engines (SEO compliance)

**Our Approach:**
FluxMeter is not a text generator. It is a **content intelligence pipeline** that treats blog creation as a multi-stage engineering problem — not a single prompt.

**The Core Insight:**
> Ranking on Google requires satisfying three systems simultaneously: the search algorithm, the user's intent, and the AI-powered answer engines (SGE/GEO). FluxMeter is designed to satisfy all three.

**Key Design Decisions:**
- Generate → Validate → Score → Improve → Review (not just generate)
- Use real SERP data, not assumptions
- Make every metric measurable and explainable

---

## SLIDE 2 — System Architecture

**Title:** The Pipeline: Keyword → Ranked Blog

**Flow Diagram (describe visually):**

```
Keyword Input
     ↓
[1] Google Trends Analysis
     → Trend score, direction, top regions
     ↓
[2] AI Blog Generation  (Ollama llama3 → Groq fallback)
     → 3 attempts with retry logic
     ↓
[3] esbuild Content Validation
     → Rejects hallucinated code, JSX, malformed content
     ↓
[4] SEO Scoring Engine  (7 dimensions)
     → Keyword density, headings, FAQ, length, lists, readability, meta
     → Improvement loop: if score < 60, AI rewrites and re-scores
     ↓
[5] AI SEO Review
     → Suggestions, missing topics, improved intro
     ↓
[6] SERP Analysis  (DuckDuckGo + Jina Reader)
     → Scrapes top competitors, fetches real content
     → AI identifies gaps between your blog and top-ranking pages
     ↓
Final Output: Blog + SEO Score + Trend Score + Metrics
```

**Key Technical Choices:**
- Streaming API — user sees live progress, never a blank loading screen
- Ollama first, Groq fallback — no single point of AI failure
- Supabase Realtime — blog list updates without refresh
- All metrics persisted to DB — no re-computation on revisit

---

## SLIDE 3 — Key Insights & Analysis

**Title:** What We Measured — And What We Found

**Insight 1: SEO is structural, not just keyword-based**
A blog can mention a keyword 20 times and still score poorly. Our 7-dimension engine catches what keyword density alone misses — missing FAQ sections, no meta description, weak heading hierarchy.

**Insight 2: AI-generated content has detectable patterns**
We built a naturalness scorer that flags: uniform sentence lengths, overused transition phrases ("furthermore", "it is worth noting", "delve into"), high passive voice ratio, and repetitive sentence starters. These are the exact signals human editors and AI detectors look for.

**Insight 3: SERP gaps are more valuable than keyword density**
The most actionable SEO improvement is not adding more keywords — it's covering subtopics that top-ranking competitors cover and you don't. Our DuckDuckGo + Jina pipeline surfaces these gaps from real competitor content, not assumptions.

**Insight 4: Trend data changes the generation strategy**
A keyword with a declining trend score needs a different angle (niche, long-tail) than a rising one. We use the trend direction to inform the recommendation, not just the score.

**Metrics We Track:**
| Metric | Method |
|---|---|
| SEO Score | 7-rule internal engine |
| AI Detection Risk | Heuristic: phrases, variance, passive voice |
| Snippet Readiness | FAQ + question headings + concise answers |
| Traffic Potential | Trend score × CTR model |
| SERP Gaps | DDG scrape + Jina + AI analysis |
| Keyword Clusters | Frequency analysis on generated content |
| Internal Link Opportunities | Cross-reference all blogs in DB |
| Prompt Clarity | Structure scoring: H1, meta, intro, conclusion |

---

## SLIDE 4 — Prototype Description

**Title:** FluxMeter — What We Built

**Interface: 3-Panel Dark Dashboard**

```
┌─────────────┬──────────────────────────┬──────────────┐
│  SIDEBAR    │    BLOG VIEWER           │  AI EDITOR   │
│             │                          │              │
│ Trends CSV  │  Preview / Markdown /    │  Chat to     │
│ Upload      │  Metrics tabs            │  edit blog   │
│             │                          │  live        │
│ Generate    │  SEO + Trend scores      │              │
│ Form        │  AI suggestions          │  Quick       │
│             │  Competitor list         │  actions     │
│ Blog List   │  Traffic potential       │              │
│ (realtime)  │  SERP gaps               │  Save to DB  │
└─────────────┴──────────────────────────┴──────────────┘
```

**Core Features:**
- **Live generation** — streaming progress with animated step tracker
- **Editable Markdown** — edit raw content directly, syncs to preview
- **AI Chat Editor** — ask AI to rewrite, improve SEO, change tone — edits apply live
- **Metrics Tab** — all 10 hackathon criteria in one panel, saved to DB after first run
- **Google Trends Upload** — drag and drop up to 4 CSVs, auto-detected by content
- **SERP Analysis** — one click triggers DuckDuckGo scrape + Jina content fetch + AI gap analysis

**Tech Stack:**
Next.js 16 · Supabase · Ollama llama3 · Groq · DuckDuckGo · Jina Reader · esbuild · LangSmith · Tailwind CSS

---

## SLIDE 5 — Results & Scalability

**Title:** Performance, Scalability & What's Next

**Measured Results:**
| Metric | Result |
|---|---|
| Average generation time | ~25–35 seconds end-to-end |
| Average SEO score | 85–95 / 100 |
| Validation pass rate (attempt 1) | ~80% |
| SERP analysis time | ~15–20 seconds |
| Metrics re-load time (cached) | Instant (from DB) |

**Scalability Design:**
- **Stateless pipeline** — any keyword runs the same pipeline independently
- **No shared state** — each blog generation is isolated, can run in parallel
- **DB-persisted metrics** — computed once, served forever
- **Fallback AI chain** — Ollama → Groq ensures 99%+ availability
- **Streaming responses** — no timeout issues even for long generations

**What Makes This Replicable:**
1. Change the keyword → get a new blog. Zero configuration per topic.
2. Upload new Trends CSVs → trend data updates automatically
3. Every metric is computed programmatically — no manual review needed

**Potential Extensions:**
- Bulk generation (keyword list → 50 blogs overnight)
- WordPress / Ghost / Notion export
- Automated internal linking injection
- Scheduled re-generation when trend scores drop
- Multi-language blog generation

---

## ENDING SLIDE

**Title:** Thank You

**Tagline:** FluxMeter — Measure the flux. Rank the content.

**Built with:** Next.js · Supabase · Ollama · Groq · DuckDuckGo · Jina · LangSmith

**GitHub / Demo:** [your link here]
