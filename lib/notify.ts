import "server-only";
import { createClient } from "@supabase/supabase-js";
import { isSupabaseConfigured, supabaseKey, supabaseUrl } from "./supabase/env";

/**
 * Avisa por e-mail que chegou pedido de orçamento, usando o e-mail do próprio
 * Supabase Auth: pede um link de acesso para o endereço de LEADS_NOTIFY_EMAIL.
 * O modelo "Magic Link" do projeto é reescrito como "Chegou um pedido novo" e o
 * link entra no painel já na lista de pedidos (app/admin/confirmar/route.ts).
 *
 * Limites: o endereço precisa ser de um admin que já existe no Auth (não cria
 * conta), o Supabase manda poucos e-mails por hora e não repete para o mesmo
 * endereço em menos de 60 s. Por isso o aviso é "tem pedido novo", não o pedido.
 *
 * Nunca lança erro: falha no aviso não pode derrubar o pedido.
 */
export async function notifyNewLead(): Promise<void> {
  const to = process.env.LEADS_NOTIFY_EMAIL?.trim().toLowerCase();
  if (!to || !isSupabaseConfigured) return;
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
    console.error("[aviso] LEADS_NOTIFY_EMAIL inválido");
    return;
  }

  try {
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
    });
    const { error } = await supabase.auth.signInWithOtp({
      email: to,
      options: { shouldCreateUser: false },
    });
    if (error) console.error("[aviso] e-mail de pedido novo não saiu:", error.status, error.code ?? error.message);
  } catch (error) {
    console.error("[aviso] e-mail de pedido novo falhou", error);
  }
}
