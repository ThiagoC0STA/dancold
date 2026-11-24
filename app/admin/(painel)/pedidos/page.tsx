import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { daysAgoIso, formatDateTime, LEAD_STATUS, pageName, SEGMENT_NAMES, STALE, statusFilter } from "@/lib/admin/format";
import { redirect } from "next/navigation";
import { hrefWith, lastPage, MIN_SEARCH, pageNumber, param, readFilters, searchTerm } from "@/lib/admin/filters";
import { Empty, FilterTags, PageHeader, Pager, StatusTag } from "@/components/admin/ui";
import { LinkSelect } from "@/components/admin/link-select";
import { IconDownload, IconSearch } from "@/components/admin/icons";
import { getPostTitles } from "@/lib/admin/post-titles";

export const metadata: Metadata = { title: "Pedidos" };

const PAGE_SIZE = 50;

interface LeadRow {
  id: string;
  created_at: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  segment: string | null;
  source: string | null;
  city: string | null;
  status: string;
  campaign: string | null;
  stale: boolean;
}

interface LeadList {
  all: number;
  total: number;
  counts: Record<string, number>;
  rows: LeadRow[];
}

export default async function LeadsPage({ searchParams }: PageProps<"/admin/pedidos">) {
  const { supabase } = await requireAdmin();
  const search = await searchParams;
  const status = statusFilter(param(search, "status", 20));
  const filters = readFilters(search);
  const { term, tooShort } = searchTerm(search);
  const rawDays = Number(param(search, "dias", 3));
  const days = [7, 30, 90].includes(rawDays) ? rawDays : undefined;
  const page = pageNumber(search);

  // tudo que define a lista, menos a página: vai junto em todo link desta tela
  const params: Record<string, string | undefined> = {
    status,
    ...filters,
    busca: term,
    dias: days ? String(days) : undefined,
  };

  const [{ data, error }, titles] = await Promise.all([
    supabase.rpc("dash_leads", {
      p_from: days ? daysAgoIso(days) : undefined,
      p_status: status,
      p_source: filters.origem,
      p_campaign: filters.campanha,
      p_path: filters.pagina,
      p_city: filters.cidade,
      p_search: term,
      p_limit: PAGE_SIZE,
      p_offset: (page - 1) * PAGE_SIZE,
    }),
    getPostTitles(),
  ]);
  if (error) throw new Error("Não foi possível carregar os pedidos.");

  const list = data as LeadList;
  // página além da última (lista encolheu, link velho): volta para a última que existe
  const last = lastPage(list.total, PAGE_SIZE);
  if (page > last) redirect(hrefWith("/admin/pedidos", { ...params, pg: last > 1 ? last : undefined }));
  const leads = list.rows;
  const narrowed = Boolean(term || days || Object.keys(filters).length);
  const statusHref = (value?: string) => hrefWith("/admin/pedidos", { ...params, status: value });
  // "Sem resposta" entra logo depois de "Novo": é um pedaço dele que já passou do prazo
  const tabs = Object.entries(LEAD_STATUS).flatMap(([value, info]) =>
    value === "novo" ? [{ value, label: info.label }, { value: STALE, label: "Sem resposta" }] : [{ value, label: info.label }],
  );

  return (
    <>
      <PageHeader
        title="Pedidos de orçamento"
        description="Tudo que chegou pelo formulário do site. Abra um pedido para ver o que a pessoa fez antes de enviar."
      >
        <a href={hrefWith("/admin/exportar/pedidos", params)} className="adm-btn" download>
          <IconDownload className="h-4 w-4" />
          Baixar planilha
        </a>
      </PageHeader>

      <form action="/admin/pedidos" className="mb-4 flex gap-2" role="search">
        {Object.entries(params).map(([key, value]) =>
          key !== "busca" && value ? <input key={key} type="hidden" name={key} value={value} /> : null,
        )}
        <label className="relative min-w-0 flex-1">
          <span className="sr-only">Buscar pedido</span>
          <IconSearch className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" />
          <input
            type="search"
            name="busca"
            defaultValue={term ?? tooShort}
            maxLength={100}
            placeholder="Nome, empresa, e-mail, telefone"
            className="adm-input mt-0 h-10"
            // o padding do .adm-input ganha das classes utilitárias
            style={{ paddingLeft: "2.25rem" }}
          />
        </label>
        <button type="submit" className="adm-btn h-10">
          Buscar
        </button>
      </form>

      {tooShort && (
        <p role="status" className="mb-4 text-[13px] text-(--warn)">
          Digite pelo menos {MIN_SEARCH} letras ou números para buscar.
        </p>
      )}

      <FilterTags
        base="/admin/pedidos"
        params={params}
        filters={filters}
        pretty={{ pagina: filters.pagina ? pageName(filters.pagina, titles) : undefined }}
        extra={[
          ...(term ? [{ key: "busca", label: `Busca: ${term}` }] : []),
          ...(days ? [{ key: "dias", label: `Últimos ${days} dias` }] : []),
        ]}
      />

      <LinkSelect
        label="Filtrar por situação"
        className="mb-4 md:hidden"
        value={statusHref(status)}
        options={[
          { href: statusHref(), label: `Todos (${list.all})` },
          ...tabs.map((tab) => ({
            href: statusHref(tab.value),
            label: `${tab.label} (${list.counts[tab.value] ?? 0})`,
          })),
        ]}
      />
      <div className="mb-4 hidden md:block">
        <div className="adm-seg" role="group" aria-label="Filtrar por situação">
          <Link href={statusHref()} aria-current={!status ? "true" : undefined} scroll={false}>
            Todos <span className="text-ink-3">{list.all}</span>
          </Link>
          {tabs.map((tab) => (
            <Link
              key={tab.value}
              href={statusHref(tab.value)}
              aria-current={status === tab.value ? "true" : undefined}
              scroll={false}
            >
              {tab.label}{" "}
              <span className={tab.value === STALE && list.counts[STALE] ? "font-semibold text-(--bad)" : "text-ink-3"}>
                {list.counts[tab.value] ?? 0}
              </span>
            </Link>
          ))}
        </div>
      </div>

      <section className="adm-panel">
        {leads.length === 0 ? (
          <Empty
            title={
              term
                ? `Nenhum pedido com “${term}”`
                : narrowed || status
                  ? "Nenhum pedido com estes filtros"
                  : "Nenhum pedido de orçamento ainda"
            }
          >
            {narrowed || status
              ? "Tire um filtro acima para ver mais pedidos."
              : "Quando alguém preencher o formulário de orçamento do site, o pedido aparece aqui na hora."}
          </Empty>
        ) : (
          <div className="overflow-x-auto">
            <table className="adm-table adm-list">
              <thead>
                <tr>
                  <th>Quem pediu</th>
                  <th className="wide">Contato</th>
                  <th className="wide">Segmento</th>
                  <th className="wide">Origem</th>
                  <th className="num wide">Chegou em</th>
                  <th className="end">Situação</th>
                </tr>
              </thead>
              <tbody>
                {leads.map((lead) => (
                  <tr key={lead.id} className={lead.stale ? "link stale" : "link"}>
                    <td className="main">
                      <Link href={`/admin/pedidos/${lead.id}`} className="row">
                        {lead.name}
                      </Link>
                      <span className="block truncate text-[13px] font-normal text-ink-3">{lead.company}</span>
                    </td>
                    <td className="wide">
                      {lead.phone}
                      <span className="block text-[13px] text-ink-3">{lead.email}</span>
                    </td>
                    <td className="wide">{SEGMENT_NAMES[lead.segment ?? ""] ?? "–"}</td>
                    <td className="wide">
                      {lead.source ?? "Direto"}
                      {(lead.campaign || lead.city) && (
                        <span className="block max-w-[200px] truncate text-[13px] text-ink-3">
                          {[lead.campaign, lead.city].filter(Boolean).join(" · ")}
                        </span>
                      )}
                    </td>
                    <td className="num wide">{formatDateTime(lead.created_at)}</td>
                    <td className="end">
                      <StatusTag status={lead.status} stale={lead.stale} />
                      <span className="mt-1 block text-[12px] text-ink-3 md:hidden">
                        {formatDateTime(lead.created_at)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <Pager base="/admin/pedidos" params={params} page={page} size={PAGE_SIZE} total={list.total} noun="pedidos" />
    </>
  );
}
