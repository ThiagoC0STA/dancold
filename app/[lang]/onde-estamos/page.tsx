import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/dictionaries";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { SectionHeading } from "@/components/section-heading";
import { CtaSection } from "@/components/cta-section";

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

  return (
    <>
      <PageHero
        lang={lang}
        kicker={data.kicker}
        title={data.title}
        homeLabel={dict.common.home}
        crumbs={[{ label: data.title }]}
        image="/img/slides/3.webp"
      />

      <section className="relative bg-bg py-24">
        <div className="bg-blueprint absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6">
          <Reveal>
            <p className="max-w-4xl text-lg leading-[1.85] text-ink-2">{data.intro}</p>
          </Reveal>

          <div className="mt-14 grid gap-7 md:grid-cols-3">
            {infoCards.map((card, index) => (
              <Reveal
                key={card.title}
                delay={index * 0.1}
                className="rounded-[10px] border border-line bg-surface p-7 transition hover:border-line-2"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-lg border border-line text-accent">
                  {card.icon}
                </span>
                <h3 className="mt-5 font-display text-lg font-semibold text-ink">{card.title}</h3>
                <p className="mt-2.5 text-sm leading-relaxed text-ink-2">{card.text}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* states and cities */}
      <section className="border-y border-line bg-surface-2 py-20">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-14 lg:grid-cols-2">
            <div>
              <SectionHeading kicker={data.kicker} title={data.statesTitle} />
              <div className="mt-8 flex flex-wrap gap-3">
                {data.states.map((state, index) => (
                  <Reveal key={state} delay={index * 0.06}>
                    <span className="inline-flex items-center gap-2.5 rounded-md border border-line-2 bg-surface px-4 py-2 text-sm font-semibold text-ink">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                      {state}
                    </span>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={0.2} className="mt-12">
                <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-ink-3">
                  {data.citiesTitle}
                </h3>
                <ul className="mt-5 flex flex-wrap gap-2">
                  {data.cities.map((city) => (
                    <li
                      key={city}
                      className="rounded-md border border-line bg-surface px-3.5 py-1.5 text-[13px] text-ink-2"
                    >
                      {city}
                    </li>
                  ))}
                </ul>
              </Reveal>

              <Reveal
                delay={0.25}
                className="mt-12 rounded-[10px] border border-line bg-surface p-7"
              >
                <h3 className="font-display text-lg font-semibold text-ink">{data.contactTitle}</h3>
                <div className="mt-4 space-y-2 text-sm text-ink-2">
                  <p>
                    <span className="mr-2 text-xs uppercase tracking-wider text-ink-3">
                      {data.emailTitle}
                    </span>
                    <a
                      href={`mailto:${site.email}`}
                      className="font-medium text-ink transition hover:text-accent"
                    >
                      {site.email}
                    </a>
                  </p>
                  <p className="flex flex-wrap gap-x-6">
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
                  </p>
                </div>
              </Reveal>
            </div>

            <Reveal
              delay={0.15}
              className="overflow-hidden rounded-[10px] border border-line"
            >
              <iframe
                title="Dancold - Google Maps"
                src="https://www.google.com/maps?q=Av.+Prefeito+Maur%C3%ADcio+Fruet,+3060,+Cajuru,+Curitiba+-+PR&output=embed"
                className="h-full min-h-[480px] w-full grayscale-[35%] contrast-[1.05]"
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
