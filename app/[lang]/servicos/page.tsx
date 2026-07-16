import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/dictionaries";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { serviceSlugs } from "@/lib/site";
import { PageHero } from "@/components/page-hero";
import { ServiceCard } from "@/components/service-card";
import { CtaSection } from "@/components/cta-section";
import { JsonLd } from "@/components/json-ld";
import { breadcrumb } from "@/lib/schema";

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
      <JsonLd
        data={breadcrumb(lang, [
          { name: dict.common.home, path: "" },
          { name: dict.servicesPage.breadcrumb, path: "/servicos" },
        ])}
      />
      <PageHero
        lang={lang}
        kicker={dict.servicesPage.kicker}
        title={dict.servicesPage.title}
        homeLabel={dict.common.home}
        crumbs={[{ label: dict.servicesPage.breadcrumb }]}
        image="/img/heroes/servicos.webp"
        imageAlt="Técnicos em manutenção de equipamentos de ar condicionado no telhado"
      />
      <section className="bg-bg py-24 lg:py-28">
        <div className="mx-auto max-w-7xl px-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {serviceSlugs.map((slug, index) => (
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
      <CtaSection dict={dict} />
    </>
  );
}
