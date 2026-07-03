import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/dictionaries";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { serviceSlugs } from "@/lib/site";
import { PageHero } from "@/components/page-hero";
import { ServiceList } from "@/components/service-list";
import { CtaSection } from "@/components/cta-section";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/servicos">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata(lang, "servicos", dict.meta.services.title, dict.meta.services.description);
}

export default async function ServicesPage({ params }: PageProps<"/[lang]/servicos">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <PageHero
        lang={lang}
        kicker={dict.servicesPage.kicker}
        title={dict.servicesPage.title}
        homeLabel={dict.common.home}
        crumbs={[{ label: dict.servicesPage.breadcrumb }]}
        image="/img/services/instalacoes-2.webp"
      />
      <section className="relative bg-bg py-24 lg:py-32">
        <div className="bg-blueprint absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6">
          <ServiceList
            lang={lang}
            items={serviceSlugs.map((slug) => ({
              slug,
              title: dict.services[slug].title,
              text: dict.services[slug].short,
            }))}
            readMore={dict.common.readMore}
          />
        </div>
      </section>
      <CtaSection dict={dict} />
    </>
  );
}
