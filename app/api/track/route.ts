import { publicInsert } from "@/lib/supabase/rest";
import { geoFromHeaders, parseEvents } from "@/lib/track";

/**
 * Recebe os eventos de navegação do site (página vista, clique, tempo na
 * página) e grava na tabela `events`. Nunca responde erro ao navegador: o
 * rastreio não pode atrapalhar a visita.
 */
export async function POST(request: Request) {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host") ?? "";
  if (origin && host && new URL(origin).host !== host) return new Response(null, { status: 204 });
  // quem tem sessão do painel é da equipe: não conta como visita. Só olha o cookie,
  // sem consultar o Supabase, então não custa nada para o visitante comum
  if (/(?:^|;\s*)sb-[^=;]+-auth-token/.test(request.headers.get("cookie") ?? "")) {
    return new Response(null, { status: 204 });
  }

  let body: unknown;
  try {
    body = JSON.parse((await request.text()).slice(0, 20000));
  } catch {
    return new Response(null, { status: 204 });
  }

  const rows = parseEvents(body, {
    userAgent: request.headers.get("user-agent") ?? "",
    host,
    ...geoFromHeaders(request.headers),
  });
  if (rows.length > 0) await publicInsert("events", rows);

  return new Response(null, { status: 204 });
}
