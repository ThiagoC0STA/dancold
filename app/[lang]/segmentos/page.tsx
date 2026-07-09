import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/dictionaries";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { segmentSlugs } from "@/lib/site";
import { PageHero } from "@/components/page-hero";
import { SegmentCard } from "@/components/segment-card";
import { Reveal } from "@/components/reveal";
import { CtaSection } from "@/components/cta-section";
import { JsonLd } from "@/components/json-ld";
import { breadcrumb } from "@/lib/schema";

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/segmentos">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata(lang, "segmentos", dict.meta.segments.title, dict.meta.segments.description);
}

export default async function SegmentsPage({ params }: PageProps<"/[lang]/segmentos">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary(lang);

  return (
    <>
      <JsonLd
        data={breadcrumb(lang, [
          { name: dict.common.home, path: "" },
          { name: dict.segmentsPage.breadcrumb, path: "/segmentos" },
        ])}
      />
      <PageHero
        lang={lang}
        kicker={dict.segmentsPage.kicker}
        title={dict.segmentsPage.title}
        homeLabel={dict.common.home}
        crumbs={[{ label: dict.segmentsPage.breadcrumb }]}
        image="/img/heroes/mall-atrium.jpg"
        imageAlt="Átrio de shopping center com climatização central"
      />
      <section className="relative border-b border-line bg-bg py-24 lg:py-28">
        <div className="bg-blueprint absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6">
          <Reveal>
            <p className="max-w-3xl text-lg leading-relaxed text-ink-2">
              {dict.segmentsPage.intro}
            </p>
          </Reveal>
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {segmentSlugs.map((slug, index) => (
              <SegmentCard
                key={slug}
                lang={lang}
                slug={slug}
                index={index}
                title={dict.segments[slug].title}
                text={dict.segments[slug].short}
                learnMore={dict.common.learnMore}
              />
            ))}
          </div>
        </div>
      </section>
      <CtaSection dict={dict} />
    </>
  );
}
