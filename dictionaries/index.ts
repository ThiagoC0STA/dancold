import "server-only";
import type { Locale } from "@/lib/i18n";
import type pt from "./pt";

export type Dictionary = typeof pt;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  pt: () => import("./pt").then((m) => m.default),
  en: () => import("./en").then((m) => m.default),
  es: () => import("./es").then((m) => m.default),
};

export const getDictionary = (locale: Locale) => dictionaries[locale]();
