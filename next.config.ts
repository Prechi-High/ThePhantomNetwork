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
      { source: "/community", destination: "/creator", permanent: false },
      { source: "/armory", destination: "/sessions/prepare", permanent: false },
      { source: "/shop", destination: "/legacy", permanent: false },
      { source: "/rivals", destination: "/world", permanent: false },
    ];
  },
};

export default nextConfig;
