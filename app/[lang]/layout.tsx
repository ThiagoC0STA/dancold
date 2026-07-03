import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { notFound } from "next/navigation";
import { getDictionary } from "@/dictionaries";
import { isLocale, locales, type Locale } from "@/lib/i18n";
import { site } from "@/lib/site";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import "../globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter", display: "swap" });

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
    alternates: {
      canonical: `/${lang}`,
      languages: Object.fromEntries(locales.map((locale) => [locale, `/${locale}`])),
    },
    openGraph: {
      type: "website",
      siteName: site.name,
      locale: lang === "pt" ? "pt_BR" : lang === "es" ? "es_ES" : "en_US",
    },
    robots: { index: true, follow: true },
  };
}

function JsonLd({ lang }: { lang: Locale }) {
  const data = {
    "@context": "https://schema.org",
    "@type": "HVACBusiness",
    name: site.name,
    url: `${site.url}/${lang}`,
    email: site.email,
    telephone: "+55-41-3365-4877",
    foundingDate: "1998",
    taxID: site.cnpj,
    address: {
      "@type": "PostalAddress",
      streetAddress: "Av. Prefeito Maurício Fruet, 3060, Cajuru",
      addressLocality: "Curitiba",
      addressRegion: "PR",
      postalCode: "82920-330",
      addressCountry: "BR",
    },
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "08:00",
      closes: "17:30",
    },
    sameAs: [site.social.facebook, site.social.instagram, site.social.linkedin],
  };
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
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
        <JsonLd lang={lang} />
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
        <main className="flex-1">{children}</main>
        <Footer lang={lang} dict={dict} />
        <WhatsAppFab label={dict.common.whatsapp} />
      </body>
    </html>
  );
}
