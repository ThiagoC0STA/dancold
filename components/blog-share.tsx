"use client";

import { useState } from "react";
import { WhatsAppIcon } from "./header";

type BlogShareLabels = {
  share: string;
  copyLink: string;
  copied: string;
};

function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.24 8h4.52v14H.24V8zm7.5 0h4.33v1.92h.06c.6-1.14 2.07-2.34 4.26-2.34 4.56 0 5.4 3 5.4 6.9V22h-4.52v-6.62c0-1.58-.03-3.6-2.2-3.6-2.2 0-2.53 1.72-2.53 3.49V22H7.74V8z" />
    </svg>
  );
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

const BTN =
  "flex h-10 w-10 items-center justify-center rounded-full border border-line bg-surface text-ink-3 transition hover:-translate-y-0.5 hover:border-accent hover:text-accent";

export function BlogShare({
  url,
  title,
  labels,
  orientation = "horizontal",
}: {
  url: string;
  title: string;
  labels: BlogShareLabels;
  orientation?: "horizontal" | "vertical";
}) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(`${title} — ${url}`);
  const whatsappHref = `https://wa.me/?text=${encodedText}`;
  const linkedInHref = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable — no-op */
    }
  };

  const isVertical = orientation === "vertical";

  return (
    <div className={isVertical ? "flex flex-col items-center gap-3" : "flex items-center gap-2.5"}>
      <span
        className={
          isVertical
            ? "text-[10px] font-semibold uppercase tracking-[0.18em] text-ink-3 [writing-mode:vertical-rl] rotate-180"
            : "mr-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-ink-3"
        }
      >
        {labels.share}
      </span>
      <a
        href={whatsappHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="WhatsApp"
        className={BTN}
      >
        <WhatsAppIcon className="h-[18px] w-[18px]" />
      </a>
      <a
        href={linkedInHref}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="LinkedIn"
        className={BTN}
      >
        <LinkedInIcon className="h-[17px] w-[17px]" />
      </a>
      <button
        type="button"
        onClick={copy}
        aria-label={copied ? labels.copied : labels.copyLink}
        title={copied ? labels.copied : labels.copyLink}
        className={`${BTN} ${copied ? "border-accent text-accent" : ""}`}
      >
        {copied ? <CheckIcon className="h-[17px] w-[17px]" /> : <LinkIcon className="h-[17px] w-[17px]" />}
      </button>
    </div>
  );
}
