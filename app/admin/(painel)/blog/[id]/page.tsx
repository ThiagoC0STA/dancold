import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/session";
import { toMarkdown, type Block } from "@/lib/blog/markdown";
import { locales, type Locale } from "@/lib/i18n";
import { isTranslatorConfigured } from "@/lib/translate";
import { IconBack } from "@/components/admin/icons";
import { PostEditor, type EditorPost } from "./post-editor";

export const metadata: Metadata = { title: "Editar post" };

const UUID = /^[0-9a-f-]{36}$/i;
const emptyLocales = () => ({ pt: "", en: "", es: "" }) as Record<Locale, string>;

export default async function PostPage({ params }: PageProps<"/admin/blog/[id]">) {
  const { id } = await params;
  const { supabase } = await requireAdmin();

  let post: EditorPost = {
    id: null,
    slug: "",
    status: "rascunho",
    publishedAt: new Date().toISOString(),
    coverUrl: null,
    coverAlt: "",
    coverWidth: null,
    coverHeight: null,
    title: emptyLocales(),
    excerpt: emptyLocales(),
    body: emptyLocales(),
  };

  if (id !== "novo") {
    if (!UUID.test(id)) notFound();
    const { data } = await supabase.from("posts").select("*").eq("id", id).maybeSingle();
    if (!data) notFound();
    const title = (data.title ?? {}) as Record<string, string>;
    const excerpt = (data.excerpt ?? {}) as Record<string, string>;
    const body = (data.body ?? {}) as Record<string, Block[]>;
    post = {
      id: data.id,
      slug: data.slug,
      status: data.status,
      publishedAt: data.published_at,
      coverUrl: data.cover_url,
      coverAlt: data.cover_alt ?? "",
      coverWidth: data.cover_width,
      coverHeight: data.cover_height,
      title: emptyLocales(),
      excerpt: emptyLocales(),
      body: emptyLocales(),
    };
    for (const locale of locales) {
      post.title[locale] = title[locale] ?? "";
      post.excerpt[locale] = excerpt[locale] ?? "";
      post.body[locale] = toMarkdown(body[locale]);
    }
  }

  return (
    <>
      <Link href="/admin/blog" className="adm-btn adm-btn-quiet -ml-3 mb-3">
        <IconBack className="h-4 w-4" />
        Blog
      </Link>
      <PostEditor key={post.id ?? "novo"} initial={post} canTranslate={isTranslatorConfigured()} />
    </>
  );
}
