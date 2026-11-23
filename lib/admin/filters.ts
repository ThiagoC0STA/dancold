/**
 * Filtros das listas do painel, todos pela URL (dá para copiar e mandar o link):
 * ?origem=Google Ads&campanha=hospitais-sul&pagina=/pt/segmentos/hospitais&cidade=Curitiba
 * O valor só é usado como parâmetro de função do banco, nunca montado em SQL.
 */

export const FILTER_KEYS = ["origem", "campanha", "pagina", "cidade"] as const;
export type FilterKey = (typeof FILTER_KEYS)[number];
export type Filters = Partial<Record<FilterKey, string>>;

export const FILTER_LABELS: Record<FilterKey, string> = {
  origem: "Origem",
  campanha: "Campanha",
  pagina: "Página",
  cidade: "Cidade",
};

type Search = Record<string, string | string[] | undefined>;

// byte nulo e outros caracteres de controle: o banco recusa e ninguém digita
const CONTROL = /[\u0000-\u001f\u007f-\u009f]/g;

/**
 * Lê um parâmetro de texto da URL: sem caractere de controle, espaços repetidos
 * viram um só, cortado no tamanho. Toda tela e toda exportação lê por aqui.
 */
export function param(search: Search, key: string, max = 300): string | undefined {
  const raw = search[key];
  const value = (Array.isArray(raw) ? raw[0] : raw)
    ?.replace(CONTROL, "")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, max);
  return value || undefined;
}

export const MIN_SEARCH = 3;

/** Busca de Pedidos: com menos de 3 letras ou números não busca e avisa. */
export function searchTerm(search: Search): { term?: string; tooShort?: string } {
  const value = param(search, "busca", 100);
  if (!value) return {};
  return value.replace(/[^\p{L}\p{N}]/gu, "").length < MIN_SEARCH ? { tooShort: value } : { term: value };
}

export function readFilters(search: Search): Filters {
  const filters: Filters = {};
  for (const key of FILTER_KEYS) {
    const value = param(search, key, key === "pagina" ? 300 : 160);
    // página do site sempre começa com "/": o resto é ignorado
    if (value && (key !== "pagina" || value.startsWith("/"))) filters[key] = value;
  }
  return filters;
}

/** Número da página da lista (?pg=2), a partir de 1. Texto, zero ou negativo vira 1. */
export function pageNumber(search: Search): number {
  const value = Number(param(search, "pg", 6));
  return Number.isInteger(value) && value > 1 && value < 100000 ? value : 1;
}

/** Última página que existe para o total (pelo menos 1). */
export const lastPage = (total: number, size: number) => Math.max(1, Math.ceil(total / size));

/** Monta o endereço com os parâmetros dados, pulando os vazios. */
export function hrefWith(base: string, params: Record<string, string | number | undefined | null>): string {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  }
  const text = query.toString();
  return text ? `${base}?${text}` : base;
}
