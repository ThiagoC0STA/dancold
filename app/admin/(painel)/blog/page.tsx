import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { formatDate } from "@/lib/admin/format";
import { Empty, PageHeader } from "@/components/admin/ui";
import { IconPlus } from "@/components/admin/icons";

export const metadata: Metadata = { title: "Blog" };

const isFuture = (iso: string) => new Date(iso).getTime() > Date.now();
const missingLangs = (title: Record<string, string>) => !title.en || !title.es;

export default async function BlogAdminPage() {
  const { supabase } = await requireAdmin();
  const { data, error } = await supabase
    .from("posts")
    .select("id,slug,status,published_at,title,cover_url")
    .order("published_at", { ascending: false });
  if (error) throw new Error("Não foi possível carregar os posts.");
  const posts = data ?? [];

  return (
    <>
      <PageHeader
        title="Blog"
        description={`${posts.length} posts. O que estiver publicado aparece no site em poucos segundos depois de salvar.`}
      >
        <Link href="/admin/blog/novo" className="adm-btn adm-btn-primary">
          <IconPlus className="h-4 w-4" />
          Novo post
        </Link>
      </PageHeader>

      <section className="adm-panel">
        {posts.length === 0 ? (
          <Empty title="Nenhum post ainda">Escreva o primeiro em Novo post.</Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="adm-table adm-list">
              <thead>
                <tr>
                  <th>Post</th>
                  <th className="wide">Línguas</th>
                  <th className="num wide">Data</th>
                  <th className="end">Situação</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => {
                  const title = (post.title ?? {}) as Record<string, string>;
                  const scheduled = post.status === "publicado" && isFuture(post.published_at);
                  return (
                    <tr key={post.id} className="link">
                      <td className="main">
                        <div className="flex items-center gap-3">
                          <span className="relative hidden h-10 w-16 flex-none overflow-hidden rounded-md bg-surface-2 sm:block">
                            {post.cover_url && (
                              <Image src={post.cover_url} alt="" fill sizes="64px" className="object-cover" />
                            )}
                          </span>
                          <span className="min-w-0">
                            <Link href={`/admin/blog/${post.id}`} className="row line-clamp-2 max-w-[520px]">
                              {title.pt || "Sem título"}
                            </Link>
                            <span className="block truncate text-[13px] font-normal text-ink-3 md:hidden">
                              {formatDate(post.published_at)}
                              {missingLangs(title) && " · sem tradução"}
                            </span>
                          </span>
                        </div>
                      </td>
                      <td className="wide">
                        <span className="flex gap-1">
                          {["pt", "en", "es"].map((lang) => (
                            <span
                              key={lang}
                              className={`adm-tag uppercase ${title[lang] ? "" : "opacity-35"}`}
                              title={title[lang] ? "Traduzido" : "Sem tradução"}
                            >
                              {lang}
                            </span>
                          ))}
                        </span>
                      </td>
                      <td className="num wide">{formatDate(post.published_at)}</td>
                      <td className="end">
                        {post.status === "rascunho" ? (
                          <span className="adm-tag" data-tone="warn">
                            Rascunho
                          </span>
                        ) : scheduled ? (
                          <span className="adm-tag">Agendado</span>
                        ) : (
                          <span className="adm-tag" data-tone="ok">
                            Publicado
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </>
  );
}
