"use client";

import Spline from "@splinetool/react-spline";

export default function SplineScene() {
  return (
    <div className="w-full h-[500px] md:h-[600px] rounded-2xl overflow-hidden shadow-xl border border-white/10">
      <Spline scene="https://my.spline.design/3dpathslines1copy-ldInbO9IsvLs0wW08ENjdpZH/" />
    </div>
  );
}
