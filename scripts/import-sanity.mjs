// Copia o blog inteiro do Sanity para o Supabase: textos nas 3 línguas, capas e
// imagens do corpo. Pode rodar de novo: atualiza o que já foi importado.
//
//   node --env-file=.env.local scripts/import-sanity.mjs
//
// Precisa de SUPABASE_SECRET_KEY no ambiente (chave secreta, só para esta carga).

const SANITY_PROJECT = process.env.NEXT_PUBLIC_SANITY_PROJECT_ID;
const SANITY_DATASET = process.env.NEXT_PUBLIC_SANITY_DATASET ?? "production";
const SANITY_TOKEN = process.env.SANITY_API_READ_TOKEN;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SECRET = process.env.SUPABASE_SECRET_KEY;

for (const [name, value] of Object.entries({
  NEXT_PUBLIC_SANITY_PROJECT_ID: SANITY_PROJECT,
  NEXT_PUBLIC_SUPABASE_URL: SUPABASE_URL,
  SUPABASE_SECRET_KEY: SECRET,
})) {
  if (!value) {
    console.error(`Falta a variável ${name}.`);
    process.exit(1);
  }
}

const LOCALES = ["pt", "en", "es"];
const auth = { apikey: SECRET, Authorization: `Bearer ${SECRET}` };

const bodyProjection = LOCALES.map(
  (l) => `${l}[]{..., _type == "image" => {"url": asset->url, "dims": asset->metadata.dimensions}}`,
).join(", ");
const query = `*[_type == "post"]{
  _id, slug, title, excerpt, publishedAt,
  "coverUrl": coverImage.asset->url,
  "coverDims": coverImage.asset->metadata.dimensions,
  "coverAlt": coverImage.alt,
  body{ ${bodyProjection} }
}`;

async function fetchSanity() {
  const url = new URL(
    `https://${SANITY_PROJECT}.api.sanity.io/v2026-07-01/data/query/${SANITY_DATASET}`,
  );
  url.searchParams.set("query", query);
  url.searchParams.set("perspective", "raw");
  const response = await fetch(url, {
    headers: SANITY_TOKEN ? { Authorization: `Bearer ${SANITY_TOKEN}` } : {},
  });
  if (!response.ok) throw new Error(`Sanity ${response.status}: ${await response.text()}`);
  return (await response.json()).result;
}

const uploaded = new Map();

/** Baixa do CDN do Sanity e grava no bucket "blog". Devolve o endereço público. */
async function moveImage(sourceUrl) {
  if (uploaded.has(sourceUrl)) return uploaded.get(sourceUrl);
  const name = new URL(sourceUrl).pathname.split("/").pop();
  const path = `sanity/${name}`;
  const download = await fetch(sourceUrl);
  if (!download.ok) throw new Error(`Imagem ${download.status}: ${sourceUrl}`);
  const bytes = Buffer.from(await download.arrayBuffer());
  const upload = await fetch(`${SUPABASE_URL}/storage/v1/object/blog/${path}`, {
    method: "POST",
    headers: {
      ...auth,
      "Content-Type": download.headers.get("content-type") ?? "application/octet-stream",
      "Cache-Control": "max-age=31536000",
      "x-upsert": "true",
    },
    body: bytes,
  });
  if (!upload.ok) throw new Error(`Upload ${upload.status}: ${await upload.text()}`);
  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/blog/${path}`;
  uploaded.set(sourceUrl, publicUrl);
  return publicUrl;
}

async function convertBody(blocks) {
  const out = [];
  for (const block of blocks ?? []) {
    if (block._type === "image") {
      if (!block.url) continue;
      out.push({
        _type: "image",
        _key: block._key,
        url: await moveImage(block.url),
        alt: block.alt ?? "",
        width: block.dims?.width ?? null,
        height: block.dims?.height ?? null,
      });
    } else if (block._type === "block") {
      // o título da página já é o h1: dentro do texto o maior nível é h2
      out.push(block.style === "h1" ? { ...block, style: "h2" } : block);
    }
  }
  return out;
}

function pickLocales(value) {
  const out = {};
  for (const locale of LOCALES) {
    if (typeof value?.[locale] === "string" && value[locale].trim()) out[locale] = value[locale];
  }
  return out;
}

const docs = await fetchSanity();
const publishedIds = new Set(docs.filter((d) => !d._id.startsWith("drafts.")).map((d) => d._id));
const rows = [];
let skipped = 0;

for (const doc of docs) {
  const isDraft = doc._id.startsWith("drafts.");
  // rascunho de um post já publicado: vale a versão publicada
  if (isDraft && publishedIds.has(doc._id.slice(7))) {
    skipped += 1;
    continue;
  }
  const slug = doc.slug?.current;
  if (!slug) {
    console.warn(`Sem slug, pulado: ${doc._id}`);
    skipped += 1;
    continue;
  }
  const body = {};
  for (const locale of LOCALES) {
    const converted = await convertBody(doc.body?.[locale]);
    if (converted.length > 0) body[locale] = converted;
  }
  rows.push({
    sanity_id: isDraft ? doc._id.slice(7) : doc._id,
    slug,
    status: isDraft ? "rascunho" : "publicado",
    published_at: doc.publishedAt ?? new Date().toISOString(),
    title: pickLocales(doc.title),
    excerpt: pickLocales(doc.excerpt),
    body,
    cover_url: doc.coverUrl ? await moveImage(doc.coverUrl) : null,
    cover_alt: doc.coverAlt ?? null,
    cover_width: doc.coverDims?.width ?? null,
    cover_height: doc.coverDims?.height ?? null,
  });
  process.stdout.write(".");
}

const save = await fetch(`${SUPABASE_URL}/rest/v1/posts?on_conflict=sanity_id`, {
  method: "POST",
  headers: {
    ...auth,
    "Content-Type": "application/json",
    Prefer: "resolution=merge-duplicates,return=minimal",
  },
  body: JSON.stringify(rows),
});
if (!save.ok) throw new Error(`Supabase ${save.status}: ${await save.text()}`);

console.log(
  `\n${rows.length} posts gravados (${rows.filter((r) => r.status === "rascunho").length} rascunhos), ` +
    `${uploaded.size} imagens copiadas, ${skipped} pulados.`,
);
