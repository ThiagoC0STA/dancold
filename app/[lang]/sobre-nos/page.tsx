import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDictionary } from "@/dictionaries";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { clients } from "@/lib/site";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Counter } from "@/components/counter";
import { SectionHeading } from "@/components/section-heading";
import { LogoMarquee } from "@/components/logo-marquee";
import { CtaSection } from "@/components/cta-section";
import { JsonLd } from "@/components/json-ld";
import { breadcrumb } from "@/lib/schema";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/sobre-nos">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata(lang, "sobre-nos", dict.meta.about.title, dict.meta.about.description);
}

export default async function AboutPage({ params }: PageProps<"/[lang]/sobre-nos">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  const stats = [
    { value: 25, prefix: "+", label: dict.home.statsYears },
    { value: 3000, prefix: "+", label: dict.home.statsClients },
    { value: 365, prefix: "", label: dict.home.statsSupport },
    { value: 16, prefix: "", label: dict.home.statsCities },
  ];

  const reasonIcons = [ShieldIcon, MedalIcon, UsersIcon, ChipIcon];

  return (
    <>
      <JsonLd
        data={breadcrumb(lang, [
          { name: dict.common.home, path: "" },
          { name: dict.about.title, path: "/sobre-nos" },
        ])}
      />
      <PageHero
        lang={lang}
        kicker={dict.about.kicker}
        title={dict.about.title}
        homeLabel={dict.common.home}
        crumbs={[{ label: dict.about.title }]}
        image="/img/heroes/technicians.jpg"
        imageAlt="Técnicos da Dancold em manutenção de sistema de climatização"
      />

      {/* intro + photo composition */}
      <section className="relative overflow-hidden bg-bg py-24 lg:py-32">
        <div className="bg-blueprint absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl items-center gap-16 px-6 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
          <div>
            <SectionHeading kicker={dict.about.welcome} title={dict.about.whoWeAre} />
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
                {dict.about.intro}
              </p>
            </Reveal>
            <Reveal delay={0.18}>
              <p className="mt-8 max-w-xl border-l-2 border-accent pl-6 text-[15px] leading-[1.85] text-ink-2">
                {dict.about.history}
              </p>
            </Reveal>
          </div>

          {/* layered photo composition */}
          <Reveal delay={0.12} className="relative hidden lg:block">
            <span
              aria-hidden
              className="absolute -top-6 -right-6 h-40 w-40 rounded-[10px] border-2 border-accent/25"
            />
            <div className="relative aspect-4/3 overflow-hidden rounded-[10px] border border-line shadow-[0_30px_60px_rgba(13,27,46,0.14)]">
              <Image
                src="/img/services/projetos-2.webp"
                alt=""
                fill
                sizes="(max-width: 1024px) 0px, 40vw"
                className="object-cover"
              />
            </div>
            <div className="absolute -bottom-10 -left-10 w-[46%] overflow-hidden rounded-[10px] border-4 border-bg shadow-[0_24px_48px_rgba(13,27,46,0.2)]">
              <div className="relative aspect-square">
                <Image
                  src="/img/services/automacao-2.webp"
                  alt=""
                  fill
                  sizes="(max-width: 1024px) 0px, 18vw"
                  className="object-cover"
                />
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* mission / vision / values — dark editorial band */}
      <section className="section-dark relative overflow-hidden border-y border-line bg-bg">
        <div className="bg-blueprint absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl gap-14 px-6 py-20 lg:grid-cols-3 lg:gap-0 lg:py-28">
          <Reveal className="lg:pr-12">
            <div className="flex items-baseline justify-between">
              <span aria-hidden className="font-display text-6xl font-bold text-white/10">01</span>
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-line text-accent">
                <TargetIcon />
              </span>
            </div>
            <h2 className="mt-6 font-display text-2xl font-semibold tracking-tight text-ink">
              {dict.about.missionTitle}
            </h2>
            <span aria-hidden className="mt-4 block h-[2px] w-10 bg-accent" />
            <p className="mt-6 text-sm leading-[1.9] text-ink-2">{dict.about.mission}</p>
          </Reveal>

          <Reveal delay={0.1} className="border-line lg:border-l lg:px-12">
            <div className="flex items-baseline justify-between">
              <span aria-hidden className="font-display text-6xl font-bold text-white/10">02</span>
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-line text-accent">
                <EyeIcon />
              </span>
            </div>
            <h2 className="mt-6 font-display text-2xl font-semibold tracking-tight text-ink">
              {dict.about.visionTitle}
            </h2>
            <span aria-hidden className="mt-4 block h-[2px] w-10 bg-accent" />
            <p className="mt-6 text-sm leading-[1.9] text-ink-2">{dict.about.vision}</p>
          </Reveal>

          <Reveal delay={0.2} className="border-line lg:border-l lg:pl-12">
            <div className="flex items-baseline justify-between">
              <span aria-hidden className="font-display text-6xl font-bold text-white/10">03</span>
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-line text-accent">
                <DiamondIcon />
              </span>
            </div>
            <h2 className="mt-6 font-display text-2xl font-semibold tracking-tight text-ink">
              {dict.about.valuesTitle}
            </h2>
            <span aria-hidden className="mt-4 block h-[2px] w-10 bg-accent" />
            <ul className="mt-6 space-y-2.5">
              {dict.about.values.map((value) => (
                <li key={value} className="flex items-center gap-3 text-sm text-ink-2">
                  <span aria-hidden className="h-1.5 w-1.5 flex-none rounded-full bg-accent" />
                  {value}
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* history timeline */}
      <section className="relative overflow-hidden bg-surface-2 py-24 lg:py-32">
        <div className="bg-blueprint absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6">
          <SectionHeading kicker={dict.about.kicker} title={dict.about.historyTitle} />
          <div className="relative mt-16">
            <span
              aria-hidden
              className="absolute top-2 bottom-2 left-4 w-px bg-line-2 lg:left-1/2 lg:-translate-x-1/2"
            />
            <ol className="space-y-8 lg:space-y-5">
              {dict.about.timeline.map((entry, index) => {
                const onLeft = index % 2 === 0;
                return (
                  <li
                    key={entry.period}
                    className="relative lg:grid lg:grid-cols-2 lg:items-center"
                  >
                    <span
                      aria-hidden
                      className="absolute top-7 left-4 z-10 h-3.5 w-3.5 -translate-x-1/2 rounded-full bg-accent ring-4 ring-surface-2 lg:left-1/2"
                    />
                    <Reveal
                      delay={0.05}
                      className={`ml-11 rounded-[10px] border border-line bg-surface p-6 transition hover:border-line-2 lg:ml-0 ${
                        onLeft
                          ? "lg:col-start-1 lg:mr-10 lg:text-right"
                          : "lg:col-start-2 lg:ml-10"
                      }`}
                    >
                      <p className="font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                        {entry.period}
                      </p>
                      <p className="mt-3 text-[15px] leading-relaxed text-ink-2">
                        {entry.text}
                      </p>
                    </Reveal>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      {/* proof band — photo + counters */}
      <section className="relative overflow-hidden border-y border-line">
        <Image
          src="/img/heroes/chillers.jpg"
          alt=""
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#060d1b]/88" aria-hidden />
        <div className="bg-blueprint absolute inset-0 opacity-30" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-12 px-6 py-20 lg:grid-cols-4 lg:py-24">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.08}>
              <span aria-hidden className="mb-5 block h-[2px] w-8 bg-accent" />
              <p className="font-display text-4xl font-bold tracking-tight text-white tabular-nums sm:text-5xl">
                <Counter to={stat.value} prefix={stat.prefix} />
              </p>
              <p className="mt-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                {stat.label}
              </p>
            </Reveal>
          ))}
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

      {/* why choose us */}
      <section className="relative border-t border-line bg-surface-2 py-24 lg:py-32">
        <div className="bg-blueprint absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6">
          <SectionHeading
            kicker={dict.about.whyKicker}
            title={dict.about.whyTitle}
            intro={dict.about.whyIntro}
            align="center"
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {dict.about.reasons.map((reason, index) => {
              const Icon = reasonIcons[index % reasonIcons.length];
              return (
                <Reveal
                  key={reason.title}
                  delay={index * 0.08}
                  className="group relative overflow-hidden rounded-[10px] border border-line bg-surface p-7 transition hover:border-navy-300 hover:shadow-sm"
                >
                  <span
                    aria-hidden
                    className="absolute top-5 right-6 font-display text-sm font-bold tabular-nums text-ink-3/60"
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    aria-hidden
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition group-hover:bg-accent group-hover:text-white"
                  >
                    <Icon />
                  </span>
                  <h3 className="mt-6 font-display text-[17px] font-semibold tracking-tight text-ink">
                    {reason.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-2">{reason.text}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      <CtaSection dict={dict} />
    </>
  );
}

function TargetIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="5" />
      <circle cx="12" cy="12" r="1.2" fill="currentColor" />
    </svg>
  );
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-hidden>
      <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-5 w-5" aria-hidden>
      <path d="M6 4h12l4 6-10 11L2 10z" />
      <path d="M2 10h20M12 21 8 10l3-6M12 21l4-11-3-6" />
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

function MedalIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6" aria-hidden>
      <circle cx="12" cy="9" r="5.5" />
      <path d="m12 11.6-1.8 1 .4-2-1.5-1.4 2-.3.9-1.9.9 1.9 2 .3-1.5 1.4.4 2z" fill="currentColor" stroke="none" />
      <path d="M8.5 13.8 6.5 21l3-1.8L12 21l2.5-1.8 3 1.8-2-7.2" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6" aria-hidden>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19.5c.6-3 2.8-4.7 5.5-4.7s4.9 1.7 5.5 4.7" />
      <circle cx="16.8" cy="9.2" r="2.6" />
      <path d="M16.4 14.6c2.3.2 3.8 1.7 4.3 4" />
    </svg>
  );
}

function ChipIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6" aria-hidden>
      <rect x="7" y="7" width="10" height="10" rx="1.5" />
      <rect x="10.2" y="10.2" width="3.6" height="3.6" rx="0.6" />
      <path d="M9 4v3M12 4v3M15 4v3M9 17v3M12 17v3M15 17v3M4 9h3M4 12h3M4 15h3M17 9h3M17 12h3M17 15h3" />
    </svg>
  );
}
