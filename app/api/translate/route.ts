import { NextResponse } from "next/server";

/**
 * Provider-agnostic translation endpoint used by the Studio "Traduzir (EN/ES)"
 * action. It auto-detects which provider is configured via env vars, so the
 * free-tier landscape can change without touching the app:
 *   1. Azure AI Translator  (AZURE_TRANSLATOR_KEY)  — 2M chars/month free, no card
 *   2. Google Gemini        (GEMINI_API_KEY)        — free tier, no card
 *   3. DeepL                (DEEPL_API_KEY)         — 500k/month or 1M one-time
 */

type Target = "en" | "es";

const LANG_NAME: Record<Target, string> = { en: "English", es: "Spanish" };

/** Terms that must never be translated. */
const PROTECTED = "Dancold, PMOC, VRF, VRV, HVAC, ANVISA, RDC, CREA, ART, Split, Chiller, Fan Coil";

async function withAzure(texts: string[], target: Target): Promise<string[]> {
  const key = process.env.AZURE_TRANSLATOR_KEY!;
  const region = process.env.AZURE_TRANSLATOR_REGION;
  const endpoint =
    process.env.AZURE_TRANSLATOR_ENDPOINT ?? "https://api.cognitive.microsofttranslator.com";

  const response = await fetch(
    `${endpoint}/translate?api-version=3.0&from=pt&to=${target}`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        ...(region ? { "Ocp-Apim-Subscription-Region": region } : {}),
        "Content-Type": "application/json",
      },
      body: JSON.stringify(texts.map((text) => ({ Text: text }))),
    },
  );
  if (!response.ok) throw new Error(`Azure ${response.status}: ${await response.text()}`);
  const data = (await response.json()) as { translations: { text: string }[] }[];
  return data.map((item) => item.translations[0]?.text ?? "");
}

async function withGemini(texts: string[], target: Target): Promise<string[]> {
  const key = process.env.GEMINI_API_KEY!;
  const model = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";
  const prompt =
    `Translate each string in the following JSON array from Brazilian Portuguese to ${LANG_NAME[target]}. ` +
    `Return ONLY a JSON array of translated strings, exactly the same length and order. ` +
    `Keep the professional tone and HVAC/refrigeration technical terminology accurate. ` +
    `Do NOT translate these terms: ${PROTECTED}. Do not translate numbers or codes.\n\n` +
    JSON.stringify(texts);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: { type: "ARRAY", items: { type: "STRING" } },
        },
      }),
    },
  );
  if (!response.ok) throw new Error(`Gemini ${response.status}: ${await response.text()}`);
  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const raw = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]";
  const parsed = JSON.parse(raw) as unknown;
  if (!Array.isArray(parsed)) throw new Error("Gemini retornou formato inesperado.");
  return parsed.map((value) => String(value));
}

async function withDeepL(texts: string[], target: Target): Promise<string[]> {
  const key = process.env.DEEPL_API_KEY!;
  const host = key.endsWith(":fx") ? "api-free.deepl.com" : "api.deepl.com";
  const response = await fetch(`https://${host}/v2/translate`, {
    method: "POST",
    headers: { Authorization: `DeepL-Auth-Key ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: texts,
      source_lang: "PT",
      target_lang: target === "en" ? "EN-US" : "ES",
      preserve_formatting: true,
    }),
  });
  if (!response.ok) throw new Error(`DeepL ${response.status}: ${await response.text()}`);
  const data = (await response.json()) as { translations: { text: string }[] };
  return data.translations.map((item) => item.text);
}

function pickProvider(): ((texts: string[], target: Target) => Promise<string[]>) | null {
  if (process.env.AZURE_TRANSLATOR_KEY) return withAzure;
  if (process.env.GEMINI_API_KEY) return withGemini;
  if (process.env.DEEPL_API_KEY) return withDeepL;
  return null;
}

export async function POST(request: Request) {
  const provider = pickProvider();
  if (!provider) {
    return NextResponse.json(
      {
        error:
          "Nenhum tradutor configurado. Defina AZURE_TRANSLATOR_KEY, GEMINI_API_KEY ou DEEPL_API_KEY.",
      },
      { status: 503 },
    );
  }

  const { texts, target } = (await request.json()) as { texts?: unknown; target?: unknown };
  if (!Array.isArray(texts) || texts.some((t) => typeof t !== "string") || texts.length === 0) {
    return NextResponse.json({ error: "Campo 'texts' inválido." }, { status: 400 });
  }
  if (target !== "en" && target !== "es") {
    return NextResponse.json({ error: "Campo 'target' deve ser 'en' ou 'es'." }, { status: 400 });
  }

  // Preserve positions of empty strings; only send non-empty ones to the API.
  const nonEmptyIndexes: number[] = [];
  const payload: string[] = [];
  (texts as string[]).forEach((text, index) => {
    if (text.trim().length > 0) {
      nonEmptyIndexes.push(index);
      payload.push(text);
    }
  });

  const result = [...(texts as string[])];
  if (payload.length > 0) {
    try {
      const translated = await provider(payload, target);
      translated.forEach((text, i) => {
        if (nonEmptyIndexes[i] !== undefined) result[nonEmptyIndexes[i]] = text;
      });
    } catch (error) {
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Falha na tradução." },
        { status: 502 },
      );
    }
  }

  return NextResponse.json({ translations: result });
}
