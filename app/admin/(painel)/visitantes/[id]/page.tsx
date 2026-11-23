import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/admin/session";
import { formatDateTime, formatDuration, formatNumber } from "@/lib/admin/format";
import { IconBack } from "@/components/admin/icons";
import { getPostTitles } from "@/lib/admin/post-titles";
import { Timeline, TIMELINE_COLUMNS, type TimelineEvent } from "@/components/admin/timeline";

export const metadata: Metadata = { title: "Visitante" };

const ID = /^[a-zA-Z0-9-]{8,40}$/;

export default async function VisitorPage({ params }: PageProps<"/admin/visitantes/[id]">) {
  const { id } = await params;
  if (!ID.test(id)) notFound();
  const { supabase } = await requireAdmin();

  const [{ data }, { data: lead }, titles] = await Promise.all([
    supabase
      .from("events")
      .select(TIMELINE_COLUMNS)
      .eq("visitor_id", id)
      .order("created_at", { ascending: true })
      .limit(600),
    supabase
      .from("leads")
      .select("id,name,company")
      .eq("visitor_id", id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle(),
    getPostTitles(),
  ]);
  const events = (data ?? []) as unknown as TimelineEvent[];
  if (events.length === 0) notFound();

  const first = events[0];
  const last = events[events.length - 1];
  const sessions = new Set(events.map((event) => event.session_id)).size;
  const pages = events.filter((event) => event.type === "pageview").length;
  const seconds = events.reduce((sum, event) => sum + (event.type === "page_exit" ? (event.seconds ?? 0) : 0), 0);
  const facts = [
    ["Primeira visita", formatDateTime(first.created_at)],
    ["Última atividade", formatDateTime(last.created_at)],
    ["Visitas", formatNumber(sessions)],
    ["Páginas vistas", formatNumber(pages)],
    ["Tempo no site", seconds ? formatDuration(seconds) : "–"],
    ["Chegou por", first.source ?? "Direto"],
    ["Aparelho", first.device ?? "–"],
    ["Cidade", first.city ? `${first.city}${first.region ? `, ${first.region}` : ""}` : "–"],
  ];

  return (
    <>
      <Link href="/admin/visitantes" className="adm-btn adm-btn-quiet -ml-3 mb-3">
        <IconBack className="h-4 w-4" />
        Visitantes
      </Link>

      <header className="mb-6">
        <h1 className="font-display text-[22px] font-semibold leading-tight tracking-tight text-ink">
          {lead?.name ?? (first.city ? `Visitante de ${first.city}` : "Visitante")}
        </h1>
        <p className="mt-1 text-[13.5px] text-ink-2">
          {lead ? (
            <>
              {lead.company} · pediu orçamento.{" "}
              <Link href={`/admin/pedidos/${lead.id}`} className="font-semibold text-brand hover:underline">
                Abrir o pedido
              </Link>
            </>
          ) : (
            "Ainda não pediu orçamento. Sem nome nem contato: o site só sabe o que esta pessoa fez."
          )}
        </p>
      </header>

      <div className="grid grid-cols-[minmax(0,1fr)] items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(0,5fr)]">
        <section className="adm-panel">
          <dl className="px-5 py-2 text-[13.5px]">
            {facts.map(([label, value]) => (
              <div key={label} className="flex justify-between gap-6 border-b border-line py-2.5 last:border-b-0">
                <dt className="flex-none text-ink-2">{label}</dt>
                <dd className="min-w-0 break-words text-right font-medium text-ink">{value}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="adm-panel">
          <div className="adm-panel-head">
            <h2>Passo a passo</h2>
            <p>Visita mais recente primeiro</p>
          </div>
          <Timeline events={events} titles={titles} />
        </section>
      </div>
    </>
  );
}
