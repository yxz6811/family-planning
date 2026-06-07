import type { NextConfig } from "next";
import path from "path";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.resolve(process.cwd()),
  ...(basePath
    ? { basePath, assetPrefix: basePath, trailingSlash: true }
    : {}),
};

export default nextConfig;
