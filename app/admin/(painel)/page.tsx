import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/admin/session";
import {
  formatAgo,
  formatDuration,
  formatNumber,
  formatPercent,
  pageLang,
  pageName,
  periodFrom,
  SEGMENT_NAMES,
  STALE,
} from "@/lib/admin/format";
import { BarCell, Empty, PageHeader, PeriodTabs, StatusTag } from "@/components/admin/ui";
import { IconArrowDown, IconArrowUp } from "@/components/admin/icons";
import { TrafficChart, type DayPoint } from "@/components/admin/traffic-chart";
import { getPostTitles } from "@/lib/admin/post-titles";
import { hrefWith } from "@/lib/admin/filters";
import { CampaignTable, type CampaignRow } from "@/components/admin/campaign-table";

export const metadata: Metadata = { title: "Visão geral" };

interface Overview {
  totals: {
    visitors: number;
    sessions: number;
    pageviews: number;
    leads: number;
    avg_seconds: number;
    form_starts: number;
    form_submits: number;
    whatsapp_clicks: number;
    video_plays: number;
  };
  days: DayPoint[];
  pages: {
    path: string;
    views: number;
    visitors: number;
    avg_seconds: number;
    avg_scroll: number;
    clicks: number;
    leads: number;
  }[];
  sources: {
    source: string;
    sessions: number;
    visitors: number;
    leads: number;
  }[];
  campaigns: CampaignRow[];
  devices: { device: string; sessions: number }[];
  cities: { city: string; region: string | null; visitors: number }[];
  clicks: { label: string; total: number; visitors: number }[];
  segments: {
    slug: string;
    viewed: number;
    saw_form: number;
    started: number;
    sent: number;
  }[];
}

const FUNNEL_STEPS = [
  { key: "viewed", label: "Viram a página" },
  { key: "saw_form", label: "Viram o formulário" },
  { key: "started", label: "Começaram a preencher" },
  { key: "sent", label: "Enviaram" },
] as const;

/** Comparação com o período anterior, sempre em uma linha. */
function Delta({ now, before, days }: { now: number; before: number; days: number }) {
  // sem base de comparação não há seta: sair do zero não é "100% a mais"
  if (!before) return <span className="block truncate text-ink-3">Sem dados nos {days} dias antes</span>;
  const change = Math.round(((now - before) / before) * 100);
  if (change === 0) return <span className="block truncate text-ink-3">Igual aos {days} dias antes</span>;
  const up = change > 0;
  return (
    <span className="flex items-center gap-1 whitespace-nowrap text-ink-3">
      <span className={`flex items-center font-semibold ${up ? "text-(--ok)" : "text-(--bad)"}`}>
        {up ? <IconArrowUp className="h-3.5 w-3.5" /> : <IconArrowDown className="h-3.5 w-3.5" />}
        {Math.abs(change)}%
      </span>
      <span className="truncate">
        {up ? "acima dos" : "abaixo dos"} {days} dias antes
      </span>
    </span>
  );
}

const GUIDE = [
  {
    title: "Visitantes e pedidos por dia",
    text: "Quantas pessoas entraram no site e em que dias chegou pedido de orçamento.",
  },
  {
    title: "De onde vieram",
    text: "Google, anúncio do Google Ads, Instagram, link direto. E quantos pedidos cada origem trouxe.",
  },
  {
    title: "Páginas",
    text: "Quais páginas foram mais vistas, quanto tempo leram e de qual saiu cada pedido.",
  },
  {
    title: "Campanhas",
    text: "O resultado de cada campanha de anúncio, quando o link dela traz o nome da campanha.",
  },
];

const TODO = [
  {
    title: "Publicar o site novo",
    text: "As visitas só passam a contar na versão do site que tem este painel.",
  },
  {
    title: "Pedir à agência a marcação dos anúncios",
    text: "Marcação automática ligada no Google Ads e nome da campanha no link (utm_campaign).",
  },
  {
    title: "Esperar o primeiro pedido",
    text: "Ele aparece em Pedidos na hora, com o passo a passo da pessoa no site.",
  },
];

interface Stale {
  total: number;
  rows: { id: string; created_at: string; name: string; company: string; source: string | null }[];
}

/** Pedidos Novos que passaram de 1 dia útil sem ninguém mexer: vem antes de tudo. */
function StalePanel({ stale }: { stale: Stale }) {
  const shown = stale.rows.slice(0, 5);
  return (
    <section className="adm-panel mb-5 border-(--bad)">
      <div className="adm-panel-head">
        <h2 className="text-(--bad)">
          {stale.total === 1 ? "1 pedido sem resposta" : `${stale.total} pedidos sem resposta`}
        </h2>
        <Link href={`/admin/pedidos?status=${STALE}`} className="text-[13px] font-semibold text-brand hover:underline">
          Ver {stale.total === 1 ? "o pedido" : "todos"}
        </Link>
      </div>
      <p className="-mt-1 px-5 pb-2 text-[13px] text-ink-2">
        Chegaram há mais de 1 dia útil e continuam como Novo. Abra, fale com a pessoa e mude a situação.
      </p>
      <div className="overflow-x-auto">
        <table className="adm-table adm-list">
          <tbody>
            {shown.map((lead) => (
              <tr key={lead.id} className="link stale">
                <td className="main">
                  <Link href={`/admin/pedidos/${lead.id}`} className="row">
                    {lead.name}
                  </Link>
                  <span className="block truncate font-normal text-ink-3 sm:ml-2 sm:inline">{lead.company}</span>
                </td>
                <td className="end">
                  <span className="text-[13px] text-(--bad)">chegou {formatAgo(lead.created_at)}</span>
                  <span className="block text-[12px] text-ink-3">{lead.source ?? "Direto"}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {stale.total > shown.length && (
        <p className="border-t border-line px-5 py-2.5 text-[13px] text-ink-3">
          E mais {stale.total - shown.length}.{" "}
          <Link href={`/admin/pedidos?status=${STALE}`} className="font-semibold text-brand hover:underline">
            Ver todos
          </Link>
        </p>
      )}
    </section>
  );
}

/** Primeiro acesso: em vez de uma faixa de zeros, o que vai aparecer e o que falta. */
function FirstAccess() {
  return (
    <section className="adm-panel">
      <div className="border-b border-line px-5 py-5">
        <h2 className="text-[16px] font-semibold text-ink">O painel começa a contar quando o site novo for ao ar</h2>
        <p className="mt-1 max-w-[64ch] text-[13.5px] text-ink-2">
          Ainda não há nenhuma visita nem pedido registrado. Esta tela muda sozinha assim que chegar a primeira visita.
        </p>
      </div>
      <div className="grid gap-px bg-line lg:grid-cols-2">
        <div className="bg-surface px-5 py-5">
          <h3 className="text-[13px] font-semibold text-ink-3">O que vai aparecer aqui</h3>
          <ul className="mt-3 space-y-3.5">
            {GUIDE.map((item) => (
              <li key={item.title} className="text-[13.5px]">
                <p className="font-semibold text-ink">{item.title}</p>
                <p className="text-ink-2">{item.text}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="bg-surface px-5 py-5">
          <h3 className="text-[13px] font-semibold text-ink-3">O que falta para começar</h3>
          <ol className="mt-3 space-y-3.5">
            {TODO.map((item, index) => (
              <li key={item.title} className="flex gap-3 text-[13.5px]">
                <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-surface-2 text-[12px] font-semibold text-ink">
                  {index + 1}
                </span>
                <span>
                  <span className="block font-semibold text-ink">{item.title}</span>
                  <span className="text-ink-2">{item.text}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </section>
  );
}

export default async function OverviewPage({ searchParams }: PageProps<"/admin">) {
  const { supabase } = await requireAdmin();
  const { days, from, to, previousFrom } = periodFrom((await searchParams).dias);

  const [current, previous, recent, anyEvent, titles, stale] = await Promise.all([
    supabase.rpc("dash_overview", {
      p_from: from.toISOString(),
      p_to: to.toISOString(),
    }),
    supabase.rpc("dash_overview", {
      p_from: previousFrom.toISOString(),
      p_to: from.toISOString(),
    }),
    supabase
      .from("leads")
      .select("id,created_at,name,company,segment,source,status")
      .order("created_at", { ascending: false })
      .limit(6),
    supabase.from("events").select("id").limit(1),
    getPostTitles(),
    supabase.rpc("dash_stale"),
  ]);
  if (current.error) throw new Error("Não foi possível carregar os números.");

  // Visitantes já abre em 30 dias; Pedidos abre com tudo, então lá o período vai sempre
  const visitorsHref = (filter: Record<string, string>) =>
    hrefWith("/admin/visitantes", {
      ...filter,
      dias: days === 30 ? undefined : days,
    });
  const leadsHref = (filter: Record<string, string>) => hrefWith("/admin/pedidos", { ...filter, dias: days });

  const data = current.data as Overview;
  const before = (previous.data as Overview | null)?.totals;
  const t = data.totals;
  const hasVisits = t.pageviews > 0;
  const firstAccess = (anyEvent.data ?? []).length === 0 && (recent.data ?? []).length === 0;
  const waiting = (stale.data as Stale | null) ?? { total: 0, rows: [] };
  const staleIds = new Set(waiting.rows.map((lead) => lead.id));
  const maxSource = Math.max(...data.sources.map((s) => s.sessions), 1);
  const maxPage = Math.max(...data.pages.map((p) => p.views), 1);
  const maxClick = Math.max(...data.clicks.map((c) => c.total), 1);
  const totalDevices = data.devices.reduce((sum, d) => sum + d.sessions, 0);

  const metrics = [
    {
      label: "Visitantes",
      value: formatNumber(t.visitors),
      now: t.visitors,
      before: before?.visitors ?? 0,
      href: visitorsHref({}),
    },
    {
      label: "Pedidos de orçamento",
      value: formatNumber(t.leads),
      now: t.leads,
      before: before?.leads ?? 0,
      href: leadsHref({}),
    },
    {
      label: "Visitantes que pediram orçamento",
      value: formatPercent(t.leads, t.visitors),
      now: t.visitors ? t.leads / t.visitors : 0,
      before: before?.visitors ? before.leads / before.visitors : 0,
    },
    {
      label: "Tempo médio por visita",
      value: formatDuration(t.avg_seconds),
      now: t.avg_seconds,
      before: before?.avg_seconds ?? 0,
    },
  ];

  const funnel = [
    { label: "Visitaram o site", value: t.sessions },
    { label: "Começaram a preencher o pedido", value: t.form_starts },
    {
      label: "Enviaram o pedido",
      value: Math.max(t.form_submits, Math.min(t.leads, t.form_starts)),
    },
  ];

  return (
    <>
      <PageHeader title="Visão geral" description={`O que aconteceu no site nos últimos ${days} dias.`}>
        <PeriodTabs base="/admin" days={days} />
      </PageHeader>

      {firstAccess && <FirstAccess />}

      {!firstAccess && (
        <>
          {waiting.total > 0 && <StalePanel stale={waiting} />}

          <section aria-label="Resumo" className="adm-panel grid sm:grid-cols-2 xl:grid-cols-4">
            {metrics.map((metric, index) => (
              <div
                key={metric.label}
                className={`px-5 py-4 ${index > 0 ? "border-t border-line sm:border-t-0" : ""} ${
                  index % 2 === 1 ? "sm:border-l" : ""
                } ${index >= 2 ? "sm:border-t xl:border-t-0" : ""} ${index > 0 ? "xl:border-l" : ""} border-line`}
              >
                <p className="text-[13px] text-ink-2">{metric.label}</p>
                <p className="mt-1 font-display text-[28px] font-semibold leading-none tracking-tight text-ink">
                  {"href" in metric && metric.href ? (
                    <Link href={metric.href} className="hover:text-brand hover:underline">
                      {metric.value}
                    </Link>
                  ) : (
                    metric.value
                  )}
                </p>
                <div className="mt-2.5 text-[12.5px]">
                  <Delta now={metric.now} before={metric.before} days={days} />
                </div>
              </div>
            ))}
          </section>

          {!hasVisits ? (
            <div className="adm-panel mt-5">
              <Empty title="Ainda não há visitas registradas neste período">
                O site passa a registrar cada visita, clique e pedido assim que esta versão for publicada. Os números
                aparecem aqui sozinhos.
              </Empty>
            </div>
          ) : (
            <>
              <section className="adm-panel mt-5">
                <div className="adm-panel-head">
                  <h2 className="truncate">Visitantes e pedidos por dia</h2>
                  <p className="hidden whitespace-nowrap sm:block">{formatNumber(t.pageviews)} páginas vistas</p>
                </div>
                <TrafficChart days={data.days} />
              </section>

              <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
                <section className="adm-panel">
                  <div className="adm-panel-head">
                    <h2>De onde vieram</h2>
                    <p>Anúncio do Google aparece como Google Ads</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>Origem</th>
                          <th className="num">Visitas</th>
                          <th className="num">Pedidos</th>
                          <th className="num wide">Viraram pedido</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.sources.map((source) => (
                          <tr key={source.source}>
                            <td className="main">
                              <Link href={visitorsHref({ origem: source.source })} className="go">
                                {source.source}
                              </Link>
                            </td>
                            <td className="num">
                              <BarCell value={source.sessions} max={maxSource} label={formatNumber(source.sessions)} />
                            </td>
                            <td className={`num ${source.leads ? "font-semibold text-accent" : ""}`}>
                              <Link href={leadsHref({ origem: source.source })} className="go">
                                {formatNumber(source.leads)}
                              </Link>
                            </td>
                            <td className="num wide">{formatPercent(source.leads, source.sessions)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>

                <section className="adm-panel">
                  <div className="adm-panel-head">
                    <h2>Do site ao pedido</h2>
                  </div>
                  <ol className="space-y-4 px-5 pb-5">
                    {funnel.map((step, index) => (
                      <li key={step.label}>
                        <div className="flex items-baseline justify-between gap-3 text-[13.5px]">
                          <span className="text-ink-2">{step.label}</span>
                          <span className="font-semibold text-ink">
                            {formatNumber(step.value)}
                            {index > 0 && (
                              <span className="ml-2 font-normal text-ink-3">
                                {formatPercent(step.value, funnel[0].value)}
                              </span>
                            )}
                          </span>
                        </div>
                        <div className="adm-bar mt-2 h-2">
                          <span
                            style={{
                              width: `${funnel[0].value ? Math.max(1.5, (step.value / funnel[0].value) * 100) : 0}%`,
                              background: index === 2 ? "var(--color-accent)" : undefined,
                            }}
                          />
                        </div>
                      </li>
                    ))}
                  </ol>
                  <dl className="grid grid-cols-2 border-t border-line text-[13.5px]">
                    <div className="px-5 py-3.5">
                      <dt className="text-ink-2">Cliques no WhatsApp</dt>
                      <dd className="mt-0.5 text-[18px] font-semibold text-ink">{formatNumber(t.whatsapp_clicks)}</dd>
                    </div>
                    <div className="border-l border-line px-5 py-3.5">
                      <dt className="text-ink-2">Plays no vídeo</dt>
                      <dd className="mt-0.5 text-[18px] font-semibold text-ink">{formatNumber(t.video_plays)}</dd>
                    </div>
                  </dl>
                </section>
              </div>

              <section className="adm-panel mt-5">
                <div className="adm-panel-head">
                  <h2>Páginas</h2>
                  <p>Quanto cada página foi vista, lida e quantos pedidos saíram dela</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="adm-table">
                    <thead>
                      <tr>
                        <th>Página</th>
                        <th className="num">Visualizações</th>
                        <th className="num wide">Visitantes</th>
                        <th className="num wide">Tempo médio</th>
                        <th className="num wide">Leram até</th>
                        <th className="num wide">Cliques</th>
                        <th className="num">Pedidos</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.pages.map((page) => (
                        <tr key={page.path}>
                          <td className="main">
                            <Link
                              href={visitorsHref({ pagina: page.path })}
                              className="go line-clamp-2 max-w-[150px] sm:block sm:max-w-[340px] sm:truncate"
                              title={page.path}
                            >
                              {pageName(page.path, titles)}
                              {pageLang(page.path) && <span className="adm-tag ml-2">{pageLang(page.path)}</span>}
                            </Link>
                          </td>
                          <td className="num">
                            <BarCell value={page.views} max={maxPage} label={formatNumber(page.views)} />
                          </td>
                          <td className="num wide">{formatNumber(page.visitors)}</td>
                          <td className="num wide">{page.avg_seconds ? formatDuration(page.avg_seconds) : "–"}</td>
                          <td className="num wide">{page.avg_seconds ? `${page.avg_scroll}%` : "–"}</td>
                          <td className="num wide">{formatNumber(page.clicks)}</td>
                          <td className={`num ${page.leads ? "font-semibold text-accent" : ""}`}>
                            <Link href={leadsHref({ pagina: page.path })} className="go">
                              {formatNumber(page.leads)}
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>

              {data.segments.length > 0 && (
                <section className="adm-panel mt-5">
                  <div className="adm-panel-head">
                    <h2>Funil das páginas de segmento</h2>
                    <p>Visitas que passaram por cada etapa, em % de quem viu a página</p>
                  </div>
                  {/* bordas por cartão (e não fundo de grade) para não sobrar bloco cinza na última linha */}
                  <div className="overflow-hidden rounded-b-[10px] border-t border-line">
                    <ul
                      className={`-mb-px -mr-px grid ${data.segments.length > 1 ? "sm:grid-cols-2" : ""} ${data.segments.length > 2 ? "xl:grid-cols-3" : ""}`}
                    >
                      {data.segments.map((segment) => (
                        <li key={segment.slug} className="border-b border-r border-line px-5 py-4">
                          <div className="flex items-baseline justify-between gap-3">
                            <h3 className="truncate text-[14px] font-semibold text-ink">
                              {SEGMENT_NAMES[segment.slug] ?? segment.slug}
                            </h3>
                            <Link
                              href={leadsHref({
                                pagina: `/pt/segmentos/${segment.slug}`,
                              })}
                              className="whitespace-nowrap text-[12.5px] font-semibold text-brand hover:underline"
                            >
                              Pedidos
                            </Link>
                          </div>
                          <ol className="mt-3 space-y-2.5">
                            {FUNNEL_STEPS.map((step, index) => {
                              const value = segment[step.key];
                              return (
                                <li key={step.key}>
                                  <div className="flex items-baseline justify-between gap-3 text-[13px]">
                                    <span className="text-ink-2">{step.label}</span>
                                    <span className="whitespace-nowrap font-semibold text-ink">
                                      {formatNumber(value)}
                                      {index > 0 && (
                                        <span className="ml-1.5 font-normal text-ink-3">
                                          {formatPercent(value, segment.viewed)}
                                        </span>
                                      )}
                                    </span>
                                  </div>
                                  <div className="adm-bar mt-1.5 h-1.5">
                                    <span
                                      style={{
                                        width: `${segment.viewed ? Math.max(value ? 1.5 : 0, (value / segment.viewed) * 100) : 0}%`,
                                        background: index === 3 ? "var(--color-accent)" : undefined,
                                      }}
                                    />
                                  </div>
                                </li>
                              );
                            })}
                          </ol>
                        </li>
                      ))}
                    </ul>
                  </div>
                </section>
              )}

              <section className="adm-panel mt-5">
                <div className="adm-panel-head">
                  <h2>Campanhas</h2>
                </div>
                {data.campaigns.length === 0 ? (
                  <Empty title="Nenhuma campanha identificada">
                    Uma campanha aparece aqui quando o link do anúncio traz o nome dela (utm_campaign). Peça à agência
                    para pôr o nome no fim do link.
                  </Empty>
                ) : (
                  <CampaignTable rows={data.campaigns.slice(0, 8)} days={days} />
                )}
              </section>

              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                <section className="adm-panel">
                  <div className="adm-panel-head">
                    <h2>O que mais clicaram</h2>
                  </div>
                  {data.clicks.length === 0 ? (
                    <Empty title="Nenhum clique registrado" />
                  ) : (
                    <table className="adm-table">
                      <thead>
                        <tr>
                          <th>Botão ou link</th>
                          <th className="num">Cliques</th>
                          <th className="num wide">Pessoas</th>
                        </tr>
                      </thead>
                      <tbody>
                        {data.clicks.map((click) => (
                          <tr key={click.label}>
                            <td className="main">
                              <span className="block max-w-[170px] truncate sm:max-w-[260px]" title={click.label}>
                                {click.label}
                              </span>
                            </td>
                            <td className="num">
                              <BarCell value={click.total} max={maxClick} label={formatNumber(click.total)} />
                            </td>
                            <td className="num wide">{formatNumber(click.visitors)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </section>
                <div className="space-y-5">
                  <section className="adm-panel">
                    <div className="adm-panel-head">
                      <h2>Cidades</h2>
                    </div>
                    {data.cities.length === 0 ? (
                      <Empty title="Sem cidade identificada ainda" />
                    ) : (
                      <table className="adm-table">
                        <tbody>
                          {data.cities.map((city) => (
                            <tr key={`${city.city}-${city.region}`}>
                              <td className="main">
                                <Link href={visitorsHref({ cidade: city.city })} className="go">
                                  {city.city}
                                </Link>
                                {city.region && <span className="ml-2 font-normal text-ink-3">{city.region}</span>}
                              </td>
                              <td className="num">{formatNumber(city.visitors)} visitantes</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </section>

                  <section className="adm-panel">
                    <div className="adm-panel-head">
                      <h2>Aparelhos</h2>
                    </div>
                    <ul className="space-y-4 px-5 pb-5">
                      {data.devices.map((device) => (
                        <li key={device.device}>
                          <div className="flex justify-between text-[13.5px]">
                            <span className="capitalize text-ink-2">{device.device}</span>
                            <span className="font-semibold text-ink">
                              {formatPercent(device.sessions, totalDevices)}
                            </span>
                          </div>
                          <div className="adm-bar mt-2">
                            <span
                              style={{
                                width: `${totalDevices ? (device.sessions / totalDevices) * 100 : 0}%`,
                              }}
                            />
                          </div>
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </div>
            </>
          )}

          <section className="adm-panel mt-5">
            <div className="adm-panel-head">
              <h2>Últimos pedidos</h2>
              <Link href="/admin/pedidos" className="text-[13px] font-semibold text-brand hover:underline">
                Ver todos
              </Link>
            </div>
            {(recent.data ?? []).length === 0 ? (
              <Empty title="Nenhum pedido de orçamento ainda">
                Quando alguém preencher o formulário de orçamento do site, o pedido aparece aqui.
              </Empty>
            ) : (
              <div className="overflow-x-auto">
                <table className="adm-table adm-list">
                  <tbody>
                    {(recent.data ?? []).map((lead) => (
                      <tr key={lead.id} className={staleIds.has(lead.id) ? "link stale" : "link"}>
                        <td className="main">
                          <Link href={`/admin/pedidos/${lead.id}`} className="row">
                            {lead.name}
                          </Link>
                          <span className="block truncate font-normal text-ink-3 sm:ml-2 sm:inline">
                            {lead.company}
                            <span className="md:hidden"> · {formatAgo(lead.created_at)}</span>
                          </span>
                        </td>
                        <td className="wide">{SEGMENT_NAMES[lead.segment ?? ""] ?? "–"}</td>
                        <td className="wide">{lead.source ?? "–"}</td>
                        <td className="num wide">{formatAgo(lead.created_at)}</td>
                        <td className="end">
                          <StatusTag status={lead.status} stale={staleIds.has(lead.id)} />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </>
      )}
    </>
  );
}
