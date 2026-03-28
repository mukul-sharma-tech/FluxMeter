import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Loader2, XCircle, TrendingUp, BarChart2, Lightbulb } from "lucide-react";

type BlogPageProps = {
  params: Promise<{ id: string }>;
};

function toSentenceCase(text: string) {
  if (!text) return "";
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function renderMarkdown(content: string) {
  // Simple markdown → HTML for display
  return content
    .split("\n")
    .map((line) => {
      if (line.startsWith("# ")) return `<h1 class="text-3xl font-bold mt-6 mb-3 text-cyan-300">${line.slice(2)}</h1>`;
      if (line.startsWith("## ")) return `<h2 class="text-2xl font-semibold mt-5 mb-2 text-blue-300">${line.slice(3)}</h2>`;
      if (line.startsWith("### ")) return `<h3 class="text-xl font-semibold mt-4 mb-2 text-indigo-300">${line.slice(4)}</h3>`;
      if (line.startsWith("- ") || line.startsWith("* ")) return `<li class="ml-4 list-disc text-gray-200">${line.slice(2)}</li>`;
      if (line.trim() === "") return `<br/>`;
      return `<p class="text-gray-200 leading-relaxed">${line}</p>`;
    })
    .join("\n");
}

export default async function BlogPage({ params }: BlogPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: blog } = await supabase
    .from("blogs")
    .select("*")
    .eq("id", id)
    .single();

  if (!blog) notFound();

  let aiSuggestions: { suggestions?: string[]; improvedIntro?: string; missingTopics?: string[] } = {};
  try {
    if (blog.ai_suggestions) aiSuggestions = JSON.parse(blog.ai_suggestions);
  } catch { /* ignore */ }

  const seoColor = (score: number | null) => {
    if (!score) return "text-gray-400";
    if (score >= 80) return "text-emerald-400";
    if (score >= 60) return "text-yellow-400";
    return "text-red-400";
  };

  return (
    <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-white px-6 py-10">
      <div className="max-w-4xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to home
        </Link>

        <h1 className="text-4xl font-extrabold mb-2 tracking-tight bg-gradient-to-r from-teal-300 to-emerald-400 text-transparent bg-clip-text">
          {toSentenceCase(blog.keyword)}
        </h1>

        {/* Scores */}
        <div className="flex flex-wrap gap-4 mb-6">
          {blog.seo_score !== null && (
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2 border border-white/10">
              <BarChart2 className="w-4 h-4 text-teal-400" />
              <span className="text-sm text-gray-300">SEO Score:</span>
              <span className={`font-bold text-lg ${seoColor(blog.seo_score)}`}>{blog.seo_score}/100</span>
            </div>
          )}
          {blog.trend_score !== null && (
            <div className="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2 border border-white/10">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <span className="text-sm text-gray-300">Trend Score:</span>
              <span className="font-bold text-lg text-emerald-400">{blog.trend_score}/100</span>
            </div>
          )}
        </div>

        {/* Status */}
        {blog.status === "generating" && (
          <div className="flex items-center gap-3 border border-yellow-400/30 bg-yellow-400/10 rounded-lg p-6 text-yellow-200 mb-6">
            <Loader2 className="animate-spin w-5 h-5" />
            <span>Blog is being generated — AI is writing, validating SEO, and reviewing...</span>
          </div>
        )}

        {blog.status === "failed" && (
          <div className="flex items-center gap-3 border border-red-400/30 bg-red-400/10 rounded-lg p-6 text-red-200 mb-6">
            <XCircle className="w-5 h-5" />
            <span>Blog generation failed. Check Inngest logs for details.</span>
          </div>
        )}

        {/* AI Suggestions Panel */}
        {blog.status === "generated" && aiSuggestions.suggestions && aiSuggestions.suggestions.length > 0 && (
          <div className="mb-6 bg-indigo-900/40 border border-indigo-500/30 rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3 text-indigo-300 font-semibold">
              <Lightbulb className="w-4 h-4" />
              AI SEO Suggestions
            </div>
            <ul className="space-y-1">
              {aiSuggestions.suggestions.map((s, i) => (
                <li key={i} className="text-sm text-gray-300 flex gap-2">
                  <span className="text-indigo-400 shrink-0">→</span>
                  {s}
                </li>
              ))}
            </ul>
            {aiSuggestions.missingTopics && aiSuggestions.missingTopics.length > 0 && (
              <div className="mt-3 pt-3 border-t border-indigo-500/20">
                <p className="text-xs text-indigo-400 font-medium mb-1">Missing topics to consider:</p>
                <div className="flex flex-wrap gap-2">
                  {aiSuggestions.missingTopics.map((t, i) => (
                    <span key={i} className="text-xs bg-indigo-800/50 text-indigo-200 rounded-full px-3 py-1">{t}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Blog Content */}
        {blog.status === "generated" && blog.content && (
          <div
            className="backdrop-blur-md bg-white/5 rounded-2xl shadow-2xl border border-white/10 p-8"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(blog.content) }}
          />
        )}
      </div>
    </div>
  );
}
