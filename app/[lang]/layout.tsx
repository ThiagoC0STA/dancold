import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { getDictionary } from "@/dictionaries";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { ogLocale, siteGraph } from "@/lib/schema";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import { JsonLd } from "@/components/json-ld";
import { MotionProvider } from "@/components/motion-provider";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

const KEYWORDS: Record<Locale, string[]> = {
  pt: [
    "ar condicionado",
    "refrigeração",
    "climatização",
    "refrigeração industrial",
    "PMOC",
    "automação predial",
    "HVAC",
    "câmara fria",
    "chiller",
    "Curitiba",
  ],
  en: [
    "air conditioning",
    "refrigeration",
    "HVAC",
    "industrial cooling",
    "building automation",
    "PMOC",
    "cold rooms",
    "chiller",
    "Brazil",
  ],
  es: [
    "aire acondicionado",
    "refrigeración",
    "climatización",
    "HVAC",
    "automatización de edificios",
    "PMOC",
    "cámara frigorífica",
    "chiller",
    "Brasil",
  ],
};

const SKIP_LABEL: Record<Locale, string> = {
  pt: "Pular para o conteúdo",
  en: "Skip to content",
  es: "Saltar al contenido",
};

export const viewport: Viewport = {
  themeColor: "#0a1428",
};

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata({ params }: LayoutProps<"/[lang]">): Promise<Metadata> {
  const { lang } = await params;
  if (!isLocale(lang)) return {};
  const dict = await getDictionary(lang);

  return {
    metadataBase: new URL(site.url),
    title: {
      default: dict.meta.home.title,
      template: `%s | ${site.name}`,
    },
    description: dict.meta.home.description,
    applicationName: site.name,
    manifest: "/manifest.webmanifest",
    keywords: KEYWORDS[lang],
    authors: [{ name: site.name, url: site.url }],
    creator: site.name,
    publisher: site.name,
    alternates: {
      canonical: `/${lang}`,
      languages: {
        ...Object.fromEntries(locales.map((locale) => [locale, `/${locale}`])),
        "x-default": "/pt",
      },
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      url: `/${lang}`,
      title: dict.meta.home.title,
      description: dict.meta.home.description,
      locale: ogLocale(lang),
      alternateLocale: locales.filter((locale) => locale !== lang).map(ogLocale),
    },
    twitter: {
      card: "summary_large_image",
      title: dict.meta.home.title,
      description: dict.meta.home.description,
    },
    appleWebApp: {
      capable: true,
      title: site.name,
      statusBarStyle: "black-translucent",
    },
    robots: { index: true, follow: true },
  };
}

export default async function LangLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <html
      lang={lang === "pt" ? "pt-BR" : lang}
      className={`${inter.variable} antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="flex min-h-screen flex-col">
        <JsonLd data={siteGraph(dict, lang)} />
        <a
          href="#main"
          className="sr-only rounded-lg bg-accent px-5 py-3 text-sm font-semibold text-white focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60]"
        >
          {SKIP_LABEL[lang]}
        </a>
        <MotionProvider>
          <Header
            lang={lang}
            labels={{
              home: dict.nav.home,
              about: dict.nav.about,
              services: dict.nav.services,
              segments: dict.nav.segments,
              whereWeAre: dict.nav.whereWeAre,
              contact: dict.nav.contact,
              whatsapp: dict.common.whatsapp,
              hours: dict.common.hours,
            }}
          />
          <main id="main" className="flex-1">
            {children}
          </main>
          <Footer lang={lang} dict={dict} />
          <WhatsAppFab label={dict.common.whatsapp} />
        </MotionProvider>
      </body>
    </html>
  );
}
