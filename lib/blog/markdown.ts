/**
 * Conversão entre o corpo do post (Portable Text, como está no banco) e o texto
 * que o admin edita. O editor mostra um texto simples com marcação leve:
 *
 *   ## Título          ### Subtítulo        > Citação
 *   - item de lista    1. item numerado
 *   **negrito**        *itálico*            [texto](https://link)
 *   ![descrição](https://endereco-da-imagem#1536x1024)
 *
 * Um parágrafo por bloco, separados por linha em branco.
 * Parágrafo cuja linha começa como marcação ("2026. ", "- ", "# ") leva uma barra
 * de escape ("2026\. "), para não virar lista ou título na volta. Linha em branco
 * dentro de um parágrafo vira uma linha só com "\".
 *
 * O editor visual (lib/blog/rich.ts) usa este formato por baixo; o admin não o vê.
 */

export interface Span {
  _type: "span";
  _key: string;
  text: string;
  marks: string[];
}

export interface MarkDef {
  _type: "link";
  _key: string;
  href: string;
}

export interface TextBlock {
  _type: "block";
  _key: string;
  style: string;
  listItem?: "bullet" | "number";
  level?: number;
  markDefs: MarkDef[];
  children: Span[];
}

export interface ImageBlock {
  _type: "image";
  _key: string;
  url: string;
  alt: string;
  width: number | null;
  height: number | null;
}

export type Block = TextBlock | ImageBlock;

function key(): string {
  return Math.random().toString(36).slice(2, 14).padEnd(12, "0");
}

const ESCAPE = /([\\*[\]])/g;

function wrap(text: string, open: string, close: string): string {
  // a marcação não pode encostar em espaço: o espaço fica do lado de fora
  const match = /^(\s*)([\s\S]*?)(\s*)$/.exec(text);
  if (!match || !match[2]) return text;
  return `${match[1]}${open}${match[2]}${close}${match[3]}`;
}

function inlineToMarkdown(block: TextBlock): string {
  const links = new Map(block.markDefs.map((def) => [def._key, def.href]));
  let out = "";
  for (const span of block.children) {
    let text = (span.text ?? "").replace(ESCAPE, "\\$1");
    if (!text) continue;
    const marks = span.marks ?? [];
    if (marks.includes("em")) text = wrap(text, "*", "*");
    if (marks.includes("strong")) text = wrap(text, "**", "**");
    const link = marks.find((mark) => links.has(mark));
    if (link) text = wrap(text, "[", `](${links.get(link)})`);
    out += text;
  }
  return out;
}

const PREFIX: Record<string, string> = { h2: "## ", h3: "### ", blockquote: "> " };

/** Linha em branco dentro de um parágrafo (texto do bloco com "\n\n"): uma barra sozinha. */
const BLANK = "\\";

function escapeLineStart(line: string): string {
  return line
    .replace(/^(\s*)(#|>|[-•](?=\s)|!\[)/, "$1\\$2")
    .replace(/^(\s*\d+)([.)])(?=\s)/, "$1\\$2");
}

export function toMarkdown(blocks: Block[] | null | undefined): string {
  const parts: string[] = [];
  let previousList = false;
  for (const block of blocks ?? []) {
    if (block._type === "image") {
      const size = block.width && block.height ? `#${block.width}x${block.height}` : "";
      parts.push(`\n\n![${block.alt.replace(ESCAPE, "\\$1")}](${block.url}${size})`);
      previousList = false;
      continue;
    }
    const text = inlineToMarkdown(block);
    if (block.listItem) {
      const marker = block.listItem === "number" ? "1. " : "- ";
      // itens da mesma lista ficam em linhas seguidas
      parts.push(`${previousList ? "\n" : "\n\n"}${marker}${text.replace(/\n/g, " ")}`);
      previousList = true;
      continue;
    }
    const prefix = PREFIX[block.style];
    // título e citação são uma linha só; no parágrafo, linha que começa como título,
    // lista ou citação ganha barra de escape, e linha vazia vira BLANK (senão a linha
    // em branco partiria o parágrafo em dois na volta)
    const line = prefix
      ? `${prefix}${text.replace(/\n/g, " ")}`
      : text
          .split("\n")
          .map((part) => (part.trim() ? escapeLineStart(part) : BLANK))
          .join("\n");
    parts.push(`\n\n${line}`);
    previousList = false;
  }
  return parts.join("").trim();
}

/** Lê negrito, itálico e link de uma linha e devolve os trechos do bloco. */
function parseInline(source: string): { children: Span[]; markDefs: MarkDef[] } {
  const children: Span[] = [];
  const markDefs: MarkDef[] = [];

  const push = (text: string, marks: string[]) => {
    if (!text) return;
    const last = children[children.length - 1];
    if (last && last.marks.join() === marks.join()) last.text += text;
    else children.push({ _type: "span", _key: key(), text, marks: [...marks] });
  };

  const walk = (input: string, marks: string[]) => {
    let buffer = "";
    let i = 0;
    const flush = () => {
      push(buffer, marks);
      buffer = "";
    };
    while (i < input.length) {
      const char = input[i];
      if (char === "\\" && i + 1 < input.length && /[\\*[\]#>\-•.)!]/.test(input[i + 1])) {
        buffer += input[i + 1];
        i += 2;
        continue;
      }
      if (char === "[") {
        const link = /^\[((?:\\.|[^\]\\])+)\]\(([^)\s]+)\)/.exec(input.slice(i));
        if (link) {
          flush();
          const def: MarkDef = { _type: "link", _key: key(), href: link[2] };
          markDefs.push(def);
          walk(link[1], [...marks, def._key]);
          i += link[0].length;
          continue;
        }
      }
      if (char === "*") {
        const strong = input.startsWith("**", i);
        const marker = strong ? "**" : "*";
        const mark = strong ? "strong" : "em";
        let end = -1;
        for (let j = i + marker.length; j < input.length; j += 1) {
          if (input[j] === "\\") {
            j += 1;
            continue;
          }
          if (input.startsWith(marker, j) && (strong || input[j + 1] !== "*" || input[j - 1] === "*")) {
            end = j;
            break;
          }
        }
        const inner = end > 0 ? input.slice(i + marker.length, end) : "";
        if (inner.trim() && !marks.includes(mark)) {
          flush();
          walk(inner, [...marks, mark]);
          i = end + marker.length;
          continue;
        }
      }
      buffer += char;
      i += 1;
    }
    flush();
  };

  walk(source, []);
  if (children.length === 0) children.push({ _type: "span", _key: key(), text: "", marks: [] });
  return { children, markDefs };
}

function textBlock(text: string, style: string, listItem?: "bullet" | "number"): TextBlock {
  return {
    _type: "block",
    _key: key(),
    style,
    ...(listItem ? { listItem, level: 1 } : {}),
    ...parseInline(text),
  };
}

const IMAGE = /^!\[((?:\\.|[^\]\\])*)\]\(([^)\s#]+)(?:#(\d+)x(\d+))?\)$/;

export function fromMarkdown(markdown: string): Block[] {
  const blocks: Block[] = [];
  let paragraph: string[] = [];

  const flush = () => {
    if (paragraph.length === 0) return;
    blocks.push(textBlock(paragraph.join("\n"), "normal"));
    paragraph = [];
  };

  for (const raw of markdown.replace(/\r\n?/g, "\n").split("\n")) {
    const line = raw.trimEnd();
    if (line.trim() === BLANK) {
      paragraph.push("");
      continue;
    }
    if (!line.trim()) {
      flush();
      continue;
    }
    const image = IMAGE.exec(line.trim());
    if (image) {
      flush();
      blocks.push({
        _type: "image",
        _key: key(),
        url: image[2],
        alt: image[1].replace(/\\([\\*[\]])/g, "$1"),
        width: image[3] ? Number(image[3]) : null,
        height: image[4] ? Number(image[4]) : null,
      });
      continue;
    }
    const heading = /^(#{1,3})\s+(.*)$/.exec(line);
    if (heading) {
      flush();
      // "#" vira título de seção: o título da página já é o do post
      blocks.push(textBlock(heading[2], heading[1].length === 3 ? "h3" : "h2"));
      continue;
    }
    const quote = /^>\s?(.*)$/.exec(line);
    if (quote) {
      flush();
      blocks.push(textBlock(quote[1], "blockquote"));
      continue;
    }
    const bullet = /^\s*[-•]\s+(.*)$/.exec(line);
    if (bullet) {
      flush();
      blocks.push(textBlock(bullet[1], "normal", "bullet"));
      continue;
    }
    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line);
    if (numbered) {
      flush();
      blocks.push(textBlock(numbered[1], "normal", "number"));
      continue;
    }
    paragraph.push(line);
  }
  flush();
  return blocks;
}

/** Texto puro do corpo, para contar palavras e traduzir. */
export function plainText(blocks: Block[]): string {
  return blocks
    .map((block) => (block._type === "block" ? block.children.map((span) => span.text).join("") : ""))
    .filter(Boolean)
    .join("\n");
}

/** Endereço do post a partir do título: sem acento, minúsculo, com hífen. */
export function slugify(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96)
    .replace(/-+$/, "");
}
