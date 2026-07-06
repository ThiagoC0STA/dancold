import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDictionary } from "@/dictionaries";
import { isLocale, locales } from "@/lib/i18n";
import { pageMetadata } from "@/lib/metadata";
import { site } from "@/lib/site";
import { getAllSlugs, getPost, getPosts } from "@/lib/blog";
import { readingMinutes } from "@/lib/blog/reading-time";
import { PageHero } from "@/components/page-hero";
import { BlogBody } from "@/components/blog-body";
import { BlogCard, formatPostDate } from "@/components/blog-card";
import { BlogShare } from "@/components/blog-share";
import { ReadingProgress } from "@/components/reading-progress";
import { Reveal } from "@/components/reveal";
import { CtaSection } from "@/components/cta-section";
import { JsonLd } from "@/components/json-ld";
import { articleSchema, breadcrumb } from "@/lib/schema";

export const revalidate = 300;
export const dynamicParams = true;

export async function generateStaticParams() {
  const slugs = await getAllSlugs();
  return locales.flatMap((lang) => slugs.map((slug) => ({ lang, slug })));
}

export async function generateMetadata({
  params,
}: PageProps<"/[lang]/blog/[slug]">): Promise<Metadata> {
  const { lang, slug } = await params;
  if (!isLocale(lang)) return {};
  const post = await getPost(lang, slug);
  if (!post) return {};
  const meta = pageMetadata(lang, `blog/${slug}`, post.title, post.excerpt);
  return {
    ...meta,
    openGraph: {
      ...meta.openGraph,
      type: "article",
      publishedTime: post.publishedAt,
      images: [{ url: post.coverUrl }],
    },
  };
}

export default async function BlogPostPage({ params }: PageProps<"/[lang]/blog/[slug]">) {
  const { lang, slug } = await params;
  if (!isLocale(lang)) notFound();
  const [dict, post] = await Promise.all([getDictionary(lang), getPost(lang, slug)]);
  if (!post) notFound();

  const related = (await getPosts(lang)).filter((item) => item.slug !== slug).slice(0, 3);
  const minutes = readingMinutes(post.body);
  const shareUrl = `${site.url}/${lang}/blog/${slug}`;
  const shareLabels = { share: dict.blog.share, copyLink: dict.blog.copyLink, copied: dict.blog.copied };

  return (
    <>
      <ReadingProgress />
      <JsonLd
        data={breadcrumb(lang, [
          { name: dict.common.home, path: "" },
          { name: dict.blog.breadcrumb, path: "/blog" },
          { name: post.title, path: `/blog/${slug}` },
        ])}
      />
      <JsonLd
        data={articleSchema(lang, slug, post.title, post.excerpt, post.coverUrl, post.publishedAt)}
      />
      <PageHero
        lang={lang}
        kicker={formatPostDate(post.publishedAt, lang)}
        title={post.title}
        homeLabel={dict.common.home}
        crumbs={[
          { label: dict.blog.breadcrumb, href: `/${lang}/blog` },
          { label: post.title },
        ]}
        image={post.coverUrl}
        imageAlt={post.coverAlt}
      />

      <article className="relative border-b border-line bg-bg py-16 lg:py-24">
        <div className="bg-blueprint absolute inset-0 opacity-40" aria-hidden />

        <div className="relative mx-auto max-w-4xl px-6">
          {/* sticky share rail in the left gutter — desktop only */}
          <div className="pointer-events-none absolute right-full top-0 hidden h-full pr-10 xl:block">
            <div className="pointer-events-auto sticky top-32">
              <BlogShare url={shareUrl} title={post.title} labels={shareLabels} orientation="vertical" />
            </div>
          </div>

          {/* byline: author + reading time, with inline share on the right */}
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-line pb-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-line bg-white">
                <Image
                  src="/logo-mark.webp"
                  alt=""
                  width={32}
                  height={32}
                  className="h-8 w-8 object-contain"
                />
              </span>
              <div className="leading-tight">
                <p className="text-sm font-semibold text-ink">{dict.blog.author}</p>
                <p className="mt-0.5 text-[13px] text-ink-3">
                  {formatPostDate(post.publishedAt, lang)}
                  <span aria-hidden className="mx-1.5 text-line-2">·</span>
                  {minutes} {dict.blog.minRead}
                </p>
              </div>
            </div>
            <div className="xl:hidden">
              <BlogShare url={shareUrl} title={post.title} labels={shareLabels} />
            </div>
          </div>

          <Reveal>
            <p className="mt-8 border-l-2 border-accent pl-5 text-lg font-medium leading-relaxed text-ink md:text-xl">
              {post.excerpt}
            </p>
          </Reveal>

          <div className="relative mt-10 aspect-video overflow-hidden rounded-[12px] border border-line shadow-[0_30px_60px_-40px_rgba(13,27,46,0.55)]">
            <Image
              src={post.coverUrl}
              alt={post.coverAlt}
              fill
              priority
              sizes="(max-width: 896px) 100vw, 896px"
              className="object-cover"
            />
          </div>

          <Reveal delay={0.05} className="mt-10">
            <BlogBody value={post.body} />
          </Reveal>

          <div className="mt-14 flex flex-wrap items-center justify-between gap-5 border-t border-line pt-8">
            <Link
              href={`/${lang}/blog`}
              className="group inline-flex items-center gap-2 text-[13px] font-semibold uppercase tracking-[0.16em] text-ink-3 transition hover:text-accent"
            >
              <span aria-hidden className="transition-transform group-hover:-translate-x-1">←</span>
              {dict.blog.backToBlog}
            </Link>
            <BlogShare url={shareUrl} title={post.title} labels={shareLabels} />
          </div>
        </div>
      </article>

      {related.length > 0 && (
        <section className="bg-surface-2 py-20 lg:py-24">
          <div className="mx-auto max-w-7xl px-6">
            <Reveal>
              <p className="kicker">{dict.blog.relatedKicker}</p>
              <h2 className="mt-3 font-display text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                {dict.blog.title}
              </h2>
            </Reveal>
            <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {related.map((item, index) => (
                <BlogCard
                  key={item.slug}
                  lang={lang}
                  post={item}
                  index={index}
                  readMore={dict.blog.readArticle}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      <CtaSection dict={dict} />
    </>
  );
}
