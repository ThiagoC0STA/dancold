import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { segmentImages, type SegmentSlug } from "@/lib/site";
import { Reveal } from "./reveal";

export function SegmentCard({
  lang,
  slug,
  title,
  text,
  learnMore,
  index = 0,
}: {
  lang: Locale;
  slug: SegmentSlug;
  title: string;
  text: string;
  learnMore: string;
  index?: number;
}) {
  return (
    <Reveal delay={(index % 3) * 0.08} className="h-full">
      <Link
        href={`/${lang}/segmentos/${slug}`}
        className="group relative block h-[380px] overflow-hidden rounded-[10px] border border-line"
      >
        <Image
          src={segmentImages[slug]}
          alt={title}
          fill
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          className="object-cover transition duration-700 ease-out group-hover:scale-105"
        />
        {/* scrim sits on photography — theme-independent navy */}
        <div
          className="absolute inset-0 bg-gradient-to-t from-[#060d1b]/95 via-[#060d1b]/40 to-[#060d1b]/5 transition duration-500 group-hover:from-[#0b1526]/95 group-hover:via-[#0b1526]/55"
          aria-hidden
        />
        <span
          aria-hidden
          className="absolute right-5 top-5 font-display text-sm font-bold tabular-nums text-white/50"
        >
          {String(index + 1).padStart(2, "0")}
        </span>
        <div className="absolute inset-x-0 bottom-0 p-7">
          <span aria-hidden className="mb-4 block h-px w-8 bg-accent transition-all duration-500 group-hover:w-14" />
          <h3 className="font-display text-2xl font-semibold text-white">{title}</h3>
          <p className="mt-2.5 max-h-0 overflow-hidden text-sm leading-relaxed text-white/75 opacity-0 transition-all duration-500 group-hover:max-h-44 group-hover:opacity-100">
            {text}
          </p>
          <span className="mt-4 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-white/60 transition-all duration-300 group-hover:gap-3.5 group-hover:text-white">
            {learnMore}
            <span aria-hidden>→</span>
          </span>
        </div>
      </Link>
    </Reveal>
  );
}
