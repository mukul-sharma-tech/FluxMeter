"use client";

import Spline from "@splinetool/react-spline";

export default function SplineBackground() {
  return (
    <div className="absolute inset-0 -z-10 w-full h-full overflow-hidden">
      <Spline scene="https://my.spline.design/3dpathslines1copy-ldInbO9IsvLs0wW08ENjdpZH/" />
      {/* Optional: overlay gradient for readability */}
      <div className="absolute inset-0 bg-gradient-to-br from-sky-50/60 via-white/60 to-indigo-100/50 backdrop-blur-[1px]" />
    </div>
  );
}
