"use client";

import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import type { PortableTextBlock } from "@portabletext/react";
import { BlogBody } from "@/components/blog-body";
import { IconCheck, IconExternal } from "@/components/admin/icons";
import { RichEditor } from "@/components/admin/rich-editor";
import { fromMarkdown, slugify } from "@/lib/blog/markdown";
import { locales, type Locale } from "@/lib/i18n";
import { createClient } from "@/lib/supabase/browser";
import type { Target } from "@/lib/translate";
import { deletePost, savePost, translatePost, type PostInput } from "../../../actions";

export type EditorPost = PostInput;

const LANG_NAMES: Record<Locale, string> = { pt: "Português", en: "Inglês", es: "Espanhol" };
const TARGETS: Target[] = ["en", "es"];

/** Uma língua só vai ao ar com título e texto. */
const isReady = (post: EditorPost, locale: Locale) => Boolean(post.title[locale].trim() && post.body[locale].trim());
const MAX_IMAGE = 8 * 1024 * 1024;

/** "2026-11-23T14:30" no horário de quem está editando. */
function toLocalInput(iso: string): string {
  const date = new Date(iso);
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return shifted.toISOString().slice(0, 16);
}

function readSize(file: File): Promise<{ width: number; height: number } | null> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(file);
    const image = new window.Image();
    image.onload = () => {
      resolve({ width: image.naturalWidth, height: image.naturalHeight });
      URL.revokeObjectURL(url);
    };
    image.onerror = () => {
      resolve(null);
      URL.revokeObjectURL(url);
    };
    image.src = url;
  });
}

async function uploadImage(file: File) {
  if (!file.type.startsWith("image/")) throw new Error("Escolha um arquivo de imagem.");
  if (file.size > MAX_IMAGE) throw new Error("A imagem passa de 8 MB. Reduza e tente de novo.");
  const size = await readSize(file);
  const extension = (file.name.split(".").pop() ?? "jpg").toLowerCase().replace(/[^a-z0-9]/g, "");
  const name = slugify(file.name.replace(/\.[^.]+$/, "")) || "imagem";
  const path = `posts/${Date.now()}-${name}.${extension}`;
  const supabase = createClient();
  const { error } = await supabase.storage
    .from("blog")
    .upload(path, file, { cacheControl: "31536000", contentType: file.type });
  if (error) throw new Error("Não foi possível enviar a imagem. Tente de novo.");
  return { url: supabase.storage.from("blog").getPublicUrl(path).data.publicUrl, ...size };
}

export function PostEditor({ initial, canTranslate }: { initial: EditorPost; canTranslate: boolean }) {
  const router = useRouter();
  const [post, setPost] = useState(initial);
  const [lang, setLang] = useState<Locale>("pt");
  const [view, setView] = useState<"write" | "preview">("write");
  const [slugTouched, setSlugTouched] = useState(Boolean(initial.id));
  const [dirty, setDirty] = useState(false);
  const [notice, setNotice] = useState<{ tone: "ok" | "bad"; text: string } | null>(null);
  const [busy, setBusy] = useState<"cover" | "translate" | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [askPublish, setAskPublish] = useState(false);
  // muda quando o texto é trocado de fora (tradução): o editor recomeça com o texto novo
  const [editorVersion, setEditorVersion] = useState(0);
  const [saving, startSaving] = useTransition();
  const coverInput = useRef<HTMLInputElement>(null);

  const preview = useMemo(
    () => (view === "preview" ? (fromMarkdown(post.body[lang]) as unknown as PortableTextBlock[]) : []),
    [view, post.body, lang],
  );

  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  function change(patch: (current: EditorPost) => Partial<EditorPost>) {
    setPost((current) => ({ ...current, ...patch(current) }));
    setDirty(true);
    setNotice(null);
    setAskPublish(false);
  }
  const changeText = (field: "title" | "excerpt" | "body", value: string) =>
    change((current) => ({ [field]: { ...current[field], [lang]: value } }));

  function changeTitle(value: string) {
    change((current) => ({
      title: { ...current.title, [lang]: value },
      ...(lang === "pt" && !slugTouched ? { slug: slugify(value) } : {}),
    }));
  }

  async function handleCover(file: File | undefined) {
    if (!file) return;
    setBusy("cover");
    try {
      const image = await uploadImage(file);
      change(() => ({ coverUrl: image.url, coverWidth: image.width ?? null, coverHeight: image.height ?? null }));
      setNotice({ tone: "ok", text: "Capa enviada. Salve o post para ela valer." });
    } catch (error) {
      setNotice({ tone: "bad", text: (error as Error).message });
    } finally {
      setBusy(null);
      if (coverInput.current) coverInput.current.value = "";
    }
  }

  /** Traduz do português para as línguas pedidas. Devolve o post traduzido, ou null se falhou. */
  async function translate(targets: Target[]): Promise<EditorPost | null> {
    setBusy("translate");
    setNotice(null);
    const source = { title: post.title.pt, excerpt: post.excerpt.pt, body: post.body.pt };
    let results: Awaited<ReturnType<typeof translatePost>>[];
    try {
      // o servidor corta cada tradução em 25 s; se nem ele responder, o navegador desiste em 70 s
      let timer: ReturnType<typeof setTimeout> | undefined;
      const giveUp = new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("sem resposta do servidor")), 70_000);
      });
      try {
        results = await Promise.race([
          Promise.all(targets.map((target) => translatePost(source, target))),
          giveUp,
        ]);
      } finally {
        clearTimeout(timer);
      }
    } catch (error) {
      // sem conexão ou servidor fora: avisa e libera os botões
      console.error("[blog] tradução sem resposta", error);
      setBusy(null);
      setNotice({ tone: "bad", text: "O tradutor não respondeu. Tente de novo em instantes." });
      return null;
    }
    setBusy(null);
    const failed = results.find((result) => !result.ok);
    if (failed && !failed.ok) {
      setNotice({ tone: "bad", text: failed.error });
      return null;
    }
    const next = { ...post, title: { ...post.title }, excerpt: { ...post.excerpt }, body: { ...post.body } };
    targets.forEach((target, index) => {
      const result = results[index];
      if (!result.ok) return;
      next.title[target] = result.title;
      next.excerpt[target] = result.excerpt;
      next.body[target] = result.body;
    });
    setPost(next);
    setDirty(true);
    setEditorVersion((version) => version + 1);
    return next;
  }

  async function handleTranslate(targets: Target[]) {
    const next = await translate(targets);
    if (next) {
      setNotice({
        tone: "ok",
        text:
          targets.length > 1
            ? "Inglês e espanhol preenchidos. Confira nas abas e salve."
            : "Traduzido. Revise e salve.",
      });
    }
  }

  function save(status: EditorPost["status"], source: EditorPost = post) {
    setAskPublish(false);
    startSaving(async () => {
      const result = await savePost({ ...source, status });
      if (!result.ok) {
        setNotice({ tone: "bad", text: result.error });
        return;
      }
      setPost((current) => ({ ...current, status, id: result.id }));
      setDirty(false);
      setNotice({ tone: "ok", text: status === "publicado" ? "Salvo e publicado." : "Rascunho salvo." });
      if (!post.id) router.replace(`/admin/blog/${result.id}`);
      else router.refresh();
    });
  }

  const missing = TARGETS.filter((target) => !isReady(post, target));

  function publish() {
    // o que impede publicar vem antes de qualquer pergunta sobre tradução
    const blocker = !isReady(post, "pt")
      ? "Escreva o título e o texto em português antes de publicar."
      : !post.excerpt.pt.trim()
        ? "Escreva o resumo em português antes de publicar."
        : !post.coverUrl
          ? "Escolha a imagem de capa antes de publicar."
          : null;
    if (blocker) {
      setAskPublish(false);
      setNotice({ tone: "bad", text: blocker });
      return;
    }
    // publicar com língua vazia: pergunta antes, o site mostraria só português nela
    if (missing.length > 0 && !askPublish) {
      setAskPublish(true);
      return;
    }
    save("publicado");
  }

  async function translateAndPublish() {
    const next = await translate(missing);
    if (next) save("publicado", next);
  }

  const published = post.status === "publicado";
  const hasTranslation = Boolean(post.title[lang] || post.body[lang]);
  const incomplete = lang !== "pt" && Boolean(post.title[lang].trim()) !== Boolean(post.body[lang].trim());
  const ptReady = isReady(post, "pt");
  const blocked = saving || busy !== null;

  const saveButtons = (
    <>
      <button type="button" className="adm-btn adm-btn-primary" disabled={blocked} onClick={publish}>
        {saving ? "Salvando..." : published ? "Salvar alterações" : "Publicar"}
      </button>
      <button type="button" className="adm-btn" disabled={blocked} onClick={() => save("rascunho")}>
        {published ? "Tirar do ar" : "Salvar rascunho"}
      </button>
    </>
  );

  const status = (
    <>
      {askPublish && (
        <div role="alertdialog" aria-label="Publicar sem tradução?" className="rounded-lg bg-(--warn-bg) p-3 text-[13px] text-ink">
          <p className="font-semibold">
            {missing.length > 1 ? "Inglês e espanhol estão vazios." : `${LANG_NAMES[missing[0]]} está vazio.`}
          </p>
          <p className="mt-0.5 text-ink-2">Quem lê nessa língua não vai encontrar este post.</p>
          <div className="mt-2.5 flex flex-wrap gap-2">
            {canTranslate && ptReady && (
              <button type="button" className="adm-btn adm-btn-primary h-9" disabled={blocked} onClick={translateAndPublish}>
                {busy === "translate" ? "Traduzindo..." : "Traduzir e publicar"}
              </button>
            )}
            <button type="button" className="adm-btn h-9" disabled={blocked} onClick={() => save("publicado")}>
              Publicar sem tradução
            </button>
          </div>
        </div>
      )}
      {notice && (
        <p role="status" className={`text-[13px] font-medium ${notice.tone === "bad" ? "text-(--bad)" : "text-(--ok)"}`}>
          {notice.text}
        </p>
      )}
      {dirty && !notice && !askPublish && <p className="text-[13px] text-ink-3">Há alterações não salvas.</p>}
    </>
  );

  return (
    <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 pb-28 lg:grid-cols-[minmax(0,1fr)_300px] lg:pb-0">
      <div className="adm-panel min-w-0">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
          <div className="adm-seg max-w-full overflow-x-auto" role="tablist" aria-label="Língua do texto">
            {locales.map((locale) => (
              <button
                key={locale}
                type="button"
                role="tab"
                aria-selected={lang === locale}
                onClick={() => setLang(locale)}
              >
                {LANG_NAMES[locale]}
                {isReady(post, locale) ? (
                  <span className="text-(--ok)" title="Pronto">
                    <IconCheck className="h-3.5 w-3.5" />
                    <span className="sr-only">pronto</span>
                  </span>
                ) : (
                  <span className="text-[12px] font-normal text-ink-3">vazio</span>
                )}
              </button>
            ))}
          </div>
          {canTranslate && (
            <button
              type="button"
              className="adm-btn"
              disabled={blocked || !ptReady}
              title={ptReady ? undefined : "Escreva o título e o texto em português primeiro"}
              onClick={() => handleTranslate(lang === "pt" ? TARGETS : [lang])}
            >
              {busy === "translate"
                ? "Traduzindo..."
                : lang === "pt"
                  ? missing.length === 0
                    ? "Traduzir de novo para inglês e espanhol"
                    : "Traduzir para inglês e espanhol"
                  : hasTranslation
                    ? "Traduzir de novo do português"
                    : "Traduzir do português"}
            </button>
          )}
        </div>

        <div className="space-y-5 p-4 sm:p-5">
          <div>
            <label htmlFor="post-title" className="adm-label">
              Título
            </label>
            <input
              id="post-title"
              value={post.title[lang]}
              onChange={(event) => changeTitle(event.target.value)}
              maxLength={200}
              lang={lang}
              className="adm-input h-11 text-ellipsis text-[16px] font-semibold"
            />
          </div>

          <div>
            <label htmlFor="post-excerpt" className="adm-label">
              Resumo
            </label>
            <textarea
              id="post-excerpt"
              value={post.excerpt[lang]}
              onChange={(event) => changeText("excerpt", event.target.value)}
              rows={3}
              maxLength={400}
              lang={lang}
              className="adm-input resize-y"
              aria-describedby="post-excerpt-hint"
            />
            <p id="post-excerpt-hint" className="adm-hint mt-1.5">
              Aparece na lista do blog e no Google. Uma ou duas frases.
            </p>
          </div>

          <div>
            <div className="flex flex-wrap items-end justify-between gap-3">
              <span className="adm-label">Texto</span>
              <div className="adm-seg" role="group" aria-label="Modo">
                <button type="button" aria-pressed={view === "write"} onClick={() => setView("write")}>
                  Escrever
                </button>
                <button type="button" aria-pressed={view === "preview"} onClick={() => setView("preview")}>
                  Ver como fica no site
                </button>
              </div>
            </div>

            {view === "write" ? (
              <RichEditor
                key={`${lang}-${editorVersion}`}
                value={post.body[lang]}
                onChange={(value) => changeText("body", value)}
                lang={lang}
                label={`Texto do post em ${LANG_NAMES[lang].toLowerCase()}`}
                onUpload={uploadImage}
                onError={(message) => setNotice({ tone: "bad", text: message })}
              />
            ) : (
              <div className="mt-2 max-h-[70vh] overflow-y-auto rounded-lg border border-line bg-bg px-5 py-8 sm:px-8">
                {preview.length === 0 ? (
                  <p className="text-center text-[14px] text-ink-3">Nada escrito nesta língua ainda.</p>
                ) : (
                  <div className="mx-auto max-w-[720px]">
                    <BlogBody value={preview} />
                  </div>
                )}
              </div>
            )}
            {incomplete && (
              <p className="mt-2 text-[13px] font-medium text-(--warn)">
                Esta língua só é salva com título e texto. Complete os dois ou deixe os dois vazios.
              </p>
            )}
          </div>
        </div>
      </div>

      <aside className="space-y-5 lg:sticky lg:top-6">
        <div className="adm-panel p-5">
          <div className="flex items-center justify-between">
            <span className="adm-label">Situação</span>
            <span className="adm-tag" data-tone={published ? "ok" : "warn"}>
              {published ? "Publicado" : "Rascunho"}
            </span>
          </div>

          <div className="mt-4 hidden gap-2 lg:grid">{saveButtons}</div>
          <div className="mt-3 hidden space-y-3 empty:hidden lg:block">{status}</div>

          {published && post.id && !dirty && (
            <a
              href={`/${lang}/blog/${post.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex items-center gap-1.5 text-[13px] font-semibold text-brand hover:underline"
            >
              Ver no site
              <IconExternal className="h-3.5 w-3.5" />
            </a>
          )}
        </div>

        <div className="adm-panel space-y-4 p-5">
          <div>
            <span className="adm-label">Imagem de capa</span>
            <div
              className="relative mt-2 overflow-hidden rounded-lg border border-line bg-surface-2"
              style={{
                aspectRatio:
                  post.coverWidth && post.coverHeight ? `${post.coverWidth} / ${post.coverHeight}` : "3 / 2",
              }}
            >
              {post.coverUrl ? (
                <Image src={post.coverUrl} alt="" fill sizes="300px" className="object-cover" />
              ) : (
                <span className="absolute inset-0 flex items-center justify-center text-[13px] text-ink-3">
                  Sem capa
                </span>
              )}
            </div>
            <button
              type="button"
              className="adm-btn mt-2 w-full"
              disabled={busy !== null}
              onClick={() => coverInput.current?.click()}
            >
              {busy === "cover" ? "Enviando..." : post.coverUrl ? "Trocar imagem" : "Escolher imagem"}
            </button>
            <input
              ref={coverInput}
              type="file"
              accept="image/png,image/jpeg,image/webp,image/avif"
              hidden
              onChange={(event) => handleCover(event.target.files?.[0])}
            />
          </div>
          <div>
            <label htmlFor="post-cover-alt" className="adm-label">
              Descrição da capa
            </label>
            <input
              id="post-cover-alt"
              value={post.coverAlt}
              onChange={(event) => change(() => ({ coverAlt: event.target.value }))}
              maxLength={300}
              className="adm-input"
              placeholder="O que aparece na foto"
            />
          </div>
        </div>

        <div className="adm-panel space-y-4 p-5">
          <div>
            <label htmlFor="post-date" className="adm-label">
              Data de publicação
            </label>
            <input
              id="post-date"
              type="datetime-local"
              value={toLocalInput(post.publishedAt)}
              onChange={(event) => {
                const date = new Date(event.target.value);
                if (!Number.isNaN(date.getTime())) change(() => ({ publishedAt: date.toISOString() }));
              }}
              className="adm-input"
              aria-describedby="post-date-hint"
            />
            <p id="post-date-hint" className="adm-hint mt-1.5">
              Data no futuro agenda o post: ele entra no ar sozinho.
            </p>
          </div>
          <div>
            <label htmlFor="post-slug" className="adm-label">
              Endereço
            </label>
            <input
              id="post-slug"
              value={post.slug}
              onChange={(event) => {
                setSlugTouched(true);
                change(() => ({ slug: event.target.value }));
              }}
              onBlur={() => post.slug && change(() => ({ slug: slugify(post.slug) }))}
              maxLength={96}
              className="adm-input adm-mono text-ellipsis"
              aria-describedby="post-slug-hint"
            />
            <p id="post-slug-hint" className="adm-hint mt-1.5 break-words">
              dancold.com.br/pt/blog/{post.slug || "..."}
              {initial.id && published && " · mudar o endereço quebra links já divulgados."}
            </p>
          </div>
        </div>

        {post.id && (
          <form action={deletePost} className="flex flex-wrap items-center gap-2 px-1">
            <input type="hidden" name="id" value={post.id} />
            {confirmDelete ? (
              <>
                <button type="submit" className="adm-btn adm-btn-danger">
                  Excluir de vez
                </button>
                <button type="button" className="adm-btn adm-btn-quiet" onClick={() => setConfirmDelete(false)}>
                  Cancelar
                </button>
                <p className="adm-hint w-full">O post sai do site e não dá para recuperar.</p>
              </>
            ) : (
              <button type="button" className="adm-btn adm-btn-quiet adm-btn-danger" onClick={() => setConfirmDelete(true)}>
                Excluir post
              </button>
            )}
          </form>
        )}
      </aside>

      {/* no celular os botões de salvar ficam presos embaixo da tela */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] shadow-[0_-4px_16px_rgba(13,27,46,0.06)] lg:hidden">
        <div className="mb-2 space-y-2 empty:hidden">{status}</div>
        <div className="grid grid-cols-2 gap-2">{saveButtons}</div>
      </div>
    </div>
  );
}
