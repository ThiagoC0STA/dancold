import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/session";
import { formatDateTime, pageName, SEGMENT_NAMES } from "@/lib/admin/format";
import { Empty, StatusTag } from "@/components/admin/ui";
import { IconBack } from "@/components/admin/icons";
import { getPostTitles } from "@/lib/admin/post-titles";
import { Timeline, TIMELINE_COLUMNS, type TimelineEvent } from "@/components/admin/timeline";
import { LeadForm } from "./lead-form";

export const metadata: Metadata = { title: "Pedido" };

const UUID = /^[0-9a-f-]{36}$/i;
const UTM_NAMES: Record<string, string> = {
  utm_source: "Origem do anúncio",
  utm_medium: "Tipo de mídia",
  utm_campaign: "Campanha",
  utm_term: "Palavra buscada",
  utm_content: "Anúncio",
};

export default async function LeadPage({ params }: PageProps<"/admin/pedidos/[id]">) {
  const { id } = await params;
  if (!UUID.test(id)) notFound();
  const { supabase } = await requireAdmin();

  const [{ data: lead }, titles] = await Promise.all([
    supabase.from("leads").select("*").eq("id", id).maybeSingle(),
    getPostTitles(),
  ]);
  if (!lead) notFound();

  const { data: events } = lead.visitor_id
    ? await supabase
        .from("events")
        .select(TIMELINE_COLUMNS)
        .eq("visitor_id", lead.visitor_id)
        .order("created_at", { ascending: true })
        .limit(400)
    : { data: [] };

  const digits = String(lead.phone).replace(/\D/g, "");
  const whatsapp = `https://wa.me/${digits.length <= 11 ? `55${digits}` : digits}`;
  const utm = Object.entries((lead.utm ?? {}) as Record<string, string>);
  const facts = [
    ["Segmento", SEGMENT_NAMES[lead.segment ?? ""] ?? "–"],
    ["Página do pedido", lead.page ? pageName(lead.page, titles) : "–"],
    ["Origem", lead.source ?? "–"],
    ["Cidade", lead.city ? `${lead.city}${lead.region ? `, ${lead.region}` : ""}` : "–"],
    ["Língua", String(lead.lang ?? "pt").toUpperCase()],
    ...utm.map(([key, value]) => [UTM_NAMES[key] ?? key, value]),
    ...(lead.gclid ? [["Clique no Google Ads", "sim"]] : []),
  ];

  return (
    <>
      <Link href="/admin/pedidos" className="adm-btn adm-btn-quiet -ml-3 mb-3">
        <IconBack className="h-4 w-4" />
        Pedidos
      </Link>

      <header className="mb-6 flex flex-wrap items-center gap-x-4 gap-y-2">
        <h1 className="font-display text-[22px] font-semibold leading-tight tracking-tight text-ink">{lead.name}</h1>
        <StatusTag status={lead.status} />
        <p className="w-full text-[13.5px] text-ink-2">
          {lead.company} · chegou em {formatDateTime(lead.created_at)}
        </p>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)]">
        <div className="min-w-0 space-y-5">
          <section className="adm-panel">
            <div className="adm-panel-head">
              <h2>O que pediu</h2>
            </div>
            <p className="whitespace-pre-wrap px-5 pb-5 text-[14.5px] leading-relaxed text-ink">{lead.message}</p>
            <div className="flex flex-wrap gap-2 border-t border-line px-5 py-4">
              <a href={whatsapp} target="_blank" rel="noopener noreferrer" className="adm-btn adm-btn-primary">
                Chamar no WhatsApp
              </a>
              <a href={`mailto:${lead.email}`} className="adm-btn">
                Enviar e-mail
              </a>
              <a href={`tel:${digits}`} className="adm-btn">
                Ligar
              </a>
            </div>
            <dl className="border-t border-line px-5 py-2 text-[13.5px]">
              {[["Telefone", lead.phone], ["E-mail", lead.email], ...facts].map(([label, value]) => (
                <div key={label} className="flex justify-between gap-6 border-b border-line py-2.5 last:border-b-0">
                  <dt className="flex-none text-ink-2">{label}</dt>
                  <dd className="min-w-0 break-words text-right font-medium text-ink">{value}</dd>
                </div>
              ))}
            </dl>
          </section>

          <section className="adm-panel">
            <div className="adm-panel-head">
              <h2>Acompanhamento</h2>
            </div>
            <LeadForm id={lead.id} status={lead.status} notes={lead.notes ?? ""} />
          </section>
        </div>

        <section className="adm-panel">
          <div className="adm-panel-head">
            <h2>O que fez no site</h2>
            {lead.visitor_id && (
              <Link
                href={`/admin/visitantes/${lead.visitor_id}`}
                className="text-[13px] font-semibold text-brand hover:underline"
              >
                Abrir visitante
              </Link>
            )}
          </div>
          {(events ?? []).length === 0 ? (
            <Empty title="Sem registro de navegação">
              O navegador desta pessoa bloqueou o rastreio, ou o pedido chegou antes de ele estar no ar.
            </Empty>
          ) : (
            <Timeline events={(events ?? []) as unknown as TimelineEvent[]} titles={titles} />
          )}
        </section>
      </div>
    </>
  );
}
