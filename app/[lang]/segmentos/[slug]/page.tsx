import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/dictionaries";
import { isLocale, locales } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { segmentImages, segmentSlugs, site, type SegmentSlug } from "@/lib/site";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { CtaSection } from "@/components/cta-section";
import { WhatsAppIcon } from "@/components/header";
import { JsonLd } from "@/components/json-ld";
import { breadcrumb } from "@/lib/schema";

export async function generateStaticParams() {
  return locales.flatMap((lang) => segmentSlugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/segmentos/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang) || !segmentSlugs.includes(slug as SegmentSlug)) return {};
  const dict = await getDictionary(lang);
  const segment = dict.segments[slug as SegmentSlug];
  return pageMetadata(lang, `segmentos/${slug}`, segment.pageTitle, segment.short);
}

export default async function SegmentPage({ params }: PageProps<"/[lang]/segmentos/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang) || !segmentSlugs.includes(slug as SegmentSlug)) notFound();
  const dict = await getDictionary(lang);
  const segment = dict.segments[slug as SegmentSlug];

  return (
    <>
      <JsonLd
        data={breadcrumb(lang, [
          { name: dict.common.home, path: "" },
          { name: dict.segmentsPage.breadcrumb, path: "/segmentos" },
          { name: segment.title, path: `/segmentos/${slug}` },
        ])}
      />
      <PageHero
        lang={lang}
        kicker={dict.segmentsPage.kicker}
        title={segment.pageTitle}
        homeLabel={dict.common.home}
        crumbs={[
          { label: dict.segmentsPage.breadcrumb, href: `/${lang}/segmentos` },
          { label: segment.title },
        ]}
        image="/img/heroes/building-facade.jpg"
        imageAlt="Fachada de edifício corporativo climatizado"
      />

      <section className="relative bg-bg py-24 lg:py-28">
        <div className="bg-blueprint absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid gap-14 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <Reveal>
                <p className="border-l-2 border-accent pl-6 font-display text-xl font-medium leading-relaxed text-ink sm:text-2xl">
                  {segment.description}
                </p>
              </Reveal>

              <Reveal delay={0.12} className="mt-14">
                <p className="kicker">{dict.segmentsPage.kicker}</p>
                <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight text-ink sm:text-[1.7rem]">
                  {dict.segmentsPage.servicesInclude}
                </h2>
              </Reveal>
              <div className="mt-8 grid gap-5 sm:grid-cols-2">
                {segment.items.map((item, index) => (
                  <Reveal
                    key={item.title}
                    delay={0.08 * (index % 2)}
                    className="rounded-[10px] border border-line bg-surface p-6 transition-colors duration-300 hover:border-line-2"
                  >
                    <span
                      aria-hidden
                      className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-accent"
                    >
                      <CheckIcon className="h-[18px] w-[18px]" />
                    </span>
                    <h3 className="mt-4 font-display text-base font-semibold text-ink">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm leading-relaxed text-ink-2">{item.text}</p>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={0.2} className="mt-12">
                <a
                  href={site.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                >
                  <WhatsAppIcon className="h-4.5 w-4.5" />
                  {dict.common.contactUs}
                  <span aria-hidden className="btn-arrow">→</span>
                </a>
              </Reveal>
            </div>

            <aside>
              <Reveal delay={0.1} className="sticky top-28 space-y-8">
                <div className="relative h-80 overflow-hidden rounded-[10px] border border-line">
                  <Image
                    src={segmentImages[slug as SegmentSlug]}
                    alt={segment.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                  {/* scrim sits on photography — theme-independent navy */}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#0b1526]/50 to-transparent"
                    aria-hidden
                  />
                </div>
                <nav
                  aria-label={dict.segmentsPage.title}
                  className="overflow-hidden rounded-[10px] border border-line bg-surface"
                >
                  <h2 className="border-b border-line px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-ink-3">
                    {dict.segmentsPage.title}
                  </h2>
                  <ul>
                    {segmentSlugs.map((other) => (
                      <li key={other}>
                        <Link
                          href={`/${lang}/segmentos/${other}`}
                          className={`flex items-center justify-between gap-3 border-b border-l-2 border-line px-6 py-3.5 text-sm transition last:border-b-0 ${
                            other === slug
                              ? "border-l-accent bg-surface-2 font-semibold text-ink"
                              : "border-l-transparent text-ink-2 hover:bg-surface-2 hover:text-ink"
                          }`}
                        >
                          {dict.segments[other].title}
                          <span
                            aria-hidden
                            className={other === slug ? "text-accent" : "text-ink-3"}
                          >
                            →
                          </span>
                        </Link>
                      </li>
                    ))}
                  </ul>
                </nav>
              </Reveal>
            </aside>
          </div>
        </div>
      </section>

      <CtaSection dict={dict} />
    </>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
