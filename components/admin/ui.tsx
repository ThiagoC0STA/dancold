import Link from "next/link";
import { LEAD_STATUS } from "@/lib/admin/format";
import { FILTER_KEYS, FILTER_LABELS, hrefWith, type Filters } from "@/lib/admin/filters";
import { IconClose } from "./icons";

export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
      <div className="min-w-0">
        <h1 className="font-display text-[22px] font-semibold leading-tight tracking-tight text-ink">{title}</h1>
        {description && <p className="mt-1 max-w-[62ch] text-[13.5px] text-ink-2">{description}</p>}
      </div>
      {children}
    </header>
  );
}

/** Seletor de período. Mantém a página e os filtros, troca só o ?dias= (e volta para a página 1). */
export function PeriodTabs({
  base,
  days,
  params = {},
}: {
  base: string;
  days: number;
  params?: Record<string, string | undefined>;
}) {
  return (
    <div className="adm-seg" role="group" aria-label="Período">
      {[7, 30, 90].map((option) => (
        <Link
          key={option}
          href={hrefWith(base, { ...params, dias: option === 30 ? undefined : option })}
          aria-current={option === days ? "true" : undefined}
          scroll={false}
        >
          {option} dias
        </Link>
      ))}
    </div>
  );
}

/** Situação do pedido. Novo que passou do prazo de 1 dia útil vira "Sem resposta". */
export function StatusTag({ status, stale = false }: { status: string; stale?: boolean }) {
  const info = stale ? { label: "Sem resposta", tone: "late" } : (LEAD_STATUS[status] ?? { label: status, tone: "" });
  return (
    <span className="adm-tag" data-tone={info.tone || undefined}>
      {info.label}
    </span>
  );
}

export function Empty({ title, children }: { title: string; children?: React.ReactNode }) {
  return (
    <div className="px-5 py-10 text-center">
      <p className="text-[14px] font-semibold text-ink">{title}</p>
      {children && <p className="mx-auto mt-1.5 max-w-[52ch] text-[13.5px] text-ink-2">{children}</p>}
    </div>
  );
}

/** Célula com número e barra proporcional ao maior valor da coluna. */
export function BarCell({ value, max, label }: { value: number; max: number; label: string }) {
  return (
    <div className="flex items-center justify-end gap-3">
      <div className="adm-bar hidden w-20 sm:block" aria-hidden>
        <span style={{ width: `${max ? Math.max(3, (value / max) * 100) : 0}%` }} />
      </div>
      <span className="w-12 text-right text-ink">{label}</span>
    </div>
  );
}

/**
 * Filtros ligados, como etiquetas: o × tira só aquele filtro.
 * `extra` são etiquetas de fora da lista padrão (busca, período).
 */
export function FilterTags({
  base,
  params,
  filters,
  extra = [],
  pretty = {},
}: {
  base: string;
  params: Record<string, string | undefined>;
  filters: Filters;
  extra?: { key: string; label: string }[];
  pretty?: Partial<Record<string, string>>;
}) {
  const tags = [
    ...FILTER_KEYS.filter((key) => filters[key]).map((key) => ({
      key,
      label: `${FILTER_LABELS[key]}: ${pretty[key] ?? filters[key]}`,
    })),
    ...extra,
  ];
  if (tags.length === 0) return null;
  const keep = Object.fromEntries(Object.entries(params).filter(([key]) => !tags.some((tag) => tag.key === key)));

  return (
    <div className="mb-4 flex flex-wrap items-center gap-2" aria-label="Filtros ligados">
      {tags.map((tag) => (
        <Link
          key={tag.key}
          href={hrefWith(base, { ...params, [tag.key]: undefined, pg: undefined })}
          scroll={false}
          className="adm-chip"
          title="Tirar este filtro"
        >
          <span className="truncate">{tag.label}</span>
          <IconClose className="h-3.5 w-3.5" />
          <span className="sr-only">(tirar)</span>
        </Link>
      ))}
      {tags.length > 1 && (
        <Link href={hrefWith(base, { ...keep, pg: undefined })} scroll={false} className="text-[13px] font-semibold text-brand hover:underline">
          Tirar todos
        </Link>
      )}
    </div>
  );
}

/** Anterior / próxima, com "51 a 100 de 230". */
export function Pager({
  base,
  params,
  page,
  size,
  total,
  noun,
}: {
  base: string;
  params: Record<string, string | undefined>;
  page: number;
  size: number;
  total: number;
  noun: string;
}) {
  if (total <= size && page === 1) return null;
  const first = (page - 1) * size + 1;
  const last = Math.min(total, page * size);
  const pages = Math.max(1, Math.ceil(total / size));
  const link = (target: number) => hrefWith(base, { ...params, pg: target > 1 ? target : undefined });

  return (
    <nav className="mt-3 flex flex-wrap items-center justify-between gap-3" aria-label="Páginas da lista">
      <p className="adm-hint">
        {total === 0 ? `Nenhum ${noun} nesta página` : `${first} a ${last} de ${total} ${noun}`}
      </p>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link href={link(page - 1)} className="adm-btn">
            Anterior
          </Link>
        ) : (
          <span className="adm-btn opacity-50" aria-disabled="true">
            Anterior
          </span>
        )}
        {page < pages ? (
          <Link href={link(page + 1)} className="adm-btn">
            Próxima
          </Link>
        ) : (
          <span className="adm-btn opacity-50" aria-disabled="true">
            Próxima
          </span>
        )}
      </div>
    </nav>
  );
}
