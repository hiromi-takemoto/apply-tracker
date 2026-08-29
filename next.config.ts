import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // `npm run build` の先頭で tsc を実行するため、Next.js 内部の重複検査は省く。
    ignoreBuildErrors: true,
  },
  experimental: {
    workerThreads: true,
  },
};

export default nextConfig;
