import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/i18n";
import { Reveal } from "./reveal";

export function PageHero({
  lang,
  kicker,
  title,
  homeLabel,
  crumbs = [],
  image,
}: {
  lang: Locale;
  kicker: string;
  title: string;
  homeLabel: string;
  crumbs?: { label: string; href?: string }[];
  image?: string;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-bg">
      <div className="bg-blueprint absolute inset-0 opacity-60" aria-hidden />
      <div className="relative mx-auto grid max-w-7xl items-end gap-10 px-6 pb-14 pt-12 lg:grid-cols-[1fr_400px] lg:pb-20 lg:pt-16">
        <Reveal>
          <nav aria-label="Breadcrumb">
            <ol className="flex flex-wrap items-center gap-2 text-[13px] text-ink-3">
              <li>
                <Link href={`/${lang}`} className="transition hover:text-ink">
                  {homeLabel}
                </Link>
              </li>
              {crumbs.map((crumb) => (
                <li key={crumb.label} className="flex items-center gap-2">
                  <span aria-hidden className="text-line-2">/</span>
                  {crumb.href ? (
                    <Link href={crumb.href} className="transition hover:text-ink">
                      {crumb.label}
                    </Link>
                  ) : (
                    <span className="text-ink-2">{crumb.label}</span>
                  )}
                </li>
              ))}
            </ol>
          </nav>
          <p className="kicker mt-8">{kicker}</p>
          <h1 className="mt-4 max-w-3xl font-display text-4xl font-bold tracking-tight text-ink text-balance sm:text-5xl lg:text-6xl">
            {title}
          </h1>
        </Reveal>
        {image && (
          <Reveal delay={0.12} className="hidden lg:block">
            <div className="relative h-72 overflow-hidden rounded-[10px] border border-line">
              <Image
                src={image}
                alt=""
                fill
                priority
                sizes="400px"
                className="object-cover"
              />
              <div
                className="absolute inset-0 bg-gradient-to-t from-[#0b1526]/45 to-transparent"
                aria-hidden
              />
            </div>
          </Reveal>
        )}
      </div>
    </section>
  );
}
