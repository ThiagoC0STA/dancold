/**
 * Conversão entre o corpo do post (Portable Text, como está no banco) e o
 * documento do editor visual (formato JSON do Tiptap/ProseMirror).
 *
 * O editor só conhece o que o site mostra: parágrafo, título, subtítulo,
 * citação, listas, imagem, negrito, itálico e link. Qualquer outra coisa que
 * chegue colada vira texto simples.
 */
import type { Block, MarkDef, Span, TextBlock } from "./markdown";

export interface DocNode {
  type: string;
  attrs?: Record<string, unknown>;
  content?: DocNode[];
  marks?: { type: string; attrs?: Record<string, unknown> }[];
  text?: string;
}

function key(): string {
  return Math.random().toString(36).slice(2, 14).padEnd(12, "0");
}

/* ── Banco -> editor ───────────────────────────────────────────────── */

function inline(block: TextBlock, keepBreaks: boolean): DocNode[] {
  const links = new Map(block.markDefs.map((def) => [def._key, def.href]));
  const out: DocNode[] = [];
  for (const span of block.children) {
    if (!span.text) continue;
    const marks: DocNode["marks"] = [];
    for (const mark of span.marks ?? []) {
      if (mark === "strong") marks.push({ type: "bold" });
      else if (mark === "em") marks.push({ type: "italic" });
      else if (links.has(mark)) marks.push({ type: "link", attrs: { href: links.get(mark) } });
    }
    const lines = keepBreaks ? span.text.split("\n") : [span.text.replace(/\n/g, " ")];
    lines.forEach((line, index) => {
      if (index > 0) out.push({ type: "hardBreak" });
      if (line) out.push({ type: "text", text: line, ...(marks.length ? { marks } : {}) });
    });
  }
  return out;
}

const paragraph = (content: DocNode[]): DocNode => ({ type: "paragraph", ...(content.length ? { content } : {}) });

export function toDoc(blocks: Block[] | null | undefined): DocNode {
  const content: DocNode[] = [];
  let list: DocNode | null = null;

  for (const block of blocks ?? []) {
    if (block._type === "image") {
      list = null;
      content.push({
        type: "image",
        attrs: { src: block.url, alt: block.alt, width: block.width, height: block.height },
      });
      continue;
    }
    if (block.listItem) {
      const type = block.listItem === "number" ? "orderedList" : "bulletList";
      if (!list || list.type !== type) {
        list = { type, content: [] };
        content.push(list);
      }
      list.content!.push({ type: "listItem", content: [paragraph(inline(block, false))] });
      continue;
    }
    list = null;
    if (block.style === "h2" || block.style === "h3") {
      const nodes = inline(block, false);
      content.push({ type: "heading", attrs: { level: block.style === "h3" ? 3 : 2 }, ...(nodes.length ? { content: nodes } : {}) });
    } else if (block.style === "blockquote") {
      content.push({ type: "blockquote", content: [paragraph(inline(block, false))] });
    } else {
      content.push(paragraph(inline(block, true)));
    }
  }
  if (content.length === 0) content.push({ type: "paragraph" });
  return { type: "doc", content };
}

/* ── Editor -> banco ───────────────────────────────────────────────── */

/** Imagem guardada no bucket `blog` do Supabase do projeto. */
export function isOwnImage(url: string): boolean {
  return /^https:\/\/[a-z0-9-]+\.supabase\.co\/storage\/v1\/object\/public\/blog\//.test(url);
}

/** Endereço de link aceito: web, e-mail, telefone ou caminho do próprio site. */
export function cleanHref(raw: string): string | null {
  let href = raw.trim();
  if (!href) return null;
  if (!/^(https?:|mailto:|tel:|\/)/i.test(href)) {
    if (/^[\w.+-]+@[\w-]+\.[\w.]+$/.test(href)) href = `mailto:${href}`;
    else if (/^[\w-]+(\.[\w-]+)+/.test(href)) href = `https://${href}`;
    else return null;
  }
  // o formato de texto do corpo não aceita espaço nem parêntese no endereço
  return href.replace(/\s/g, "%20").replace(/\(/g, "%28").replace(/\)/g, "%29");
}

function spans(nodes: DocNode[] | undefined, keepBreaks: boolean) {
  const children: Span[] = [];
  const markDefs: MarkDef[] = [];

  const push = (text: string, marks: string[]) => {
    const last = children[children.length - 1];
    if (last && last.marks.join() === marks.join()) last.text += text;
    else children.push({ _type: "span", _key: key(), text, marks });
  };

  const walk = (list: DocNode[] | undefined) => {
    for (const node of list ?? []) {
      if (node.type === "hardBreak") {
        const last = children[children.length - 1];
        // duas quebras seguidas são uma linha em branco dentro do parágrafo: ficam as duas
        push(keepBreaks ? "\n" : " ", last?.marks ?? []);
        continue;
      }
      if (node.type !== "text") {
        walk(node.content);
        continue;
      }
      const marks: string[] = [];
      for (const mark of node.marks ?? []) {
        if (mark.type === "bold") marks.push("strong");
        else if (mark.type === "italic") marks.push("em");
        else if (mark.type === "link") {
          const href = cleanHref(String(mark.attrs?.href ?? ""));
          if (!href) continue;
          const previous = markDefs[markDefs.length - 1];
          const lastSpan = children[children.length - 1];
          // trechos vizinhos do mesmo link continuam sendo um link só
          const def =
            previous && previous.href === href && lastSpan?.marks.includes(previous._key)
              ? previous
              : { _type: "link" as const, _key: key(), href };
          if (def !== previous) markDefs.push(def);
          marks.push(def._key);
        }
      }
      if (node.text) push(node.text, marks);
    }
  };
  walk(nodes);

  // quebra de linha no começo ou no fim do parágrafo não significa nada
  while (children.length && /^\s*$/.test(children[children.length - 1].text) && children[children.length - 1].text.includes("\n")) {
    children.pop();
  }
  if (children.length) {
    children[0].text = children[0].text.replace(/^\n+/, "");
    const last = children[children.length - 1];
    last.text = last.text.replace(/\n+$/, "");
  }
  const used = new Set(children.flatMap((span) => span.marks));
  return { children: children.filter((span) => span.text), markDefs: markDefs.filter((def) => used.has(def._key)) };
}

function textBlock(nodes: DocNode[] | undefined, style: string, listItem?: "bullet" | "number"): TextBlock | null {
  const { children, markDefs } = spans(nodes, style === "normal" && !listItem);
  if (!children.some((span) => span.text.trim())) return null;
  return { _type: "block", _key: key(), style, ...(listItem ? { listItem, level: 1 } : {}), markDefs, children };
}

export function fromDoc(doc: DocNode): Block[] {
  const blocks: Block[] = [];
  const add = (block: TextBlock | null) => {
    if (block) blocks.push(block);
  };

  const visit = (node: DocNode, context: { quote?: boolean; list?: "bullet" | "number" }) => {
    switch (node.type) {
      case "image": {
        const url = String(node.attrs?.src ?? "");
        // só imagem enviada pelo painel: endereço de outro site quebra quando ele some
        if (!isOwnImage(url)) return;
        const width = Number(node.attrs?.width) || null;
        const height = Number(node.attrs?.height) || null;
        blocks.push({
          _type: "image",
          _key: key(),
          url: url.replace(/#.*$/, "").replace(/\s/g, "%20").replace(/\)/g, "%29"),
          alt: String(node.attrs?.alt ?? "").replace(/\s+/g, " ").trim(),
          width: width && height ? width : null,
          height: width && height ? height : null,
        });
        return;
      }
      case "heading": {
        const level = Number(node.attrs?.level ?? 2);
        if (context.list) return add(textBlock(node.content, "normal", context.list));
        if (context.quote) return add(textBlock(node.content, "blockquote"));
        return add(textBlock(node.content, level >= 3 ? "h3" : "h2"));
      }
      case "paragraph":
        if (context.list) return add(textBlock(node.content, "normal", context.list));
        if (context.quote) return add(textBlock(node.content, "blockquote"));
        return add(textBlock(node.content, "normal"));
      case "blockquote":
        for (const child of node.content ?? []) visit(child, { ...context, quote: true });
        return;
      case "bulletList":
      case "orderedList": {
        const list = node.type === "orderedList" ? "number" : "bullet";
        for (const child of node.content ?? []) visit(child, { list });
        return;
      }
      case "listItem":
        for (const child of node.content ?? []) visit(child, context);
        return;
      default:
        // qualquer outro bloco vira parágrafo com o texto que tiver
        if (node.content?.some((child) => child.type === "text" || child.type === "hardBreak")) {
          return add(textBlock(node.content, context.quote ? "blockquote" : "normal", context.list));
        }
        for (const child of node.content ?? []) visit(child, context);
    }
  };

  for (const node of doc.content ?? []) visit(node, {});
  return blocks;
}
