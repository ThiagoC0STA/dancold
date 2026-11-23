// Confere que nenhum post muda ao passar pelo editor, nos dois caminhos:
//   1. abrir e salvar sem mexer: corpo do banco -> texto do editor -> corpo de novo
//   2. mexer no editor visual (Tiptap): o mesmo, passando pelo esquema do editor
//
// Estrutura tem que ser idêntica: mesmo número de blocos, mesmo tipo, estilo e
// lista em cada um. Texto tem que ser idêntico; só aceita diferença de espaço
// dentro do mesmo bloco (espaço que muda de lado do negrito, por exemplo).
//
//   node --env-file=.env.local scripts/check-markdown.mts

import { getSchema } from "@tiptap/core";
import { editorExtensions } from "../lib/blog/editor-extensions.ts";
import { fromMarkdown, toMarkdown, type Block } from "../lib/blog/markdown.ts";
import { fromDoc, toDoc } from "../lib/blog/rich.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const response = await fetch(`${url}/rest/v1/posts?select=slug,body&status=eq.publicado`, {
  headers: { apikey: key!, Authorization: `Bearer ${key}` },
});
const posts = (await response.json()) as { slug: string; body: Record<string, Block[]> }[];

const schema = getSchema(editorExtensions);

const saveUntouched = (blocks: Block[]) => fromMarkdown(toMarkdown(blocks));
function throughEditor(blocks: Block[]): Block[] {
  const doc = schema.nodeFromJSON(toDoc(fromMarkdown(toMarkdown(blocks))));
  doc.check();
  return fromMarkdown(toMarkdown(fromDoc(doc.toJSON())));
}

/** Estrutura do bloco: tipo, estilo e lista. */
const kind = (block: Block) =>
  block._type === "image" ? "image" : `${block.style}/${block.listItem ?? ""}`;

/** Conteúdo do bloco: trechos com suas marcas (link pelo endereço), vizinhos iguais juntos. */
function content(block: Block) {
  if (block._type === "image") return JSON.stringify([block.url, block.alt, block.width, block.height]);
  const links = new Map(block.markDefs.map((def) => [def._key, def.href]));
  const spans: [string, string][] = [];
  for (const span of block.children) {
    if (!span.text) continue;
    const marks = (span.marks ?? []).map((mark) => links.get(mark) ?? mark).sort().join("|");
    const last = spans[spans.length - 1];
    if (last && last[1] === marks) last[0] += span.text;
    else spans.push([span.text, marks]);
  }
  return JSON.stringify(spans);
}
const plain = (block: Block) =>
  block._type === "image" ? block.url : block.children.map((span) => span.text).join("").replace(/\s/g, "");

type Verdict = "igual" | "espaco" | "perda";

function compare(before: Block[], after: Block[], label: string): Verdict {
  const a = before.map(kind);
  const b = after.map(kind);
  if (a.length !== b.length || a.some((item, i) => item !== b[i])) {
    const index = a.findIndex((item, i) => item !== b[i]);
    console.log(`${label}: ESTRUTURA mudou, ${a.length} -> ${b.length} blocos, primeiro diferente no ${index}`);
    console.log("  antes :", JSON.stringify(before[index])?.slice(0, 300));
    console.log("  depois:", JSON.stringify(after[index])?.slice(0, 300));
    return "perda";
  }
  let verdict: Verdict = "igual";
  for (let i = 0; i < before.length; i += 1) {
    if (content(before[i]) === content(after[i])) continue;
    if (plain(before[i]) === plain(after[i])) {
      verdict = "espaco";
      continue;
    }
    console.log(`${label}: TEXTO mudou no bloco ${i}`);
    console.log("  antes :", content(before[i]).slice(0, 300));
    console.log("  depois:", content(after[i]).slice(0, 300));
    return "perda";
  }
  return verdict;
}

const count = { igual: 0, espaco: 0, perda: 0 };
let bodies = 0;
const blankLine = new Set<string>();
for (const post of posts) {
  for (const [lang, blocks] of Object.entries(post.body)) {
    bodies += 1;
    if (blocks.some((block) => block._type === "block" && block.children.some((span) => /\n\s*\n/.test(span.text)))) {
      blankLine.add(post.slug);
    }
    const save = compare(blocks, saveUntouched(blocks), `${post.slug} [${lang}] salvar sem mexer`);
    const visual = compare(blocks, throughEditor(blocks), `${post.slug} [${lang}] editor visual`);
    const worst: Verdict = save === "perda" || visual === "perda" ? "perda" : save === "espaco" || visual === "espaco" ? "espaco" : "igual";
    count[worst] += 1;
  }
}
console.log(
  `${posts.length} posts, ${bodies} corpos: ${count.igual} idênticos, ${count.espaco} só com espaço diferente, ${count.perda} com perda. ` +
    `${blankLine.size} posts com linha em branco dentro de parágrafo.`,
);
process.exit(count.perda ? 1 : 0);
