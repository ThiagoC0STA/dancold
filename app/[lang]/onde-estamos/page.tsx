import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/dictionaries";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { coverage, site } from "@/lib/site";
import { BrazilCoverageMap } from "@/components/brazil-coverage-map";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Counter } from "@/components/counter";
import { SectionHeading } from "@/components/section-heading";
import { CtaSection } from "@/components/cta-section";
import { WhatsAppIcon } from "@/components/header";
import { JsonLd } from "@/components/json-ld";
import { breadcrumb } from "@/lib/schema";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/onde-estamos">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata(
    lang,
    "onde-estamos",
    dict.meta.whereWeAre.title,
    dict.meta.whereWeAre.description,
  );
}

export default async function WhereWeArePage({ params }: PageProps<"/[lang]/onde-estamos">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const data = dict.whereWeAre;

  const infoCards = [
    { title: data.hqTitle, text: data.hqText, icon: <PinIcon /> },
    { title: data.serviceTitle, text: data.serviceText, icon: <ClockIcon /> },
    { title: data.onCallTitle, text: data.onCallText, icon: <ShieldIcon /> },
  ];

  const mapStates = coverage.map((entry, index) => ({
    id: entry.id,
    name: data.states[index] ?? entry.id.toUpperCase(),
    cities: [...entry.cities],
  }));

  const totalCities = coverage.reduce((sum, entry) => sum + entry.cities.length, 0);

  const stats = [
    { value: totalCities, prefix: "", suffix: "", label: dict.home.statsCities },
    { value: 365, prefix: "", suffix: dict.home.statsSupportUnit, label: dict.home.statsSupport },
    { value: 25, prefix: "+", suffix: "", label: dict.home.statsYears },
  ];

  return (
    <>
      <JsonLd
        data={breadcrumb(lang, [
          { name: dict.common.home, path: "" },
          { name: data.title, path: "/onde-estamos" },
        ])}
      />
      <PageHero
        lang={lang}
        kicker={data.kicker}
        title={data.title}
        homeLabel={dict.common.home}
        crumbs={[{ label: data.title }]}
        image="/img/heroes/onde-estamos.webp"
        imageAlt="Equipes dos segmentos atendidos pela Dancold"
      />

      {/* intro + operational highlights */}
      <section className="relative bg-bg py-20 lg:py-24">
        <div className="bg-blueprint absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6">
          <Reveal>
            <p className="max-w-4xl text-lg leading-[1.85] text-ink-2">{data.intro}</p>
          </Reveal>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {infoCards.map((card, index) => (
              <Reveal
                key={card.title}
                delay={index * 0.1}
                className="group rounded-[10px] border border-line bg-surface p-8 transition hover:border-navy-300 hover:shadow-sm"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition group-hover:bg-accent group-hover:text-white">
                  {card.icon}
                </span>
                <h2 className="mt-6 font-display text-lg font-semibold text-ink">{card.title}</h2>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-2">{card.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* coverage map — dark centerpiece */}
      <section className="section-dark relative overflow-hidden border-y border-line bg-bg">
        <div className="bg-blueprint absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6 py-24 lg:py-28">
          <div className="flex flex-wrap items-end justify-between gap-x-12 gap-y-8">
            <SectionHeading kicker={data.kicker} title={data.statesTitle} />
            <Reveal delay={0.15}>
              <div className="flex flex-wrap gap-x-12 gap-y-6">
                {stats.map((stat) => (
                  <div key={stat.label}>
                    <p className="font-display text-4xl font-bold tracking-tight text-brand tabular-nums">
                      <Counter to={stat.value} prefix={stat.prefix} />
                      {stat.suffix && (
                        <span className="ml-1 align-baseline text-sm font-semibold tracking-normal text-ink-3">
                          {stat.suffix}
                        </span>
                      )}
                    </p>
                    <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-ink-3">
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1} className="mt-14">
            <BrazilCoverageMap states={mapStates} tone="dark" hqTitle={data.hqTitle} />
          </Reveal>
        </div>
      </section>

      {/* headquarters + map */}
      <section className="bg-bg py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid items-stretch gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
            <Reveal className="flex flex-col rounded-[10px] border border-line bg-surface p-8 lg:p-10">
              <SectionHeading kicker={data.hqTitle} title={data.contactTitle} />

              <dl className="mt-8 space-y-6 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-3">
                    {data.hqTitle}
                  </dt>
                  <dd className="mt-2 leading-relaxed text-ink-2">{data.hqText}</dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-3">
                    {data.emailTitle}
                  </dt>
                  <dd className="mt-2">
                    <a
                      href={`mailto:${site.email}`}
                      className="font-medium text-ink transition hover:text-accent"
                    >
                      {site.email}
                    </a>
                  </dd>
                </div>
                <div>
                  <dt className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-3">
                    {dict.contact.phonesTitle}
                  </dt>
                  <dd className="mt-2 flex flex-wrap gap-x-6 gap-y-1">
                    <a
                      href="tel:+554133654877"
                      className="font-medium tabular-nums text-ink transition hover:text-accent"
                    >
                      {site.phoneFixed}
                    </a>
                    <a
                      href={site.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-medium tabular-nums text-ink transition hover:text-accent"
                    >
                      {site.phoneMobile}
                    </a>
                  </dd>
                </div>
              </dl>

              <a
                href={site.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary mt-10 self-start lg:mt-auto"
              >
                <WhatsAppIcon className="h-5 w-5" />
                {dict.common.whatsapp}
                <span aria-hidden className="btn-arrow">→</span>
              </a>
            </Reveal>

            <link rel="preconnect" href="https://maps.gstatic.com" crossOrigin="" />
            <link rel="dns-prefetch" href="https://maps.gstatic.com" />
            <link rel="dns-prefetch" href="https://www.google.com" />
            <Reveal delay={0.12} className="overflow-hidden rounded-[10px] border border-line">
              <iframe
                title="Dancold - Google Maps"
                src="https://www.google.com/maps?q=Av.+Prefeito+Maur%C3%ADcio+Fruet,+3060,+Cajuru,+Curitiba+-+PR&output=embed"
                className="h-full min-h-[460px] w-full grayscale-35 contrast-105"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </Reveal>
          </div>
        </div>
      </section>

      <CtaSection dict={dict} />
    </>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6" aria-hidden>
      <path d="M12 21s-7-5.4-7-11a7 7 0 1 1 14 0c0 5.6-7 11-7 11z" />
      <circle cx="12" cy="10" r="2.6" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6" aria-hidden>
      <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8 7.5 9.5 4.3-1.5 7.5-4.9 7.5-9.5V6z" />
      <path d="m9 12 2.2 2.2L15.5 10" />
    </svg>
  );
}
