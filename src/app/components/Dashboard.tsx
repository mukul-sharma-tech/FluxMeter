"use client";

import MetricsPanel from "@/app/components/MetricsPanel";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/utils/supabase/client";
import {
  PanelLeftClose, PanelLeftOpen, TrendingUp, BarChart2,
  Trash2, Loader2, CheckCircle, XCircle, Lightbulb,
  Sparkles, FileText, ChevronRight, AlertCircle,
  Bot, Send, Code2, Eye, BarChart3
} from "lucide-react";
import { Database } from "@/app/types_db";

type Blog = Database["public"]["Tables"]["blogs"]["Row"];
interface ProgressState { step: string; message: string; progress: number; error?: string; }
interface ChatMsg { role: "user" | "assistant"; content: string; updatedBlog?: string; }

const STEP_ICONS: Record<string, string> = {
  trends: "📈", generating: "✍️", validation: "🔍",
  seo: "⚙️", review: "🤖", saving: "💾", done: "✅", error: "❌",
};
const STEPS = ["trends", "generating", "validation", "seo", "review", "saving"];

// ── Markdown renderer ──────────────────────────────────────
function renderMarkdown(content: string) {
  return content.split("\n").map((line) => {
    if (line.startsWith("# "))  return `<h1 class="text-2xl font-bold mt-8 mb-3 text-white">${line.slice(2)}</h1>`;
    if (line.startsWith("## ")) return `<h2 class="text-xl font-semibold mt-6 mb-2 text-teal-300 border-b border-white/10 pb-1">${line.slice(3)}</h2>`;
    if (line.startsWith("### "))return `<h3 class="text-lg font-semibold mt-4 mb-1 text-slate-300">${line.slice(4)}</h3>`;
    if (line.startsWith("- ") || line.startsWith("* "))
      return `<li class="ml-5 list-disc text-slate-300 leading-relaxed">${line.slice(2)}</li>`;
    if (line.trim() === "") return `<div class="h-3"></div>`;
    // Render markdown images: ![alt](url)
    const imgLine = line.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (_, alt, src) =>
      `<img src="${src}" alt="${alt}" class="rounded-xl my-4 max-w-full w-full object-cover max-h-80" loading="lazy" />`
    );
    // Render inline links: [text](url)
    const linkedLine = imgLine.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_, text, href) =>
      `<a href="${href}" target="_blank" rel="noopener noreferrer" class="text-teal-400 hover:text-teal-300 underline">${text}</a>`
    );
    if (linkedLine !== line) return `<p class="text-slate-300 leading-relaxed">${linkedLine}</p>`;
    return `<p class="text-slate-300 leading-relaxed">${line}</p>`;
  }).join("");
}

// ── Toast ──────────────────────────────────────────────────
function Toast({ status }: { status: { ok: boolean; msg: string } | null }) {
  if (!status) return null;
  return (
    <div className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-2xl border backdrop-blur-md text-sm font-medium
      ${status.ok ? "bg-emerald-950/90 border-emerald-500/30 text-emerald-300" : "bg-red-950/90 border-red-500/30 text-red-300"}`}
      style={{ maxWidth: "90vw" }}>
      <span>{status.ok ? "✅" : "❌"}</span>
      <span className="truncate">{status.msg}</span>
    </div>
  );
}

// ── Generating panel ───────────────────────────────────────
function GeneratingPanel({ keyword, progress }: { keyword: string; progress: ProgressState | null }) {
  const isError = progress?.step === "error";
  const pct = progress?.progress ?? 3;
  return (
    <div className="h-full flex flex-col items-center justify-center px-12 max-w-2xl mx-auto w-full">
      <div className="w-full mb-8">
        <p className="text-xs text-slate-500 uppercase tracking-widest mb-1">Generating</p>
        <h2 className="text-2xl font-bold text-white capitalize">{keyword}</h2>
      </div>
      <div className="w-full mb-4">
        <div className="flex justify-between text-xs text-slate-500 mb-2">
          <span>{progress?.message ?? "Starting..."}</span>
          <span>{pct}%</span>
        </div>
        <div className="w-full bg-white/5 rounded-full h-2 overflow-hidden">
          <div className={`h-2 rounded-full transition-all duration-700 ${isError ? "bg-red-500" : "bg-gradient-to-r from-teal-600 to-teal-400"}`} style={{ width: `${pct}%` }} />
        </div>
      </div>
      <div className="w-full flex items-center justify-between mb-8">
        {STEPS.map((s, i) => {
          const stepIndex = STEPS.indexOf(progress?.step ?? "");
          const done = stepIndex > i;
          const active = progress?.step === s;
          return (
            <div key={s} className="flex flex-col items-center gap-1">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm border transition-all duration-300 ${active ? "border-teal-400 bg-teal-400/20 scale-110" : done ? "border-teal-600 bg-teal-600/10" : "border-white/10 bg-white/5"}`}>
                {done ? <CheckCircle className="w-4 h-4 text-teal-500" /> : <span>{STEP_ICONS[s]}</span>}
              </div>
              <span className={`text-[10px] capitalize ${active ? "text-teal-400" : done ? "text-teal-600" : "text-slate-600"}`}>{s}</span>
            </div>
          );
        })}
      </div>
      {isError && (
        <div className="w-full flex items-start gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-300 text-sm">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div><p className="font-medium">Generation failed</p><p className="text-red-400 text-xs mt-1">{progress?.error ?? progress?.message}</p></div>
        </div>
      )}
      {!isError && progress?.step !== "done" && (
        <div className="flex gap-1.5 mt-4">
          {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
        </div>
      )}
    </div>
  );
}

// ── Blog viewer (middle panel) ─────────────────────────────
function BlogViewer({ blog, liveContent, onContentChange }: { blog: Blog; liveContent?: string; onContentChange?: (c: string) => void }) {
  const [viewMode, setViewMode] = useState<"preview" | "code" | "metrics">("preview");
  const [editableContent, setEditableContent] = useState(liveContent ?? blog.content ?? "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Sync when liveContent changes from AI chat
  const content = editableContent;

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/update-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogId: blog.id, content: editableContent }),
      });
      onContentChange?.(editableContent);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } finally {
      setSaving(false);
    }
  };

  // Sync incoming liveContent (from AI chat edits)
  const prevLive = useRef(liveContent);
  useEffect(() => {
    if (liveContent && liveContent !== prevLive.current) {
      setEditableContent(liveContent);
      prevLive.current = liveContent;
    }
  }, [liveContent]);

  let aiSuggestions: { suggestions?: string[]; missingTopics?: string[] } = {};
  try { if (blog.ai_suggestions) aiSuggestions = JSON.parse(blog.ai_suggestions); } catch { /* */ }

  const seoColor = !blog.seo_score ? "text-slate-400" : blog.seo_score >= 80 ? "text-emerald-400" : blog.seo_score >= 60 ? "text-yellow-400" : "text-red-400";

  return (
    <div className="h-full flex flex-col">
      {/* Toolbar */}
      <div className="flex items-center gap-3 px-6 py-3 border-b border-white/5 shrink-0">
        <h2 className="text-sm font-semibold text-white capitalize truncate flex-1">{blog.keyword}</h2>
        <div className="flex items-center gap-2">
          {blog.seo_score !== null && (
            <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2.5 py-1 border border-white/10">
              <BarChart2 className="w-3 h-3 text-teal-400" />
              <span className={`text-xs font-bold ${seoColor}`}>{blog.seo_score}/100</span>
            </div>
          )}
          {blog.trend_score !== null && (
            <div className="flex items-center gap-1.5 bg-white/5 rounded-lg px-2.5 py-1 border border-white/10">
              <TrendingUp className="w-3 h-3 text-emerald-400" />
              <span className="text-xs font-bold text-emerald-400">{blog.trend_score}/100</span>
            </div>
          )}
        </div>
        {/* Toggle */}
        <div className="flex items-center bg-white/5 rounded-lg p-0.5 border border-white/10">
          <button onClick={() => setViewMode("preview")} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition ${viewMode === "preview" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"}`}>
            <Eye className="w-3 h-3" /> Preview
          </button>
          <button onClick={() => setViewMode("code")} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition ${viewMode === "code" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"}`}>
            <Code2 className="w-3 h-3" /> Markdown
          </button>
          <button onClick={() => setViewMode("metrics")} className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs transition ${viewMode === "metrics" ? "bg-teal-600 text-white" : "text-slate-400 hover:text-white"}`}>
            <BarChart3 className="w-3 h-3" /> Metrics
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {viewMode === "metrics" ? (
          <MetricsPanel blogId={blog.id} keyword={blog.keyword} aiSuggestions={blog.ai_suggestions} />
        ) : viewMode === "preview" ? (
          <div className="px-8 py-6">
            {blog.status === "failed" && (
              <div className="flex items-center gap-3 bg-red-500/10 border border-red-500/20 rounded-xl p-4 text-red-300 text-sm mb-6">
                <XCircle className="w-4 h-4 shrink-0" /> Blog generation failed.
              </div>
            )}
            {aiSuggestions.suggestions && aiSuggestions.suggestions.length > 0 && (
              <div className="mb-6 bg-indigo-500/10 border border-indigo-500/20 rounded-xl p-4">
                <div className="flex items-center gap-2 mb-3 text-indigo-300 text-sm font-semibold">
                  <Lightbulb className="w-4 h-4" /> AI SEO Suggestions
                </div>
                <ul className="space-y-1.5">
                  {aiSuggestions.suggestions.map((s, i) => (
                    <li key={i} className="text-xs text-slate-300 flex gap-2"><span className="text-indigo-400 shrink-0">→</span>{s}</li>
                  ))}
                </ul>
                {aiSuggestions.missingTopics && aiSuggestions.missingTopics.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-indigo-500/20">
                    <p className="text-[10px] text-indigo-400 font-medium mb-2">Missing topics:</p>
                    <div className="flex flex-wrap gap-1.5">
                      {aiSuggestions.missingTopics.map((t, i) => (
                        <span key={i} className="text-[10px] bg-indigo-500/20 text-indigo-300 rounded-full px-2.5 py-0.5">{t}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            {content && <div className="prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: renderMarkdown(content) }} />}
          </div>
        ) : (
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between px-6 py-2 border-b border-white/5 shrink-0">
              <span className="text-[10px] text-slate-500">Edit markdown directly — changes reflect in Preview</span>
              <button
                onClick={handleSave}
                disabled={saving}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${saved ? "bg-emerald-600/20 text-emerald-400 border border-emerald-500/30" : "bg-teal-600 hover:bg-teal-500 text-white"} disabled:opacity-40`}
              >
                {saving ? <><Loader2 className="w-3 h-3 animate-spin" /> Saving...</> : saved ? <><CheckCircle className="w-3 h-3" /> Saved</> : "Save"}
              </button>
            </div>
            <textarea
              value={editableContent}
              onChange={e => { setEditableContent(e.target.value); onContentChange?.(e.target.value); }}
              spellCheck={false}
              className="flex-1 w-full px-6 py-4 bg-transparent text-xs text-slate-300 font-mono leading-relaxed resize-none focus:outline-none"
              style={{ minHeight: "100%" }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

// ── AI Chat panel (right) ──────────────────────────────────
function ChatPanel({ blog, onBlogUpdate }: { blog: Blog; onBlogUpdate: (content: string) => void }) {
  const [messages, setMessages] = useState<ChatMsg[]>([
    { role: "assistant", content: "Hi! I can help you improve this blog. Ask me to rewrite sections, improve SEO, change the tone, add content, or anything else." }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [liveContent, setLiveContent] = useState(blog.content ?? "");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => { setLiveContent(blog.content ?? ""); }, [blog.id, blog.content]);

  const send = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input.trim();
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const history = messages.slice(-6).map(m => ({ role: m.role, content: m.content }));
      const res = await fetch("/api/chat-blog", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ blogContent: liveContent, userMessage: userMsg, history }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      const assistantMsg: ChatMsg = { role: "assistant", content: data.reply };
      if (data.updatedBlog) {
        assistantMsg.updatedBlog = data.updatedBlog;
        setLiveContent(data.updatedBlog);
        onBlogUpdate(data.updatedBlog);
      }
      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { role: "assistant", content: `Error: ${err instanceof Error ? err.message : "Unknown error"}` }]);
    } finally {
      setLoading(false);
    }
  };

  const applyUpdate = async (content: string) => {
    await fetch("/api/update-blog", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ blogId: blog.id, content }),
    });
  };

  return (
    <div className="h-full flex flex-col bg-[#0d0d14] border-l border-white/5">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-white/5 shrink-0">
        <Bot className="w-4 h-4 text-teal-400" />
        <span className="text-sm font-semibold text-white">AI Editor</span>
        <span className="ml-auto text-[10px] text-slate-600">edits apply live</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
            <div className={`max-w-[85%] rounded-2xl px-3 py-2.5 text-xs leading-relaxed ${
              msg.role === "user"
                ? "bg-teal-600/30 text-teal-100 rounded-br-sm"
                : "bg-white/5 text-slate-300 rounded-bl-sm border border-white/10"
            }`}>
              {msg.content}
              {msg.updatedBlog && (
                <button
                  onClick={() => applyUpdate(msg.updatedBlog!)}
                  className="mt-2 flex items-center gap-1.5 text-[10px] text-teal-400 hover:text-teal-300 transition"
                >
                  <CheckCircle className="w-3 h-3" /> Save changes to DB
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 border border-white/10 rounded-2xl rounded-bl-sm px-3 py-2.5 flex gap-1">
              {[0,1,2].map(i => <div key={i} className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-bounce" style={{ animationDelay: `${i*0.15}s` }} />)}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Quick actions */}
      <div className="px-4 pb-2 flex flex-wrap gap-1.5">
        {["Improve SEO", "Fix grammar", "Make it shorter", "Add FAQ", "Change tone to casual"].map(action => (
          <button key={action} onClick={() => { setInput(action); }}
            className="text-[10px] px-2.5 py-1 rounded-full bg-white/5 border border-white/10 text-slate-400 hover:text-white hover:border-teal-500/50 transition">
            {action}
          </button>
        ))}
      </div>

      {/* Input */}
      <div className="px-4 pb-4 pt-2 border-t border-white/5">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
            placeholder="Ask AI to edit the blog..."
            disabled={loading}
            className="flex-1 px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-600 text-xs focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-40"
          />
          <button onClick={send} disabled={loading || !input.trim()}
            className="p-2 rounded-xl bg-teal-600 hover:bg-teal-500 text-white transition disabled:opacity-40">
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Sidebar components ─────────────────────────────────────
function BlogItem({ blog, active, onClick, onDelete }: {
  blog: Blog; active: boolean; onClick: () => void; onDelete: (id: string) => void;
}) {
  const seoColor = !blog.seo_score ? "text-slate-500" : blog.seo_score >= 80 ? "text-emerald-400" : blog.seo_score >= 60 ? "text-yellow-400" : "text-red-400";
  return (
    <div onClick={onClick} className={`group relative flex items-start gap-2 px-3 py-2.5 rounded-lg cursor-pointer transition-all ${active ? "bg-teal-600/20 border border-teal-500/30" : "hover:bg-white/5 border border-transparent"}`}>
      <FileText className="w-4 h-4 mt-0.5 shrink-0 text-slate-500" />
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-200 truncate capitalize">{blog.keyword}</p>
        <div className="flex items-center gap-2 mt-0.5">
          {blog.status === "generating" && <span className="text-[10px] text-yellow-400 flex items-center gap-1"><Loader2 className="w-2.5 h-2.5 animate-spin" />generating</span>}
          {blog.status === "generated" && <span className={`text-[10px] font-medium ${seoColor}`}>SEO {blog.seo_score}/100</span>}
          {blog.status === "failed" && <span className="text-[10px] text-red-400">failed</span>}
          {blog.trend_score !== null && <span className="text-[10px] text-slate-500">· trend {blog.trend_score}</span>}
        </div>
      </div>
      <button onClick={(e) => { e.stopPropagation(); onDelete(blog.id); }} className="opacity-0 group-hover:opacity-100 p-1 rounded text-slate-600 hover:text-red-400 transition">
        <Trash2 className="w-3 h-3" />
      </button>
      {active && <ChevronRight className="w-3 h-3 text-teal-400 shrink-0 mt-1" />}
    </div>
  );
}

function TrendsUploader({ onToast }: { onToast: (s: { ok: boolean; msg: string }) => void }) {
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const handleUpload = async () => {
    if (!files.length) return;
    setUploading(true);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("file", f));
      const res = await fetch("/api/upload-trends", { method: "POST", body: fd });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      const count = data.saved.length;
      const unrecog = data.unrecognized?.length ? ` (${data.unrecognized.length} unrecognized)` : "";
      onToast({ ok: true, msg: `Google Trends uploaded${unrecog} — ${count} file${count !== 1 ? "s" : ""} ready` });
      setFiles([]);
    } catch (err) {
      onToast({ ok: false, msg: err instanceof Error ? err.message : "Upload failed" });
    } finally { setUploading(false); }
  };
  return (
    <div className="space-y-2">
      <label className={`flex flex-col items-center justify-center w-full h-16 rounded-lg border-2 border-dashed cursor-pointer transition ${files.length ? "border-teal-500/50 bg-teal-500/5" : "border-white/10 bg-white/5 hover:border-white/20"}`}>
        <input type="file" accept=".csv" multiple className="hidden" onChange={e => { if (e.target.files) setFiles(Array.from(e.target.files)); }} />
        {files.length ? (
          <p className="text-xs text-teal-400 font-medium px-2 truncate">{files.length} file{files.length > 1 ? "s" : ""} selected</p>
        ) : (
          <p className="text-xs text-slate-500">Drop Google Trends CSVs (up to 4)</p>
        )}
      </label>
      {files.length > 0 && (
        <button onClick={handleUpload} disabled={uploading} className="w-full py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs text-slate-300 font-medium transition disabled:opacity-40 flex items-center justify-center gap-2">
          {uploading ? <><Loader2 className="w-3 h-3 animate-spin" /> Uploading...</> : "Upload CSVs"}
        </button>
      )}
    </div>
  );
}

function SidebarForm({ onStart, onDone, onProgress }: {
  onStart: (kw: string) => void; onDone: (id: string) => void; onProgress: (p: ProgressState) => void;
}) {
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!keyword.trim()) return;
    const kw = keyword.trim();
    setLoading(true); setKeyword(""); onStart(kw);
    try {
      const res = await fetch("/api/generate-blog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ keyword: kw }) });
      if (!res.body) throw new Error("No stream");
      const reader = res.body.getReader(); const decoder = new TextDecoder(); let buffer = "";
      while (true) {
        const { done, value } = await reader.read(); if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n"); buffer = lines.pop() || "";
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const data = JSON.parse(line);
            if (data.done) onDone(data.blogId);
            else if (data.step) onProgress({ step: data.step, message: data.message, progress: data.progress, error: data.error });
          } catch { /* skip */ }
        }
      }
    } catch (err) {
      onProgress({ step: "error", message: err instanceof Error ? err.message : "Unknown error", progress: 0, error: String(err) });
    } finally { setLoading(false); }
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-2">
      <input type="text" value={keyword} onChange={e => setKeyword(e.target.value)} disabled={loading} placeholder="e.g. AI tools, react hooks..."
        className="w-full px-3 py-2.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-sm focus:outline-none focus:ring-1 focus:ring-teal-500 disabled:opacity-40 transition" />
      <button type="submit" disabled={loading || !keyword.trim()} className="w-full py-2.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-sm font-semibold transition disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2">
        {loading ? <><Loader2 className="w-4 h-4 animate-spin" /> Generating...</> : <><Sparkles className="w-4 h-4" /> Generate Blog</>}
      </button>
    </form>
  );
}

// ── Main Dashboard ─────────────────────────────────────────
export default function Dashboard({ initialBlogs }: { initialBlogs: Blog[] }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [blogs, setBlogs] = useState(initialBlogs);
  const [activeBlogId, setActiveBlogId] = useState<string | null>(initialBlogs[0]?.id ?? null);
  const [generating, setGenerating] = useState<{ keyword: string; progress: ProgressState | null } | null>(null);
  const [toast, setToast] = useState<{ ok: boolean; msg: string } | null>(null);
  const [liveBlogContent, setLiveBlogContent] = useState<Record<string, string>>({});
  const supabase = createClient();

  const activeBlog = blogs.find((b) => b.id === activeBlogId) ?? null;

  const showToast = (s: { ok: boolean; msg: string }) => {
    setToast(s);
    setTimeout(() => setToast(null), 4500);
  };

  useEffect(() => {
    const channel = supabase.channel("blogs-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "blogs" }, (payload) => {
        setBlogs((prev) => [payload.new as Blog, ...prev]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "blogs" }, (payload) => {
        setBlogs((prev) => prev.map((b) => b.id === (payload.new as Blog).id ? payload.new as Blog : b));
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "blogs" }, (payload) => {
        setBlogs((prev) => prev.filter((b) => b.id !== (payload.old as Blog).id));
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const handleDelete = async (id: string) => {
    await supabase.from("blogs").delete().eq("id", id);
    if (activeBlogId === id) setActiveBlogId(blogs.find((b) => b.id !== id)?.id ?? null);
  };

  const handleBlogUpdate = (blogId: string, content: string) => {
    setLiveBlogContent(prev => ({ ...prev, [blogId]: content }));
  };

  return (
    <div className="flex h-screen bg-[#0a0a0f] text-white overflow-hidden">

      {/* Left: Sidebar */}
      <aside className={`flex flex-col shrink-0 border-r border-white/5 bg-[#0d0d14] transition-all duration-300 ${sidebarOpen ? "w-64" : "w-0 overflow-hidden"}`}>
        <div className="flex items-center gap-2 px-4 py-4 border-b border-white/5">
          <Sparkles className="w-4 h-4 text-teal-400" />
          <span className="text-sm font-semibold text-white">FluxMeter</span>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-2 font-medium">Trends CSVs</p>
            <TrendsUploader onToast={showToast} />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-2 font-medium">New Blog</p>
            <SidebarForm
              onStart={(kw) => { setGenerating({ keyword: kw, progress: null }); setActiveBlogId(null); }}
              onDone={(id) => { setGenerating(null); setActiveBlogId(id); }}
              onProgress={(p) => setGenerating(prev => prev ? { ...prev, progress: p } : null)}
            />
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-widest text-slate-600 mb-2 font-medium">Generated ({blogs.length})</p>
            <div className="space-y-0.5">
              {blogs.length === 0 && <p className="text-xs text-slate-600 text-center py-4">No blogs yet</p>}
              {blogs.map((blog) => (
                <BlogItem key={blog.id} blog={blog}
                  active={!generating && blog.id === activeBlogId}
                  onClick={() => { setGenerating(null); setActiveBlogId(blog.id); }}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        </div>
      </aside>

      {/* Center + Right wrapper */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-white/5 shrink-0">
          <button onClick={() => setSidebarOpen(o => !o)} className="p-1.5 rounded-lg text-slate-500 hover:text-white hover:bg-white/5 transition">
            {sidebarOpen ? <PanelLeftClose className="w-4 h-4" /> : <PanelLeftOpen className="w-4 h-4" />}
          </button>
          <span className="text-sm text-slate-500">
            {generating ? <span className="text-teal-400 capitalize">{generating.keyword}</span>
              : activeBlog ? <span className="text-slate-300 capitalize">{activeBlog.keyword}</span>
              : "Select a blog"}
          </span>
          {generating && (
            <div className="ml-auto flex items-center gap-2">
              <Loader2 className="w-3.5 h-3.5 text-teal-400 animate-spin" />
              <span className="text-xs text-teal-400">{generating.progress?.progress ?? 0}%</span>
            </div>
          )}
          {activeBlog?.status === "generated" && !generating && (
            <div className="ml-auto flex items-center gap-2">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-xs text-emerald-400">Generated</span>
            </div>
          )}
        </div>

        {/* Panels */}
        <div className="flex-1 overflow-hidden flex">
          {/* Middle: Blog viewer */}
          <div className="flex-1 min-w-0 border-r border-white/5 overflow-hidden">
            {generating ? (
              <div className="h-full flex items-center justify-center">
                <GeneratingPanel keyword={generating.keyword} progress={generating.progress} />
              </div>
            ) : activeBlog ? (
              <BlogViewer
                blog={activeBlog}
                liveContent={liveBlogContent[activeBlog.id]}
                onContentChange={(c) => handleBlogUpdate(activeBlog.id, c)}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center gap-4">
                <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center">
                  <Sparkles className="w-7 h-7 text-teal-500" />
                </div>
                <div>
                  <p className="text-slate-300 font-medium">No blog selected</p>
                  <p className="text-slate-600 text-sm mt-1">Generate or select a blog from the sidebar</p>
                </div>
              </div>
            )}
          </div>

          {/* Right: AI Chat */}
          <div className="w-80 shrink-0 overflow-hidden">
            {activeBlog && !generating ? (
              <ChatPanel
                blog={activeBlog}
                onBlogUpdate={(content) => handleBlogUpdate(activeBlog.id, content)}
              />
            ) : (
              <div className="h-full flex flex-col items-center justify-center gap-3 bg-[#0d0d14] border-l border-white/5">
                <Bot className="w-8 h-8 text-slate-700" />
                <p className="text-xs text-slate-600 text-center px-4">AI Editor available once a blog is selected</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Toast status={toast} />
    </div>
  );
}
