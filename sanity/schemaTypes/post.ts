import { defineField, defineType } from "sanity";

const LOCALES = [
  { id: "pt", title: "Português" },
  { id: "en", title: "English" },
  { id: "es", title: "Español" },
] as const;

/** String/text/rich-text fields repeated per locale, pt first and required. */
function localizedField(kind: "string" | "text" | "blockContent") {
  return LOCALES.map(({ id, title }) => {
    if (kind === "blockContent") {
      return defineField({
        name: id,
        title,
        type: "array",
        of: [
          { type: "block" },
          { type: "image", options: { hotspot: true }, fields: [{ name: "alt", type: "string", title: "Texto alternativo" }] },
        ],
        validation: id === "pt" ? (rule) => rule.required() : undefined,
      });
    }
    return defineField({
      name: id,
      title,
      type: kind,
      ...(kind === "text" ? { rows: 3 } : {}),
      validation: id === "pt" ? (rule) => rule.required() : undefined,
    });
  });
}

export const postType = defineType({
  name: "post",
  title: "Post do Blog",
  type: "document",
  groups: [
    { name: "content", title: "Conteúdo (PT)", default: true },
    { name: "translations", title: "Traduções (EN/ES)" },
    { name: "meta", title: "Configurações" },
  ],
  fields: [
    defineField({
      name: "title",
      title: "Título",
      type: "object",
      group: ["content", "translations"],
      fields: localizedField("string"),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "slug",
      title: "Slug (endereço do post)",
      type: "slug",
      group: "meta",
      options: { source: "title.pt", maxLength: 96 },
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "excerpt",
      title: "Resumo (aparece na listagem e no Google)",
      type: "object",
      group: ["content", "translations"],
      fields: localizedField("text"),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "coverImage",
      title: "Imagem de capa",
      type: "image",
      group: "content",
      options: { hotspot: true },
      fields: [{ name: "alt", type: "string", title: "Texto alternativo" }],
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "body",
      title: "Conteúdo",
      type: "object",
      group: ["content", "translations"],
      fields: localizedField("blockContent"),
      validation: (rule) => rule.required(),
    }),
    defineField({
      name: "publishedAt",
      title: "Data de publicação",
      type: "datetime",
      group: "meta",
      initialValue: () => new Date().toISOString(),
      validation: (rule) => rule.required(),
    }),
  ],
  orderings: [
    {
      title: "Data de publicação (recente primeiro)",
      name: "publishedAtDesc",
      by: [{ field: "publishedAt", direction: "desc" }],
    },
  ],
  preview: {
    select: { title: "title.pt", media: "coverImage", subtitle: "publishedAt" },
    prepare({ title, media, subtitle }) {
      return {
        title: title ?? "Sem título",
        media,
        subtitle: subtitle ? new Date(subtitle).toLocaleDateString("pt-BR") : "",
      };
    },
  },
});

export const schemaTypes = [postType];
