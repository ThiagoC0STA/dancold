import "server-only";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "./env";

/**
 * Acesso do site público ao Supabase, sem login: só insere pedido e evento,
 * e só lê post publicado. Quem garante isso é o RLS (supabase/schema.sql).
 */

function headers(extra?: Record<string, string>) {
  return { apikey: supabaseKey, Authorization: `Bearer ${supabaseKey}`, ...extra };
}

/** Insere linhas sem pedir de volta (a política não deixa o site ler). */
export async function publicInsert(table: "leads" | "events", rows: object | object[]): Promise<boolean> {
  if (!isSupabaseConfigured) {
    console.error(`[supabase] não configurado, ${table} não gravado`);
    return false;
  }
  const response = await fetch(`${supabaseUrl}/rest/v1/${table}`, {
    method: "POST",
    headers: headers({ "Content-Type": "application/json", Prefer: "return=minimal" }),
    body: JSON.stringify(rows),
    cache: "no-store",
  }).catch(() => null);
  if (!response?.ok) {
    console.error(`[supabase] falha ao gravar em ${table}`, response?.status ?? "sem resposta");
    return false;
  }
  return true;
}

/** Leitura pública em cache, renovada por tag quando o admin salva. */
export async function publicSelect<T>(query: string, tag: string): Promise<T[]> {
  const response = await fetch(`${supabaseUrl}/rest/v1/${query}`, {
    headers: headers(),
    next: { revalidate: 300, tags: [tag] },
  });
  if (!response.ok) throw new Error(`Supabase ${response.status} em ${query.split("?")[0]}`);
  return (await response.json()) as T[];
}
