import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: [{ protocol: "https", hostname: "cdn.sanity.io" }],
  },
  async redirects() {
    // segmento "comercial" virou "agronegocios" (jul/2026)
    return [
      {
        source: "/:lang/segmentos/comercial",
        destination: "/:lang/segmentos/agronegocios",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
