import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/dictionaries";
import { isLocale, locales } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { serviceImages, serviceSlugs, site, type ServiceSlug } from "@/lib/site";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { CtaSection } from "@/components/cta-section";
import { WhatsAppIcon } from "@/components/header";

export async function generateStaticParams() {
  return locales.flatMap((lang) => serviceSlugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/servicos/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang) || !serviceSlugs.includes(slug as ServiceSlug)) return {};
  const dict = await getDictionary(lang);
  const service = dict.services[slug as ServiceSlug];
  return pageMetadata(lang, `servicos/${slug}`, service.title, service.short);
}

export default async function ServicePage({ params }: PageProps<"/[lang]/servicos/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang) || !serviceSlugs.includes(slug as ServiceSlug)) notFound();
  const dict = await getDictionary(lang);
  const service = dict.services[slug as ServiceSlug];

  return (
    <>
      <PageHero
        lang={lang}
        kicker={dict.servicesPage.kicker}
        title={service.title}
        homeLabel={dict.common.home}
        crumbs={[
          { label: dict.servicesPage.breadcrumb, href: `/${lang}/servicos` },
          { label: service.title },
        ]}
        image="/img/heroes/chillers.jpg"
      />

      <section className="relative bg-bg py-24 lg:py-28">
        <div className="bg-blueprint absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid gap-14 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <Reveal>
                <p className="border-l-2 border-accent pl-6 font-display text-xl font-medium leading-relaxed text-ink sm:text-2xl">
                  {service.summary}
                </p>
              </Reveal>
              <div className="mt-10 space-y-6">
                {service.body.map((paragraph, index) => (
                  <Reveal key={index} delay={0.08 * (index + 1)}>
                    <p className="text-[15.5px] leading-relaxed text-ink-2">{paragraph}</p>
                  </Reveal>
                ))}
              </div>

              <Reveal delay={0.15} className="mt-14">
                <h2 className="font-display text-2xl font-semibold tracking-tight text-ink">
                  {service.characteristicsTitle}
                </h2>
                <ol className="mt-8 space-y-4">
                  {service.characteristics.map((item) => (
                    <li
                      key={item.title}
                      className="flex gap-5 rounded-[10px] border border-line bg-surface p-6 transition-colors duration-300 hover:border-line-2"
                    >
                      <span
                        aria-hidden
                        className="mt-0.5 flex h-9 w-9 flex-none items-center justify-center rounded-lg border border-line text-accent"
                      >
                        <CheckIcon className="h-[18px] w-[18px]" />
                      </span>
                      <div>
                        <h3 className="font-display text-base font-semibold text-ink">
                          {item.title}
                        </h3>
                        <p className="mt-2 text-sm leading-relaxed text-ink-2">{item.text}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </Reveal>

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
                <div className="relative h-64 overflow-hidden rounded-[10px] border border-line">
                  <Image
                    src={serviceImages[slug as ServiceSlug]}
                    alt={service.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 33vw"
                    className="object-cover"
                  />
                  {/* scrim sits on photography — theme-independent navy */}
                  <div
                    className="absolute inset-0 bg-gradient-to-t from-[#0b1526]/45 to-transparent"
                    aria-hidden
                  />
                </div>
                <nav
                  aria-label={dict.footer.servicesTitle}
                  className="overflow-hidden rounded-[10px] border border-line bg-surface"
                >
                  <h2 className="border-b border-line px-6 py-4 text-xs font-semibold uppercase tracking-[0.18em] text-ink-3">
                    {dict.footer.servicesTitle}
                  </h2>
                  <ul>
                    {serviceSlugs.map((other) => (
                      <li key={other}>
                        <Link
                          href={`/${lang}/servicos/${other}`}
                          className={`relative flex items-center justify-between gap-3 border-b border-line px-6 py-3.5 text-sm transition-colors duration-300 last:border-0 ${
                            other === slug
                              ? "font-semibold text-ink"
                              : "text-ink-2 hover:bg-surface-2 hover:text-ink"
                          }`}
                        >
                          {other === slug && (
                            <span
                              aria-hidden
                              className="absolute inset-y-0 left-0 w-0.5 bg-accent"
                            />
                          )}
                          {dict.services[other].title}
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
