import type { Metadata } from "next";
import { defaultLocale, locales, type Locale } from "./i18n";
import { site } from "./site";
import { ogLocale } from "./schema";

export function pageMetadata(
  lang: Locale,
  path: string,
  title: string,
  description: string,
  keywords?: string[],
): Metadata {
  const suffix = path ? `/${path}` : "";
  const url = `/${lang}${suffix}`;
  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
      languages: {
        ...Object.fromEntries(locales.map((locale) => [locale, `/${locale}${suffix}`])),
        "x-default": `/${defaultLocale}${suffix}`,
      },
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      url,
      title,
      description,
      locale: ogLocale(lang),
      alternateLocale: locales.filter((locale) => locale !== lang).map(ogLocale),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}
