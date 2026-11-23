"use server";

import { updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { requireAdmin } from "@/lib/admin/session";
import { fromMarkdown, slugify, toMarkdown, type Block } from "@/lib/blog/markdown";
import { locales, type Locale } from "@/lib/i18n";
import { createClient as createStatelessClient } from "@supabase/supabase-js";
import { supabaseKey, supabaseUrl } from "@/lib/supabase/env";
import { createClient } from "@/lib/supabase/server";
import { isTranslatorConfigured, translateTexts, type Target } from "@/lib/translate";

/* ── Entrar e sair ─────────────────────────────────────────────────── */

export async function signIn(_previous: string | null, form: FormData): Promise<string | null> {
  const email = String(form.get("email") ?? "").trim().toLowerCase();
  const password = String(form.get("password") ?? "");
  if (!email || !password) return "Preencha e-mail e senha.";

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.user) return "E-mail ou senha incorretos.";

  const { data: admin } = await supabase
    .from("admins")
    .select("user_id")
    .eq("user_id", data.user.id)
    .maybeSingle();
  if (!admin) {
    await supabase.auth.signOut();
    return "Esta conta não tem acesso ao painel.";
  }
  redirect("/admin");
}

export async function signOut() {
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

/* ── Minha conta ───────────────────────────────────────────────────── */

export type PasswordResult = { ok: boolean; message: string } | null;

export async function changePassword(_previous: PasswordResult, form: FormData): Promise<PasswordResult> {
  const { supabase, user } = await requireAdmin();
  const current = String(form.get("current") ?? "");
  const next = String(form.get("next") ?? "");
  const repeat = String(form.get("repeat") ?? "");

  if (!current || !next) return { ok: false, message: "Preencha a senha atual e a nova." };
  if (next.length < 8) return { ok: false, message: "A senha nova precisa ter pelo menos 8 caracteres." };
  if (next.length > 72) return { ok: false, message: "A senha nova pode ter no máximo 72 caracteres." };
  if (next !== repeat) return { ok: false, message: "A confirmação não bate com a senha nova." };
  if (next === current) return { ok: false, message: "A senha nova é igual à atual." };

  // confere a senha atual sem mexer na sessão do painel
  const check = createStatelessClient(supabaseUrl, supabaseKey, {
    auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false },
  });
  const { error: wrong } = await check.auth.signInWithPassword({ email: user.email ?? "", password: current });
  if (wrong) return { ok: false, message: "A senha atual está errada." };
  await check.auth.signOut({ scope: "local" });

  const { error } = await supabase.auth.updateUser({ password: next });
  if (error) {
    console.error("[conta] troca de senha falhou", error.status, error.code);
    return {
      ok: false,
      message:
        error.code === "weak_password"
          ? "Senha fraca. Misture letras, números e símbolos."
          : "Não foi possível trocar a senha. Tente de novo.",
    };
  }
  return { ok: true, message: "Senha trocada. Use a nova no próximo acesso." };
}

/* ── Pedidos de orçamento ──────────────────────────────────────────── */

const LEAD_STATUS = ["novo", "em_contato", "ganho", "perdido"];
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function updateLead(_previous: string | null, form: FormData): Promise<string | null> {
  const { supabase } = await requireAdmin();
  const id = String(form.get("id") ?? "");
  const status = String(form.get("status") ?? "");
  const notes = String(form.get("notes") ?? "").slice(0, 4000);
  if (!UUID.test(id) || !LEAD_STATUS.includes(status)) return "Dados inválidos.";

  const { error } = await supabase
    .from("leads")
    .update({ status, notes, updated_at: new Date().toISOString() })
    .eq("id", id);
  return error ? "Não foi possível salvar. Tente de novo." : "Salvo.";
}

/* ── Blog ──────────────────────────────────────────────────────────── */

export interface PostInput {
  id: string | null;
  slug: string;
  status: "rascunho" | "publicado";
  publishedAt: string;
  coverUrl: string | null;
  coverAlt: string;
  coverWidth: number | null;
  coverHeight: number | null;
  title: Record<Locale, string>;
  excerpt: Record<Locale, string>;
  body: Record<Locale, string>;
}

export type SaveResult = { ok: true; id: string } | { ok: false; error: string };

export async function savePost(input: PostInput): Promise<SaveResult> {
  const { supabase } = await requireAdmin();

  const slug = slugify(input.slug || input.title.pt);
  if (!input.title.pt?.trim()) return { ok: false, error: "Escreva o título em português." };
  if (!slug) return { ok: false, error: "O endereço do post ficou vazio." };
  if (input.id && !UUID.test(input.id)) return { ok: false, error: "Post inválido." };
  const publishedAt = new Date(input.publishedAt);
  if (Number.isNaN(publishedAt.getTime())) return { ok: false, error: "Data de publicação inválida." };

  const title: Record<string, string> = {};
  const excerpt: Record<string, string> = {};
  const body: Record<string, Block[]> = {};
  for (const locale of locales) {
    const text = input.title[locale]?.trim().slice(0, 200);
    const blocks = fromMarkdown(input.body[locale] ?? "");
    // uma língua só vai ao ar completa: título e texto
    if (!text || blocks.length === 0) continue;
    title[locale] = text;
    body[locale] = blocks;
    const summary = input.excerpt[locale]?.trim().slice(0, 400);
    if (summary) excerpt[locale] = summary;
  }
  if (!title.pt) return { ok: false, error: "Escreva o texto do post em português." };
  if (input.status === "publicado" && !excerpt.pt) {
    return { ok: false, error: "Escreva o resumo em português antes de publicar." };
  }
  if (input.status === "publicado" && !input.coverUrl) {
    return { ok: false, error: "Escolha a imagem de capa antes de publicar." };
  }

  const row = {
    slug,
    status: input.status === "publicado" ? "publicado" : "rascunho",
    published_at: publishedAt.toISOString(),
    cover_url: input.coverUrl,
    cover_alt: input.coverAlt.trim().slice(0, 300) || null,
    cover_width: input.coverWidth,
    cover_height: input.coverHeight,
    title,
    excerpt,
    body,
    updated_at: new Date().toISOString(),
  };

  const query = input.id
    ? supabase.from("posts").update(row).eq("id", input.id).select("id").single()
    : supabase.from("posts").insert(row).select("id").single();
  const { data, error } = await query;
  if (error || !data) {
    return {
      ok: false,
      error:
        error?.code === "23505"
          ? "Já existe um post com esse endereço. Mude o endereço."
          : "Não foi possível salvar. Tente de novo.",
    };
  }

  updateTag("blog");
  return { ok: true, id: data.id as string };
}

export async function deletePost(form: FormData) {
  const { supabase } = await requireAdmin();
  const id = String(form.get("id") ?? "");
  if (UUID.test(id)) {
    await supabase.from("posts").delete().eq("id", id);
    updateTag("blog");
  }
  redirect("/admin/blog");
}

const TRANSLATE_TIMEOUT = 25_000;

export type TranslateResult =
  | { ok: true; title: string; excerpt: string; body: string }
  | { ok: false; error: string };

/** Traduz título, resumo e texto do português, mantendo negrito, links e imagens. */
export async function translatePost(
  source: { title: string; excerpt: string; body: string },
  target: Target,
): Promise<TranslateResult> {
  await requireAdmin();
  if (target !== "en" && target !== "es") return { ok: false, error: "Língua inválida." };
  if (!isTranslatorConfigured()) {
    return { ok: false, error: "O tradutor automático não está configurado neste site." };
  }

  const blocks = fromMarkdown(source.body.slice(0, 60000));
  const texts = [source.title.slice(0, 200), source.excerpt.slice(0, 400)];
  for (const block of blocks) {
    if (block._type === "block") for (const span of block.children) texts.push(span.text);
    else texts.push(block.alt);
  }

  // inglês e espanhol saem em paralelo: cada um tem até 25 s, a tela nunca espera mais que isso
  const signal = AbortSignal.timeout(TRANSLATE_TIMEOUT);
  try {
    const translated = await translateTexts(texts, target, signal);
    let index = 2;
    for (const block of blocks) {
      if (block._type === "block") {
        for (const span of block.children) span.text = translated[index++] ?? span.text;
      } else {
        block.alt = translated[index++] ?? block.alt;
      }
    }
    return { ok: true, title: translated[0], excerpt: translated[1], body: toMarkdown(blocks) };
  } catch (error) {
    console.error("[blog] tradução falhou", signal.aborted ? "tempo esgotado" : error);
    return {
      ok: false,
      error: signal.aborted
        ? "O tradutor não respondeu. Tente de novo em instantes."
        : "A tradução falhou. Tente de novo em instantes.",
    };
  }
}

