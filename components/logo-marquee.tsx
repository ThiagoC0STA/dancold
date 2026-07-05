"use client";

import { useState } from "react";
import Image from "next/image";
import type { Locale } from "@/lib/i18n";

const LABELS: Record<Locale, { pause: string; play: string }> = {
  pt: { pause: "Pausar rolagem dos logos", play: "Retomar rolagem dos logos" },
  en: { pause: "Pause logo scroll", play: "Resume logo scroll" },
  es: { pause: "Pausar desplazamiento de logos", play: "Reanudar desplazamiento de logos" },
};

export function LogoMarquee({
  logos,
  lang,
  slow = false,
  itemClassName = "",
}: {
  logos: { logo: string; name?: string }[];
  lang: Locale;
  slow?: boolean;
  itemClassName?: string;
}) {
  const [paused, setPaused] = useState(false);
  const track = [...logos, ...logos];
  const labels = LABELS[lang];

  return (
    <div className="group relative">
      <div
        className="relative overflow-hidden"
        style={{
          maskImage: "linear-gradient(90deg, transparent, black 12%, black 88%, transparent)",
        }}
      >
        <div
          className={`flex w-max items-center gap-14 pr-14 ${slow ? "animate-marquee-slow" : "animate-marquee"} group-hover:[animation-play-state:paused] ${paused ? "[animation-play-state:paused]" : ""}`}
        >
          {track.map((item, index) => (
            <div key={index} className="flex h-20 w-36 shrink-0 items-center justify-center">
              <Image
                src={item.logo}
                alt={item.name ?? ""}
                width={144}
                height={72}
                className={`max-h-16 w-auto object-contain transition duration-300 ${itemClassName}`}
              />
            </div>
          ))}
        </div>
      </div>

      <button
        type="button"
        onClick={() => setPaused((value) => !value)}
        aria-label={paused ? labels.play : labels.pause}
        aria-pressed={paused}
        className="absolute -top-3 right-0 flex h-7 w-7 items-center justify-center rounded-full border border-line bg-surface text-ink-3 opacity-0 transition hover:text-ink focus-visible:opacity-100 group-hover:opacity-100"
      >
        {paused ? (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3" aria-hidden>
            <path d="M8 5v14l11-7z" />
          </svg>
        ) : (
          <svg viewBox="0 0 24 24" fill="currentColor" className="h-3 w-3" aria-hidden>
            <path d="M7 5h3.5v14H7zM13.5 5H17v14h-3.5z" />
          </svg>
        )}
      </button>
    </div>
  );
}
