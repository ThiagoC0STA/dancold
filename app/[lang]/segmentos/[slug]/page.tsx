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
import { brazilStates } from "@/lib/brazil-map-data";
import { segmentClients, segmentNouns, segmentVideos } from "@/lib/segment-proof";
import { BrazilCoverageMap } from "@/components/brazil-coverage-map";
import { LiteVideo } from "@/components/lite-video";
import { QuoteForm } from "@/components/quote-form";
import { SectionHeading } from "@/components/section-heading";

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
  const page = dict.segmentsPage;

  // prova do segmento: só aparece com dado real em lib/segment-proof.ts
  const video = segmentVideos[slug as SegmentSlug];
  const clients = segmentClients[slug as SegmentSlug] ?? [];
  const cases = clients.filter((client) => client.summary?.[lang] ?? client.summary?.pt);
  const presenceStates = brazilStates
    .map((state) => ({
      id: state.id,
      name: state.name,
      cities: clients
        .filter((client) => client.state === state.id)
        .map((client) => `${client.name} (${client.city})`),
    }))
    .filter((state) => state.cities.length > 0);
  const presenceTitle = page.presenceTitle
    .replace("{count}", String(clients.length))
    .replace("{noun}", segmentNouns[slug as SegmentSlug]?.[lang] ?? page.presenceFallbackNoun);

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

              {video && (
                <Reveal delay={0.08} className="mt-10">
                  <LiteVideo
                    youtubeId={video.youtubeId}
                    title={segment.pageTitle}
                    playLabel={page.videoPlay}
                  />
                </Reveal>
              )}

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

              <Reveal delay={0.2} className="mt-12 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <a href="#orcamento" className="btn btn-primary">
                  {page.quoteCta}
                  <span aria-hidden className="btn-arrow">→</span>
                </a>
                <a
                  href={site.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline"
                >
                  <WhatsAppIcon className="h-4.5 w-4.5" />
                  {dict.common.whatsapp}
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
                    className={`object-cover ${slug === "hospitais" ? "object-top" : ""}`}
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

      {/* presença no segmento: "Estamos em X ..." + mapa */}
      {clients.length > 0 && (
        <section className="section-dark relative overflow-hidden border-y border-line bg-bg">
          <div className="bg-blueprint absolute inset-0 opacity-50" aria-hidden />
          <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-28">
            <Reveal>
              <BrazilCoverageMap
                states={presenceStates}
                tone="dark"
                hqTitle={dict.whereWeAre.hqTitle}
                header={
                  <div className="mb-8">
                    <p className="kicker">{page.presenceKicker}</p>
                    <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink text-balance sm:text-4xl">
                      {presenceTitle}
                    </h2>
                  </div>
                }
              />
            </Reveal>
          </div>
        </section>
      )}

      {cases.length > 0 && (
        <section className="bg-bg py-24 lg:py-28">
          <div className="mx-auto max-w-7xl px-6">
            <SectionHeading kicker={segment.title} title={page.casesTitle} />
            <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {cases.map((client, index) => (
                <Reveal
                  key={`${client.name}-${client.city}`}
                  delay={0.08 * (index % 3)}
                  className="rounded-[10px] border border-line bg-surface p-7"
                >
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-3">
                    {client.city} · {client.state.toUpperCase()}
                  </p>
                  <h3 className="mt-3 font-display text-lg font-semibold text-ink">
                    {client.name}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-2">
                    {client.summary?.[lang] ?? client.summary?.pt}
                  </p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* pedido de orçamento — destino do clique do anúncio */}
      <section
        id="orcamento"
        className="relative scroll-mt-24 border-t border-line bg-surface-2 py-24 lg:py-28"
      >
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
            <div>
              <SectionHeading
                kicker={dict.quote.kicker}
                title={dict.quote.title}
                intro={dict.quote.text}
              />
              <Reveal delay={0.1}>
                <ul className="mt-9 space-y-4">
                  {dict.quote.points.map((point) => (
                    <li key={point} className="flex items-start gap-3 text-[15px] text-ink-2">
                      <span
                        aria-hidden
                        className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-md border border-line-2 text-accent"
                      >
                        <CheckIcon className="h-3.5 w-3.5" />
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
                <p className="mt-10 text-sm text-ink-3">{dict.quote.whatsappAlt}</p>
                <a
                  href={site.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-2 font-display text-lg font-semibold text-ink transition hover:text-accent"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  {site.phoneMobile}
                </a>
              </Reveal>
            </div>
            <Reveal delay={0.12}>
              <QuoteForm lang={lang} segment={slug} labels={dict.quote} />
            </Reveal>
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
