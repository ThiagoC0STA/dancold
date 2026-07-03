import type { MetadataRoute } from "next";
import { locales } from "@/lib/i18n";
import { segmentSlugs, serviceSlugs, site } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "",
    "/sobre-nos",
    "/servicos",
    ...serviceSlugs.map((slug) => `/servicos/${slug}`),
    "/segmentos",
    ...segmentSlugs.map((slug) => `/segmentos/${slug}`),
    "/onde-estamos",
    "/contato",
  ];

  return paths.map((path) => ({
    url: `${site.url}/pt${path}`,
    lastModified: new Date(),
    changeFrequency: path === "" ? "weekly" : "monthly",
    priority: path === "" ? 1 : 0.8,
    alternates: {
      languages: Object.fromEntries(
        locales.map((locale) => [locale, `${site.url}/${locale}${path}`]),
      ),
    },
  }));
}
