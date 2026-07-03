"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion, useMotionValue, useSpring } from "motion/react";
import type { Locale } from "@/lib/i18n";
import { serviceImages, type ServiceSlug } from "@/lib/site";
import { Reveal } from "./reveal";

/*
 * Editorial numbered service index. On desktop, hovering a row reveals the
 * service photo in a floating panel that trails the cursor with a spring.
 */
export function ServiceList({
  lang,
  items,
  readMore,
}: {
  lang: Locale;
  items: { slug: ServiceSlug; title: string; text: string }[];
  readMore: string;
}) {
  const [hovered, setHovered] = useState<ServiceSlug | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const springX = useSpring(x, { stiffness: 180, damping: 24, mass: 0.6 });
  const springY = useSpring(y, { stiffness: 180, damping: 24, mass: 0.6 });

  function handleMove(event: React.MouseEvent) {
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    x.set(event.clientX - rect.left);
    y.set(event.clientY - rect.top);
  }

  return (
    <div
      ref={containerRef}
      className="relative"
      onMouseMove={handleMove}
      onMouseLeave={() => setHovered(null)}
    >
      {items.map((item, index) => (
        <Reveal key={item.slug} delay={index * 0.06}>
          <Link
            href={`/${lang}/servicos/${item.slug}`}
            onMouseEnter={() => setHovered(item.slug)}
            className={`group grid grid-cols-[3.5rem_1fr_auto] items-center gap-5 border-t border-line py-8 transition-colors duration-300 hover:bg-surface sm:grid-cols-[5.5rem_1fr_auto] lg:py-10 ${
              index === items.length - 1 ? "border-b" : ""
            }`}
          >
            <span
              aria-hidden
              className="text-stroke font-display text-4xl font-bold tabular-nums sm:text-5xl"
            >
              {String(index + 1).padStart(2, "0")}
            </span>
            <span className="min-w-0 pr-4">
              <span className="block font-display text-xl font-semibold tracking-tight text-ink transition-colors duration-300 sm:text-2xl lg:text-[1.7rem]">
                {item.title}
              </span>
              <span className="mt-2 block max-w-xl text-sm leading-relaxed text-ink-2">
                {item.text}
              </span>
            </span>
            <span className="flex items-center gap-4">
              <span className="hidden text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-3 transition-colors duration-300 group-hover:text-accent lg:block">
                {readMore}
              </span>
              <span
                aria-hidden
                className="flex h-11 w-11 items-center justify-center rounded-lg border border-line text-ink-2 transition-all duration-300 group-hover:border-accent group-hover:bg-accent group-hover:text-white"
              >
                →
              </span>
            </span>
          </Link>
        </Reveal>
      ))}

      {/* floating preview panel — desktop only, trails the cursor */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute left-0 top-0 z-10 hidden lg:block"
        style={{ x: springX, y: springY }}
      >
        <AnimatePresence>
          {hovered && (
            <motion.div
              key={hovered}
              initial={{ opacity: 0, scale: 0.92, rotate: -2 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              className="absolute -top-24 left-10 h-48 w-72 overflow-hidden rounded-[10px] border border-line shadow-2xl shadow-black/25"
            >
              <Image
                src={serviceImages[hovered]}
                alt=""
                fill
                sizes="288px"
                className="object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b1526]/40 to-transparent" />
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
