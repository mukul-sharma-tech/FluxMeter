import type { Metadata } from "next";
import './globals.css';

export const metadata: Metadata = {
  title: "FluxMeter — AI SEO Blog Engine",
  description: "AI-powered blog generation with SERP analysis, SEO scoring, and competitor intelligence",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#0a0a0f] text-white">
        {children}
      </body>
    </html>
  );
}
