import Link from "next/link";
import Image from "next/image";
import type { Locale } from "@/lib/i18n";
import type { Dictionary } from "@/dictionaries";
import { serviceSlugs, site } from "@/lib/site";

export function Footer({ lang, dict }: { lang: Locale; dict: Dictionary }) {
  const year = new Date().getFullYear();

  const company = [
    { href: `/${lang}`, label: dict.nav.home },
    { href: `/${lang}/sobre-nos`, label: dict.nav.about },
    { href: `/${lang}/servicos`, label: dict.nav.services },
    { href: `/${lang}/segmentos`, label: dict.nav.segments },
    { href: `/${lang}/onde-estamos`, label: dict.nav.whereWeAre },
    { href: `/${lang}/blog`, label: dict.nav.blog },
    { href: `/${lang}/contato`, label: dict.nav.contact },
    { href: `/${lang}/trabalhe-conosco`, label: dict.nav.careers },
  ];

  return (
    <footer className="section-dark relative border-t border-line bg-bg text-ink">
      <div className="bg-blueprint absolute inset-0 opacity-40" aria-hidden />
      <div className="relative mx-auto max-w-7xl px-6 pb-10 pt-16">
        <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.2fr]">
          <div>
            <Image src="/logo-light.webp" alt="Dancold" width={200} height={46} className="h-11 w-auto" />
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-ink-2">{dict.footer.about}</p>
            <p className="mt-4 text-xs tabular-nums text-ink-3">CNPJ: {site.cnpj}</p>
            <div className="mt-6 flex gap-3">
              <SocialLink href={site.social.facebook} label="Facebook">
                <path d="M13.5 21v-8h2.7l.4-3.1h-3.1V7.9c0-.9.25-1.5 1.55-1.5h1.65V3.6c-.3-.04-1.3-.12-2.45-.12-2.4 0-4.05 1.46-4.05 4.15v2.32H7.5V13h2.7v8h3.3z" />
              </SocialLink>
              <SocialLink href={site.social.instagram} label="Instagram">
                <path d="M12 8.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4zM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10zm6.5-.25a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0zM12 4.6c-2.4 0-2.7.01-3.65.05-.94.05-1.45.2-1.79.33-.45.18-.77.39-1.1.72-.34.33-.55.65-.72 1.1-.14.34-.29.85-.33 1.79C4.36 9.53 4.35 9.82 4.35 12s.01 2.47.06 3.41c.04.94.2 1.45.33 1.79.17.45.38.77.72 1.1.33.34.65.55 1.1.72.34.14.85.29 1.79.33.95.05 1.24.06 3.65.06s2.7-.01 3.65-.06c.94-.04 1.45-.19 1.79-.33.45-.17.77-.38 1.1-.72.34-.33.55-.65.72-1.1.14-.34.29-.85.33-1.79.05-.94.06-1.23.06-3.41s-.01-2.47-.06-3.41c-.04-.94-.19-1.45-.33-1.79a2.96 2.96 0 0 0-.72-1.1 2.96 2.96 0 0 0-1.1-.72c-.34-.14-.85-.29-1.79-.33C14.7 4.61 14.4 4.6 12 4.6zm0-1.85c2.45 0 2.75.01 3.71.05 1 .05 1.66.2 2.25.44.6.23 1.12.55 1.63 1.06.5.5.83 1.02 1.06 1.63.23.6.4 1.25.44 2.25.04.96.05 1.26.05 3.71s-.01 2.75-.05 3.71c-.05 1-.2 1.66-.44 2.25a4.6 4.6 0 0 1-1.06 1.63c-.5.5-1.02.83-1.63 1.06-.6.23-1.25.4-2.25.44-.96.04-1.26.05-3.71.05s-2.75-.01-3.71-.05c-1-.05-1.66-.2-2.25-.44a4.6 4.6 0 0 1-1.63-1.06 4.6 4.6 0 0 1-1.06-1.63c-.23-.6-.4-1.25-.44-2.25-.04-.96-.05-1.26-.05-3.71s.01-2.75.05-3.71c.05-1 .2-1.66.44-2.25.23-.6.55-1.12 1.06-1.63a4.6 4.6 0 0 1 1.63-1.06c.6-.23 1.25-.4 2.25-.44.96-.04 1.26-.05 3.71-.05z" />
              </SocialLink>
              <SocialLink href={site.social.linkedin} label="LinkedIn">
                <path d="M6.94 8.6H3.6V20.4h3.34V8.6zM5.27 3.6a1.94 1.94 0 1 0 0 3.87 1.94 1.94 0 0 0 0-3.87zM20.4 13.9c0-3.06-1.63-4.48-3.81-4.48-1.76 0-2.55.97-2.99 1.65V8.6h-3.34c.04.94 0 11.8 0 11.8h3.34v-6.6c0-.35.03-.7.13-.96.28-.7.92-1.43 2-1.43 1.4 0 1.97 1.07 1.97 2.64v6.35h3.7V13.9z" />
              </SocialLink>
            </div>
          </div>

          <nav aria-label={dict.footer.companyTitle}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-3">
              {dict.footer.companyTitle}
            </h3>
            <ul className="mt-5 space-y-2.5">
              {company.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-sm text-ink-2 transition hover:text-ink"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <nav aria-label={dict.footer.servicesTitle}>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-3">
              {dict.footer.servicesTitle}
            </h3>
            <ul className="mt-5 space-y-2.5">
              {serviceSlugs.map((slug) => (
                <li key={slug}>
                  <Link
                    href={`/${lang}/servicos/${slug}`}
                    className="text-sm text-ink-2 transition hover:text-ink"
                  >
                    {dict.services[slug].title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-ink-3">
              {dict.footer.hoursTitle}
            </h3>
            <div className="mt-5 space-y-4 text-sm text-ink-2">
              <p className="tabular-nums">
                <a href="tel:+554133654877" className="block text-lg font-semibold text-ink transition hover:text-brand">
                  {site.phoneFixed}
                </a>
                <a
                  href={site.whatsapp}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-lg font-semibold text-ink transition hover:text-brand"
                >
                  {site.phoneMobile}
                </a>
              </p>
              <p>
                <span className="mb-1 block text-xs uppercase tracking-wider text-ink-3">
                  {dict.footer.addressTitle}
                </span>
                {site.address}
              </p>
              <p>
                <span className="mb-1 block text-xs uppercase tracking-wider text-ink-3">
                  {dict.footer.emailTitle}
                </span>
                <a href={`mailto:${site.email}`} className="transition hover:text-ink">
                  {site.email}
                </a>
              </p>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-col items-center justify-between gap-3 border-t border-line pt-6 text-xs text-ink-3 sm:flex-row">
          <p>
            {year} © Dancold. {dict.footer.rights}
          </p>
          <p>Ar condicionado / Refrigeração / Automação</p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-2 transition hover:border-line-2 hover:text-ink"
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4" aria-hidden>
        {children}
      </svg>
    </a>
  );
}
