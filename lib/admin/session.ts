import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

/**
 * Garante que quem pede é admin: logado e presente na tabela `admins`.
 * Toda página e toda ação do painel passa por aqui. O banco confere de novo
 * pelo RLS, então mesmo um erro aqui não vaza dado.
 */
export const requireAdmin = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/admin/login");

  const { data } = await supabase.from("admins").select("user_id").eq("user_id", user.id).maybeSingle();
  if (!data) redirect("/admin/login?erro=acesso");

  return { supabase, user };
});

