"use client";

import Link from "next/link";
import Image from "next/image";
import { motion } from "motion/react";
import type { Locale } from "@/lib/i18n";

const EASE_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function PageHero({
  lang,
  kicker,
  title,
  homeLabel,
  crumbs = [],
  image,
  imageAlt = "",
}: {
  lang: Locale;
  kicker: string;
  title: string;
  homeLabel: string;
  crumbs?: { label: string; href?: string }[];
  image?: string;
  imageAlt?: string;
}) {
  return (
    <section className="relative flex min-h-[46svh] flex-col justify-end overflow-hidden bg-navy-950 lg:min-h-[54svh]">
      {/* background with slow zoom, same treatment as the home hero */}
      {image && (
        <motion.div
          className="absolute inset-0"
          initial={{ scale: 1.1 }}
          animate={{ scale: 1 }}
          transition={{ duration: 2.4, ease: EASE_EXPO }}
        >
          <Image src={image} alt={imageAlt} fill priority sizes="100vw" className="object-cover" />
        </motion.div>
      )}

      {/* cinematic scrim — identical to the home hero, sits on photography */}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#060d1b]/92 via-[#060d1b]/70 to-[#0a1428]/30"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#060d1b]/85 via-transparent to-transparent"
        aria-hidden
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 pt-36 pb-14 lg:pb-20">
        <motion.nav
          aria-label={lang === "pt" ? "Trilha de navegação" : lang === "es" ? "Ruta de navegación" : "Breadcrumb"}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <ol className="flex flex-wrap items-center gap-2 text-[13px] text-white/55">
            <li>
              <Link href={`/${lang}`} className="transition hover:text-white">
                {homeLabel}
              </Link>
            </li>
            {crumbs.map((crumb) => (
              <li key={crumb.label} className="flex items-center gap-2">
                <span aria-hidden className="text-white/30">/</span>
                {crumb.href ? (
                  <Link href={crumb.href} className="transition hover:text-white">
                    {crumb.label}
                  </Link>
                ) : (
                  <span className="text-white/80">{crumb.label}</span>
                )}
              </li>
            ))}
          </ol>
        </motion.nav>

        <motion.p
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: EASE_EXPO, delay: 0.1 }}
          className="mt-10 flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.3em] text-white/70"
        >
          <span aria-hidden className="h-px w-6 bg-accent" />
          {kicker}
        </motion.p>

        <h1 className="mt-5 max-w-4xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-white text-balance sm:text-6xl lg:text-7xl">
          {title.split(" ").map((word, index) => (
            <span
              key={index}
              className="mr-[0.28em] inline-block overflow-hidden align-top last:mr-0"
            >
              <motion.span
                className="inline-block"
                initial={{ y: "112%" }}
                animate={{ y: 0 }}
                transition={{ duration: 0.7, ease: EASE_EXPO, delay: 0.12 + index * 0.055 }}
              >
                {word}
              </motion.span>
            </span>
          ))}
        </h1>

        {/* accent baseline, echoes the brand rule */}
        <motion.span
          aria-hidden
          className="mt-10 block h-[3px] w-24 origin-left bg-accent"
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.8, ease: EASE_EXPO, delay: 0.5 }}
        />
      </div>
    </section>
  );
}
