import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: path.join(__dirname),
  outputFileTracingIncludes: {
    "/middleware": ["./node_modules/@swc/helpers/**/*"],
  },
  async redirects() {
    return [
      { source: "/social", destination: "/creator", permanent: false },
      { source: "/armory", destination: "/sessions/prepare", permanent: false },
    ];
  },
};

export default nextConfig;
