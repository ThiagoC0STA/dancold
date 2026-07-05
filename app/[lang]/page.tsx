import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/dictionaries";
import { isLocale } from "@/lib/i18n";
import { clients, coverage, segmentSlugs, serviceSlugs, site, suppliers } from "@/lib/site";
import { Hero } from "@/components/hero";
import { Reveal } from "@/components/reveal";
import { Counter } from "@/components/counter";
import { SectionHeading } from "@/components/section-heading";
import { ServiceCard } from "@/components/service-card";
import { SegmentCard } from "@/components/segment-card";
import { LogoMarquee } from "@/components/logo-marquee";
import { BrazilCoverageMap } from "@/components/brazil-coverage-map";
import { CtaSection } from "@/components/cta-section";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  // canonical, hreflang (incl. x-default), openGraph and twitter come from the root layout.
  return {
    title: { absolute: dict.meta.home.title },
    description: dict.meta.home.description,
  };
}

export default async function HomePage({ params }: PageProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const homeServices = serviceSlugs.slice(0, 3);

  const stats = [
    { value: 25, prefix: "+", label: dict.home.statsYears },
    { value: 3000, prefix: "+", label: dict.home.statsClients },
    { value: 365, prefix: "", label: dict.home.statsSupport },
    { value: 16, prefix: "", label: dict.home.statsCities },
  ];

  return (
    <>
      <Hero
        lang={lang}
        slides={dict.hero.slides}
        learnMore={dict.common.learnMore}
      />

      {/* stats */}
      <section className="border-b border-line bg-surface">
        <div className="mx-auto grid max-w-7xl grid-cols-2 divide-line px-6 lg:grid-cols-4 lg:divide-x">
          {stats.map((stat, index) => (
            <Reveal
              key={stat.label}
              delay={index * 0.08}
              className="px-2 py-12 lg:px-10 lg:first:pl-0"
            >
              <p className="font-display text-4xl font-bold tracking-tight text-brand tabular-nums sm:text-5xl">
                <Counter to={stat.value} prefix={stat.prefix} suffix="" />
              </p>
              <p className="mt-2 text-[13px] font-medium uppercase tracking-[0.12em] text-ink-3">
                {stat.label}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* services */}
      <section className="bg-bg py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading kicker={dict.home.servicesKicker} title={dict.home.servicesTitle} />
            <Reveal delay={0.15}>
              <Link href={`/${lang}/servicos`} className="btn btn-outline">
                {dict.common.seeAll}
                <span aria-hidden className="btn-arrow">→</span>
              </Link>
            </Reveal>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {homeServices.map((slug, index) => (
              <ServiceCard
                key={slug}
                lang={lang}
                slug={slug}
                index={index}
                title={dict.services[slug].title}
                text={dict.services[slug].short}
                readMore={dict.common.readMore}
              />
            ))}
          </div>
        </div>
      </section>

      {/* brand quote */}
      <section className="section-dark relative overflow-hidden border-y border-line bg-bg">
        <div className="bg-blueprint absolute inset-0 opacity-60" aria-hidden />
        <span
          aria-hidden
          className="pointer-events-none absolute -top-10 left-6 select-none font-display text-[13rem] leading-none text-brand/15 sm:left-16 sm:text-[17rem]"
        >
          &ldquo;
        </span>
        <div className="relative mx-auto max-w-4xl px-6 py-24 text-center lg:py-32">
          <Reveal>
            <p className="font-display text-2xl font-medium leading-snug text-ink text-balance lg:text-[2.1rem] lg:leading-[1.32]">
              {dict.home.quote}
            </p>
            <span
              aria-hidden
              className="mx-auto mt-10 flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.28em] text-brand"
            >
              <span className="h-px w-8 bg-accent" />
              {site.name}
              <span className="h-px w-8 bg-accent" />
            </span>
          </Reveal>
        </div>
      </section>

      {/* clients */}
      <section className="bg-bg py-24">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            kicker={dict.home.clientsKicker}
            title={dict.home.clientsTitle}
            align="center"
          />
          <Reveal delay={0.1} className="mt-12">
            <div className="overflow-hidden rounded-[10px] border border-line bg-white py-6">
              <LogoMarquee
                logos={[...clients]}
                lang={lang}
                itemClassName="opacity-70 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
              />
            </div>
          </Reveal>
        </div>
      </section>

      {/* segments */}
      <section className="border-t border-line bg-surface-2 py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            kicker={dict.home.segmentsKicker}
            title={dict.home.segmentsTitle}
            intro={dict.home.segmentsIntro}
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {segmentSlugs.map((slug, index) => (
              <SegmentCard
                key={slug}
                lang={lang}
                slug={slug}
                index={index}
                title={dict.segments[slug].title}
                text={dict.segments[slug].short}
                learnMore={dict.common.learnMore}
              />
            ))}
          </div>
        </div>
      </section>

      {/* coverage signature */}
      <section className="section-dark relative overflow-hidden border-t border-line bg-bg">
        <div className="bg-blueprint absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-6xl px-6 py-24 lg:py-28">
          <BrazilCoverageMap
            variant="compact"
            tone="dark"
            showCities={false}
            hqTitle={dict.whereWeAre.hqTitle}
            header={
              <SectionHeading
                kicker={dict.whereWeAre.kicker}
                title={dict.whereWeAre.statesTitle}
              />
            }
            states={coverage.map((entry, index) => ({
              id: entry.id,
              name: dict.whereWeAre.states[index] ?? entry.id.toUpperCase(),
              cities: [...entry.cities],
            }))}
          >
            {/* <Link href={`/${lang}/onde-estamos`} className="btn btn-outline mt-8">
              {dict.common.seeAll}
              <span aria-hidden className="btn-arrow">→</span>
            </Link> */}
          </BrazilCoverageMap>
        </div>
      </section>

      {/* suppliers */}
      <section className="border-t border-line bg-bg py-20">
        <div className="mx-auto max-w-7xl px-6">
          <SectionHeading
            kicker={dict.home.suppliersKicker}
            title={dict.home.suppliersTitle}
            align="center"
          />
        </div>
        <Reveal delay={0.1} className="mt-10">
          <LogoMarquee
            logos={suppliers}
            lang={lang}
            slow
            itemClassName="opacity-60 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
          />
        </Reveal>
      </section>

      <CtaSection dict={dict} />
    </>
  );
}
