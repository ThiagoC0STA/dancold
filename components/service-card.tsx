import Image from "next/image";
import Link from "next/link";
import type { Locale } from "@/lib/i18n";
import { serviceImages, type ServiceSlug } from "@/lib/site";
import { Reveal } from "./reveal";

export function ServiceCard({
  lang,
  slug,
  title,
  text,
  readMore,
  index = 0,
}: {
  lang: Locale;
  slug: ServiceSlug;
  title: string;
  text: string;
  readMore: string;
  index?: number;
}) {
  return (
    <Reveal delay={index * 0.08} className="h-full">
      <Link
        href={`/${lang}/servicos/${slug}`}
        className="group relative flex h-full flex-col overflow-hidden rounded-[10px] border border-line bg-surface transition duration-300 hover:-translate-y-1 hover:border-line-2"
      >
        <div className="relative h-52 overflow-hidden">
          <Image
            src={serviceImages[slug]}
            alt={title}
            fill
            sizes="(max-width: 768px) 100vw, 33vw"
            className="object-cover transition duration-700 ease-out group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0b1526]/50 via-transparent to-transparent" aria-hidden />
          <span
            aria-hidden
            className="absolute right-4 top-4 font-display text-sm font-bold tabular-nums text-white/70"
          >
            {String(index + 1).padStart(2, "0")}
          </span>
        </div>
        <div className="flex flex-1 flex-col p-6">
          <h3 className="font-display text-xl font-semibold text-ink">{title}</h3>
          <p className="mt-3 flex-1 text-sm leading-relaxed text-ink-2">{text}</p>
          <span className="mt-5 inline-flex items-center gap-2 text-[12px] font-semibold uppercase tracking-[0.16em] text-ink-3 transition-all duration-300 group-hover:gap-3.5 group-hover:text-accent">
            {readMore}
            <span aria-hidden>→</span>
          </span>
        </div>
        <span
          aria-hidden
          className="absolute inset-x-0 bottom-0 h-[2px] origin-left scale-x-0 bg-accent transition-transform duration-400 group-hover:scale-x-100"
        />
      </Link>
    </Reveal>
  );
}
