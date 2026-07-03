"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import { locales, localeNames, type Locale } from "@/lib/i18n";
import { FlagBR, FlagES, FlagUS } from "./flags";

const flags: Record<Locale, React.ComponentType<{ className?: string }>> = {
  pt: FlagBR,
  en: FlagUS,
  es: FlagES,
};

export function LocaleSwitcher({ current }: { current: Locale }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  useEffect(() => {
    function onClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const rest = pathname.replace(/^\/(pt|en|es)(?=\/|$)/, "");
  const CurrentFlag = flags[current];

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label="Idioma"
        aria-expanded={open}
        className="flex h-10 cursor-pointer items-center gap-2 rounded-lg border border-line px-3 text-xs font-semibold tracking-wide text-ink-2 transition hover:border-line-2 hover:text-ink"
      >
        <CurrentFlag className="h-4.5 w-4.5" />
        <span className="uppercase">{current}</span>
        <svg
          viewBox="0 0 12 12"
          className={`h-2.5 w-2.5 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
        >
          <path d="M2 4l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" />
        </svg>
      </button>

      <AnimatePresence>
        {open && (
          <motion.ul
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.16 }}
            className="absolute right-0 top-full z-50 mt-2 w-44 overflow-hidden rounded-[10px] border border-line bg-surface p-1.5 shadow-[0_8px_24px_rgba(0,0,0,0.18)]"
          >
            {locales.map((locale) => {
              const Flag = flags[locale];
              return (
                <li key={locale}>
                  <Link
                    href={`/${locale}${rest}`}
                    onClick={() => {
                      document.cookie = `locale=${locale};path=/;max-age=31536000`;
                      setOpen(false);
                    }}
                    className={`flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition hover:bg-surface-2 ${
                      locale === current ? "text-ink" : "text-ink-2"
                    }`}
                  >
                    <Flag className="h-5 w-5" />
                    {localeNames[locale]}
                    {locale === current && (
                      <span className="ml-auto h-1.5 w-1.5 rounded-full bg-accent" />
                    )}
                  </Link>
                </li>
              );
            })}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
