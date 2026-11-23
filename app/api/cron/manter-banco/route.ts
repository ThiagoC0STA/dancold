import { cronJson, isCronAuthorized } from "@/lib/cron";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "@/lib/supabase/env";

/**
 * Mantém o Supabase acordado: o plano grátis pausa o projeto com pouca atividade
 * de banco em 7 dias ("algumas requisições ao banco por dia" bastam, diz a
 * documentação). A Vercel chama uma vez por dia (limite do plano Hobby, vercel.json); cada chamada
 * faz três contagens de posts publicados, sem cache, que chegam ao Postgres.
 *
 * Falha responde 500 e vai para o log, para aparecer na Vercel. A garantia de
 * verdade é o plano pago do Supabase, que não pausa.
 */
async function count(query: string): Promise<number> {
  const response = await fetch(`${supabaseUrl}/rest/v1/${query}`, {
    method: "HEAD",
    headers: { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, Prefer: "count=exact" },
    cache: "no-store",
    signal: AbortSignal.timeout(15_000),
  });
  const total = Number(response.headers.get("content-range")?.split("/")[1]);
  if (!response.ok || !Number.isFinite(total)) throw new Error(`${query.split("?")[0]} respondeu ${response.status}`);
  return total;
}

export async function GET(request: Request) {
  if (!isCronAuthorized(request)) return cronJson({ ok: false, erro: "não autorizado" }, 401);
  const at = new Date().toISOString();
  if (!isSupabaseConfigured) {
    console.error("[manter-banco] Supabase não configurado");
    return cronJson({ ok: false, erro: "Supabase não configurado", hora: at }, 500);
  }
  try {
    const [posts, english, spanish] = await Promise.all([
      count("posts?select=id&status=eq.publicado"),
      count("posts?select=id&status=eq.publicado&title->>en=not.is.null"),
      count("posts?select=id&status=eq.publicado&title->>es=not.is.null"),
    ]);
    return cronJson({ ok: true, posts_publicados: posts, em_ingles: english, em_espanhol: spanish, hora: at });
  } catch (error) {
    console.error("[manter-banco] leitura falhou: o banco pode pausar", error instanceof Error ? error.message : error);
    return cronJson({ ok: false, erro: "leitura falhou", hora: at }, 500);
  }
}
