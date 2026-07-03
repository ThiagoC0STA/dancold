import type { Metadata } from "next";
import { locales, type Locale } from "./i18n";

export function pageMetadata(
  lang: Locale,
  path: string,
  title: string,
  description: string,
): Metadata {
  const suffix = path ? `/${path}` : "";
  return {
    title,
    description,
    alternates: {
      canonical: `/${lang}${suffix}`,
      languages: Object.fromEntries(locales.map((locale) => [locale, `/${locale}${suffix}`])),
    },
  };
}
