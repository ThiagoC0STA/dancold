import type { Metadata } from "next";
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

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/sobre-nos">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata(lang, "sobre-nos", dict.meta.about.title, dict.meta.about.description);
}

const pillars = ["mission", "vision", "values"] as const;

export default async function AboutPage({ params }: PageProps<"/[lang]/sobre-nos">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <PageHero
        lang={lang}
        kicker={dict.about.kicker}
        title={dict.about.title}
        homeLabel={dict.common.home}
        crumbs={[{ label: dict.about.title }]}
        image="/img/slides/1.webp"
      />

      {/* intro + stats */}
      <section className="bg-bg py-24 lg:py-32">
        <div className="mx-auto grid max-w-7xl items-center gap-14 px-6 lg:grid-cols-[1.3fr_1fr]">
          <div>
            <SectionHeading kicker={dict.about.welcome} title={dict.about.whoWeAre} />
            <Reveal delay={0.1}>
              <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-2">
                {dict.about.intro}
              </p>
            </Reveal>
          </div>
          <div className="grid grid-cols-2 gap-10 lg:border-l lg:border-line lg:pl-12">
            <Reveal delay={0.15}>
              <span aria-hidden className="mb-4 block h-px w-6 bg-accent" />
              <p className="font-display text-4xl font-bold tabular-nums text-ink sm:text-5xl">
                <Counter to={25} prefix="+" />
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-3">
                {dict.about.yearsLabel}
              </p>
            </Reveal>
            <Reveal delay={0.23}>
              <span aria-hidden className="mb-4 block h-px w-6 bg-accent" />
              <p className="font-display text-4xl font-bold tabular-nums text-ink sm:text-5xl">
                <Counter to={3000} prefix="+" />
              </p>
              <p className="mt-2 text-xs font-semibold uppercase tracking-[0.16em] text-ink-3">
                {dict.about.clientsLabel}
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* mission / vision / values */}
      <section className="border-t border-line bg-surface-2 py-20 lg:py-24 dark:bg-surface">
        <div className="mx-auto grid max-w-7xl gap-6 px-6 md:grid-cols-3">
          {pillars.map((key, index) => (
            <Reveal
              key={key}
              delay={index * 0.08}
              className="rounded-[10px] border border-line bg-surface p-8 transition hover:border-line-2"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-lg border border-line text-accent">
                {key === "mission" ? <TargetIcon /> : key === "vision" ? <EyeIcon /> : <DiamondIcon />}
              </span>
              <h3 className="mt-6 font-display text-xl font-semibold tracking-tight text-ink">
                {key === "mission"
                  ? dict.about.missionTitle
                  : key === "vision"
                    ? dict.about.visionTitle
                    : dict.about.valuesTitle}
              </h3>
              {key === "values" ? (
                <ul className="mt-4 flex flex-wrap gap-2">
                  {dict.about.values.map((value) => (
                    <li
                      key={value}
                      className="rounded-md border border-line px-3 py-1.5 text-xs font-medium text-ink-2"
                    >
                      {value}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-4 text-sm leading-relaxed text-ink-2">
                  {key === "mission" ? dict.about.mission : dict.about.vision}
                </p>
              )}
            </Reveal>
          ))}
        </div>
      </section>

      {/* history timeline — dark impact band */}
      <section className="section-dark relative overflow-hidden border-y border-line bg-bg py-24 text-ink lg:py-32">
        <div className="bg-blueprint absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6">
          <SectionHeading
            kicker={dict.about.kicker}
            title={dict.about.historyTitle}
            intro={dict.about.history}
          />
          <ol className="mt-16 space-y-14 border-l border-line lg:ml-4 lg:space-y-16">
            {dict.about.timeline.map((entry, index) => (
              <li key={entry.period} className="relative pl-8 sm:pl-12">
                <span
                  aria-hidden
                  className="absolute -left-[5px] top-2 h-[9px] w-[9px] rounded-full bg-accent"
                />
                <Reveal delay={0.06 * (index % 3)}>
                  <div className="relative">
                    <span
                      aria-hidden
                      className="text-stroke pointer-events-none absolute -left-2 -top-7 select-none font-display text-7xl font-bold leading-none tabular-nums sm:text-8xl"
                    >
                      {entry.period.slice(0, 4)}
                    </span>
                    <p className="relative font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                      {entry.period}
                    </p>
                    <p className="relative mt-3 max-w-3xl text-[15px] leading-relaxed text-ink-2">
                      {entry.text}
                    </p>
                  </div>
                </Reveal>
              </li>
            ))}
          </ol>
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

      {/* why choose us */}
      <section className="relative border-t border-line bg-bg py-24 lg:py-32">
        <div className="bg-blueprint absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6">
          <SectionHeading
            kicker={dict.about.whyKicker}
            title={dict.about.whyTitle}
            intro={dict.about.whyIntro}
            align="center"
          />
          <div className="mx-auto mt-14 grid max-w-5xl gap-6 sm:grid-cols-2">
            {dict.about.reasons.map((reason, index) => (
              <Reveal
                key={reason.title}
                delay={index * 0.08}
                className={`rounded-[10px] border border-line bg-surface p-8 transition hover:border-line-2 ${
                  index === 0 ? "crosshair" : ""
                }`}
              >
                <span
                  aria-hidden
                  className="text-stroke font-display text-5xl font-bold tabular-nums"
                >
                  {String(index + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold tracking-tight text-ink">
                  {reason.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-ink-2">{reason.text}</p>
              </Reveal>
            ))}
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
