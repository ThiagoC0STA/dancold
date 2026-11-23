import "server-only";
import type { PortableTextBlock } from "@portabletext/react";
import type { Locale } from "@/lib/i18n";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { publicSelect } from "@/lib/supabase/rest";
import { getSamplePosts, getSampleSlugs } from "./sample-posts";
import type { BlogPost, BlogPostCard } from "./types";

/**
 * Blog lido do Supabase (tabela `posts`). O site só enxerga post publicado e
 * com data já vencida: quem garante é o RLS. A leitura fica em cache e é
 * renovada pela tag "blog" quando o admin salva.
 */

type Row = {
  slug: string;
  title: string | null;
  excerpt: string | null;
  cover_url: string | null;
  cover_alt: string | null;
  cover_width: number | null;
  cover_height: number | null;
  published_at: string;
};

const cardColumns = (lang: Locale) =>
  `slug,title:title->>${lang},excerpt:excerpt->>${lang},cover_url,cover_alt,cover_width,cover_height,published_at`;

function toCard(row: Row): BlogPostCard {
  const title = row.title ?? "";
  return {
    slug: row.slug,
    title,
    excerpt: row.excerpt ?? "",
    coverUrl: row.cover_url ?? "/img/heroes/chillers.jpg",
    coverAlt: row.cover_alt || title,
    coverRatio:
      row.cover_width && row.cover_height ? `${row.cover_width} / ${row.cover_height}` : undefined,
    publishedAt: row.published_at,
  };
}

export async function getPosts(lang: Locale): Promise<BlogPostCard[]> {
  if (!isSupabaseConfigured) return getSamplePosts(lang);
  const rows = await publicSelect<Row>(
    `posts?select=${cardColumns(lang)}&status=eq.publicado&title->>${lang}=not.is.null&order=published_at.desc`,
    "blog",
  );
  return rows.map(toCard);
}

export async function getPost(lang: Locale, slug: string): Promise<BlogPost | null> {
  if (!isSupabaseConfigured) {
    return getSamplePosts(lang).find((post) => post.slug === slug) ?? null;
  }
  const rows = await publicSelect<Row & { body: PortableTextBlock[] | null }>(
    `posts?select=${cardColumns(lang)},body:body->${lang}&status=eq.publicado&slug=eq.${encodeURIComponent(slug)}&limit=1`,
    "blog",
  );
  const row = rows[0];
  if (!row || !row.title || !row.body?.length) return null;
  return { ...toCard(row), body: row.body };
}

export async function getAllSlugs(): Promise<string[]> {
  if (!isSupabaseConfigured) return getSampleSlugs();
  const rows = await publicSelect<{ slug: string }>("posts?select=slug&status=eq.publicado", "blog");
  return rows.map((row) => row.slug);
}
