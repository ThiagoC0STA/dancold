"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import type { EventType } from "@/lib/track";

/**
 * Rastreio próprio do site: página vista, tempo e rolagem em cada página,
 * cliques em link e botão, início e envio do formulário, play do vídeo.
 *
 * Sem cookie e sem dado pessoal: o visitante é um código aleatório guardado
 * no navegador. É esse código que liga a visita ao pedido de orçamento.
 */

interface QueuedEvent {
  t: EventType;
  p: string;
  label?: string;
  href?: string;
  sec?: number;
  scroll?: number;
}

interface Attribution {
  ref: string;
  gclid: string | null;
  utm: Record<string, string>;
}

const UTM_KEYS = ["utm_source", "utm_medium", "utm_campaign", "utm_term", "utm_content"];
const queue: QueuedEvent[] = [];
let timer: ReturnType<typeof setTimeout> | null = null;

function newId(): string {
  return typeof crypto.randomUUID === "function"
    ? crypto.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 12)}`;
}

function stored(storage: Storage, key: string): string {
  let value = storage.getItem(key);
  if (!value) {
    value = newId();
    storage.setItem(key, value);
  }
  return value;
}

/** Códigos do visitante e da sessão. Navegador que bloqueia storage fica sem rastreio. */
export function getIds(): { visitor: string; session: string } | null {
  try {
    return { visitor: stored(localStorage, "dc_v"), session: stored(sessionStorage, "dc_s") };
  } catch {
    return null;
  }
}

/** De onde a sessão veio: guardado na chegada, porque o utm some ao navegar. */
export function getAttribution(): Attribution {
  const empty: Attribution = { ref: "", gclid: null, utm: {} };
  try {
    const saved = sessionStorage.getItem("dc_a");
    if (saved) return JSON.parse(saved) as Attribution;
    const query = new URLSearchParams(window.location.search);
    const utm: Record<string, string> = {};
    for (const key of UTM_KEYS) {
      const value = query.get(key);
      if (value) utm[key] = value.slice(0, 160);
    }
    const gclid = query.get("gclid")?.slice(0, 200) || null;
    const attribution = { ref: document.referrer, gclid, utm };
    sessionStorage.setItem("dc_a", JSON.stringify(attribution));
    // o clique do anúncio vale 90 dias para o Google Ads: guarda, com a campanha, para quem volta depois
    if (gclid && GCLID.test(gclid)) localStorage.setItem("dc_g", JSON.stringify({ g: gclid, t: Date.now(), utm }));
    return attribution;
  } catch {
    return empty;
  }
}

const CLICK_DAYS = 90;
// mesmo formato que o servidor aceita (lib/track.ts e lib/quote.ts)
const GCLID = /^[\w-]+$/;

/**
 * Clique no anúncio que vai junto do pedido: o desta visita, com o utm dela; ou,
 * se esta visita não veio de anúncio nem de link marcado, o de uma visita dos
 * últimos 90 dias, com o utm (origem e campanha) daquela visita.
 */
export function getAdClick(): { gclid: string | null; utm: Record<string, string> } {
  const current = getAttribution();
  if (current.gclid || Object.keys(current.utm).length > 0) return { gclid: current.gclid, utm: current.utm };
  try {
    const saved = JSON.parse(localStorage.getItem("dc_g") ?? "null") as { g?: unknown; t?: unknown; utm?: unknown } | null;
    if (typeof saved?.g !== "string" || !GCLID.test(saved.g) || typeof saved.t !== "number") return { gclid: null, utm: {} };
    if (Date.now() - saved.t >= CLICK_DAYS * 86400000) return { gclid: null, utm: {} };
    const utm: Record<string, string> = {};
    if (typeof saved.utm === "object" && saved.utm !== null) {
      for (const key of UTM_KEYS) {
        const value = (saved.utm as Record<string, unknown>)[key];
        if (typeof value === "string" && value) utm[key] = value.slice(0, 160);
      }
    }
    return { gclid: saved.g, utm };
  } catch {
    return { gclid: null, utm: {} };
  }
}

function flush() {
  if (timer) clearTimeout(timer);
  timer = null;
  if (queue.length === 0) return;
  const ids = getIds();
  const events = queue.splice(0, queue.length);
  if (!ids) return;
  const attribution = getAttribution();
  const body = JSON.stringify({
    v: ids.visitor,
    s: ids.session,
    lang: document.documentElement.lang.slice(0, 2),
    ref: attribution.ref,
    gclid: attribution.gclid,
    utm: attribution.utm,
    events,
  });
  // sendBeacon sobrevive ao fechamento da aba; fetch é o plano B
  if (!navigator.sendBeacon?.("/api/track", new Blob([body], { type: "application/json" }))) {
    void fetch("/api/track", { method: "POST", body, keepalive: true }).catch(() => {});
  }
}

/** Registra um evento. Pode ser chamado de qualquer componente do site. */
export function track(type: EventType, extra: Omit<QueuedEvent, "t" | "p"> = {}) {
  if (typeof window === "undefined") return;
  queue.push({ t: type, p: window.location.pathname, ...extra });
  if (!timer) timer = setTimeout(flush, 1500);
}

function labelOf(element: Element): string {
  const named = element.getAttribute("data-track") ?? element.getAttribute("aria-label");
  const label = named ?? (element as HTMLElement).innerText ?? "";
  return label.replace(/\s+/g, " ").replace(/→/g, "").trim().slice(0, 100);
}

export function Tracker() {
  const pathname = usePathname();

  // tempo visível e rolagem máxima da página atual
  useEffect(() => {
    track("pageview");
    getAttribution();

    let visibleSince = document.visibilityState === "visible" ? Date.now() : 0;
    let seconds = 0;
    let maxScroll = 0;

    const measureScroll = () => {
      const total = document.documentElement.scrollHeight - window.innerHeight;
      const percent = total <= 0 ? 100 : Math.round((window.scrollY / total) * 100);
      if (percent > maxScroll) maxScroll = Math.min(100, percent);
    };
    const pause = () => {
      if (visibleSince) seconds += (Date.now() - visibleSince) / 1000;
      visibleSince = 0;
    };
    const exit = (path: string) => {
      pause();
      if (seconds >= 1) {
        queue.push({ t: "page_exit", p: path, sec: Math.round(seconds), scroll: maxScroll });
      }
      seconds = 0;
    };
    const leave = () => {
      exit(pathname);
      flush();
    };
    const onVisibility = () => {
      if (document.visibilityState === "hidden") leave();
      else visibleSince = Date.now();
    };

    measureScroll();
    window.addEventListener("scroll", measureScroll, { passive: true });
    document.addEventListener("visibilitychange", onVisibility);
    // ao sair por link ou fechar a aba a página ainda conta como visível
    window.addEventListener("pagehide", leave);

    return () => {
      window.removeEventListener("scroll", measureScroll);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("pagehide", leave);
      exit(pathname);
    };
  }, [pathname]);

  // todo clique em link ou botão
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = (event.target as Element | null)?.closest?.("a, button");
      if (!target || target.closest("[data-no-track]")) return;
      const label = labelOf(target);
      const href = target instanceof HTMLAnchorElement ? target.getAttribute("href") ?? "" : "";
      if (!label && !href) return;
      track("click", { label: label || undefined, href: href.slice(0, 300) || undefined });
    };
    document.addEventListener("click", onClick, true);
    return () => document.removeEventListener("click", onClick, true);
  }, []);

  return null;
}
