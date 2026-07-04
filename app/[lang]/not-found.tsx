"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { isLocale, type Locale } from "@/lib/i18n";

const copy: Record<Locale, { title: string; text: string; back: string }> = {
  pt: {
    title: "Página não encontrada",
    text: "A página que você procura não existe ou foi movida.",
    back: "Voltar para o início",
  },
  en: {
    title: "Page not found",
    text: "The page you are looking for does not exist or has been moved.",
    back: "Back to home",
  },
  es: {
    title: "Página no encontrada",
    text: "La página que busca no existe o fue movida.",
    back: "Volver al inicio",
  },
};

export default function NotFound() {
  const params = useParams<{ lang: string }>();
  const lang: Locale = params?.lang && isLocale(params.lang) ? params.lang : "pt";
  const t = copy[lang];

  return (
    <section className="relative flex min-h-[70vh] items-center justify-center overflow-hidden bg-bg">
      <div className="bg-blueprint absolute inset-0 opacity-40" aria-hidden />
      <div className="relative px-6 py-32 text-center">
        <p className="font-display text-[6rem] font-bold leading-none tracking-tight text-brand sm:text-[8rem]">
          404
        </p>
        <h1 className="mt-2 font-display text-2xl font-bold text-ink sm:text-3xl">{t.title}</h1>
        <p className="mt-3 text-ink-2">{t.text}</p>
        <Link href={`/${lang}`} className="btn btn-primary mt-8">
          ← {t.back}
        </Link>
      </div>
    </section>
  );
}
