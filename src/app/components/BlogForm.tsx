"use client";

import { useState } from "react";
import { TrendingUp, TrendingDown, Minus, CheckCircle, AlertCircle } from "lucide-react";

interface ProgressState {
  step: string;
  message: string;
  progress: number;
  error?: string;
}

const STEP_ICONS: Record<string, string> = {
  trends: "📈",
  generating: "✍️",
  validation: "🔍",
  seo: "⚙️",
  review: "🤖",
  saving: "💾",
  done: "✅",
  error: "❌",
};

export default function BlogForm() {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState<ProgressState | null>(null);
  const [done, setDone] = useState<{ blogId: string; seoScore: number; trendScore: number } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;

    setLoading(true);
    setProgress(null);
    setDone(null);

    try {
      const res = await fetch("/api/generate-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ keyword }),
      });

      if (!res.body) throw new Error("No response stream");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done: streamDone, value } = await reader.read();
        if (streamDone) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.done) {
              setDone({ blogId: data.blogId, seoScore: data.seoScore, trendScore: data.trendScore });
              setKeyword("");
            } else if (data.step) {
              setProgress({ step: data.step, message: data.message, progress: data.progress, error: data.error });
            }
          } catch { /* skip malformed line */ }
        }
      }
    } catch (err) {
      setProgress({ step: "error", message: err instanceof Error ? err.message : "Unknown error", progress: 0, error: String(err) });
    } finally {
      setLoading(false);
    }
  };

  const isError = progress?.step === "error";

  return (
    <div className="space-y-4 p-6 rounded-2xl shadow-sm bg-gradient-to-r from-emerald-50 to-teal-50 border border-teal-100">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="keyword" className="block text-sm font-medium text-teal-800 mb-2">
            Blog Keyword / Topic
          </label>
          <input
            id="keyword"
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            disabled={loading}
            placeholder="e.g. artificial intelligence, react hooks, seo tips..."
            className="w-full px-4 py-3 rounded-xl border border-teal-200 bg-white text-gray-800 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-teal-400 disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={loading || !keyword.trim()}
          className="w-full py-3 px-6 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? "Generating..." : "Generate SEO Blog"}
        </button>
      </form>

      {/* Progress */}
      {(loading || progress) && !done && (
        <div className="space-y-3">
          {/* Progress bar */}
          <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
            <div
              className={`h-2.5 rounded-full transition-all duration-500 ${isError ? "bg-red-500" : "bg-teal-500"}`}
              style={{ width: `${progress?.progress ?? 5}%` }}
            />
          </div>

          {/* Step message */}
          {progress && (
            <div className={`flex items-start gap-2 text-sm rounded-lg px-4 py-3 border ${
              isError
                ? "bg-red-50 border-red-200 text-red-700"
                : "bg-white border-teal-100 text-gray-700"
            }`}>
              <span className="text-base shrink-0">{STEP_ICONS[progress.step] ?? "⏳"}</span>
              <div className="flex-1">
                <p className="font-medium">{progress.message}</p>
                {isError && (
                  <p className="text-xs mt-1 text-red-500 flex items-center gap-1">
                    <AlertCircle className="w-3 h-3" /> {progress.error}
                  </p>
                )}
              </div>
              <span className="text-xs text-gray-400 shrink-0">{progress.progress}%</span>
            </div>
          )}

          {/* Step tracker */}
          <div className="flex items-center justify-between text-xs text-gray-400 px-1">
            {["trends", "generating", "validation", "seo", "review", "saving"].map((s) => (
              <span
                key={s}
                className={`capitalize ${progress?.step === s ? "text-teal-600 font-semibold" : ""}`}
              >
                {STEP_ICONS[s]} {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Success */}
      {done && (
        <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 text-emerald-700 text-sm">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <div>
            <p className="font-semibold">Blog generated successfully!</p>
            <p className="text-xs text-emerald-600 mt-0.5">
              SEO Score: {done.seoScore}/100 · Trend Score: {done.trendScore}/100
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
