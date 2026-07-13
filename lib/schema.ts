import { site } from "./site";
import type { Locale } from "./i18n";
import type { Dictionary } from "@/dictionaries";

/** Absolute URL for a site-relative path. */
export function abs(path: string): string {
  if (path.startsWith("http")) return path;
  return `${site.url}${path.startsWith("/") ? path : `/${path}`}`;
}

/** Open Graph locale code for a locale. */
export function ogLocale(lang: Locale): string {
  return lang === "pt" ? "pt_BR" : lang === "es" ? "es_ES" : "en_US";
}

const POSTAL_ADDRESS = {
  "@type": "PostalAddress",
  streetAddress: "Av. Prefeito Maurício Fruet, 3060, Cajuru",
  addressLocality: "Curitiba",
  addressRegion: "PR",
  postalCode: "82920-330",
  addressCountry: "BR",
} as const;

/** WebSite + HVACBusiness graph, cross-linked by @id. Rendered once in the layout. */
export function siteGraph(dict: Dictionary, lang: Locale) {
  const business = {
    "@type": "HVACBusiness",
    "@id": `${site.url}/#business`,
    name: site.name,
    url: `${site.url}/${lang}`,
    logo: abs("/logo.webp"),
    image: abs("/img/heroes/chillers.jpg"),
    description: dict.meta.home.description,
    email: site.email,
    telephone: "+55-41-3365-4877",
    priceRange: "$$$",
    foundingDate: "1998",
    taxID: site.cnpj,
    address: POSTAL_ADDRESS,
    geo: { "@type": "GeoCoordinates", latitude: -25.4372, longitude: -49.2003 },
    areaServed: dict.whereWeAre.states.map((state) => ({ "@type": "State", name: state })),
    contactPoint: [
      {
        "@type": "ContactPoint",
        telephone: "+55-41-3365-4877",
        contactType: "customer service",
        areaServed: "BR",
        availableLanguage: ["pt-BR", "en", "es"],
      },
      {
        "@type": "ContactPoint",
        telephone: "+55-41-99246-6920",
        contactType: "sales",
      },
    ],
    openingHoursSpecification: {
      "@type": "OpeningHoursSpecification",
      dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
      opens: "07:30",
      closes: "17:30",
    },
    sameAs: [site.social.facebook, site.social.instagram, site.social.linkedin],
  };

  const website = {
    "@type": "WebSite",
    "@id": `${site.url}/#website`,
    url: site.url,
    name: site.name,
    inLanguage: ["pt-BR", "en", "es"],
    publisher: { "@id": `${site.url}/#business` },
  };

  return { "@context": "https://schema.org", "@graph": [website, business] };
}

/** BreadcrumbList JSON-LD from a trail of { name, path } relative to the locale root. */
export function breadcrumb(lang: Locale, trail: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: trail.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: abs(`/${lang}${item.path}`),
    })),
  };
}

/** BlogPosting JSON-LD for a post detail page, linked back to the business. */
export function articleSchema(
  lang: Locale,
  slug: string,
  headline: string,
  description: string,
  imageUrl: string,
  publishedAt: string,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": `${site.url}/${lang}/blog/${slug}#article`,
    headline,
    description,
    image: imageUrl.startsWith("http") ? imageUrl : abs(imageUrl),
    datePublished: publishedAt,
    dateModified: publishedAt,
    inLanguage: lang === "pt" ? "pt-BR" : lang,
    url: abs(`/${lang}/blog/${slug}`),
    mainEntityOfPage: abs(`/${lang}/blog/${slug}`),
    author: { "@id": `${site.url}/#business` },
    publisher: { "@id": `${site.url}/#business` },
  };
}

/** Service JSON-LD for a service detail page, linked back to the business. */
export function serviceSchema(
  lang: Locale,
  slug: string,
  name: string,
  description: string,
  imagePath: string,
  states: readonly string[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "@id": `${site.url}/${lang}/servicos/${slug}#service`,
    name,
    serviceType: name,
    description,
    url: abs(`/${lang}/servicos/${slug}`),
    image: abs(imagePath),
    provider: { "@id": `${site.url}/#business` },
    areaServed: states.map((state) => ({ "@type": "State", name: state })),
  };
}
