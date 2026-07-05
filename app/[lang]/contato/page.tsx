import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/dictionaries";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { WhatsAppIcon } from "@/components/header";
import { JsonLd } from "@/components/json-ld";
import { breadcrumb } from "@/lib/schema";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/contato">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata(lang, "contato", dict.meta.contact.title, dict.meta.contact.description);
}

export default async function ContactPage({ params }: PageProps<"/[lang]/contato">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);
  const c = dict.contact;

  const socials = [
    { href: site.social.facebook, label: "Facebook", path: FACEBOOK_PATH },
    { href: site.social.instagram, label: "Instagram", path: INSTAGRAM_PATH },
    { href: site.social.linkedin, label: "LinkedIn", path: LINKEDIN_PATH },
  ];

  return (
    <>
      <JsonLd
        data={breadcrumb(lang, [
          { name: dict.common.home, path: "" },
          { name: c.kicker, path: "/contato" },
        ])}
      />
      <link rel="preconnect" href="https://maps.gstatic.com" crossOrigin="" />
      <link rel="dns-prefetch" href="https://maps.gstatic.com" />
      <link rel="dns-prefetch" href="https://www.google.com" />
      <PageHero
        lang={lang}
        kicker={c.kicker}
        title={c.title}
        homeLabel={dict.common.home}
        crumbs={[{ label: c.kicker }]}
        image="/img/heroes/gauge.jpg"
        imageAlt="Manômetros de um sistema de refrigeração industrial"
      />

      {/* contact channels — no form, direct actions */}
      <section className="relative bg-bg py-24 lg:py-28">
        <div className="bg-blueprint absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6">
          <Reveal>
            <p className="max-w-2xl text-lg leading-relaxed text-ink-2">{c.intro}</p>
          </Reveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-[1.4fr_1fr_1fr]">
            {/* WhatsApp — featured */}
            <Reveal className="lg:row-span-1">
              <a
                href={site.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="group relative flex h-full min-h-[220px] flex-col justify-between overflow-hidden rounded-2xl bg-[#1faa52] p-8 text-white transition hover:bg-[#1c9c4c]"
              >
                <span
                  aria-hidden
                  className="absolute -right-8 -top-8 text-white/10 transition duration-500 group-hover:scale-110"
                >
                  <WhatsAppIcon className="h-44 w-44" />
                </span>
                <span className="relative flex h-12 w-12 items-center justify-center rounded-xl bg-white/15">
                  <WhatsAppIcon className="h-6 w-6" />
                </span>
                <div className="relative">
                  <p className="font-display text-2xl font-bold tabular-nums">
                    {site.phoneMobile}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                    {dict.common.whatsapp}
                    <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </a>
            </Reveal>

            {/* Phone */}
            <Reveal delay={0.08}>
              <div className="flex h-full min-h-[220px] flex-col justify-between rounded-2xl border border-line bg-surface p-8 transition hover:border-navy-300 hover:shadow-sm">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <PhoneIcon />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3">
                    {c.phonesTitle}
                  </p>
                  <div className="mt-2 space-y-1">
                    <a
                      href="tel:+554133654877"
                      className="block font-display text-xl font-bold tabular-nums text-ink transition hover:text-accent"
                    >
                      {site.phoneFixed}
                    </a>
                    <a
                      href="tel:+5541992466920"
                      className="block font-display text-xl font-bold tabular-nums text-ink transition hover:text-accent"
                    >
                      {site.phoneMobile}
                    </a>
                  </div>
                </div>
              </div>
            </Reveal>

            {/* E-mail */}
            <Reveal delay={0.16}>
              <a
                href={`mailto:${site.email}`}
                className="group flex h-full min-h-[220px] flex-col justify-between rounded-2xl border border-line bg-surface p-8 transition hover:border-navy-300 hover:shadow-sm"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent">
                  <MailIcon />
                </span>
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3">
                    {c.emailTitle}
                  </p>
                  <p className="mt-2 font-display text-lg font-bold break-all text-ink transition group-hover:text-accent">
                    {site.email}
                  </p>
                  <span className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-ink-2 transition group-hover:text-ink">
                    {dict.common.contactUs}
                    <span aria-hidden className="transition-transform duration-200 group-hover:translate-x-1">→</span>
                  </span>
                </div>
              </a>
            </Reveal>
          </div>

          {/* location — info panel + map */}
          <Reveal delay={0.1} className="mt-6">
            <div className="grid overflow-hidden rounded-2xl border border-line shadow-[0_24px_60px_rgba(13,27,46,0.08)] lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
              <div className="section-dark relative flex flex-col bg-bg p-8 text-ink lg:p-12">
                <div className="bg-blueprint absolute inset-0 opacity-60" aria-hidden />
                <div className="relative flex flex-1 flex-col">
                  <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
                    {c.infoTitle}
                  </h2>
                  <span aria-hidden className="mt-5 block h-[2px] w-10 bg-accent" />

                  <dl className="mt-9 space-y-7 text-sm">
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3">
                        {c.addressTitle}
                      </dt>
                      <dd className="mt-2 leading-relaxed text-ink-2">{c.addressText}</dd>
                    </div>
                    <div>
                      <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3">
                        {c.hoursTitle}
                      </dt>
                      <dd className="mt-2 leading-relaxed text-ink-2">{c.hoursText}</dd>
                    </div>
                  </dl>

                  <div className="mt-auto flex gap-3 pt-10">
                    {socials.map((s) => (
                      <a
                        key={s.label}
                        href={s.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={s.label}
                        className="flex h-10 w-10 items-center justify-center rounded-lg border border-line text-ink-2 transition hover:border-line-2 hover:text-ink"
                      >
                        <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
                          <path d={s.path} />
                        </svg>
                      </a>
                    ))}
                  </div>
                </div>
              </div>

              <iframe
                title="Dancold - Google Maps"
                src="https://www.google.com/maps?q=Av.+Prefeito+Maur%C3%ADcio+Fruet,+3060,+Cajuru,+Curitiba+-+PR&output=embed"
                className="h-full min-h-[380px] w-full grayscale-35 contrast-105"
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                allowFullScreen
              />
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
      <path d="M6.5 3.5h3l1.5 5-2 1.2a12 12 0 0 0 5.3 5.3l1.2-2 5 1.5v3a2 2 0 0 1-2.2 2A16.5 16.5 0 0 1 4.5 5.7 2 2 0 0 1 6.5 3.5z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" className="h-6 w-6" aria-hidden>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3.5 6.5 8.5 6 8.5-6" />
    </svg>
  );
}

const FACEBOOK_PATH =
  "M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.3-.04-1.3-.12-2.45-.12-2.4 0-4.05 1.46-4.05 4.15v2.32H7.5V13h2.7v8h3.3z";
const INSTAGRAM_PATH =
  "M12 8.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm6.5-.25a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0zM12 4.6c-2.4 0-2.7.01-3.65.05-.94.05-1.45.2-1.79.33-.45.18-.77.39-1.1.72-.34.33-.55.65-.72 1.1-.14.34-.29.85-.33 1.79C4.36 9.53 4.35 9.82 4.35 12s.01 2.47.06 3.41c.04.94.2 1.45.33 1.79.17.45.38.77.72 1.1.33.34.65.55 1.1.72.34.14.85.29 1.79.33.95.05 1.24.06 3.65.06s2.7-.01 3.65-.06c.94-.04 1.45-.19 1.79-.33.45-.17.77-.38 1.1-.72.34-.33.55-.65.72-1.1.14-.34.29-.85.33-1.79.05-.94.06-1.23.06-3.41s-.01-2.47-.06-3.41c-.04-.94-.19-1.45-.33-1.79a2.96 2.96 0 0 0-.72-1.1 2.96 2.96 0 0 0-1.1-.72c-.34-.14-.85-.29-1.79-.33C14.7 4.61 14.4 4.6 12 4.6zm0-1.85c2.45 0 2.75.01 3.71.05 1 .05 1.66.2 2.25.44.6.23 1.12.55 1.63 1.06.5.5.83 1.02 1.06 1.63.23.6.4 1.25.44 2.25.04.96.05 1.26.05 3.71s-.01 2.75-.05 3.71c-.05 1-.2 1.66-.44 2.25a4.6 4.6 0 0 1-1.06 1.63c-.5.5-1.02.83-1.63 1.06-.6.23-1.25.4-2.25.44-.96.04-1.26.05-3.71.05s-2.75-.01-3.71-.05c-1-.05-1.66-.2-2.25-.44a4.6 4.6 0 0 1-1.63-1.06 4.6 4.6 0 0 1-1.06-1.63c-.23-.6-.4-1.25-.44-2.25-.04-.96-.05-1.26-.05-3.71s.01-2.75.05-3.71c.05-1 .2-1.66.44-2.25.23-.6.55-1.12 1.06-1.63a4.6 4.6 0 0 1 1.63-1.06c.6-.23 1.25-.4 2.25-.44.96-.04 1.26-.05 3.71-.05z";
const LINKEDIN_PATH =
  "M6.94 8.6H3.6V20.4h3.34V8.6zM5.27 3.6a1.94 1.94 0 1 0 0 3.87 1.94 1.94 0 0 0 0-3.87zM20.4 13.9c0-3.06-1.63-4.48-3.81-4.48-1.76 0-2.55.97-2.99 1.65V8.6h-3.34c.04.94 0 11.8 0 11.8h3.34v-6.6c0-.35.03-.7.13-.96.28-.7.92-1.43 2-1.43 1.4 0 1.97 1.07 1.97 2.64v6.35h3.7V13.9z";
