import { requireAdmin } from "@/lib/admin/session";
import { csvResponse, localDateTime, toCsv, today } from "@/lib/admin/csv";
import { param, readFilters, searchTerm } from "@/lib/admin/filters";
import { LEAD_STATUS, SEGMENT_NAMES, statusFilter } from "@/lib/admin/format";

interface LeadRow {
  created_at: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  segment: string | null;
  source: string | null;
  campaign: string | null;
  city: string | null;
  region: string | null;
  page: string | null;
  status: string;
  message: string;
  notes: string;
  stale: boolean;
}

/** Planilha dos pedidos, com os mesmos filtros da tela (até 5.000 linhas). */
export async function GET(request: Request) {
  const { supabase } = await requireAdmin();
  const search = Object.fromEntries(new URL(request.url).searchParams);
  const filters = readFilters(search);
  const rawStatus = param(search, "status", 20);
  const days = Number(param(search, "dias", 3));

  const { data, error } = await supabase.rpc("dash_leads", {
    p_from: [7, 30, 90].includes(days) ? new Date(Date.now() - days * 86400000).toISOString() : undefined,
    p_status: statusFilter(rawStatus),
    p_source: filters.origem,
    p_campaign: filters.campanha,
    p_path: filters.pagina,
    p_city: filters.cidade,
    p_search: searchTerm(search).term,
    p_limit: 5000,
  });
  if (error) {
    console.error("[exportar] pedidos", error.code);
    return new Response("Não foi possível gerar a planilha. Tente de novo.", { status: 500 });
  }

  const rows = ((data as { rows: LeadRow[] }).rows ?? []).map((lead) => [
    localDateTime(lead.created_at),
    lead.name,
    lead.company,
    lead.email,
    lead.phone,
    SEGMENT_NAMES[lead.segment ?? ""] ?? "",
    lead.stale ? "Novo (sem resposta)" : (LEAD_STATUS[lead.status]?.label ?? lead.status),
    lead.source ?? "Direto",
    lead.campaign ?? "",
    lead.city ?? "",
    lead.region ?? "",
    lead.page ?? "",
    lead.message,
    lead.notes,
  ]);

  const csv = toCsv(
    [
      "Chegou em",
      "Nome",
      "Empresa",
      "E-mail",
      "Telefone",
      "Segmento",
      "Situação",
      "Origem",
      "Campanha",
      "Cidade",
      "Estado",
      "Página",
      "Mensagem",
      "Anotações",
    ],
    rows,
  );
  return csvResponse(csv, `pedidos-${today()}.csv`);
}
