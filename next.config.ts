import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.100.2", "10.184.146.45"],

  turbopack: {
    root: process.cwd(),
  },

  outputFileTracingRoot: process.cwd(),

  images: {
    unoptimized: true,
  },
};

export default nextConfig;
