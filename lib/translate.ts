import "server-only";

/**
 * Tradução PT -> EN/ES usada pelo botão "Traduzir" do editor do blog.
 * Escolhe sozinho o serviço que tiver chave configurada:
 *   1. Azure AI Translator  (AZURE_TRANSLATOR_KEY)
 *   2. Google Gemini        (GEMINI_API_KEY)
 *   3. DeepL                (DEEPL_API_KEY)
 *
 * Só roda no servidor e só é chamada por ação de admin: antes ficava numa
 * rota aberta, que qualquer pessoa podia usar com a chave da Dancold.
 */

export type Target = "en" | "es";

const LANG_NAME: Record<Target, string> = { en: "English", es: "Spanish" };

/** Termos que nunca são traduzidos. */
const PROTECTED = "Dancold, PMOC, VRF, VRV, HVAC, ANVISA, RDC, CREA, ART, Split, Chiller, Fan Coil";

async function withAzure(texts: string[], target: Target, signal: AbortSignal): Promise<string[]> {
  const key = process.env.AZURE_TRANSLATOR_KEY!;
  const region = process.env.AZURE_TRANSLATOR_REGION;
  const endpoint =
    process.env.AZURE_TRANSLATOR_ENDPOINT ?? "https://api.cognitive.microsofttranslator.com";

  const response = await fetch(`${endpoint}/translate?api-version=3.0&from=pt&to=${target}`, {
    signal,
    method: "POST",
    headers: {
      "Ocp-Apim-Subscription-Key": key,
      ...(region ? { "Ocp-Apim-Subscription-Region": region } : {}),
      "Content-Type": "application/json",
    },
    body: JSON.stringify(texts.map((text) => ({ Text: text }))),
  });
  if (!response.ok) throw new Error(`Azure ${response.status}`);
  const data = (await response.json()) as { translations: { text: string }[] }[];
  return data.map((item) => item.translations[0]?.text ?? "");
}

async function withGemini(texts: string[], target: Target, signal: AbortSignal): Promise<string[]> {
  const key = process.env.GEMINI_API_KEY!;
  // Em 2026-11-25 o apelido gemini-flash-latest estourou a cota gratuita (429) e o
  // Flash Lite só respondia "sobrecarregado" (503); o 3.5 Flash e o 3 Flash respondiam.
  // Se o principal falhar, tenta o segundo.
  const models = [process.env.GEMINI_MODEL || "gemini-3.5-flash", "gemini-3-flash-preview"];
  const prompt =
    `Translate each string in the following JSON array from Brazilian Portuguese to ${LANG_NAME[target]}. ` +
    `Return ONLY a JSON array of translated strings, exactly the same length and order. ` +
    `Keep the professional tone and HVAC/refrigeration technical terminology accurate. ` +
    `Keep leading and trailing spaces of each string. ` +
    `Do NOT translate these terms: ${PROTECTED}. Do not translate numbers or codes.\n\n` +
    JSON.stringify(texts);

  const request = (model: string) =>
    fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      signal,
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.2,
          responseMimeType: "application/json",
          responseSchema: { type: "ARRAY", items: { type: "STRING" } },
        },
      }),
    });
  // o Gemini às vezes responde "sobrecarregado" (429/503) ou aposenta o modelo (404):
  // tenta de novo uma vez e depois passa para o modelo seguinte
  const retry = (status: number) => status === 404 || status === 429 || status >= 500;
  let response = await request(models[0]);
  if (retry(response.status) && response.status !== 404) {
    await new Promise((resolve) => setTimeout(resolve, 2000));
    signal.throwIfAborted();
    response = await request(models[0]);
  }
  if (retry(response.status)) response = await request(models[1]);
  if (!response.ok) throw new Error(`Gemini ${response.status} ${(await response.text()).slice(0, 200)}`);
  const data = (await response.json()) as {
    candidates?: { content?: { parts?: { text?: string }[] } }[];
  };
  const parsed = JSON.parse(data.candidates?.[0]?.content?.parts?.[0]?.text ?? "[]") as unknown;
  if (!Array.isArray(parsed)) throw new Error("Gemini devolveu formato inesperado.");
  return parsed.map((value) => String(value));
}

async function withDeepL(texts: string[], target: Target, signal: AbortSignal): Promise<string[]> {
  const key = process.env.DEEPL_API_KEY!;
  const host = key.endsWith(":fx") ? "api-free.deepl.com" : "api.deepl.com";
  const response = await fetch(`https://${host}/v2/translate`, {
    signal,
    method: "POST",
    headers: { Authorization: `DeepL-Auth-Key ${key}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      text: texts,
      source_lang: "PT",
      target_lang: target === "en" ? "EN-US" : "ES",
      preserve_formatting: true,
    }),
  });
  if (!response.ok) throw new Error(`DeepL ${response.status}`);
  const data = (await response.json()) as { translations: { text: string }[] };
  return data.translations.map((item) => item.text);
}

function pickProvider() {
  if (process.env.AZURE_TRANSLATOR_KEY) return withAzure;
  if (process.env.GEMINI_API_KEY) return withGemini;
  if (process.env.DEEPL_API_KEY) return withDeepL;
  return null;
}

export const isTranslatorConfigured = () => pickProvider() !== null;

/**
 * Traduz a lista mantendo ordem e tamanho. Texto vazio volta vazio.
 * O `signal` corta a espera: o editor não pode ficar preso em "Traduzindo...".
 */
export async function translateTexts(texts: string[], target: Target, signal: AbortSignal): Promise<string[]> {
  const provider = pickProvider();
  if (!provider) throw new Error("Nenhum tradutor configurado.");

  const indexes: number[] = [];
  const payload: string[] = [];
  texts.forEach((text, index) => {
    if (text.trim()) {
      indexes.push(index);
      payload.push(text);
    }
  });

  const result = [...texts];
  if (payload.length > 0) {
    const translated = await provider(payload, target, signal);
    if (translated.length !== payload.length) throw new Error("Tradução voltou incompleta.");
    translated.forEach((text, i) => {
      result[indexes[i]] = text;
    });
  }
  return result;
}
