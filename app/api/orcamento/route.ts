import { after, NextResponse } from "next/server";
import { notifyNewLead } from "@/lib/notify";
import { parseQuote } from "@/lib/quote";
import { publicInsert } from "@/lib/supabase/rest";
import { classifySource, geoFromHeaders, hostOf } from "@/lib/track";

/**
 * Recebe o pedido de orçamento do formulário do site e grava na tabela
 * `leads` do Supabase da Dancold (SQL em supabase/schema.sql).
 *
 * Usa a chave pública com RLS que só permite inserir, e sem pedir a linha de
 * volta, porque a política não deixa o site ler pedido nenhum.
 */
export async function POST(request: Request) {
  // só aceita envio vindo do próprio site
  const origin = request.headers.get("origin");
  const host = request.headers.get("host") ?? "";
  if (origin && host && new URL(origin).host !== host) {
    return NextResponse.json({ error: "origin" }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid", fields: [] }, { status: 400 });
  }

  const result = parseQuote(body);
  if (!result.ok) {
    // robô recebe "ok" para não aprender a contornar o campo-isca
    if (result.reason === "bot") return NextResponse.json({ ok: true });
    return NextResponse.json({ error: "invalid", fields: result.fields }, { status: 400 });
  }

  const { lead } = result;
  const geo = geoFromHeaders(request.headers);
  const saved = await publicInsert("leads", {
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    message: lead.message,
    segment: lead.segment,
    lang: lead.lang,
    page: lead.page,
    gclid: lead.gclid,
    utm: lead.utm,
    visitor_id: lead.visitorId,
    session_id: lead.sessionId,
    source: classifySource({
      utmSource: lead.utm.utm_source ?? null,
      utmMedium: lead.utm.utm_medium ?? null,
      gclid: lead.gclid,
      referrerHost: hostOf(lead.ref),
      ownHost: host,
    }),
    city: geo.city,
    region: geo.region,
  });

  if (!saved) return NextResponse.json({ error: "unavailable" }, { status: 502 });
  // o aviso por e-mail sai depois da resposta: quem pediu não espera e uma falha não derruba o pedido
  after(notifyNewLead);
  return NextResponse.json({ ok: true });
}
