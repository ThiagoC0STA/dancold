import type { EmailOtpType } from "@supabase/supabase-js";
import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Destino do link que o Supabase manda por e-mail no aviso de pedido novo
 * (lib/notify.ts). O modelo "Magic Link" do projeto aponta para cá com
 * token_hash; aqui ele vira sessão em cookie e a pessoa cai logada no painel.
 *
 *   {{ .SiteURL }}/admin/confirmar?token_hash={{ .TokenHash }}&type=email&next=/admin/pedidos
 */
const TYPES: EmailOtpType[] = ["email", "magiclink"];

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  const tokenHash = params.get("token_hash") ?? "";
  const type = params.get("type") as EmailOtpType;
  const next = params.get("next") ?? "/admin";
  // só volta para dentro do painel: nada de mandar a pessoa para outro site
  const target = /^\/admin(\/[\w/-]*)?$/.test(next) ? next : "/admin";

  const url = request.nextUrl.clone();
  url.search = "";

  if (/^[\w-]{10,200}$/.test(tokenHash) && TYPES.includes(type)) {
    const supabase = await createClient();
    const { error } = await supabase.auth.verifyOtp({ type, token_hash: tokenHash });
    if (!error) {
      url.pathname = target;
      return NextResponse.redirect(url);
    }
  }

  url.pathname = "/admin/login";
  url.searchParams.set("erro", "link");
  return NextResponse.redirect(url);
}
