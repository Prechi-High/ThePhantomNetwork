import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Prevent Next.js from using C:\Users\hp\package-lock.json as workspace root
  outputFileTracingRoot: path.join(__dirname),
  // Ensure Edge middleware bundle includes @swc/helpers ESM on Vercel
  outputFileTracingIncludes: {
    "/middleware": ["./node_modules/@swc/helpers/**/*"],
  },
};

export default nextConfig;
