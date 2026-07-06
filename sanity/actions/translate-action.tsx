import { useState } from "react";
import { useToast } from "@sanity/ui";
import { useDocumentOperation, type DocumentActionComponent } from "sanity";

function TranslateIcon() {
  return (
    <svg width="1em" height="1em" viewBox="0 0 25 25" fill="none" aria-hidden>
      <path
        d="M4 6h9M8.5 6c0 4-2 8-5 10M6 9c0 2.5 3 5 6 6M14.5 20l3.5-8 3.5 8M15.5 17.5h5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

type Span = { _type: "span"; text?: string; [key: string]: unknown };
type Block = { _type: string; children?: Span[]; [key: string]: unknown };

/** Collects every translatable string of the PT content, in a stable order. */
function collectTexts(doc: Record<string, any>): string[] {
  const texts: string[] = [doc.title?.pt ?? "", doc.excerpt?.pt ?? ""];
  for (const block of (doc.body?.pt ?? []) as Block[]) {
    if (block._type !== "block") continue;
    for (const child of block.children ?? []) {
      if (child._type === "span") texts.push(child.text ?? "");
    }
  }
  return texts;
}

/** Rebuilds the PT body with translated span texts, keeping structure/marks. */
function rebuildBody(body: Block[], translated: string[], offset: number): { body: Block[]; next: number } {
  let index = offset;
  const clone = structuredClone(body);
  for (const block of clone) {
    if (block._type !== "block") continue;
    for (const child of block.children ?? []) {
      if (child._type === "span") child.text = translated[index++] ?? child.text;
    }
  }
  return { body: clone, next: index };
}

async function translate(texts: string[], target: "en" | "es"): Promise<string[]> {
  const response = await fetch("/api/translate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ texts, target }),
  });
  if (!response.ok) {
    const detail = await response.text();
    throw new Error(`Falha na tradução (${response.status}): ${detail}`);
  }
  const data = (await response.json()) as { translations: string[] };
  return data.translations;
}

export const TranslateAction: DocumentActionComponent = (props) => {
  const { patch } = useDocumentOperation(props.id, props.type);
  const toast = useToast();
  const [busy, setBusy] = useState(false);

  const doc = (props.draft ?? props.published) as Record<string, any> | null;
  const hasPtContent = Boolean(doc?.title?.pt && doc?.body?.pt?.length);

  return {
    label: busy ? "Traduzindo…" : "Traduzir (EN/ES)",
    icon: TranslateIcon,
    disabled: busy || !hasPtContent,
    title: hasPtContent
      ? "Traduz automaticamente o conteúdo em português para inglês e espanhol"
      : "Preencha o título e o conteúdo em português primeiro",
    onHandle: async () => {
      if (!doc) return;
      setBusy(true);
      try {
        const texts = collectTexts(doc);
        const [en, es] = await Promise.all([translate(texts, "en"), translate(texts, "es")]);

        const set: Record<string, unknown> = {
          "title.en": en[0],
          "title.es": es[0],
          "excerpt.en": en[1],
          "excerpt.es": es[1],
        };
        if (doc.body?.pt?.length) {
          set["body.en"] = rebuildBody(doc.body.pt, en, 2).body;
          set["body.es"] = rebuildBody(doc.body.pt, es, 2).body;
        }
        patch.execute([{ set }]);

        toast.push({
          status: "success",
          title: "Tradução concluída",
          description: "Inglês e espanhol preenchidos. Revise nas abas de tradução e publique.",
        });
      } catch (error) {
        toast.push({
          status: "error",
          title: "Erro ao traduzir",
          description: error instanceof Error ? error.message : "Tente novamente.",
        });
      } finally {
        setBusy(false);
        props.onComplete();
      }
    },
  };
};
