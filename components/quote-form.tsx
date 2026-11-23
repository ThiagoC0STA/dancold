"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { Dictionary } from "@/dictionaries";
import type { QuoteField } from "@/lib/quote";
import { getAdClick, getAttribution, getIds, track } from "@/components/tracker";

type Status = "idle" | "sending" | "sent" | "error";

const inputClass =
  "mt-2 block w-full rounded-lg border border-line-2 bg-bg px-4 py-3 text-[15px] text-ink placeholder:text-ink-3 transition focus:border-navy-400 focus:outline-none focus:ring-2 focus:ring-navy-400/25 aria-[invalid=true]:border-accent";

export function QuoteForm({
  lang,
  segment,
  labels,
}: {
  lang: string;
  segment: string;
  labels: Dictionary["quote"];
}) {
  const id = useId();
  const [status, setStatus] = useState<Status>("idle");
  const [invalid, setInvalid] = useState<QuoteField[]>([]);
  const [started, setStarted] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  // "viu o formulário": um quarto dele na tela, uma vez por visita em cada página
  useEffect(() => {
    const form = formRef.current;
    if (!form || typeof IntersectionObserver === "undefined") return;
    const key = `dc_fv:${window.location.pathname}`;
    try {
      if (sessionStorage.getItem(key)) return;
    } catch {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (!entries.some((entry) => entry.isIntersecting)) return;
        observer.disconnect();
        try {
          sessionStorage.setItem(key, "1");
        } catch {
          // sem storage não há rastreio: getIds() descarta o evento
        }
        track("form_view", { label: segment });
      },
      { threshold: 0.25 },
    );
    observer.observe(form);
    return () => observer.disconnect();
  }, [segment]);

  function handleFocus() {
    if (started) return;
    setStarted(true);
    track("form_start", { label: segment });
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (status === "sending") return;
    const form = new FormData(event.currentTarget);
    // origem guardada na chegada: o utm some da barra ao navegar pelo site
    const attribution = getAttribution();
    const adClick = getAdClick();
    const ids = getIds();

    setStatus("sending");
    setInvalid([]);
    try {
      const response = await fetch("/api/orcamento", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.get("name"),
          email: form.get("email"),
          phone: form.get("phone"),
          company: form.get("company"),
          message: form.get("message"),
          consent: form.get("consent") === "on",
          website: form.get("website"),
          segment,
          lang,
          page: window.location.pathname,
          gclid: adClick.gclid,
          ref: attribution.ref,
          utm: adClick.utm,
          visitorId: ids?.visitor,
          sessionId: ids?.session,
        }),
      });
      if (response.ok) {
        setStatus("sent");
        track("form_submit", { label: segment });
        // conversão para o Google Ads pelo GTM da agência: o dataLayer é criado se o GTM
        // ainda não carregou, e ele lê o que estiver na fila quando chegar
        const tracker = window as unknown as { dataLayer?: unknown[] };
        tracker.dataLayer = tracker.dataLayer ?? [];
        tracker.dataLayer.push({ event: "orcamento_enviado", segmento: segment, idioma: lang });
        return;
      }
      const data = (await response.json().catch(() => null)) as { fields?: QuoteField[] } | null;
      setInvalid(data?.fields ?? []);
      setStatus(data?.fields?.length ? "idle" : "error");
    } catch {
      setStatus("error");
    }
  }

  if (status === "sent") {
    return (
      <div
        role="status"
        className="flex h-full min-h-[320px] flex-col items-start justify-center rounded-[10px] border border-line bg-surface p-8 lg:p-10"
      >
        <span
          aria-hidden
          className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent/10 text-accent"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-6 w-6"
          >
            <path d="M20 6 9 17l-5-5" />
          </svg>
        </span>
        <h3 className="mt-6 font-display text-2xl font-semibold tracking-tight text-ink">
          {labels.successTitle}
        </h3>
        <p className="mt-3 max-w-md text-base leading-relaxed text-ink-2">{labels.successText}</p>
      </div>
    );
  }

  const bad = (field: QuoteField) => invalid.includes(field);
  const field = (name: QuoteField) => ({
    id: `${id}-${name}`,
    name,
    required: true,
    "aria-invalid": bad(name) || undefined,
    "aria-describedby": bad(name) ? `${id}-${name}-error` : undefined,
    className: inputClass,
  });
  const fieldError = (name: QuoteField) =>
    bad(name) && (
      <p id={`${id}-${name}-error`} className="mt-1.5 text-[13px] font-medium text-accent">
        {labels.invalid[name]}
      </p>
    );
  const labelClass = "block text-sm font-semibold text-ink";

  return (
    <form
      ref={formRef}
      onSubmit={handleSubmit}
      onFocus={handleFocus}
      noValidate={false}
      className="rounded-[10px] border border-line bg-surface p-6 sm:p-8 lg:p-10"
    >
      <div className="grid gap-x-5 gap-y-6 sm:grid-cols-2">
        <div>
          <label htmlFor={`${id}-name`} className={labelClass}>
            {labels.name}
          </label>
          <input {...field("name")} type="text" autoComplete="name" maxLength={120} />
          {fieldError("name")}
        </div>
        <div>
          <label htmlFor={`${id}-company`} className={labelClass}>
            {labels.company}
          </label>
          <input {...field("company")} type="text" autoComplete="organization" maxLength={160} />
          {fieldError("company")}
        </div>
        <div>
          <label htmlFor={`${id}-email`} className={labelClass}>
            {labels.email}
          </label>
          <input {...field("email")} type="email" autoComplete="email" maxLength={160} />
          {fieldError("email")}
        </div>
        <div>
          <label htmlFor={`${id}-phone`} className={labelClass}>
            {labels.phone}
          </label>
          <input
            {...field("phone")}
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            maxLength={30}
            placeholder={labels.phonePlaceholder}
          />
          {fieldError("phone")}
        </div>
        <div className="sm:col-span-2">
          <label htmlFor={`${id}-message`} className={labelClass}>
            {labels.message}
          </label>
          <textarea
            {...field("message")}
            rows={5}
            maxLength={3000}
            placeholder={labels.messagePlaceholder}
            className={`${inputClass} resize-y`}
          />
          {fieldError("message")}
        </div>
      </div>

      {/* campo-isca: fora da tela e fora da navegação por teclado */}
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <label>
          Website
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 text-sm leading-relaxed text-ink-2">
        <input
          type="checkbox"
          name="consent"
          required
          aria-invalid={bad("consent") || undefined}
          className="mt-0.5 h-[18px] w-[18px] flex-none accent-(--color-accent)"
        />
        <span>{labels.consent}</span>
      </label>
      {fieldError("consent")}

      <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4">
        <button
          type="submit"
          disabled={status === "sending"}
          className="btn btn-primary disabled:cursor-wait disabled:opacity-70"
        >
          {status === "sending" ? labels.sending : labels.submit}
          {status !== "sending" && (
            <span aria-hidden className="btn-arrow">
              →
            </span>
          )}
        </button>
        <p className="text-[13px] text-ink-3">{labels.responseTime}</p>
      </div>

      <p role="alert" className="mt-4 text-sm font-medium text-accent empty:hidden">
        {status === "error" ? labels.error : ""}
      </p>
    </form>
  );
}
