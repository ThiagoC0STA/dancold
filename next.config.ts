import type { NextConfig } from "next";
import path from "node:path";

// imagens do blog ficam no Storage do Supabase
const supabaseHost = process.env.NEXT_PUBLIC_SUPABASE_URL
  ? new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname
  : null;

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  images: {
    formats: ["image/avif", "image/webp"],
    remotePatterns: supabaseHost
      ? [{ protocol: "https", hostname: supabaseHost, pathname: "/storage/v1/object/public/**" }]
      : [],
  },
  async redirects() {
    return [
      // segmento "comercial" virou "agronegocios" (jul/2026)
      {
        source: "/:lang/segmentos/comercial",
        destination: "/:lang/segmentos/agronegocios",
        permanent: true,
      },
      // o blog saiu do Sanity: quem tinha o endereço antigo cai no painel novo
      { source: "/studio/:path*", destination: "/admin/blog", permanent: false },
    ];
  },
};

export default nextConfig;
