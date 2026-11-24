import type { Locale } from "@/lib/i18n";
import type { SegmentSlug } from "@/lib/site";

/**
 * Prova por segmento: vídeo e clientes atendidos.
 *
 * Só entra dado real, confirmado pela Dancold. Segmento sem dado não
 * mostra a seção (a página continua igual à de antes).
 */

/**
 * Vídeo do segmento: do YouTube (o trecho depois de `v=`) ou arquivo do próprio
 * site em `public/video/` com a capa ao lado.
 */
export type SegmentVideo = { youtubeId: string } | { src: string; poster: string };

export const segmentVideos: Partial<Record<SegmentSlug, SegmentVideo>> = {
  hospitais: { src: "/video/hospitais.mp4", poster: "/video/hospitais.webp" },
};

/** Como chamar os clientes do segmento no título "Estamos em X ...". */
export const segmentNouns: Partial<Record<SegmentSlug, Record<Locale, string>>> = {
  hospitais: { pt: "hospitais", en: "hospitals", es: "hospitales" },
};

export interface SegmentClient {
  /** nome como deve aparecer, ex.: "Hospital X" */
  name: string;
  city: string;
  /** sigla do estado em minúsculas, igual ao mapa: "pr", "sc", "sp"... */
  state: string;
  /** resumo do trabalho; com ele o cliente vira cartão de case */
  summary?: Partial<Record<Locale, string>>;
}

/**
 * Clientes atendidos por segmento. Alimenta o "Estamos em X ...", o mapa
 * e os cartões de case.
 */
export const segmentClients: Partial<Record<SegmentSlug, SegmentClient[]>> = {
  // hospitais: [
  //   { name: "Hospital X", city: "Curitiba", state: "pr", summary: { pt: "..." } },
  // ],
};
