/** Formatação do painel: sempre em português e no horário de Brasília. */

const TZ = "America/Sao_Paulo";

const dateTime = new Intl.DateTimeFormat("pt-BR", {
  timeZone: TZ,
  day: "2-digit",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
});
const dateOnly = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, day: "2-digit", month: "short", year: "numeric" });
const dayShort = new Intl.DateTimeFormat("pt-BR", { timeZone: "UTC", day: "2-digit", month: "short" });
const timeOnly = new Intl.DateTimeFormat("pt-BR", { timeZone: TZ, hour: "2-digit", minute: "2-digit" });
const number = new Intl.NumberFormat("pt-BR");

export const formatDateTime = (iso: string) => dateTime.format(new Date(iso)).replace(".", "");
export const formatDate = (iso: string) => dateOnly.format(new Date(iso)).replace(".", "");
export const formatTime = (iso: string) => timeOnly.format(new Date(iso));
/** Dia vindo do banco como "2026-11-23" (já no fuso de Brasília). */
export const formatDay = (day: string) => dayShort.format(new Date(`${day}T12:00:00Z`)).replace(".", "");
export const formatNumber = (value: number) => number.format(value);

export function formatDuration(seconds: number): string {
  const total = Math.round(seconds);
  if (total < 60) return `${total} s`;
  const minutes = Math.floor(total / 60);
  const rest = total % 60;
  if (minutes < 60) return rest ? `${minutes} min ${rest} s` : `${minutes} min`;
  return `${Math.floor(minutes / 60)} h ${minutes % 60} min`;
}

export function formatPercent(part: number, whole: number): string {
  if (!whole) return "0%";
  const value = (part / whole) * 100;
  return `${value >= 10 || value === 0 ? Math.round(value) : value.toFixed(1).replace(".", ",")}%`;
}

/** Quanto tempo faz, em palavras curtas: "há 5 min", "há 3 dias". */
export function formatAgo(iso: string, now = Date.now()): string {
  const minutes = Math.max(0, Math.round((now - new Date(iso).getTime()) / 60000));
  if (minutes < 1) return "agora";
  if (minutes < 60) return `há ${minutes} min`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `há ${hours} h`;
  const days = Math.round(hours / 24);
  return days === 1 ? "ontem" : `há ${days} dias`;
}

const PAGE_NAMES: Record<string, string> = {
  servicos: "Serviços",
  "sobre-nos": "Sobre nós",
  "onde-estamos": "Onde estamos",
  "trabalhe-conosco": "Trabalhe conosco",
  industrias: "Indústrias",
  "shopping-centers": "Shopping centers",
  agronegocios: "Agronegócios",
  "predios-corporativos": "Prédios corporativos",
};

/** Título em português de cada post, pelo endereço. */
export type PostTitles = Record<string, string>;

/**
 * Nome legível da página a partir do caminho: "/pt/segmentos/hospitais" -> "Segmentos › Hospitais".
 * Post do blog usa o título do post, quando a lista de títulos vem junto.
 */
export function pageName(path: string, titles?: PostTitles): string {
  const parts = path.split("?")[0].split("/").filter(Boolean);
  if (["pt", "en", "es"].includes(parts[0])) parts.shift();
  if (parts.length === 0) return "Página inicial";
  if (parts[0] === "blog" && parts.length === 2 && titles?.[parts[1]]) return `Blog › ${titles[parts[1]]}`;
  return parts
    .map((part) => {
      if (PAGE_NAMES[part]) return PAGE_NAMES[part];
      const words = part.replace(/-/g, " ");
      return words.charAt(0).toUpperCase() + words.slice(1);
    })
    .join(" › ");
}

export function pageLang(path: string): string | null {
  const first = path.split("/").filter(Boolean)[0];
  return first === "en" || first === "es" ? first.toUpperCase() : null;
}

export const LEAD_STATUS: Record<string, { label: string; tone: string }> = {
  novo: { label: "Novo", tone: "new" },
  em_contato: { label: "Em contato", tone: "warn" },
  ganho: { label: "Fechado", tone: "ok" },
  perdido: { label: "Não fechou", tone: "" },
};

/**
 * Filtro "Sem resposta" de Pedidos: pedido Novo há mais de 1 dia útil (segunda a
 * sexta, horário de Brasília). A regra mora no banco (private.answer_by).
 */
export const STALE = "sem_resposta";

/** Situação aceita no filtro de Pedidos (?status=): as quatro e "sem_resposta". */
export function statusFilter(raw: string | undefined): string | undefined {
  return raw && (raw in LEAD_STATUS || raw === STALE) ? raw : undefined;
}

export const SEGMENT_NAMES: Record<string, string> = {
  hospitais: "Hospitais",
  industrias: "Indústrias",
  "shopping-centers": "Shopping centers",
  agronegocios: "Agronegócios",
  "predios-corporativos": "Prédios corporativos",
  residencial: "Residencial",
};

/** Período escolhido na barra de cima: 7, 30 ou 90 dias até agora. */
export function periodFrom(value: string | string[] | undefined) {
  const days = [7, 30, 90].includes(Number(value)) ? Number(value) : 30;
  const to = new Date();
  const from = new Date(to.getTime() - days * 86400000);
  const previousFrom = new Date(from.getTime() - days * 86400000);
  return { days, from, to, previousFrom };
}

/** Instante de N dias atrás, em ISO (para filtro de data no banco). */
export const daysAgoIso = (days: number) => new Date(Date.now() - days * 86400000).toISOString();
