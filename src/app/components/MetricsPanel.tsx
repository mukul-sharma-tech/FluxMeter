"use client";

import { useState, useEffect } from "react";
import { Loader2, TrendingUp, Shield, Zap, Link2, Search, BarChart3, Target, Globe } from "lucide-react";

interface Metrics {
  aiDetectionScore: number;
  naturalnessScore: number;
  snippetReadiness: number;
  trafficPotential: { low: number; high: number; label: string };
  internalLinkSuggestions: { keyword: string; anchor: string }[];
  keywordClusters: string[];
  promptClarity: number;
  serpGaps: string[];
  competitorTopics: string[];
  painPoints: string[];
  topSERPResults: { title: string; url: string; snippet: string; domain: string }[];
  dominantDomains: string[];
}

function ScoreBar({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  const color = value >= 70 ? "bg-emerald-500" : value >= 40 ? "bg-yellow-500" : "bg-red-500";
  const textColor = value >= 70 ? "text-emerald-400" : value >= 40 ? "text-yellow-400" : "text-red-400";
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">{icon}{label}</div>
        <span className={`text-xs font-bold ${textColor}`}>{value}/100</span>
      </div>
      <div className="w-full bg-white/5 rounded-full h-1.5">
        <div className={`h-1.5 rounded-full transition-all duration-700 ${color}`} style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

// Try to parse saved metrics from ai_suggestions JSON
function parseSavedMetrics(aiSuggestions: string | null): Metrics | null {
  if (!aiSuggestions) return null;
  try {
    const parsed = JSON.parse(aiSuggestions);
    // Check if it has the metrics key saved by analyze-serp
    if (parsed.metrics && parsed.metrics.aiDetectionScore !== undefined) return parsed.metrics as Metrics;
    // Or if the whole object IS metrics (direct save)
    if (parsed.aiDetectionScore !== undefined) return parsed as Metrics;
  } catch { /* */ }
  return null;
}

export default function MetricsPanel({ blogId, keyword, aiSuggestions }: {
  blogId: string;
  keyword: string;
  aiSuggestions?: string | null;
}) {
  const [metrics, setMetrics] = useState<Metrics | null>(() => parseSavedMetrics(aiSuggestions ?? null));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // If aiSuggestions prop updates (e.g. realtime), re-parse
  useEffect(() => {
    const saved = parseSavedMetrics(aiSuggestions ?? null);
    if (saved) setMetrics(saved);
  }, [aiSuggestions]);

  const analyze = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze-serp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogId, keyword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMetrics(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Analysis failed");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-6 h-6 text-teal-400 animate-spin" />
        <p className="text-xs text-slate-500">Scraping SERP, fetching competitor content...</p>
      </div>
    );
  }

  if (!metrics) {
    return (
      <div className="h-full flex flex-col items-center justify-center gap-4 p-6">
        <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
          <BarChart3 className="w-6 h-6 text-teal-400" />
        </div>
        <div className="text-center">
          <p className="text-sm text-slate-300 font-medium">Deep Analysis</p>
          <p className="text-xs text-slate-600 mt-1">SERP gaps, AI detection, traffic potential, competitor analysis via DuckDuckGo + Jina</p>
        </div>
        {error && <p className="text-xs text-red-400 text-center">{error}</p>}
        <button onClick={analyze} className="px-4 py-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold transition flex items-center gap-2">
          <Search className="w-4 h-4" /> Run Analysis
        </button>
      </div>
    );
  }

  const aiColor = metrics.aiDetectionScore <= 30 ? "text-emerald-400" : metrics.aiDetectionScore <= 60 ? "text-yellow-400" : "text-red-400";
  const aiBg = metrics.aiDetectionScore <= 30 ? "bg-emerald-500" : metrics.aiDetectionScore <= 60 ? "bg-yellow-500" : "bg-red-500";

  return (
    <div className="h-full overflow-y-auto px-5 py-5 space-y-6">

      {/* Score cards */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-3 font-medium">Quality Scores</p>
        <div className="space-y-3">
          <ScoreBar label="Prompt Clarity" value={metrics.promptClarity} icon={<Target className="w-3 h-3 mr-1" />} />
          <ScoreBar label="Snippet Readiness" value={metrics.snippetReadiness} icon={<Zap className="w-3 h-3 mr-1" />} />
          <ScoreBar label="Naturalness" value={metrics.naturalnessScore} icon={<Shield className="w-3 h-3 mr-1" />} />
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs text-slate-400"><Shield className="w-3 h-3" /> AI Detection Risk</div>
              <span className={`text-xs font-bold ${aiColor}`}>{metrics.aiDetectionScore}%</span>
            </div>
            <div className="w-full bg-white/5 rounded-full h-1.5">
              <div className={`h-1.5 rounded-full transition-all duration-700 ${aiBg}`} style={{ width: `${metrics.aiDetectionScore}%` }} />
            </div>
          </div>
        </div>
      </div>

      {/* Traffic potential */}
      <div>
        <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-3 font-medium">Traffic Potential</p>
        <div className="bg-white/5 border border-white/10 rounded-xl p-3">
          <div className="flex items-center gap-2 mb-1">
            <TrendingUp className="w-4 h-4 text-emerald-400" />
            <span className={`text-xs font-bold ${metrics.trafficPotential.label === "High" ? "text-emerald-400" : metrics.trafficPotential.label === "Medium" ? "text-yellow-400" : "text-slate-400"}`}>
              {metrics.trafficPotential.label} Potential
            </span>
          </div>
          <p className="text-lg font-bold text-white">{metrics.trafficPotential.low.toLocaleString()} – {metrics.trafficPotential.high.toLocaleString()}</p>
          <p className="text-[10px] text-slate-500">estimated monthly visits</p>
        </div>
      </div>

      {/* SERP Gaps */}
      {metrics.serpGaps?.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-2 font-medium">SERP Gaps</p>
          <div className="space-y-1.5">
            {metrics.serpGaps.map((gap, i) => (
              <div key={i} className="flex gap-2 text-xs text-slate-300 bg-red-500/5 border border-red-500/10 rounded-lg px-3 py-2">
                <span className="text-red-400 shrink-0">↗</span>{gap}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Pain Points */}
      {metrics.painPoints?.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-2 font-medium">User Pain Points</p>
          <div className="space-y-1.5">
            {metrics.painPoints.map((p, i) => (
              <div key={i} className="flex gap-2 text-xs text-slate-300 bg-orange-500/5 border border-orange-500/10 rounded-lg px-3 py-2">
                <span className="text-orange-400 shrink-0">!</span>{p}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Keyword clusters */}
      {metrics.keywordClusters?.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-2 font-medium">Keyword Clusters</p>
          <div className="flex flex-wrap gap-1.5">
            {metrics.keywordClusters.map((kw, i) => (
              <span key={i} className="text-[10px] bg-teal-500/10 border border-teal-500/20 text-teal-300 rounded-full px-2.5 py-0.5">{kw}</span>
            ))}
          </div>
        </div>
      )}

      {/* Internal links */}
      {metrics.internalLinkSuggestions?.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-2 font-medium">Internal Link Opportunities</p>
          <div className="space-y-1.5">
            {metrics.internalLinkSuggestions.map((link, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-slate-300 bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                <Link2 className="w-3 h-3 text-blue-400 shrink-0" />
                <span className="capitalize">{link.keyword}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top SERP competitors */}
      {metrics.topSERPResults?.length > 0 && (
        <div>
          <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-2 font-medium">Top Competitors</p>
          <div className="space-y-2">
            {metrics.topSERPResults.map((r, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-lg px-3 py-2">
                <div className="flex items-center gap-1.5 mb-1">
                  <Globe className="w-3 h-3 text-slate-500 shrink-0" />
                  <span className="text-[10px] text-slate-500">{r.domain}</span>
                </div>
                <p className="text-xs text-slate-300 font-medium leading-tight">{r.title}</p>
                {r.snippet && <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">{r.snippet}</p>}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Re-run */}
      <button onClick={analyze} disabled={loading} className="w-full py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-400 transition flex items-center justify-center gap-2">
        <Search className="w-3 h-3" /> Re-run Analysis
      </button>
    </div>
  );
}
