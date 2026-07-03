import type { Dictionary } from "@/dictionaries";
import { site } from "@/lib/site";
import { Reveal } from "./reveal";
import { WhatsAppIcon } from "./header";

export function CtaSection({ dict }: { dict: Dictionary }) {
  return (
    <section className="section-dark relative overflow-hidden border-t border-line bg-bg text-ink">
      <div className="bg-blueprint absolute inset-0 opacity-50" aria-hidden />
      <div className="relative mx-auto flex max-w-7xl flex-col items-start gap-10 px-6 py-24 lg:flex-row lg:items-center lg:justify-between lg:py-28">
        <Reveal className="max-w-2xl">
          <h2 className="font-display text-3xl font-semibold tracking-tight text-ink text-balance sm:text-4xl lg:text-[2.75rem] lg:leading-[1.1]">
            {dict.cta.title}
          </h2>
          <p className="mt-5 text-base leading-relaxed text-ink-2">{dict.cta.text}</p>
        </Reveal>
        <Reveal delay={0.15}>
          <a
            href={site.whatsapp}
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary h-[52px] px-7 text-[15px]"
          >
            <WhatsAppIcon className="h-5 w-5" />
            {dict.cta.button}
            <span aria-hidden className="btn-arrow">→</span>
          </a>
        </Reveal>
      </div>
    </section>
  );
}
