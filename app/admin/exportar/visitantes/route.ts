import { requireAdmin } from "@/lib/admin/session";
import { csvResponse, localDateTime, toCsv, today } from "@/lib/admin/csv";
import { readFilters } from "@/lib/admin/filters";
import { pageName, periodFrom } from "@/lib/admin/format";
import { getPostTitles } from "@/lib/admin/post-titles";

interface VisitorRow {
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
  lead_name: string | null;
  lead_company: string | null;
}

/** Planilha dos visitantes do período, com os mesmos filtros da tela (até 5.000 linhas). */
export async function GET(request: Request) {
  const { supabase } = await requireAdmin();
  const search = Object.fromEntries(new URL(request.url).searchParams);
  const filters = readFilters(search);
  const { from, to } = periodFrom(search.dias);

  const [{ data, error }, titles] = await Promise.all([
    supabase.rpc("dash_visitors", {
      p_from: from.toISOString(),
      p_to: to.toISOString(),
      p_source: filters.origem,
      p_campaign: filters.campanha,
      p_path: filters.pagina,
      p_city: filters.cidade,
      p_limit: 5000,
    }),
    getPostTitles(),
  ]);
  if (error) {
    console.error("[exportar] visitantes", error.code);
    return new Response("Não foi possível gerar a planilha. Tente de novo.", { status: 500 });
  }

  const rows = ((data ?? []) as VisitorRow[]).map((visitor) => [
    localDateTime(visitor.first_seen),
    localDateTime(visitor.last_seen),
    visitor.lead_name ?? "",
    visitor.lead_company ?? "",
    visitor.source,
    visitor.campaign ?? "",
    visitor.landing ? pageName(visitor.landing, titles) : "",
    visitor.sessions,
    visitor.pageviews,
    visitor.seconds,
    visitor.device ?? "",
    visitor.city ?? "",
    visitor.region ?? "",
  ]);

  const csv = toCsv(
    [
      "Primeira visita",
      "Última visita",
      "Nome (pediu orçamento)",
      "Empresa",
      "Origem",
      "Campanha",
      "Entrou por",
      "Visitas",
      "Páginas vistas",
      "Segundos no site",
      "Aparelho",
      "Cidade",
      "Estado",
    ],
    rows,
  );
  return csvResponse(csv, `visitantes-${today()}.csv`);
}
