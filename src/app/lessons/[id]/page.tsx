import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import LessonRenderer from "@/app/components/LessonRenderer";
import { ArrowLeft, Loader2, XCircle, GraduationCap } from "lucide-react";
import ThreeBackground from "@/app/components/ThreeBackground";

type LessonPageProps = { params: Promise<{ id: string }> };

export default async function LessonPage({ params }: LessonPageProps) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: lesson } = await supabase
    .from("lessons")
    .select("*")
    .eq("id", id)
    .single();

  if (!lesson) notFound();

  const toSentenceCase = (text: string) =>
    text ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : "";

  return (
    <div className="relative min-h-screen w-full text-white flex flex-col overflow-x-hidden">
      <ThreeBackground />
      <div className="relative z-10 flex-1 px-3 sm:px-5 md:px-8 py-6 md:py-10">
        <div className="max-w-4xl mx-auto backdrop-blur-md bg-white/10 rounded-2xl shadow-xl border border-white/10 p-4 sm:p-6 md:p-8">
          <Link href="/" className="inline-flex items-center gap-2 text-blue-300 hover:text-blue-400 transition mb-5 text-sm group">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            Back
          </Link>

          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 text-transparent bg-clip-text leading-tight break-words">
            {toSentenceCase(lesson.outline)}
          </h1>

          {lesson.status === "generated" && (
            <div className="mb-6">
              <Link href={`/lessons/${id}/explain`} className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all shadow-lg hover:scale-105">
                <GraduationCap className="w-5 h-5" />
                Learn from a Human-like Teacher
              </Link>
            </div>
          )}

          {lesson.status === "generating" && (
            <div className="flex items-center gap-3 border border-yellow-400/30 bg-yellow-400/10 rounded-lg p-4 text-yellow-200">
              <Loader2 className="animate-spin w-5 h-5" />
              <span>Lesson is still generating...</span>
            </div>
          )}

          {lesson.status === "failed" && (
            <div className="flex items-center gap-3 border border-red-400/30 bg-red-400/10 rounded-lg p-4 text-red-200">
              <XCircle className="w-5 h-5" />
              <span>Lesson failed to generate.</span>
            </div>
          )}

          {lesson.status === "generated" && (
            <div className="mt-4">
              <LessonRenderer code={lesson.content || ""} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
