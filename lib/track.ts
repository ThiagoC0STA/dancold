import { locales } from "@/lib/i18n";

/** Tipos de evento que o site grava. Igual ao check da tabela `events`. */
export const EVENT_TYPES = [
  "pageview",
  "page_exit",
  "click",
  "form_view",
  "form_start",
  "form_submit",
  "video_play",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export interface EventRow {
  visitor_id: string;
  session_id: string;
  type: EventType;
  path: string;
  lang: string | null;
  label: string | null;
  href: string | null;
  seconds: number | null;
  scroll: number | null;
  source: string;
  referrer: string | null;
  utm_source: string | null;
  utm_medium: string | null;
  utm_campaign: string | null;
  utm_term: string | null;
  utm_content: string | null;
  gclid: string | null;
  device: string;
  country: string | null;
  region: string | null;
  city: string | null;
}

export interface RequestContext {
  userAgent: string;
  host: string;
  country: string | null;
  region: string | null;
  city: string | null;
}

const ID = /^[a-zA-Z0-9-]{8,40}$/;
const BOT = /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|preview|monitor|curl|wget|python|scrapy/i;
const MAX_EVENTS = 25;

function text(value: unknown, max: number): string | null {
  if (typeof value !== "string") return null;
  const clean = value.trim().slice(0, max);
  return clean || null;
}

function integer(value: unknown, min: number, max: number): number | null {
  if (typeof value !== "number" || !Number.isFinite(value)) return null;
  return Math.min(max, Math.max(min, Math.round(value)));
}

export function isBot(userAgent: string): boolean {
  return !userAgent || BOT.test(userAgent);
}

export function deviceOf(userAgent: string): string {
  if (/ipad|tablet|android(?!.*mobile)/i.test(userAgent)) return "tablet";
  if (/mobi|iphone|android/i.test(userAgent)) return "celular";
  return "computador";
}

export function hostOf(url: string | null): string | null {
  if (!url) return null;
  try {
    return new URL(url).hostname.replace(/^www\./, "").slice(0, 200);
  } catch {
    return null;
  }
}

const SOCIAL: [RegExp, string][] = [
  [/instagram/, "Instagram"],
  [/facebook|fb\.com|fb\.me/, "Facebook"],
  [/linkedin|lnkd\.in/, "LinkedIn"],
  [/youtube|youtu\.be/, "YouTube"],
  [/whatsapp|wa\.me/, "WhatsApp"],
  [/t\.co$|twitter|x\.com$/, "X"],
];
const SEARCH: [RegExp, string][] = [
  [/google\./, "Google"],
  [/bing\./, "Bing"],
  [/duckduckgo/, "DuckDuckGo"],
  [/yahoo\./, "Yahoo"],
];

/**
 * Dá um nome legível à origem da visita. Anúncio do Google aparece como
 * "Google Ads" (tem gclid ou utm de mídia paga); busca comum, como "Google".
 */
export function classifySource(input: {
  utmSource: string | null;
  utmMedium: string | null;
  gclid: string | null;
  referrerHost: string | null;
  ownHost: string;
}): string {
  const source = input.utmSource?.toLowerCase() ?? "";
  const medium = input.utmMedium?.toLowerCase() ?? "";
  const paid = /cpc|ppc|paid|ads|display/.test(medium);

  if (input.gclid || (paid && /google|adwords/.test(source))) return "Google Ads";
  if (paid && /facebook|instagram|meta|fb|ig/.test(source)) return "Meta Ads";
  if (source) {
    for (const [pattern, name] of [...SOCIAL, ...SEARCH]) {
      if (pattern.test(source)) return paid ? `${name} Ads` : name;
    }
    return (input.utmSource ?? "").slice(0, 60);
  }

  const referrer = input.referrerHost;
  const own = input.ownHost.replace(/^www\./, "").split(":")[0];
  if (!referrer || referrer === own) return "Direto";
  for (const [pattern, name] of SEARCH) if (pattern.test(referrer)) return name;
  for (const [pattern, name] of SOCIAL) if (pattern.test(referrer)) return name;
  return referrer.slice(0, 60);
}

/**
 * Valida o lote enviado pelo navegador e devolve as linhas prontas para gravar.
 * Tudo que vem de fora é conferido e cortado; lote estranho devolve vazio.
 */
export function parseEvents(body: unknown, context: RequestContext): EventRow[] {
  if (typeof body !== "object" || body === null || isBot(context.userAgent)) return [];
  const input = body as Record<string, unknown>;
  const visitor = text(input.v, 40);
  const session = text(input.s, 40);
  if (!visitor || !session || !ID.test(visitor) || !ID.test(session)) return [];
  if (!Array.isArray(input.events)) return [];

  const utm = (typeof input.utm === "object" && input.utm !== null ? input.utm : {}) as Record<string, unknown>;
  const utmSource = text(utm.utm_source, 120);
  const utmMedium = text(utm.utm_medium, 120);
  const rawGclid = text(input.gclid, 200);
  // o gclid do Google só tem letras, números, "_" e "-": o resto é descartado (vai para planilha)
  const gclid = rawGclid && /^[\w-]+$/.test(rawGclid) ? rawGclid : null;
  const referrerHost = hostOf(text(input.ref, 500));
  const lang = (locales as readonly string[]).includes(String(input.lang)) ? String(input.lang) : null;

  const shared = {
    visitor_id: visitor,
    session_id: session,
    lang,
    source: classifySource({ utmSource, utmMedium, gclid, referrerHost, ownHost: context.host }),
    referrer: referrerHost,
    utm_source: utmSource,
    utm_medium: utmMedium,
    utm_campaign: text(utm.utm_campaign, 160),
    utm_term: text(utm.utm_term, 160),
    utm_content: text(utm.utm_content, 160),
    gclid,
    device: deviceOf(context.userAgent),
    country: context.country,
    region: context.region,
    city: context.city,
  };

  const rows: EventRow[] = [];
  for (const raw of input.events.slice(0, MAX_EVENTS)) {
    if (typeof raw !== "object" || raw === null) continue;
    const event = raw as Record<string, unknown>;
    const type = event.t as EventType;
    const path = text(event.p, 300);
    if (!EVENT_TYPES.includes(type) || !path || !path.startsWith("/")) continue;
    rows.push({
      ...shared,
      type,
      path,
      label: text(event.label, 120),
      href: text(event.href, 300),
      seconds: type === "page_exit" ? integer(event.sec, 0, 3600) : null,
      scroll: type === "page_exit" ? integer(event.scroll, 0, 100) : null,
    });
  }
  return rows;
}

/** Cidade e estado que a Vercel informa pelo IP. O IP em si nunca é gravado. */
export function geoFromHeaders(headers: Headers): Pick<RequestContext, "country" | "region" | "city"> {
  const read = (name: string, max: number) => {
    const value = headers.get(name);
    if (!value) return null;
    try {
      return decodeURIComponent(value).slice(0, max) || null;
    } catch {
      return null;
    }
  };
  return {
    country: read("x-vercel-ip-country", 60),
    region: read("x-vercel-ip-country-region", 60),
    city: read("x-vercel-ip-city", 80),
  };
}
