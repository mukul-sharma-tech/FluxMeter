// // app/lessons/[id]/page.tsx

// import { createClient } from "@/utils/supabase/server";
// import Link from "next/link";
// import { notFound } from "next/navigation";
// import LessonRenderer from "@/app/components/LessonRenderer";
// import { ArrowLeft, Loader2, XCircle, CheckCircle } from "lucide-react"; // 👈 Lucide icons

// type LessonPageProps = {
//   params: {
//     id: string;
//   };
// };

// export default async function LessonPage({ params }: LessonPageProps) {
  
//   const { id } = await params;

//   const supabase = await createClient();

//   // This code will now work because 'supabase' is the real client.
//   const { data: lesson } = await supabase
//     .from("lessons")
//     .select("*")
//     .eq("id", id) // Use the 'id' variable
//     .single();

//   if (!lesson) {
//     notFound();
//   }
// function toSentenceCase(text: string) {
//   if (!text) return "";
//   const lower = text.toLowerCase();
//   return lower.charAt(0).toUpperCase() + lower.slice(1);
// }

//   return (
//     <div className="min-h-screen w-full bg-gradient-to-b from-slate-950 via-slate-900 to-slate-800 text-white px-6 py-10">
//       <div className="max-w-4xl mx-auto backdrop-blur-md bg-white/10 rounded-2xl shadow-2xl border border-white/10 p-8">
        
//         {/* Back Link */}
//         <Link
//           href="/"
//           className="inline-flex items-center gap-2 text-blue-400 hover:text-blue-300 transition mb-6"
//         >
//           <ArrowLeft className="w-5 h-5" />
//           Back to all lessons
//         </Link>

//         {/* Lesson Title */}
//         <h1 className="text-4xl font-extrabold mb-6 tracking-tight bg-gradient-to-r from-cyan-300 to-blue-500 text-transparent bg-clip-text">
//           {toSentenceCase(lesson.outline)}
//         </h1>

//         {/* Lesson Status */}
//         <div>
//           {lesson.status === "generating" && (
//             <div className="flex items-center gap-3 border border-yellow-400/30 bg-yellow-400/10 rounded-lg p-6 text-yellow-200">
//               <Loader2 className="animate-spin w-5 h-5" />
//               <span>Lesson is still generating...</span>
//             </div>
//           )}

//           {lesson.status === "failed" && (
//             <div className="flex items-center gap-3 border border-red-400/30 bg-red-400/10 rounded-lg p-6 text-red-200">
//               <XCircle className="w-5 h-5" />
//               <span>Lesson failed to generate. Check Inngest logs for details.</span>
//             </div>
//           )}

//           {lesson.status === "generated" && (
//             <div className="prose prose-invert prose-pre:bg-slate-900 prose-headings:text-cyan-300 prose-a:text-blue-400 hover:prose-a:text-blue-300 max-w-none">
//               <LessonRenderer code={lesson.content || ""} />
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }


// // app/lessons/[id]/page.tsx

// import { createClient } from "@/utils/supabase/server";
// import Link from "next/link";
// import { notFound } from "next/navigation";
// import LessonRenderer from "@/app/components/LessonRenderer";
// import { ArrowLeft, Loader2, XCircle } from "lucide-react";
// import ThreeBackground from "@/app/components/ThreeBackground"; // 👈 Import added

// type LessonPageProps = {
//   params: {
//     id: string;
//   };
// };

// export default async function LessonPage({ params }: LessonPageProps) {
//   const { id } = await params;
//   const supabase = await createClient();

//   const { data: lesson } = await supabase
//     .from("lessons")
//     .select("*")
//     .eq("id", id)
//     .single();

//   if (!lesson) notFound();

//   function toSentenceCase(text: string) {
//     if (!text) return "";
//     const lower = text.toLowerCase();
//     return lower.charAt(0).toUpperCase() + lower.slice(1);
//   }

//   return (
//     <div className="relative min-h-screen w-full text-white">
//       {/* --- 3D SPACE BACKGROUND --- */}
//       <ThreeBackground />

//       {/* --- MAIN CONTENT --- */}
//       <div className="relative z-10 px-6 py-10">
//         <div className="max-w-4xl mx-auto backdrop-blur-md bg-white/10 rounded-2xl shadow-2xl border border-white/10 p-8">
//           {/* Back Link */}
// <Link
//   href="/"
//   className="inline-flex items-center gap-2 text-blue-800 hover:text-blue-400 transition mb-6"
// >
//   <ArrowLeft className="w-5 h-5" />
//   Back to all lessons
// </Link>

//           {/* Lesson Title */}
// <h1 className="text-4xl font-extrabold mb-6 tracking-tight bg-gradient-to-r from-blue-900 via-indigo-700 to-cyan-600 text-transparent bg-clip-text">
//   {toSentenceCase(lesson.outline)}
// </h1>

//           {/* Lesson Status */}
//           <div>
//             {lesson.status === "generating" && (
//               <div className="flex items-center gap-3 border border-yellow-400/30 bg-yellow-400/10 rounded-lg p-6 text-yellow-200">
//                 <Loader2 className="animate-spin w-5 h-5" />
//                 <span>Lesson is still generating...</span>
//               </div>
//             )}

//             {lesson.status === "failed" && (
//               <div className="flex items-center gap-3 border border-red-400/30 bg-red-400/10 rounded-lg p-6 text-red-200">
//                 <XCircle className="w-5 h-5" />
//                 <span>Lesson failed to generate. Check Inngest logs for details.</span>
//               </div>
//             )}

//             {lesson.status === "generated" && (
//               <div className="prose prose-invert prose-pre:bg-slate-900 prose-headings:text-cyan-300 prose-a:text-blue-400 hover:prose-a:text-blue-300 max-w-none">
//                 <LessonRenderer code={lesson.content || ""} />
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


// import { createClient } from "@/utils/supabase/server";
// import Link from "next/link";
// import { notFound } from "next/navigation";
// import LessonRenderer from "@/app/components/LessonRenderer";
// import { ArrowLeft, Loader2, XCircle } from "lucide-react";
// import ThreeBackground from "@/app/components/ThreeBackground";

// type LessonPageProps = {
//   params: {
//     id: string;
//   };
// };

// export default async function LessonPage({ params }: LessonPageProps) {
//   const { id } = await params;
//   const supabase = await createClient();

//   const { data: lesson } = await supabase
//     .from("lessons")
//     .select("*")
//     .eq("id", id)
//     .single();

//   if (!lesson) notFound();

//   function toSentenceCase(text: string) {
//     if (!text) return "";
//     const lower = text.toLowerCase();
//     return lower.charAt(0).toUpperCase() + lower.slice(1);
//   }

//   return (
//     <div className="relative min-h-screen w-full text-white flex flex-col">
//       {/* --- 3D SPACE BACKGROUND --- */}
//       <ThreeBackground />

//       {/* --- MAIN CONTENT --- */}
//       <div className="relative z-10 flex-1 px-4 sm:px-6 md:px-10 py-8 sm:py-12">
//         <div className="max-w-5xl mx-auto backdrop-blur-md bg-white/10 rounded-2xl shadow-2xl border border-white/10 p-4 sm:p-8 md:p-10">
          
//           {/* Back Link */}
//           <Link
//             href="/"
//             className="inline-flex items-center gap-2 text-blue-200 hover:text-blue-400 transition mb-6 text-sm sm:text-base"
//           >
//             <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
//             Back to all lessons
//           </Link>

//           {/* Lesson Title */}
//           <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold mb-6 tracking-tight bg-gradient-to-r from-blue-800 via-indigo-600 to-cyan-500 text-transparent bg-clip-text">
//             {toSentenceCase(lesson.outline)}
//           </h1>

//           {/* Lesson Status */}
//           <div className="text-sm sm:text-base">
//             {lesson.status === "generating" && (
//               <div className="flex flex-col sm:flex-row items-center gap-3 border border-yellow-400/30 bg-yellow-400/10 rounded-lg p-4 sm:p-6 text-yellow-200">
//                 <Loader2 className="animate-spin w-5 h-5" />
//                 <span className="text-center sm:text-left">
//                   Lesson is still generating...
//                 </span>
//               </div>
//             )}

//             {lesson.status === "failed" && (
//               <div className="flex flex-col sm:flex-row items-center gap-3 border border-red-400/30 bg-red-400/10 rounded-lg p-4 sm:p-6 text-red-200">
//                 <XCircle className="w-5 h-5" />
//                 <span className="text-center sm:text-left">
//                   Lesson failed to generate. Check Inngest logs for details.
//                 </span>
//               </div>
//             )}

//             {lesson.status === "generated" && (
//               <div className="prose prose-invert max-w-none prose-sm sm:prose-base md:prose-lg prose-pre:bg-slate-900 prose-headings:text-cyan-300 prose-a:text-blue-400 hover:prose-a:text-blue-300">
//                 <LessonRenderer code={lesson.content || ""} />
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }



// import { createClient } from "@/utils/supabase/server";
// import Link from "next/link";
// import { notFound } from "next/navigation";
// import LessonRenderer from "@/app/components/LessonRenderer";
// import { ArrowLeft, Loader2, XCircle } from "lucide-react";
// import ThreeBackground from "@/app/components/ThreeBackground";

// type LessonPageProps = {
//   params: {
//     id: string;
//   };
// };

// export default async function LessonPage({ params }: LessonPageProps) {
//   const { id } = await params;
//   const supabase = await createClient();

//   const { data: lesson } = await supabase
//     .from("lessons")
//     .select("*")
//     .eq("id", id)
//     .single();

//   if (!lesson) notFound();

//   function toSentenceCase(text: string) {
//     if (!text) return "";
//     const lower = text.toLowerCase();
//     return lower.charAt(0).toUpperCase() + lower.slice(1);
//   }

//   return (
//     <div className="relative min-h-screen w-full text-white flex flex-col overflow-x-hidden">
//       {/* --- 3D SPACE BACKGROUND --- */}
//       <ThreeBackground />

//       {/* --- MAIN CONTENT --- */}
//       <div className="relative z-10 flex-1 px-3 sm:px-4 md:px-6 lg:px-10 py-4 sm:py-6 md:py-10">
//         <div className="max-w-5xl mx-auto backdrop-blur-md bg-white/10 rounded-xl sm:rounded-2xl shadow-2xl border border-white/10 p-4 sm:p-6 md:p-8 lg:p-10">
          
//           {/* Back Link - Mobile Optimized */}
//           <Link
//             href="/"
//             className="inline-flex items-center gap-1.5 sm:gap-2 text-blue-200 hover:text-blue-400 transition-colors duration-200 mb-4 sm:mb-6 text-xs sm:text-sm md:text-base group"
//           >
//             <ArrowLeft className="w-3.5 h-3.5 sm:w-4 sm:h-4 md:w-5 md:h-5 group-hover:-translate-x-1 transition-transform" />
//             <span className="font-medium">Back to lessons</span>
//           </Link>

//           {/* Lesson Title - Responsive Typography */}
//           <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-extrabold mb-4 sm:mb-6 tracking-tight bg-gradient-to-r from-blue-400 via-indigo-400 to-cyan-400 text-transparent bg-clip-text leading-tight break-words">
//             {toSentenceCase(lesson.outline)}
//           </h1>

//           {/* Lesson Status - Mobile-First Layout */}
//           <div className="text-xs sm:text-sm md:text-base">
//             {lesson.status === "generating" && (
//               <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 border border-yellow-400/30 bg-yellow-400/10 rounded-lg p-3 sm:p-4 md:p-6 text-yellow-200">
//                 <Loader2 className="animate-spin w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
//                 <div className="text-center sm:text-left">
//                   <p className="font-semibold mb-1">Generating Lesson...</p>
//                   <p className="text-yellow-300/80 text-xs sm:text-sm">
//                     This may take a few moments. Please wait.
//                   </p>
//                 </div>
//               </div>
//             )}

//             {lesson.status === "failed" && (
//               <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 sm:gap-3 border border-red-400/30 bg-red-400/10 rounded-lg p-3 sm:p-4 md:p-6 text-red-200">
//                 <XCircle className="w-5 h-5 sm:w-6 sm:h-6 flex-shrink-0" />
//                 <div className="text-center sm:text-left">
//                   <p className="font-semibold mb-1">Generation Failed</p>
//                   <p className="text-red-300/80 text-xs sm:text-sm">
//                     Unable to generate lesson. Check Inngest logs for details.
//                   </p>
//                 </div>
//               </div>
//             )}

//             {lesson.status === "generated" && (
//               <div className="prose prose-invert max-w-none 
//                             prose-sm sm:prose-base md:prose-lg 
//                             prose-pre:bg-slate-900 prose-pre:text-xs sm:prose-pre:text-sm
//                             prose-headings:text-cyan-300 prose-headings:break-words
//                             prose-p:text-gray-200 prose-p:leading-relaxed
//                             prose-a:text-blue-400 hover:prose-a:text-blue-300 prose-a:break-words
//                             prose-li:text-gray-200
//                             prose-code:text-cyan-300 prose-code:break-words
//                             prose-img:rounded-lg prose-img:shadow-lg
//                             [&>*]:max-w-full [&>*]:overflow-x-auto">
//                 <LessonRenderer code={lesson.content || ""} />
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

import { createClient } from "@/utils/supabase/server";
import Link from "next/link";
import { notFound } from "next/navigation";
import LessonRenderer from "@/app/components/LessonRenderer";
import { ArrowLeft, Loader2, XCircle, GraduationCap } from "lucide-react";
import ThreeBackground from "@/app/components/ThreeBackground";

type LessonPageProps = { params: { id: string } };

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
      {/* 3D Space Background */}
      <ThreeBackground />

      {/* Main Content */}
      <div className="relative z-10 flex-1 px-3 sm:px-5 md:px-8 py-6 md:py-10">
        <div className="max-w-4xl mx-auto backdrop-blur-md bg-white/10 rounded-2xl shadow-xl border border-white/10 p-4 sm:p-6 md:p-8">
          {/* Back Button */}
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 sm:gap-2 text-blue-900 hover:text-blue-400 transition-colors duration-200 mb-5 text-sm sm:text-base group"
          >
            <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 group-hover:-translate-x-1 transition-transform" />
            Back
          </Link>

          {/* Lesson Title */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-6 tracking-tight bg-gradient-to-r from-blue-800 via-indigo-400 to-blue-800 text-transparent bg-clip-text leading-tight break-words">
            {toSentenceCase(lesson.outline)}
          </h1>

          {/* Learn from 3D Teacher Button */}
          {lesson.status === "generated" && (
            <div className="mb-6">
              <Link
                href={`/lessons/${id}/explain`}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <GraduationCap className="w-5 h-5" />
                Learn from a Human-like Teacher
              </Link>
            </div>
          )}

          {/* Lesson Content */}
          {lesson.status === "generating" && (
            <div className="flex items-center gap-3 border border-yellow-400/30 bg-yellow-400/10 rounded-lg p-4 text-yellow-200">
              <Loader2 className="animate-spin w-5 h-5 flex-shrink-0" />
              <span>Lesson is still generating...</span>
            </div>
          )}

          {lesson.status === "failed" && (
            <div className="flex items-center gap-3 border border-red-400/30 bg-red-400/10 rounded-lg p-4 text-red-200">
              <XCircle className="w-5 h-5 flex-shrink-0" />
              <span>Lesson failed to generate. Check logs for details.</span>
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
