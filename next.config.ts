import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Prevent Next.js from using C:\Users\hp\package-lock.json as workspace root
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
