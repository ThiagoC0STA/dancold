import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDictionary } from "@/dictionaries";
import { isLocale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { getPosts } from "@/lib/blog";
import { PageHero } from "@/components/page-hero";
import { BlogCard } from "@/components/blog-card";
import { Reveal } from "@/components/reveal";
import { CtaSection } from "@/components/cta-section";
import { JsonLd } from "@/components/json-ld";
import { breadcrumb } from "@/lib/schema";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/blog">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);
  return pageMetadata(lang, "blog", dict.meta.blog.title, dict.meta.blog.description);
}

export default async function BlogPage({ params }: PageProps<"/[lang]/blog">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const [dict, posts] = await Promise.all([getDictionary(lang), getPosts(lang)]);

  return (
    <>
      <JsonLd
        data={breadcrumb(lang, [
          { name: dict.common.home, path: "" },
          { name: dict.blog.breadcrumb, path: "/blog" },
        ])}
      />
      <PageHero
        lang={lang}
        kicker={dict.blog.kicker}
        title={dict.blog.title}
        homeLabel={dict.common.home}
        crumbs={[{ label: dict.blog.breadcrumb }]}
        image="/img/heroes/technicians.jpg"
        imageAlt=""
      />
      <section className="relative border-b border-line bg-bg py-24 lg:py-28">
        <div className="bg-blueprint absolute inset-0 opacity-40" aria-hidden />
        <div className="relative mx-auto max-w-7xl px-6">
          <Reveal>
            <p className="max-w-3xl text-lg leading-relaxed text-ink-2">{dict.blog.intro}</p>
          </Reveal>
          {posts.length === 0 ? (
            <Reveal delay={0.1}>
              <p className="mt-14 rounded-[10px] border border-line bg-surface px-8 py-14 text-center text-ink-2">
                {dict.blog.empty}
              </p>
            </Reveal>
          ) : (
            <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {posts.map((post, index) => (
                <BlogCard
                  key={post.slug}
                  lang={lang}
                  post={post}
                  index={index}
                  readMore={dict.blog.readArticle}
                />
              ))}
            </div>
          )}
        </div>
      </section>
      <CtaSection dict={dict} />
    </>
  );
}
