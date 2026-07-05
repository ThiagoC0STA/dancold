import type { MetadataRoute } from "next";
import { site } from "@/lib/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${site.name} — Climatização e Refrigeração`,
    short_name: site.name,
    description:
      "Dancold: climatização, refrigeração e HVAC-R para indústrias, hospitais, shoppings e prédios corporativos.",
    start_url: "/",
    display: "standalone",
    lang: "pt-BR",
    dir: "ltr",
    background_color: "#f7f8fa",
    theme_color: "#0a1428",
    categories: ["business", "utilities"],
    icons: [
      { src: "/icon", sizes: "48x48", type: "image/png" },
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "maskable" },
    ],
  };
}
