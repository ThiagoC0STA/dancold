import type { Metadata } from "next";
import Image from "next/image";
import { LoginForm } from "./login-form";

export const metadata: Metadata = { title: "Entrar" };

const NOTICES: Record<string, string> = {
  acesso: "Esta conta não tem acesso ao painel.",
  sessao: "Sua sessão terminou. Entre de novo para continuar.",
  link: "Esse link expirou ou já foi usado. Entre com e-mail e senha.",
};

export default async function LoginPage({ searchParams }: PageProps<"/admin/login">) {
  const { erro } = await searchParams;

  return (
    <main className="grid min-h-screen lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
      <section className="section-dark relative hidden overflow-hidden bg-bg lg:block">
        <div className="bg-blueprint absolute inset-0" aria-hidden />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Image
            src="/logo-light.webp"
            alt="Dancold"
            width={200}
            height={46}
            loading="eager"
            className="h-10 w-auto self-start"
          />
          <div>
            <p className="max-w-sm font-display text-[28px] font-semibold leading-tight tracking-tight text-ink">
              Quem visitou, o que leu e quem pediu orçamento.
            </p>
            <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-ink-2">
              Os números do site, os pedidos que chegaram e o blog, em um lugar só.
            </p>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center bg-bg px-6 py-16">
        <div className="w-full max-w-[360px]">
          <Image src="/logo.webp" alt="Dancold" width={150} height={40} className="h-8 w-auto lg:hidden" />
          <h1 className="mt-10 font-display text-2xl font-semibold tracking-tight text-ink lg:mt-0">
            Entrar no painel
          </h1>
          <p className="mt-2 text-sm text-ink-2">Use o e-mail e a senha de administrador.</p>
          <LoginForm notice={typeof erro === "string" ? (NOTICES[erro] ?? null) : null} />
        </div>
      </section>
    </main>
  );
}
