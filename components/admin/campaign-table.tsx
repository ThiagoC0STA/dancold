import Link from "next/link";
import { formatNumber } from "@/lib/admin/format";
import { hrefWith } from "@/lib/admin/filters";

export interface CampaignRow {
  campaign: string;
  source: string | null;
  sessions: number;
  leads: number;
  won: number;
}

/**
 * Tabela de campanhas do período: visitas, pedidos e fechados. Cada número leva
 * para a lista filtrada daquela campanha.
 */
export function CampaignTable({ rows, days }: { rows: CampaignRow[]; days: number }) {
  // Visitantes já abre em 30 dias; Pedidos abre com tudo, então lá o período vai sempre
  const dias = days === 30 ? undefined : days;

  return (
    <div className="overflow-x-auto">
      <table className="adm-table">
        <thead>
          <tr>
            <th>Campanha</th>
            <th className="wide">Origem</th>
            <th className="num wide">Visitas</th>
            <th className="num">Pedidos</th>
            <th className="num wide">Fechados</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.campaign}>
              <td className="main">
                <Link
                  href={hrefWith("/admin/visitantes", { campanha: row.campaign, dias })}
                  className="go block max-w-[110px] truncate sm:max-w-[220px]"
                  title={row.campaign}
                >
                  {row.campaign}
                </Link>
              </td>
              <td className="wide whitespace-nowrap">{row.source ?? "–"}</td>
              <td className="num wide">
                <Link href={hrefWith("/admin/visitantes", { campanha: row.campaign, dias })} className="go">
                  {formatNumber(row.sessions)}
                </Link>
              </td>
              <td className={`num ${row.leads ? "font-semibold text-accent" : ""}`}>
                <Link href={hrefWith("/admin/pedidos", { campanha: row.campaign, dias: days })} className="go">
                  {formatNumber(row.leads)}
                </Link>
              </td>
              <td className="num wide">
                <Link
                  href={hrefWith("/admin/pedidos", { campanha: row.campaign, status: "ganho", dias: days })}
                  className="go"
                >
                  {formatNumber(row.won)}
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
