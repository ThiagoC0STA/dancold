import type { Dictionary } from "@/dictionaries";
import { site } from "@/lib/site";
import { QuoteForm } from "./quote-form";
import { Reveal } from "./reveal";
import { SectionHeading } from "./section-heading";
import { WhatsAppIcon } from "./header";

/**
 * Pedido de orçamento no fim das páginas do site, logo antes do rodapé.
 * Links para `#orcamento` rolam até aqui. Em página de segmento o pedido
 * leva o segmento; nas outras vai só a página de onde veio.
 */
export function QuoteSection({
  lang,
  dict,
  segment = "",
}: {
  lang: string;
  dict: Dictionary;
  segment?: string;
}) {
  return (
    <section
      id="orcamento"
      className="relative scroll-mt-24 border-t border-line bg-surface-2 py-24 lg:py-28"
    >
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
          <div>
            <SectionHeading
              kicker={dict.quote.kicker}
              title={dict.quote.title}
              intro={dict.quote.text}
            />
            <Reveal delay={0.1}>
              <ul className="mt-9 space-y-4">
                {dict.quote.points.map((point) => (
                  <li key={point} className="flex items-start gap-3 text-[15px] text-ink-2">
                    <span
                      aria-hidden
                      className="mt-0.5 flex h-6 w-6 flex-none items-center justify-center rounded-md border border-line-2 text-accent"
                    >
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="h-3.5 w-3.5"
                      >
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                    </span>
                    {point}
                  </li>
                ))}
              </ul>
              <p className="mt-10 text-sm text-ink-3">{dict.quote.whatsappAlt}</p>
              <a
                href={site.whatsapp}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-whatsapp mt-3"
              >
                <WhatsAppIcon className="h-4.5 w-4.5" />
                {dict.common.whatsapp}
              </a>
              <p className="mt-3 text-sm tabular-nums text-ink-3">{site.phoneMobile}</p>
            </Reveal>
          </div>
          <Reveal delay={0.12}>
            <QuoteForm lang={lang} segment={segment} labels={dict.quote} />
          </Reveal>
        </div>
      </div>
    </section>
  );
}
