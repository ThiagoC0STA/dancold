import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/dictionaries";
import { isLocale, locales } from "@/lib/i18n";
import { clients, segmentSlugs, serviceSlugs, suppliers } from "@/lib/site";
import { Hero } from "@/components/hero";
import { Reveal } from "@/components/reveal";
import { Counter } from "@/components/counter";
import { SectionHeading } from "@/components/section-heading";
import { ServiceCard } from "@/components/service-card";
import { SegmentCard } from "@/components/segment-card";
import { LogoMarquee } from "@/components/logo-marquee";
import { CtaSection } from "@/components/cta-section";

export async function generateMetadata({ params }: PageProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return {
    title: { absolute: dict.meta.home.title },
    description: dict.meta.home.description,
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(locales.map((locale) => [locale, `/${locale}`])),
    },
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
      <section className="border-y border-line bg-surface-2 py-20 lg:py-24">
        <div className="mx-auto max-w-4xl px-6 text-center">
          <Reveal>
            <span aria-hidden className="mx-auto mb-8 block h-[2px] w-12 bg-accent" />
            <p className="font-display text-2xl font-medium leading-snug text-ink text-balance lg:text-[2rem] lg:leading-[1.3]">
              {dict.home.quote}
            </p>
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
              <LogoMarquee logos={[...clients]} />
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
            slow
            itemClassName="opacity-60 grayscale transition duration-300 hover:opacity-100 hover:grayscale-0"
          />
        </Reveal>
      </section>

      <CtaSection dict={dict} />
    </>
  );
}
