"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "motion/react";
import type { Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { LocaleSwitcher } from "./locale-switcher";

type NavLabels = {
  home: string;
  about: string;
  services: string;
  segments: string;
  whereWeAre: string;
  blog: string;
  contact: string;
  careers: string;
  whatsapp: string;
  hours: string;
};

const A11Y: Record<Locale, { homeLink: string; nav: string; menu: string; close: string }> = {
  pt: { homeLink: "Dancold — página inicial", nav: "Principal", menu: "Menu", close: "Fechar menu" },
  en: { homeLink: "Dancold — home", nav: "Main", menu: "Menu", close: "Close menu" },
  es: { homeLink: "Dancold — inicio", nav: "Principal", menu: "Menú", close: "Cerrar menú" },
};

export function Header({ lang, labels }: { lang: Locale; labels: NavLabels }) {
  const [scrolled, setScrolled] = useState(false);
  const [openedAt, setOpenedAt] = useState<string | null>(null);
  const pathname = usePathname();
  // Track which route the menu was opened on so navigation closes it.
  const mobileOpen = openedAt === pathname;
  const setMobileOpen = (open: boolean) => setOpenedAt(open ? pathname : null);
  const a11y = A11Y[lang];

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mobileOpen]);

  const items = [
    { href: `/${lang}`, label: labels.home, exact: true },
    { href: `/${lang}/sobre-nos`, label: labels.about },
    { href: `/${lang}/servicos`, label: labels.services },
    { href: `/${lang}/segmentos`, label: labels.segments },
    { href: `/${lang}/onde-estamos`, label: labels.whereWeAre },
    { href: `/${lang}/blog`, label: labels.blog },
    { href: `/${lang}/contato`, label: labels.contact },
    { href: `/${lang}/trabalhe-conosco`, label: labels.careers },
  ];

  const isActive = (item: { href: string; exact?: boolean }) =>
    item.exact ? pathname === item.href : pathname.startsWith(item.href);

  return (
    <header
      className={`sticky top-0 z-50 border-b transition-colors duration-300 ${
        scrolled ? "border-line bg-surface/90 backdrop-blur-xl" : "border-transparent bg-surface"
      }`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-6">
        <Link href={`/${lang}`} className="shrink-0" aria-label={a11y.homeLink}>
          <Image
            src="/logo.webp"
            alt=""
            width={190}
            height={44}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex" aria-label={a11y.nav}>
          {items.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={`relative px-4 py-2.5 text-[14px] font-medium tracking-tight transition-colors ${
                isActive(item) ? "text-ink" : "text-ink-2 hover:text-ink"
              }`}
            >
              {item.label}
              {isActive(item) && (
                <motion.span
                  layoutId="nav-underline"
                  className="absolute inset-x-4 -bottom-px h-[2px] bg-accent"
                  transition={{ type: "spring", stiffness: 400, damping: 34 }}
                />
              )}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitcher current={lang} />
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label={a11y.menu}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink transition-colors hover:border-line-2 lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <div className="lg:hidden">
            <motion.button
              type="button"
              aria-label={a11y.menu}
              onClick={() => setMobileOpen(false)}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="fixed inset-0 z-50 bg-navy-950/40 backdrop-blur-sm"
            />
            <motion.aside
              id="mobile-menu"
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 380, damping: 40 }}
              className="fixed inset-y-0 right-0 z-50 flex w-[86%] max-w-sm flex-col border-l border-line bg-surface shadow-[-24px_0_60px_rgba(6,13,27,0.18)]"
            >
              <div className="flex h-20 shrink-0 items-center justify-between border-b border-line px-6">
                <span className="text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3">
                  {a11y.menu}
                </span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  aria-label={a11y.close}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink transition-colors hover:border-line-2 hover:text-accent"
                >
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden>
                    <path
                      d="M6 6l12 12M18 6L6 18"
                      stroke="currentColor"
                      strokeWidth="1.75"
                      strokeLinecap="round"
                    />
                  </svg>
                </button>
              </div>

              <nav
                className="flex flex-1 flex-col gap-0.5 overflow-y-auto px-4 py-5"
                aria-label={a11y.nav}
              >
                {items.map((item) => {
                  const active = isActive(item);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`group flex items-center justify-between rounded-lg px-4 py-3.5 text-[15px] font-medium transition-colors ${
                        active ? "bg-surface-2 text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink"
                      }`}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className={`h-4 w-0.5 rounded-full transition-colors ${
                            active ? "bg-accent" : "bg-transparent"
                          }`}
                        />
                        {item.label}
                      </span>
                      <svg
                        viewBox="0 0 12 12"
                        className="h-3 w-3 -translate-x-1 text-ink-3 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                        aria-hidden
                      >
                        <path d="M3 2l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" />
                      </svg>
                    </Link>
                  );
                })}
              </nav>

              <div className="shrink-0 border-t border-line p-4">
                <a
                  href={site.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary w-full"
                >
                  <WhatsAppIcon className="h-4.5 w-4.5" />
                  {labels.whatsapp}
                </a>
                <p className="mt-3 text-center text-xs text-ink-3">{labels.hours}</p>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
}

export function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M17.47 14.38c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.96-.94 1.16-.17.2-.35.22-.64.07-.3-.15-1.26-.46-2.4-1.47-.88-.79-1.48-1.76-1.65-2.06-.17-.3-.02-.46.13-.6.13-.14.3-.35.44-.52.15-.18.2-.3.3-.5.1-.2.05-.37-.03-.52-.07-.15-.67-1.6-.91-2.2-.24-.58-.49-.5-.67-.5h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.48s1.06 2.87 1.21 3.07c.15.2 2.1 3.2 5.08 4.48.71.3 1.26.49 1.7.63.71.22 1.36.19 1.87.12.57-.09 1.76-.72 2-1.42.25-.7.25-1.28.18-1.41-.07-.13-.27-.2-.57-.35M12.05 21.79h-.01a9.87 9.87 0 0 1-5.03-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.85 9.85 0 0 1-1.51-5.26c0-5.45 4.44-9.88 9.9-9.88a9.83 9.83 0 0 1 7 2.9 9.83 9.83 0 0 1 2.89 7c0 5.45-4.44 9.88-9.9 9.88m8.42-18.3A11.8 11.8 0 0 0 12.05 0C5.5 0 .16 5.33.16 11.89c0 2.1.55 4.14 1.59 5.94L.06 24l6.32-1.65a11.9 11.9 0 0 0 5.67 1.44h.01c6.55 0 11.89-5.33 11.89-11.89 0-3.18-1.24-6.16-3.48-8.41" />
    </svg>
  );
}
