import type { PortableTextBlock } from "@portabletext/react";

const WORDS_PER_MINUTE = 200;

/**
 * Estimates reading time (in minutes, min 1) from PortableText body blocks
 * by counting words inside every span child of every block.
 */
export function readingMinutes(body: PortableTextBlock[]): number {
  const words = body.reduce((total, block) => {
    const children = Array.isArray(block.children) ? block.children : [];
    const text = children
      .map((child) => (typeof child?.text === "string" ? child.text : ""))
      .join(" ");
    const count = text.trim().split(/\s+/).filter(Boolean).length;
    return total + count;
  }, 0);

  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}
