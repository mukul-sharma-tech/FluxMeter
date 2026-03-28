// "use client";

// import React from "react";
// import { LiveProvider, LivePreview, LiveError } from "react-live";

// // React scope for live rendering
// const scope = { 
//   React,
//   useState: React.useState,
//   useEffect: React.useEffect,
//   useCallback: React.useCallback,
//   useMemo: React.useMemo,
//   useRef: React.useRef
// };

// interface LessonRendererProps {
//   code: string;
// }

// const LessonRenderer: React.FC<LessonRendererProps> = ({ code }) => {
//   // const cleanCode = code
//   //   .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, "")
//   //   .trim();


//   // Start with the raw code
//   let cleanCode = code;

//   // 1. Strip all import statements
//   cleanCode = cleanCode.replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, "");

//   // 2. Strip markdown fences (e.g., ```tsx at start, ``` at end)
//   // This regex removes ```tsx or ``` from the start, with optional newlines
//   cleanCode = cleanCode.replace(/^[\s`]*(tsx)?\n?/, ""); 
//   // This regex removes ``` from the end, with optional newlines
//   cleanCode = cleanCode.replace(/\n?[\s`]*$/, "");

//   // 3. Trim any remaining whitespace from start/end
//   cleanCode = cleanCode.trim();
//   // --- END OF UPDATE ---



//   return (
//     <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-200">
//       <LiveProvider
//         code={cleanCode}
//         scope={scope}
//         noInline={true}
//       >
//         <LiveError 
//           className="bg-red-50 border border-red-200 text-red-700 p-3 sm:p-4 rounded-lg mb-3 font-mono text-xs sm:text-sm whitespace-pre-wrap"
//         />

//         {/* 🌈 FIXED PREVIEW AREA */}
//         <div className="rounded-xl overflow-hidden shadow-inner border border-gray-300 bg-[#1a1a1a] text-white p-4 sm:p-6 min-h-[220px] transition-all duration-300">
//           <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-4 sm:p-6">
//             <LivePreview />
//           </div>
//         </div>
//       </LiveProvider>
//     </div>
//   );
// };

// export default LessonRenderer;


// "use client";

// import React from "react";
// import { LiveProvider, LivePreview, LiveError } from "react-live";

// const scope = {
//   React,
//   useState: React.useState,
//   useEffect: React.useEffect,
//   useCallback: React.useCallback,
//   useMemo: React.useMemo,
//   useRef: React.useRef,
// };

// interface LessonRendererProps {
//   code: string;
// }

// const LessonRenderer: React.FC<LessonRendererProps> = ({ code }) => {
//   // Sanitize code
//   const cleanCode = code
//     .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, "")
//     .replace(/^[\s`]*(tsx)?\n?/, "")
//     .replace(/\n?[\s`]*$/, "")
//     .trim();

//   return (
//     <div className="w-full bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-4 sm:p-6 md:p-8 shadow-lg border border-gray-200">
//       <LiveProvider code={cleanCode} scope={scope} noInline={true}>
//         <LiveError className="bg-red-50 border border-red-200 text-red-700 p-2 sm:p-3 md:p-4 rounded-lg mb-3 font-mono text-xs sm:text-sm md:text-base whitespace-pre-wrap overflow-auto" />

//         {/* 🌈 Responsive Preview Area */}
//         <div className="rounded-xl overflow-hidden shadow-inner border border-gray-300 bg-[#1a1a1a] text-white p-3 sm:p-5 md:p-6 min-h-[180px] sm:min-h-[220px] transition-all duration-300">
//           <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-3 sm:p-5 md:p-6">
//             <LivePreview />
//           </div>
//         </div>
//       </LiveProvider>
//     </div>
//   );
// };

// export default LessonRenderer;



// "use client";

// import React from "react";
// import { LiveProvider, LivePreview, LiveError } from "react-live";

// const scope = {
//   React,
//   useState: React.useState,
//   useEffect: React.useEffect,
//   useCallback: React.useCallback,
//   useMemo: React.useMemo,
//   useRef: React.useRef,
// };

// interface LessonRendererProps {
//   code: string;
// }

// const LessonRenderer: React.FC<LessonRendererProps> = ({ code }) => {
//   // 🔒 Sanitize incoming code
//   const cleanCode = code
//     .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, "")
//     .replace(/^[\s`]*(tsx)?\n?/, "")
//     .replace(/\n?[\s`]*$/, "")
//     .trim();

//   return (
//     <div className="w-full max-w-4xl mx-auto bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 rounded-2xl p-3 sm:p-5 md:p-8 shadow-lg border border-gray-200 dark:border-gray-700 transition-all duration-300">
//       <LiveProvider code={cleanCode} scope={scope} noInline={true}>
//         {/* 🧠 Live Error Box */}
//         <LiveError className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 p-2 sm:p-3 md:p-4 rounded-lg mb-4 font-mono text-xs sm:text-sm md:text-base whitespace-pre-wrap overflow-auto" />

//         {/* 🌈 Responsive Preview Area */}
//         <div className="rounded-xl overflow-hidden shadow-inner border border-gray-300 dark:border-gray-700 bg-[#1a1a1a] dark:bg-gray-950 text-white p-3 sm:p-5 md:p-6 min-h-[180px] sm:min-h-[240px] flex flex-col justify-center transition-all duration-300">
//           <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-3 sm:p-5 md:p-6 w-full overflow-x-auto">
//             <div className="scale-100 sm:scale-100 md:scale-100 lg:scale-105 xl:scale-110 transform transition-transform duration-500 ease-in-out">
//               <LivePreview />
//             </div>
//           </div>
//         </div>

//       </LiveProvider>
//     </div>
//   );
// };

// export default LessonRenderer;


"use client";

import React from "react";
import { LiveProvider, LivePreview, LiveError } from "react-live";

const scope = {
  React,
  useState: React.useState,
  useEffect: React.useEffect,
  useCallback: React.useCallback,
  useMemo: React.useMemo,
  useRef: React.useRef,
};

interface LessonRendererProps {
  code: string;
}

const LessonRenderer: React.FC<LessonRendererProps> = ({ code }) => {
  const cleanCode = code
    .replace(/import\s+.*?from\s+['"].*?['"];?\s*/g, "")
    .replace(/^[\s`]*(tsx)?\s*|^\s*```(?:typescript)?\s*/g, "")
    .replace(/\n?[\s`]*$/g, "")
    .trim();

  return (
    <LiveProvider code={cleanCode} scope={scope} noInline={true}>
      {/* 🔴 Error Output */}
      <LiveError className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 p-3 rounded-lg mb-4 font-mono text-sm whitespace-pre-wrap overflow-auto" />

      {/* 🧩 Preview Area (Lightweight, No Extra Frame) */}
      <div className="rounded-xl overflow-hidden border border-gray-700 bg-gradient-to-br from-gray-800 to-gray-900 text-white shadow-md p-4 sm:p-6 md:p-8 w-full transition-all duration-300">
        <LivePreview />
      </div>
    </LiveProvider>
  );
};

export default LessonRenderer;
