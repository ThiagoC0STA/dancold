import { locales, type Locale } from "@/lib/i18n";
import { segmentSlugs, type SegmentSlug } from "@/lib/site";

/** Pedido de orçamento já validado, pronto para gravar. */
export interface QuoteLead {
  name: string;
  email: string;
  phone: string;
  company: string;
  message: string;
  segment: SegmentSlug | null;
  lang: Locale;
  page: string | null;
  gclid: string | null;
  /** site de onde a pessoa chegou na visita (document.referrer): dá a origem igual à do rastreio */
  ref: string | null;
  utm: Record<string, string>;
  /** códigos do rastreio: ligam o pedido às páginas que a pessoa viu */
  visitorId: string | null;
  sessionId: string | null;
}

export type QuoteField = "name" | "email" | "phone" | "company" | "message" | "consent";

export type QuoteResult =
  | { ok: true; lead: QuoteLead }
  | { ok: false; reason: "bot" }
  | { ok: false; reason: "invalid"; fields: QuoteField[] };

const LIMITS = { name: 120, email: 160, phone: 30, company: 160, message: 3000 } as const;
const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"] as const;
const TRACK_ID = /^[a-zA-Z0-9-]{8,40}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function text(value: unknown, max: number): string {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

/**
 * Valida o corpo enviado pelo formulário. Tudo que vem do navegador é
 * tratado como não confiável: tipos conferidos, tamanhos cortados e
 * segmento/idioma aceitos só se existirem no site.
 */
export function parseQuote(body: unknown): QuoteResult {
  if (typeof body !== "object" || body === null) {
    return { ok: false, reason: "invalid", fields: ["name"] };
  }
  const input = body as Record<string, unknown>;

  // campo-isca: gente não vê, robô preenche
  if (text(input.website, 200)) return { ok: false, reason: "bot" };

  const lead: QuoteLead = {
    name: text(input.name, LIMITS.name),
    email: text(input.email, LIMITS.email).toLowerCase(),
    phone: text(input.phone, LIMITS.phone),
    company: text(input.company, LIMITS.company),
    message: text(input.message, LIMITS.message),
    segment: (segmentSlugs as readonly string[]).includes(String(input.segment))
      ? (input.segment as SegmentSlug)
      : null,
    lang: (locales as readonly string[]).includes(String(input.lang))
      ? (input.lang as Locale)
      : "pt",
    page: text(input.page, 300) || null,
    gclid: /^[\w-]+$/.test(text(input.gclid, 200)) ? text(input.gclid, 200) : null,
    ref: text(input.ref, 500) || null,
    utm: {},
    visitorId: TRACK_ID.test(String(input.visitorId)) ? String(input.visitorId) : null,
    sessionId: TRACK_ID.test(String(input.sessionId)) ? String(input.sessionId) : null,
  };

  if (typeof input.utm === "object" && input.utm !== null) {
    const utm = input.utm as Record<string, unknown>;
    for (const key of UTM_KEYS) {
      const value = text(utm[key], 200);
      if (value) lead.utm[key] = value;
    }
  }

  const fields: QuoteField[] = [];
  if (lead.name.length < 2) fields.push("name");
  if (!EMAIL.test(lead.email)) fields.push("email");
  if (lead.phone.replace(/\D/g, "").length < 8) fields.push("phone");
  if (lead.company.length < 2) fields.push("company");
  if (lead.message.length < 5) fields.push("message");
  if (input.consent !== true) fields.push("consent");

  return fields.length ? { ok: false, reason: "invalid", fields } : { ok: true, lead };
}
