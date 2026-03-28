"use client";

import { createClient } from "@/utils/supabase/client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, CheckCircle, Loader2, Trash2, TrendingUp, XCircle } from "lucide-react";
import { Database } from "@/app/types_db";

type Blog = Database["public"]["Tables"]["blogs"]["Row"];

type BlogsTableProps = {
  initialBlogs: Blog[];
};

export default function BlogsTable({ initialBlogs }: BlogsTableProps) {
  const [blogs, setBlogs] = useState(initialBlogs);
  const [isOpen, setIsOpen] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const supabase = createClient();

  function toSentenceCase(text: string) {
    if (!text) return "";
    return text.charAt(0).toUpperCase() + text.slice(1);
  }

  const handleDelete = async (blogId: string) => {
    if (deletingId) return;
    setDeletingId(blogId);
    try {
      const { error } = await supabase.from("blogs").delete().eq("id", blogId);
      if (error) console.error("Error deleting blog:", error);
      setTimeout(() => setDeletingId(null), 2000);
    } catch (err) {
      console.error("Delete error:", err);
      setDeletingId(null);
    }
  };

  useEffect(() => {
    const channel = supabase
      .channel("blogs-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "blogs" }, (payload) => {
        setBlogs((prev) => [payload.new as Blog, ...prev]);
      })
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "blogs" }, (payload) => {
        setBlogs((prev) =>
          prev.map((b) => (b.id === (payload.new as Blog).id ? (payload.new as Blog) : b))
        );
      })
      .on("postgres_changes", { event: "DELETE", schema: "public", table: "blogs" }, (payload) => {
        setBlogs((prev) => prev.filter((b) => b.id !== (payload.old as Blog).id));
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [supabase]);

  const seoColor = (score: number | null) => {
    if (!score) return "text-gray-400";
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-500";
  };

  return (
    <div>
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="flex items-center gap-2 text-teal-700 font-semibold text-lg mb-4 hover:text-teal-900 transition"
      >
        {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
        Generated Blogs ({blogs.length})
      </button>

      {isOpen && (
        <div className="space-y-3">
          {blogs.length === 0 && (
            <p className="text-gray-500 text-sm text-center py-6">No blogs yet. Generate your first SEO blog above.</p>
          )}
          {blogs.map((blog) => (
            <div
              key={blog.id}
              className="flex items-center justify-between gap-4 p-4 rounded-xl bg-white border border-teal-100 shadow-sm hover:shadow-md transition"
            >
              <div className="flex-1 min-w-0">
                <Link
                  href={`/blogs/${blog.id}`}
                  className="font-medium text-teal-800 hover:text-teal-600 truncate block"
                >
                  {toSentenceCase(blog.keyword)}
                </Link>
                <div className="flex items-center gap-3 mt-1 text-xs text-gray-500">
                  {blog.trend_score !== null && (
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3 h-3" />
                      Trend: {blog.trend_score}
                    </span>
                  )}
                  {blog.seo_score !== null && (
                    <span className={`font-semibold ${seoColor(blog.seo_score)}`}>
                      SEO: {blog.seo_score}/100
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {blog.status === "generating" && (
                  <span className="flex items-center gap-1 text-xs text-yellow-600 bg-yellow-50 border border-yellow-200 rounded-full px-2 py-1">
                    <Loader2 className="w-3 h-3 animate-spin" /> Generating
                  </span>
                )}
                {blog.status === "generated" && (
                  <span className="flex items-center gap-1 text-xs text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-full px-2 py-1">
                    <CheckCircle className="w-3 h-3" /> Done
                  </span>
                )}
                {blog.status === "failed" && (
                  <span className="flex items-center gap-1 text-xs text-red-600 bg-red-50 border border-red-200 rounded-full px-2 py-1">
                    <XCircle className="w-3 h-3" /> Failed
                  </span>
                )}
                <button
                  onClick={() => handleDelete(blog.id)}
                  disabled={deletingId === blog.id}
                  className="p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition disabled:opacity-40"
                  aria-label="Delete blog"
                >
                  {deletingId === blog.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
