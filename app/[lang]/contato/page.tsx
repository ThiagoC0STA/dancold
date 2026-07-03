import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/dictionaries";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import { PageHero } from "@/components/page-hero";
import { Reveal } from "@/components/reveal";
import { ContactForm } from "@/components/contact-form";
import { WhatsAppIcon } from "@/components/header";

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

  const info = [
    { title: dict.contact.hoursTitle, text: dict.contact.hoursText },
    { title: dict.contact.addressTitle, text: dict.contact.addressText },
  ];

  return (
    <>
      <PageHero
        lang={lang}
        kicker={dict.contact.kicker}
        title={dict.contact.title}
        homeLabel={dict.common.home}
        crumbs={[{ label: dict.contact.kicker }]}
        image="/img/slides/4.webp"
      />

      <section className="relative bg-bg py-24 lg:py-32">
        <div className="bg-blueprint absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6">
          <div className="grid gap-14 lg:grid-cols-[1.5fr_1fr]">
            <Reveal>
              <p className="max-w-2xl text-lg leading-relaxed text-ink-2">{dict.contact.intro}</p>
              <div className="crosshair mt-10 rounded-[10px] border border-line bg-surface p-8">
                <ContactForm copy={dict.contact.form} whatsappNumber="5541992466920" />
              </div>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="rounded-[10px] border border-line bg-surface p-8">
                <h2 className="font-display text-xl font-semibold tracking-tight text-ink">
                  {dict.contact.infoTitle}
                </h2>
                <dl className="mt-7 space-y-6 text-sm">
                  {info.map((item) => (
                    <div key={item.title}>
                      <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3">
                        {item.title}
                      </dt>
                      <dd className="mt-2 leading-relaxed text-ink-2">{item.text}</dd>
                    </div>
                  ))}
                  <div>
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3">
                      {dict.contact.emailTitle}
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
                    <dt className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-3">
                      {dict.contact.phonesTitle}
                    </dt>
                    <dd className="mt-2 space-y-1">
                      <a
                        href="tel:+554133654877"
                        className="block font-medium tabular-nums text-ink transition hover:text-accent"
                      >
                        {site.phoneFixed}
                      </a>
                      <a
                        href={site.whatsapp}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block font-medium tabular-nums text-ink transition hover:text-accent"
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
                  className="mt-8 flex h-[52px] items-center justify-center gap-2.5 rounded-lg bg-[#25D366] px-6 text-sm font-semibold text-white transition hover:brightness-105"
                >
                  <WhatsAppIcon className="h-5 w-5" />
                  {dict.common.whatsapp}
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>
    </>
  );
}
