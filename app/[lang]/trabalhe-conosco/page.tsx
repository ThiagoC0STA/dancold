import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";
import { getDictionary } from "@/dictionaries";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { Counter } from "@/components/counter";
import { SectionHeading } from "@/components/section-heading";
import { JsonLd } from "@/components/json-ld";
import { breadcrumb } from "@/lib/schema";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/trabalhe-conosco">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata(
    lang,
    "trabalhe-conosco",
    dict.meta.careers.title,
    dict.meta.careers.description,
  );
}

const reasonIcons = [ShieldIcon, BuildingIcon, GraduationIcon, TeamIcon];
const areaIcons = [CompassIcon, SnowIcon, WrenchIcon, ChipIcon];

export default async function CareersPage({ params }: PageProps<"/[lang]/trabalhe-conosco">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const c = dict.careers;

  const applyHref = `mailto:${site.emailCareers}?subject=${encodeURIComponent(c.emailSubject)}`;

  const stats = [
    { value: 25, prefix: "+", suffix: "", label: dict.home.statsYears },
    { value: 3000, prefix: "+", suffix: "", label: dict.home.statsClients },
    { value: 365, prefix: "", suffix: dict.home.statsSupportUnit, label: dict.home.statsSupport },
    { value: 16, prefix: "", suffix: "", label: dict.home.statsCities },
  ];

  return (
    <>
      <JsonLd
        data={breadcrumb(lang, [
          { name: dict.common.home, path: "" },
          { name: dict.nav.careers, path: "/trabalhe-conosco" },
        ])}
      />
      <PageHero
        lang={lang}
        kicker={c.kicker}
        title={c.title}
        homeLabel={dict.common.home}
        crumbs={[{ label: dict.nav.careers }]}
        image="/img/heroes/technicians.jpg"
        imageAlt="Técnicos da Dancold em campo em um sistema de climatização"
      />

      {/* why Dancold — intro + photo + reason cards */}
      <section className="relative overflow-hidden bg-bg py-24 lg:py-32">
        <div className="bg-blueprint absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid items-center gap-16 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)]">
            <div>
              <SectionHeading kicker={c.whyKicker} title={c.whyTitle} />
              <Reveal delay={0.1}>
                <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">{c.intro}</p>
              </Reveal>
              <Reveal delay={0.18}>
                <p className="mt-8 max-w-xl border-l-2 border-accent pl-6 text-[15px] leading-[1.85] text-ink-2">
                  {c.whyIntro}
                </p>
              </Reveal>
            </div>

            <Reveal delay={0.12} className="relative hidden lg:block">
              <span
                aria-hidden
                className="absolute -top-6 -right-6 h-40 w-40 rounded-[10px] border-2 border-accent/25"
              />
              <div className="relative aspect-4/3 overflow-hidden rounded-[10px] border border-line shadow-[0_30px_60px_rgba(13,27,46,0.14)]">
                <Image
                  src="/img/services/instalacoes-2.webp"
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

          <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {c.reasons.map((reason, index) => {
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

      {/* proof band — photo + counters */}
      <section className="relative overflow-hidden border-y border-line">
        <Image src="/img/heroes/chillers.jpg" alt="" fill sizes="100vw" className="object-cover" />
        <div className="absolute inset-0 bg-navy-950/88" aria-hidden />
        <div className="bg-blueprint absolute inset-0 opacity-30" aria-hidden />
        <div className="relative mx-auto grid max-w-7xl grid-cols-2 gap-x-6 gap-y-12 px-6 py-20 lg:grid-cols-4 lg:py-24">
          {stats.map((stat, index) => (
            <Reveal key={stat.label} delay={index * 0.08}>
              <span aria-hidden className="mb-5 block h-[2px] w-8 bg-accent" />
              <p className="font-display text-4xl font-bold tracking-tight text-white tabular-nums sm:text-5xl">
                <Counter to={stat.value} prefix={stat.prefix} />
                {stat.suffix && (
                  <span className="ml-1 align-baseline text-base font-semibold tracking-normal text-white/60 sm:text-lg">
                    {stat.suffix}
                  </span>
                )}
              </p>
              <p className="mt-2.5 text-xs font-semibold uppercase tracking-[0.16em] text-white/60">
                {stat.label}
              </p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* areas of work */}
      <section className="relative border-b border-line bg-surface-2 py-24 lg:py-28">
        <div className="bg-blueprint absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6">
          <SectionHeading
            kicker={c.areasKicker}
            title={c.areasTitle}
            intro={c.areasIntro}
            align="center"
          />
          <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {c.areas.map((area, index) => {
              const Icon = areaIcons[index % areaIcons.length];
              return (
                <Reveal
                  key={area.title}
                  delay={index * 0.08}
                  className="group flex h-full flex-col rounded-[10px] border border-line bg-surface p-7 transition hover:border-navy-300 hover:shadow-sm"
                >
                  <span
                    aria-hidden
                    className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent transition group-hover:bg-accent group-hover:text-white"
                  >
                    <Icon />
                  </span>
                  <h3 className="mt-6 font-display text-[17px] font-semibold tracking-tight text-ink">
                    {area.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-ink-2">{area.text}</p>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* how to apply */}
      <section className="relative bg-bg py-24 lg:py-28">
        <div className="bg-blueprint absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6">
          <SectionHeading kicker={c.stepsKicker} title={c.stepsTitle} align="center" />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {c.steps.map((step, index) => (
              <Reveal
                key={step.title}
                delay={index * 0.1}
                className="relative rounded-[10px] border border-line bg-surface p-8"
              >
                <span
                  aria-hidden
                  className="font-display text-5xl font-bold tabular-nums text-accent/25"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-4 font-display text-lg font-semibold tracking-tight text-ink">
                  {step.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-2">{step.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* e-mail finale — RH exposed */}
      <section className="section-dark relative overflow-hidden border-t border-line bg-bg text-ink">
        <div className="bg-blueprint absolute inset-0 opacity-50" aria-hidden />
        <div className="relative mx-auto max-w-3xl px-6 py-24 text-center lg:py-28">
          <Reveal>
            <p className="flex items-center justify-center gap-3 text-xs font-semibold uppercase tracking-[0.18em] text-ink-3">
              <span className="h-px w-6 bg-accent" aria-hidden />
              {c.emailKicker}
              <span className="h-px w-6 bg-accent" aria-hidden />
            </p>
            <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight text-ink text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
              {c.emailTitle}
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-base leading-relaxed text-ink-2">
              {c.emailText}
            </p>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="mx-auto mt-10 max-w-xl rounded-2xl border border-line bg-surface p-8 sm:p-10">
              <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-accent/10 text-accent">
                <MailIcon />
              </span>
              <p className="mt-6 text-xs font-semibold uppercase tracking-[0.18em] text-ink-3">
                {c.emailLabel}
              </p>
              <a
                href={applyHref}
                className="mt-2 block font-display text-2xl font-bold break-all text-ink transition hover:text-accent sm:text-3xl"
              >
                {site.emailCareers}
              </a>
              <a href={applyHref} className="btn btn-primary mt-8 h-[52px] px-7 text-[15px]">
                <MailIcon className="h-5 w-5" />
                {c.emailCtaLabel}
                <span aria-hidden className="btn-arrow">→</span>
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function MailIcon({ className = "h-6 w-6" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6 8.5-6" />
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

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6" aria-hidden>
      <path d="M4 21V6l7-3v18M11 21h9V10l-9-4" />
      <path d="M7.5 8v0M7.5 11.5v0M7.5 15v0M14.5 12v0M17 12v0M14.5 15.5v0M17 15.5v0" />
    </svg>
  );
}

function GraduationIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6" aria-hidden>
      <path d="M12 4 2.5 8.5 12 13l9.5-4.5L12 4z" />
      <path d="M6.5 10.8v4.4c0 1.1 2.5 2.3 5.5 2.3s5.5-1.2 5.5-2.3v-4.4M21.5 8.5v5" />
    </svg>
  );
}

function TeamIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6" aria-hidden>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19.5c.6-3 2.8-4.7 5.5-4.7s4.9 1.7 5.5 4.7" />
      <circle cx="16.8" cy="9.2" r="2.6" />
      <path d="M16.4 14.6c2.3.2 3.8 1.7 4.3 4" />
    </svg>
  );
}

function CompassIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-6 w-6" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="m15.5 8.5-2 5-5 2 2-5z" />
      <circle cx="12" cy="12" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

function SnowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="h-6 w-6" aria-hidden>
      <path d="M12 2v20M4.5 6.5 12 11l7.5-4.5M4.5 17.5 12 13l7.5 4.5M2 12h20" />
      <path d="M12 2 9.8 4.2M12 2l2.2 2.2M12 22l-2.2-2.2M12 22l2.2-2.2" />
    </svg>
  );
}

function WrenchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
      <path d="M14.5 5.5a3.8 3.8 0 0 0 4.8 4.9l-8.9 8.9a2.1 2.1 0 0 1-3-3l8.9-8.9a3.8 3.8 0 0 0-1.8-1.9z" />
      <path d="m14.5 5.5 1.8 1.9" />
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
