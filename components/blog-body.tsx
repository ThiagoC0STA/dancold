import Image from "next/image";
import { PortableText, type PortableTextBlock, type PortableTextComponents } from "@portabletext/react";
import { imageUrl } from "@/sanity/lib/client";

const components: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="mt-6 text-[16.5px] leading-[1.78] text-ink-2 first:mt-0 md:text-[17px]">
        {children}
      </p>
    ),
    h2: ({ children }) => (
      <h2 className="mt-14 flex scroll-mt-28 items-start gap-3 font-display text-[1.6rem] font-semibold leading-tight tracking-tight text-ink first:mt-0 md:text-[1.75rem]">
        <span aria-hidden className="mt-2 h-6 w-[3px] shrink-0 rounded-full bg-accent" />
        <span>{children}</span>
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="mt-10 scroll-mt-28 font-display text-xl font-semibold tracking-tight text-ink first:mt-0">
        {children}
      </h3>
    ),
    blockquote: ({ children }) => (
      <blockquote className="relative mt-8 overflow-hidden rounded-[12px] border border-line bg-surface-2 px-7 py-6 text-[17px] italic leading-relaxed text-ink first:mt-0">
        <span
          aria-hidden
          className="pointer-events-none absolute -top-3 left-4 font-display text-6xl not-italic leading-none text-accent/25"
        >
          &ldquo;
        </span>
        <span className="relative">{children}</span>
      </blockquote>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="mt-6 space-y-3 pl-1 text-[16.5px] leading-[1.7] text-ink-2 md:text-[17px]">
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol className="mt-6 list-decimal space-y-3 pl-6 text-[16.5px] leading-[1.7] text-ink-2 marker:font-semibold marker:text-accent md:text-[17px]">
        {children}
      </ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="relative pl-7 before:absolute before:left-0 before:top-[0.72em] before:h-[7px] before:w-[7px] before:-translate-y-1/2 before:rounded-full before:bg-accent">
        {children}
      </li>
    ),
    number: ({ children }) => <li className="pl-1">{children}</li>,
  },
  marks: {
    strong: ({ children }) => <strong className="font-semibold text-ink">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    link: ({ children, value }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-brand underline decoration-accent/40 underline-offset-2 transition hover:text-accent hover:decoration-accent"
      >
        {children}
      </a>
    ),
  },
  types: {
    image: ({ value }) => (
      <figure className="mt-10">
        <div className="relative aspect-video overflow-hidden rounded-[12px] border border-line shadow-[0_20px_50px_-30px_rgba(13,27,46,0.4)]">
          <Image
            src={imageUrl(value, 1400)}
            alt={value?.alt ?? ""}
            fill
            sizes="(max-width: 896px) 100vw, 850px"
            className="object-cover"
          />
        </div>
        {value?.alt && (
          <figcaption className="mt-3 text-center text-[13px] text-ink-3">{value.alt}</figcaption>
        )}
      </figure>
    ),
  },
};

export function BlogBody({ value }: { value: PortableTextBlock[] }) {
  return <PortableText value={value} components={components} />;
}
