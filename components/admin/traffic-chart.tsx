"use client";

import { useState } from "react";
import { formatDay, formatNumber } from "@/lib/admin/format";

export interface DayPoint {
  day: string;
  visitors: number;
  pageviews: number;
  leads: number;
}

const W = 1000;
const H = 240;
const PAD = { top: 16, right: 8, bottom: 4, left: 8 };

function niceMax(value: number): number {
  if (value <= 4) return 4;
  const power = 10 ** Math.floor(Math.log10(value));
  const step = [1, 2, 2.5, 5, 10].find((s) => s * power >= value) ?? 10;
  return step * power;
}

/**
 * Visitantes por dia (área azul) e pedidos de orçamento (marcas vermelhas).
 * Passar o mouse ou o dedo mostra os números do dia.
 */
export function TrafficChart({ days }: { days: DayPoint[] }) {
  const [active, setActive] = useState<number | null>(null);
  const max = niceMax(Math.max(...days.map((d) => d.visitors), 1));
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (days.length === 1 ? innerW / 2 : (i / (days.length - 1)) * innerW);
  const y = (value: number) => PAD.top + innerH - (value / max) * innerH;

  const line = days.map((d, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(d.visitors).toFixed(1)}`).join(" ");
  const area = `${line} L${x(days.length - 1).toFixed(1)},${PAD.top + innerH} L${x(0).toFixed(1)},${PAD.top + innerH} Z`;
  const point = active === null ? null : days[active];

  function pick(event: React.PointerEvent<SVGSVGElement>) {
    const box = event.currentTarget.getBoundingClientRect();
    const ratio = (event.clientX - box.left) / box.width;
    const position = (ratio * W - PAD.left) / innerW;
    setActive(Math.min(days.length - 1, Math.max(0, Math.round(position * (days.length - 1)))));
  }

  return (
    <div className="relative px-5 pb-4">
      <div className="flex min-h-10 flex-wrap items-center gap-x-5 gap-y-1 text-[13px] text-ink-2">
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-2.5 w-2.5 rounded-sm bg-navy-500" />
          Visitantes
          {point && <strong className="font-semibold text-ink">{formatNumber(point.visitors)}</strong>}
        </span>
        <span className="flex items-center gap-2">
          <span aria-hidden className="h-2.5 w-2.5 rounded-full bg-accent" />
          Pedidos de orçamento
          {point && <strong className="font-semibold text-ink">{formatNumber(point.leads)}</strong>}
        </span>
        {point ? (
          <span className="ml-auto font-medium text-ink">{formatDay(point.day)}</span>
        ) : (
          // no computador o mouse já mostra; a dica é só para quem usa o dedo
          <span className="ml-auto hidden text-ink-3 pointer-coarse:inline">Toque no gráfico para ver o dia</span>
        )}
      </div>

      <svg
        viewBox={`0 0 ${W} ${H}`}
        preserveAspectRatio="none"
        role="img"
        aria-label={`Visitantes e pedidos por dia, de ${formatDay(days[0].day)} a ${formatDay(days[days.length - 1].day)}`}
        className="mt-2 block h-[220px] w-full touch-pan-y select-none"
        onPointerMove={pick}
        onPointerDown={pick}
        onPointerLeave={() => setActive(null)}
      >
        {[0, 0.5, 1].map((step) => (
          <line
            key={step}
            x1={PAD.left}
            x2={W - PAD.right}
            y1={PAD.top + innerH * (1 - step)}
            y2={PAD.top + innerH * (1 - step)}
            stroke="var(--line)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
            strokeDasharray={step === 0 ? undefined : "3 4"}
          />
        ))}
        <path d={area} fill="var(--color-navy-500)" opacity="0.1" />
        <path
          d={line}
          fill="none"
          stroke="var(--color-navy-500)"
          strokeWidth="2"
          strokeLinejoin="round"
          strokeLinecap="round"
          vectorEffect="non-scaling-stroke"
        />
        {active !== null && (
          <line
            x1={x(active)}
            x2={x(active)}
            y1={PAD.top}
            y2={PAD.top + innerH}
            stroke="var(--ink-3)"
            strokeWidth="1"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>

      {/* marcas e rótulos em HTML, para não esticarem junto com o gráfico */}
      <div className="pointer-events-none absolute inset-x-5 bottom-[38px] h-[220px]">
        {days.map((d, i) => {
          if (d.leads === 0) return null;
          const left = `${(x(i) / W) * 100}%`;
          const top = (y(d.visitors) / H) * 100;
          return (
            <span key={d.day}>
              {/* dia com pedido: traço do eixo até o ponto e marca com o número de pedidos */}
              <span
                className="absolute bottom-[1.7%] w-px -translate-x-1/2 bg-accent/40"
                style={{ left, top: `${top}%` }}
              />
              <span
                className="absolute flex h-2.5 min-w-2.5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-accent text-[10.5px] font-bold leading-none text-white ring-2 ring-surface sm:h-[18px] sm:min-w-[18px] sm:px-1"
                style={{ left, top: `${top}%` }}
              >
                {/* no celular os dias ficam colados: só a bolinha, o número aparece ao tocar */}
                <span className="hidden sm:inline">{d.leads}</span>
              </span>
            </span>
          );
        })}
        {[1, 0.5, 0].map((step) => (
          <span
            key={step}
            className="absolute left-0 -translate-y-full pb-px text-[11.5px] leading-tight text-ink-3"
            style={{ top: `${((PAD.top + innerH * (1 - step)) / H) * 100}%` }}
          >
            {formatNumber(max * step)}
          </span>
        ))}
      </div>
      <div className="mt-1 flex justify-between text-[11.5px] text-ink-3" aria-hidden>
        <span>{formatDay(days[0].day)}</span>
        {days.length > 2 && <span>{formatDay(days[Math.floor((days.length - 1) / 2)].day)}</span>}
        <span>{formatDay(days[days.length - 1].day)}</span>
      </div>
    </div>
  );
}
