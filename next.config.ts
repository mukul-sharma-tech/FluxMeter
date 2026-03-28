// import type { NextConfig } from "next";

// const nextConfig: NextConfig = {
//   /* config options here */
//   reactCompiler: true,
// };

// export default nextConfig;


import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  experimental: {
    // This line tells Next.js to not bundle esbuild
    // and treat it as an external package on the server.
    // This is required for your Inngest API route to work.
    serverComponentsExternalPackages: ["esbuild"],
  },
};

export default nextConfig;