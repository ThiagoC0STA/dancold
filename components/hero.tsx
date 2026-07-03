"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import type { Locale } from "@/lib/i18n";

const SLIDE_IMAGES = [
  "/img/slides/1.webp",
  "/img/slides/2.webp",
  "/img/slides/3.webp",
  "/img/slides/4.webp",
];

const SLIDE_LINKS = ["servicos/projetos-personalizados", "segmentos", "servicos/plano-de-manutencao-pmoc", "servicos"];

const INTERVAL = 6500;
const EASE_EXPO: [number, number, number, number] = [0.16, 1, 0.3, 1];

export function Hero({
  lang,
  slides,
  learnMore,
}: {
  lang: Locale;
  slides: readonly { kicker: string; title: string }[];
  learnMore: string;
  since?: string;
  scroll?: string;
}) {
  const [active, setActive] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const goTo = useCallback((index: number) => {
    setActive(index);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(
      () => setActive((current) => (current + 1) % SLIDE_IMAGES.length),
      INTERVAL,
    );
  }, []);

  useEffect(() => {
    timer.current = setInterval(
      () => setActive((current) => (current + 1) % SLIDE_IMAGES.length),
      INTERVAL,
    );
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, []);

  const slide = slides[active];

  return (
    <section className="relative flex min-h-[86svh] flex-col overflow-hidden">
      {/* background images with slow zoom */}
      <AnimatePresence>
        <motion.div
          key={active}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.1, ease: "easeInOut" }}
        >
          <motion.div
            className="absolute inset-0"
            initial={{ scale: 1 }}
            animate={{ scale: 1.08 }}
            transition={{ duration: INTERVAL / 1000 + 1.5, ease: "linear" }}
          >
            <Image
              src={SLIDE_IMAGES[active]}
              alt=""
              fill
              priority={active === 0}
              sizes="100vw"
              className="object-cover"
            />
          </motion.div>
        </motion.div>
      </AnimatePresence>

      {/* cinematic scrim — intentionally theme-independent, it sits on photography */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#060d1b]/92 via-[#060d1b]/70 to-[#0a1428]/30" aria-hidden />
      <div className="absolute inset-0 bg-gradient-to-t from-[#060d1b]/85 via-transparent to-transparent" aria-hidden />

      <div className="relative mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6 pb-16 pt-24">
        <div className="min-h-[240px] sm:min-h-[280px]">
          <AnimatePresence mode="wait">
            <motion.div
              key={active}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45, ease: EASE_EXPO }}
            >
              <motion.p
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: EASE_EXPO }}
                className="flex items-center gap-3 text-[13px] font-bold uppercase tracking-[0.3em] text-white/70"
              >
                <span className="h-px w-6 bg-accent" aria-hidden />
                {slide.kicker}
              </motion.p>
              <h1 className="mt-5 max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-white text-balance sm:text-6xl lg:text-7xl">
                {slide.title.split(" ").map((word, index) => (
                  <span key={index} className="mr-[0.28em] inline-block overflow-hidden align-top last:mr-0">
                    <motion.span
                      className="inline-block"
                      initial={{ y: "112%" }}
                      animate={{ y: 0 }}
                      transition={{
                        duration: 0.7,
                        ease: EASE_EXPO,
                        delay: 0.08 + index * 0.055,
                      }}
                    >
                      {word}
                    </motion.span>
                  </span>
                ))}
              </h1>
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.55, ease: EASE_EXPO, delay: 0.35 }}
                className="mt-10"
              >
                <Link
                  href={`/${lang}/${SLIDE_LINKS[active]}`}
                  className="group inline-flex h-[52px] items-center gap-3 rounded-lg bg-accent px-7 text-sm font-bold text-white transition hover:bg-accent-dark"
                >
                  {learnMore}
                  <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              </motion.div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* slide progress controls */}
        <div className="mt-16 flex items-center gap-3">
          {slides.map((item, index) => (
            <button
              key={index}
              type="button"
              onClick={() => goTo(index)}
              aria-label={item.kicker}
              className="group relative h-8 w-12"
            >
              <span className="absolute inset-x-0 top-1/2 h-[2px] -translate-y-1/2 overflow-hidden bg-white/30">
                {index === active && (
                  <motion.span
                    key={`bar-${active}`}
                    className="absolute inset-y-0 left-0 bg-accent"
                    initial={{ width: "0%" }}
                    animate={{ width: "100%" }}
                    transition={{ duration: INTERVAL / 1000, ease: "linear" }}
                  />
                )}
              </span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
