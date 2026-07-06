import "server-only";
import { defineQuery } from "next-sanity";
import type { Locale } from "@/lib/i18n";
import { isSanityConfigured } from "@/sanity/env";
import { getClient, imageUrl } from "@/sanity/lib/client";
import { getSamplePosts, getSampleSlugs } from "./sample-posts";
import type { BlogPost, BlogPostCard } from "./types";

const FETCH_OPTIONS = { next: { revalidate: 300, tags: ["blog"] } };

const listQuery = defineQuery(`
  *[_type == "post" && defined(slug.current) && defined(title[$lang]) && publishedAt <= now()]
    | order(publishedAt desc) {
    "slug": slug.current,
    "title": title[$lang],
    "excerpt": excerpt[$lang],
    coverImage,
    "coverAlt": coalesce(coverImage.alt, title[$lang]),
    publishedAt
  }
`);

const postQuery = defineQuery(`
  *[_type == "post" && slug.current == $slug && defined(title[$lang]) && publishedAt <= now()][0] {
    "slug": slug.current,
    "title": title[$lang],
    "excerpt": excerpt[$lang],
    coverImage,
    "coverAlt": coalesce(coverImage.alt, title[$lang]),
    publishedAt,
    "body": body[$lang]
  }
`);

const slugsQuery = defineQuery(
  `*[_type == "post" && defined(slug.current)].slug.current`,
);

type SanityCard = {
  slug: string;
  title: string;
  excerpt: string | null;
  coverImage: unknown;
  coverAlt: string | null;
  publishedAt: string;
};

function toCard(item: SanityCard): BlogPostCard {
  return {
    slug: item.slug,
    title: item.title,
    excerpt: item.excerpt ?? "",
    coverUrl: item.coverImage ? imageUrl(item.coverImage as never) : "/img/heroes/chillers.jpg",
    coverAlt: item.coverAlt ?? item.title,
    publishedAt: item.publishedAt,
  };
}

export async function getPosts(lang: Locale): Promise<BlogPostCard[]> {
  if (!isSanityConfigured) return getSamplePosts(lang);
  const items = await getClient().fetch<SanityCard[]>(listQuery, { lang }, FETCH_OPTIONS);
  return items.map(toCard);
}

export async function getPost(lang: Locale, slug: string): Promise<BlogPost | null> {
  if (!isSanityConfigured) {
    return getSamplePosts(lang).find((post) => post.slug === slug) ?? null;
  }
  const item = await getClient().fetch<(SanityCard & { body: BlogPost["body"] | null }) | null>(
    postQuery,
    { lang, slug },
    FETCH_OPTIONS,
  );
  if (!item || !item.body) return null;
  return { ...toCard(item), body: item.body };
}

export async function getAllSlugs(): Promise<string[]> {
  if (!isSanityConfigured) return getSampleSlugs();
  return getClient().fetch<string[]>(slugsQuery, {}, FETCH_OPTIONS);
}
