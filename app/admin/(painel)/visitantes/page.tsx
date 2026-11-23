import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import { formatAgo, formatDuration, formatNumber, pageName, periodFrom } from "@/lib/admin/format";
import { Empty, FilterTags, PageHeader, Pager, PeriodTabs } from "@/components/admin/ui";
import { getPostTitles } from "@/lib/admin/post-titles";
import { redirect } from "next/navigation";
import { hrefWith, lastPage, pageNumber, readFilters } from "@/lib/admin/filters";
import { IconDownload } from "@/components/admin/icons";

export const metadata: Metadata = { title: "Visitantes" };

interface Visitor {
  visitor_id: string;
  first_seen: string;
  last_seen: string;
  sessions: number;
  pageviews: number;
  seconds: number;
  source: string;
  campaign: string | null;
  device: string | null;
  city: string | null;
  region: string | null;
  landing: string | null;
  lead_id: string | null;
  lead_name: string | null;
  lead_company: string | null;
  total: number;
}

const PAGE_SIZE = 50;

export default async function VisitorsPage({ searchParams }: PageProps<"/admin/visitantes">) {
  const { supabase } = await requireAdmin();
  const search = await searchParams;
  const { days, from, to } = periodFrom(search.dias);
  const filters = readFilters(search);
  const page = pageNumber(search);
  const params: Record<string, string | undefined> = { ...filters, dias: days === 30 ? undefined : String(days) };
  const narrowed = Object.keys(filters).length > 0;

  const [{ data, error }, titles] = await Promise.all([
    supabase.rpc("dash_visitors", {
      p_from: from.toISOString(),
      p_to: to.toISOString(),
      p_source: filters.origem,
      p_campaign: filters.campanha,
      p_path: filters.pagina,
      p_city: filters.cidade,
      p_limit: PAGE_SIZE,
      p_offset: (page - 1) * PAGE_SIZE,
    }),
    getPostTitles(),
  ]);
  if (error) throw new Error("Não foi possível carregar os visitantes.");
  const visitors = (data ?? []) as Visitor[];
  // o total vem em cada linha; numa página além do fim não há linha, então pergunta só a contagem
  let total = visitors[0]?.total ?? 0;
  if (!visitors.length && page > 1) {
    const { data: head } = await supabase.rpc("dash_visitors", {
      p_from: from.toISOString(),
      p_to: to.toISOString(),
      p_source: filters.origem,
      p_campaign: filters.campanha,
      p_path: filters.pagina,
      p_city: filters.cidade,
      p_limit: 1,
    });
    total = (head as Visitor[] | null)?.[0]?.total ?? 0;
    // página além da última: volta para a última que existe
    const last = lastPage(total, PAGE_SIZE);
    redirect(hrefWith("/admin/visitantes", { ...params, pg: last > 1 ? last : undefined }));
  }

  return (
    <>
      <PageHeader
        title="Visitantes"
        description="Cada linha é uma pessoa. Quem pediu orçamento aparece primeiro. Abra para ver o passo a passo no site."
      >
        <div className="flex flex-wrap gap-2">
          <PeriodTabs base="/admin/visitantes" days={days} params={filters} />
          <a href={hrefWith("/admin/exportar/visitantes", params)} className="adm-btn" download>
            <IconDownload className="h-4 w-4" />
            Baixar planilha
          </a>
        </div>
      </PageHeader>

      <FilterTags
        base="/admin/visitantes"
        params={params}
        filters={filters}
        pretty={{ pagina: filters.pagina ? pageName(filters.pagina, titles) : undefined }}
      />

      <section className="adm-panel">
        {visitors.length === 0 ? (
          narrowed ? (
            <Empty title="Nenhum visitante com estes filtros neste período">
              Tire um filtro acima ou escolha um período maior.
            </Empty>
          ) : (
            <Empty title="Nenhum visitante neste período">
              As visitas passam a ser registradas assim que esta versão do site for publicada.
            </Empty>
          )
        ) : (
          <div className="overflow-x-auto">
            <table className="adm-table adm-list">
              <thead>
                <tr>
                  <th>Visitante</th>
                  <th className="wide">Origem</th>
                  <th className="wide">Entrou por</th>
                  <th className="num wide">Visitas</th>
                  <th className="num wide">Páginas</th>
                  <th className="num wide">Tempo no site</th>
                  <th className="num">Última visita</th>
                </tr>
              </thead>
              <tbody>
                {visitors.map((visitor) => (
                  <tr key={visitor.visitor_id} className="link">
                    <td className="main">
                      <Link href={`/admin/visitantes/${visitor.visitor_id}`} className="row">
                        {visitor.lead_name ?? (
                          <span className="font-normal text-ink-2">
                            {visitor.city ? `Alguém de ${visitor.city}` : "Visitante sem cidade"}
                          </span>
                        )}
                      </Link>
                      <span className="block truncate text-[13px] font-normal text-ink-3">
                        {visitor.lead_name
                          ? `${visitor.lead_company} · pediu orçamento`
                          : (visitor.device ?? "aparelho desconhecido")}
                        <span className="md:hidden"> · {visitor.source}</span>
                      </span>
                    </td>
                    <td className="wide">
                      {visitor.source}
                      {visitor.campaign && (
                        <span className="block max-w-[180px] truncate text-[13px] text-ink-3" title={visitor.campaign}>
                          {visitor.campaign}
                        </span>
                      )}
                    </td>
                    <td className="wide">
                      <span className="block max-w-[220px] truncate" title={visitor.landing ?? ""}>
                        {visitor.landing ? pageName(visitor.landing, titles) : "–"}
                      </span>
                    </td>
                    <td className="num wide">{formatNumber(visitor.sessions)}</td>
                    <td className="num wide">{formatNumber(visitor.pageviews)}</td>
                    <td className="num wide">{visitor.seconds ? formatDuration(visitor.seconds) : "–"}</td>
                    <td className="num">{formatAgo(visitor.last_seen)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
      <Pager base="/admin/visitantes" params={params} page={page} size={PAGE_SIZE} total={total} noun="visitantes" />
    </>
  );
}
