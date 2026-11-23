"use client";

import { useRef, useState } from "react";
import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import { NodeSelection } from "@tiptap/pm/state";
import { editorExtensions } from "@/lib/blog/editor-extensions";
import { fromMarkdown, toMarkdown } from "@/lib/blog/markdown";
import { cleanHref, fromDoc, isOwnImage, toDoc, type DocNode } from "@/lib/blog/rich";

export interface UploadedImage {
  url: string;
  width?: number;
  height?: number;
}

interface Props {
  /** Corpo no formato de texto do banco (lib/blog/markdown.ts). */
  value: string;
  onChange: (value: string) => void;
  lang: string;
  label: string;
  onUpload: (file: File) => Promise<UploadedImage>;
  onError: (message: string) => void;
}

function renamed(element: Element, tag: string): Element {
  const next = element.ownerDocument.createElement(tag);
  next.innerHTML = element.innerHTML;
  return next;
}

/**
 * Ajusta o que é colado (Word, outro site) ao que o blog mostra: imagem de
 * outro endereço sai (quebraria quando o site dela mudar), <h1> vira título
 * de seção, <h4>-<h6> viram subtítulo e cada linha de tabela vira um parágrafo.
 */
function cleanPasted(html: string): string {
  const doc = new DOMParser().parseFromString(html, "text/html");
  for (const image of doc.querySelectorAll("img")) {
    if (!isOwnImage(image.getAttribute("src") ?? "")) image.remove();
  }
  for (const heading of doc.querySelectorAll("h1")) heading.replaceWith(renamed(heading, "h2"));
  for (const heading of doc.querySelectorAll("h4, h5, h6")) heading.replaceWith(renamed(heading, "h3"));
  for (const table of doc.querySelectorAll("table")) {
    const lines = [...table.querySelectorAll("tr")]
      .map((row) =>
        [...row.cells]
          .map((cell) => (cell.textContent ?? "").replace(/\s+/g, " ").trim())
          .filter(Boolean)
          .join(" · "),
      )
      .filter(Boolean);
    const paragraphs = lines.map((line) => {
      const paragraph = doc.createElement("p");
      paragraph.textContent = line;
      return paragraph;
    });
    table.replaceWith(...paragraphs);
  }
  return doc.body.innerHTML;
}

function readState(editor: Editor) {
  const selection = editor.state.selection;
  const image = selection instanceof NodeSelection && selection.node.type.name === "image" ? selection.node : null;
  return {
    h2: editor.isActive("heading", { level: 2 }),
    h3: editor.isActive("heading", { level: 3 }),
    bold: editor.isActive("bold"),
    italic: editor.isActive("italic"),
    bullet: editor.isActive("bulletList"),
    ordered: editor.isActive("orderedList"),
    quote: editor.isActive("blockquote"),
    link: editor.isActive("link"),
    linkHref: String(editor.getAttributes("link").href ?? ""),
    image: image ? { alt: String(image.attrs.alt ?? "") } : null,
    empty: editor.isEmpty,
  };
}

const TOOL = "adm-btn adm-btn-quiet h-8 px-2.5 text-[13px] aria-pressed:bg-surface aria-pressed:text-ink aria-pressed:shadow-[0_1px_2px_rgba(13,27,46,0.1)]";

/**
 * Editor do texto do post: o admin vê o texto já formatado (título grande,
 * negrito, imagem), sem marcação. O que sai daqui é convertido para o formato
 * do banco a cada alteração.
 */
export function RichEditor({ value, onChange, lang, label, onUpload, onError }: Props) {
  const [panel, setPanel] = useState<"link" | null>(null);
  const [href, setHref] = useState("");
  const [linkError, setLinkError] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imageInput = useRef<HTMLInputElement>(null);
  const linkInput = useRef<HTMLInputElement>(null);

  const editor = useEditor({
    extensions: editorExtensions,
    content: toDoc(fromMarkdown(value)),
    immediatelyRender: false,
    editorProps: {
      transformPastedHTML: cleanPasted,
      attributes: {
        class: "adm-prose",
        lang,
        spellcheck: "true",
        "aria-label": label,
        "aria-multiline": "true",
        role: "textbox",
      },
    },
    // a barra de botões acompanha o cursor (negrito ligado, link, imagem escolhida)
    shouldRerenderOnTransaction: true,
    onUpdate: ({ editor: current }) => onChange(toMarkdown(fromDoc(current.getJSON() as DocNode))),
  });

  const state = editor ? readState(editor) : null;

  if (!editor || !state) {
    return <div className="mt-2 h-[480px] animate-pulse rounded-lg border border-line-2 bg-surface-2/50" />;
  }

  const chain = () => editor.chain().focus();

  function openLink() {
    setHref(state?.linkHref ?? "");
    setLinkError(false);
    setPanel("link");
    requestAnimationFrame(() => linkInput.current?.focus());
  }

  function applyLink(event: React.FormEvent) {
    event.preventDefault();
    const clean = cleanHref(href);
    if (!clean) {
      setLinkError(true);
      return;
    }
    const { empty } = editor!.state.selection;
    if (empty && !state?.link) {
      // sem texto marcado: o próprio endereço vira o texto do link
      chain()
        .insertContent({ type: "text", text: href.trim(), marks: [{ type: "link", attrs: { href: clean } }] })
        .run();
    } else {
      chain().extendMarkRange("link").setLink({ href: clean }).run();
    }
    setPanel(null);
  }

  function removeLink() {
    chain().extendMarkRange("link").unsetLink().run();
    setPanel(null);
  }

  async function addImage(file: File | undefined) {
    if (!file) return;
    setUploading(true);
    try {
      const image = await onUpload(file);
      // entra abaixo do bloco onde está o cursor: texto marcado não é apagado
      const { selection } = editor!.state;
      const at = selection.$to.depth > 0 ? selection.$to.after(1) : selection.to;
      chain()
        .insertContentAt(at, { type: "image", attrs: { src: image.url, alt: "", width: image.width ?? null, height: image.height ?? null } })
        .run();
      // deixa a imagem nova escolhida: o campo de descrição aparece na hora
      let position = -1;
      editor!.state.doc.descendants((node, pos) => {
        if (node.type.name === "image" && node.attrs.src === image.url) position = pos;
      });
      if (position >= 0) editor!.chain().setNodeSelection(position).run();
    } catch (error) {
      onError((error as Error).message);
    } finally {
      setUploading(false);
      if (imageInput.current) imageInput.current.value = "";
    }
  }

  const tools: { label: string; title: string; active: boolean; run: () => void }[] = [
    { label: "Título", title: "Título de seção", active: state.h2, run: () => chain().toggleHeading({ level: 2 }).run() },
    { label: "Subtítulo", title: "Subtítulo", active: state.h3, run: () => chain().toggleHeading({ level: 3 }).run() },
    { label: "Negrito", title: "Negrito (Ctrl+B)", active: state.bold, run: () => chain().toggleBold().run() },
    { label: "Itálico", title: "Itálico (Ctrl+I)", active: state.italic, run: () => chain().toggleItalic().run() },
    { label: "Lista", title: "Lista com marcadores", active: state.bullet, run: () => chain().toggleBulletList().run() },
    { label: "Numerada", title: "Lista numerada", active: state.ordered, run: () => chain().toggleOrderedList().run() },
    { label: "Citação", title: "Citação em destaque", active: state.quote, run: () => chain().toggleBlockquote().run() },
  ];

  return (
    <div className="mt-2 rounded-lg border border-line-2 focus-within:border-navy-400 focus-within:shadow-[0_0_0_3px_rgba(79,125,196,0.2)]">
      <div className="sticky top-0 z-10 rounded-t-lg border-b border-line bg-surface-2">
        <div className="flex flex-wrap gap-1 p-1.5" role="toolbar" aria-label="Formatação do texto">
          {tools.map((tool) => (
            <button
              key={tool.label}
              type="button"
              title={tool.title}
              aria-pressed={tool.active}
              className={TOOL}
              onMouseDown={(event) => event.preventDefault()}
              onClick={tool.run}
            >
              {tool.label}
            </button>
          ))}
          <button
            type="button"
            title="Link"
            aria-pressed={state.link || panel === "link"}
            className={TOOL}
            onMouseDown={(event) => event.preventDefault()}
            onClick={openLink}
          >
            Link
          </button>
          <button
            type="button"
            className={TOOL}
            disabled={uploading}
            onClick={() => imageInput.current?.click()}
          >
            {uploading ? "Enviando..." : "Imagem"}
          </button>
          <input
            ref={imageInput}
            type="file"
            accept="image/png,image/jpeg,image/webp,image/avif,image/gif"
            hidden
            onChange={(event) => addImage(event.target.files?.[0])}
          />
        </div>

        {panel === "link" && (
          <form onSubmit={applyLink} className="flex flex-wrap items-center gap-2 border-t border-line bg-surface px-3 py-2.5">
            <label htmlFor="link-href" className="text-[13px] font-semibold text-ink">
              Endereço do link
            </label>
            <input
              id="link-href"
              ref={linkInput}
              value={href}
              onChange={(event) => {
                setHref(event.target.value);
                setLinkError(false);
              }}
              onKeyDown={(event) => event.key === "Escape" && setPanel(null)}
              placeholder="dancold.com.br/pt/servicos"
              inputMode="url"
              aria-invalid={linkError}
              aria-describedby={linkError ? "link-error" : undefined}
              className="adm-input mt-0 h-9 min-w-0 flex-1 basis-56"
            />
            <div className="flex gap-1">
              <button type="submit" className="adm-btn h-9">
                {state.link ? "Trocar" : "Colocar link"}
              </button>
              {state.link && (
                <button type="button" className="adm-btn adm-btn-quiet h-9" onClick={removeLink}>
                  Tirar link
                </button>
              )}
              <button type="button" className="adm-btn adm-btn-quiet h-9" onClick={() => setPanel(null)}>
                Cancelar
              </button>
            </div>
            {linkError && (
              <p id="link-error" className="w-full text-[13px] font-medium text-(--bad)">
                Endereço inválido. Exemplo: dancold.com.br/pt/servicos ou contato@dancold.com.br
              </p>
            )}
          </form>
        )}

        {state.image && (
          <div className="flex flex-wrap items-center gap-2 border-t border-line bg-surface px-3 py-2.5">
            <label htmlFor="image-alt" className="text-[13px] font-semibold text-ink">
              Descrição da imagem
            </label>
            <input
              id="image-alt"
              value={state.image.alt}
              onChange={(event) => editor.chain().updateAttributes("image", { alt: event.target.value }).run()}
              placeholder="O que aparece na foto (ajuda no Google e em leitores de tela)"
              maxLength={300}
              className="adm-input mt-0 h-9 min-w-0 flex-1 basis-56"
            />
            <button type="button" className="adm-btn adm-btn-quiet adm-btn-danger h-9" onClick={() => chain().deleteSelection().run()}>
              Tirar imagem
            </button>
          </div>
        )}
      </div>

      <div className="relative">
        {state.empty && (
          <p aria-hidden className="pointer-events-none absolute left-4 top-3 text-[15px] text-ink-3">
            Escreva o post aqui. Use os botões acima para títulos, listas, links e imagens.
          </p>
        )}
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}
