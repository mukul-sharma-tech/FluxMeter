"use client";

import { createClient } from "@/utils/supabase/client";
import { Lesson } from "@/app/page";
import { useEffect, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronUp, CheckCircle, Loader2, Trash2 } from "lucide-react"; // 1. Added Trash2

type LessonsTableProps = {
  initialLessons: Lesson[];
};

export default function LessonsTable({ initialLessons }: LessonsTableProps) {
  const [lessons, setLessons] = useState(initialLessons);
  const [isOpen, setIsOpen] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null); // 2. Added deleting state
  const supabase = createClient();


  function toSentenceCase(text: string) {
    if (!text) return "";
    const lower = text.toLowerCase();
    return lower.charAt(0).toUpperCase() + lower.slice(1);
  }

  // 3. New async function to handle deleting a lesson
  const handleDelete = async (lessonId: string) => {
    // Prevent double-clicks
    if (deletingId) return;

    setDeletingId(lessonId);
    try {
      const { error } = await supabase
        .from("lessons")
        .delete()
        .eq("id", lessonId);

      if (error) {
        console.error("Error deleting lesson:", error);
        alert("Could not delete lesson."); // Or use a proper toast notification
      }
      // No need to setDeletingId(null) here, as the realtime
      // DELETE event will remove the item from the list,
      // which automatically removes the button.
      // We'll add a fallback just in case realtime fails.
      setTimeout(() => setDeletingId(null), 2000);

    } catch (error: unknown) {
      console.error("Client-side delete error:", error);

      // Narrow the type before using .message
      if (error instanceof Error) {
        alert(error.message);
      } else {
        alert("Unknown error occurred");
      }

      setDeletingId(null);
    }

  };

  useEffect(() => {
    const channel = supabase
      .channel("lessons-feed")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lessons" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setIsOpen(true); // Open the table when a new lesson is added
            setLessons((curr) => [payload.new as Lesson, ...curr]);
          }
          if (payload.eventType === "UPDATE") {
            setLessons((curr) =>
              curr.map((lesson) =>
                lesson.id === payload.new.id
                  ? (payload.new as Lesson)
                  : lesson
              )
            );
          }
          // 4. Added DELETE event handler
          if (payload.eventType === "DELETE") {
            setLessons((curr) =>
              curr.filter((lesson) => lesson.id !== payload.old.id)
            );
            setDeletingId(null); // Clear spinner state
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  if (lessons.length === 0) {
    return (
      <p className="text-gray-500 text-center py-4 italic">
        No lessons generated yet.
      </p>
    );
  }

  return (
    <div className="rounded-2xl shadow-sm border border-indigo-100 bg-white/70 backdrop-blur-sm p-4">
      {/* Header + Collapse Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
        <h2 className="text-2xl font-semibold text-indigo-700">
          Generated Lessons
        </h2>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-center gap-1 text-sm px-3 py-1.5 rounded-md bg-indigo-100 hover:bg-indigo-200 text-indigo-700 transition self-end sm:self-auto"
        >
          {isOpen ? (
            <>
              <ChevronUp size={16} /> Hide
            </>
          ) : (
            <>
              <ChevronDown size={16} /> Show
            </>
          )}
        </button>
      </div>

      {/* Collapsible Section */}
      <div
        className={`transition-all duration-500 ease-in-out overflow-y-auto ${isOpen ? "max-h-[70vh] opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        {/* Desktop Table */}
        <div className="hidden md:block overflow-x-auto rounded-xl border border-indigo-100 mt-2">
          <table className="min-w-full divide-y divide-indigo-100 text-sm">
            <thead className="bg-gradient-to-r from-indigo-50 to-sky-50">
              <tr>
                <th className="px-6 py-3 text-left font-semibold text-indigo-700 uppercase tracking-wider">
                  Lesson Outline
                </th>
                <th className="px-6 py-3 text-left font-semibold text-indigo-700 uppercase tracking-wider">
                  Status
                </th>
                {/* 5. New column for desktop */}
                <th className="px-6 py-3 text-right font-semibold text-indigo-700 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-indigo-100">
              {lessons.map((lesson, idx) => (
                <tr
                  key={lesson.id}
                  className={`transition ${idx % 2 === 0
                    ? "bg-white hover:bg-indigo-50"
                    : "bg-indigo-50/50 hover:bg-indigo-100"
                    }`}
                >
                  <td className="px-6 py-4 max-w-md">
                    <Link
                      href={`/lessons/${lesson.id}`}
                      className="text-indigo-600 hover:text-indigo-800 font-medium hover:underline line-clamp-2"
                    >
                      {toSentenceCase(lesson.outline || '')}
                    </Link>
                  </td>

                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`flex items-center gap-2 px-3 py-1 inline-flex text-xs font-semibold rounded-full ${lesson.status === "generated"
                        ? "bg-green-100 text-green-700 border border-green-200"
                        : "bg-yellow-100 text-yellow-700 border border-yellow-200 animate-pulse"
                        }`}
                    >
                      {lesson.status === "generated" ? (
                        <>
                          <CheckCircle size={14} className="text-green-600" />
                          Generated
                        </>
                      ) : (
                        <>
                          <Loader2 size={14} className="text-yellow-600 animate-spin" />
                          Generating...
                        </>
                      )}
                    </span>
                  </td>
                  
                  {/* 6. Delete button cell for desktop */}
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <button
                      onClick={() => handleDelete(lesson.id)}
                      disabled={deletingId === lesson.id}
                      className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition disabled:opacity-50"
                      aria-label="Delete lesson"
                    >
                      {deletingId === lesson.id ? (
                        <Loader2 size={16} className="animate-spin" />
                      ) : (
                        <Trash2 size={16} />
                      )}
                    </button>
                  </td>

                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Card View */}
        <div className="md:hidden space-y-3 mt-3">
          {lessons.map((lesson) => (
            <div
              key={lesson.id}
              className="p-4 rounded-xl border border-indigo-100 bg-white/90 shadow-sm hover:shadow-md transition"
            >
              <Link
                href={`/lessons/${lesson.id}`}
                className="block font-medium text-indigo-700 hover:underline mb-3 line-clamp-2 h-12"
              >
                {toSentenceCase(lesson.outline || '')}
              </Link>

              {/* 7. Wrapper for mobile status and delete button */}
              <div className="flex justify-between items-center">
                <span
                  className={`flex items-center gap-2 px-3 py-1 inline-flex text-xs font-semibold rounded-full ${lesson.status === "generated"
                    ? "bg-green-100 text-green-700 border border-green-200"
                    : "bg-yellow-100 text-yellow-700 border border-yellow-200 animate-pulse"
                    }`}
                >
                  {lesson.status === "generated" ? (
                    <>
                      <CheckCircle size={14} className="text-green-600" />
                      Generated
                    </>
                  ) : (
                    <>
                      <Loader2 size={14} className="text-yellow-600 animate-spin" />
                      Generating...
                    </>
                  )}
                </span>

                <button
                  onClick={() => handleDelete(lesson.id)}
                  disabled={deletingId === lesson.id}
                  className="p-2 text-red-500 hover:text-red-700 hover:bg-red-100 rounded-full transition disabled:opacity-50"
                  aria-label="Delete lesson"
                >
                  {deletingId === lesson.id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </button>
              </div>

            </div>
          ))}
        </div>
      </div>
    </div>
  );
}