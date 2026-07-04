"use client";

import { useEffect, useRef, useState } from "react";
import { BRAZIL_VIEWBOX, brazilStates } from "@/lib/brazil-map-data";

export interface CoverageState {
  id: string;
  name: string;
  cities: string[];
}

interface BrazilCoverageMapProps {
  states: CoverageState[];
  /** state id that hosts the headquarters marker */
  hqId?: string;
  hqTitle?: string;
  /** color treatment — "light" for light bands, "dark" for section-dark bands */
  tone?: "light" | "dark";
  /** "full" = stacked legend cards + large map; "compact" = inline pills + smaller map (teaser) */
  variant?: "full" | "compact";
  /** render the city list inside each legend card (ignored in compact) */
  showCities?: boolean;
  /** node rendered above the legend, inside the left column */
  header?: React.ReactNode;
  children?: React.ReactNode;
}

const TONE = {
  light: {
    uncovered: "fill-surface stroke-line-2",
    coveredBase: "fill-navy-600",
    coveredActive: "fill-navy-400",
    coveredStroke: "stroke-white",
    shadow: "drop-shadow(0 24px 40px rgba(13,27,46,0.12))",
  },
  dark: {
    uncovered: "fill-white/[0.06] stroke-white/15",
    coveredBase: "fill-navy-500",
    coveredActive: "fill-navy-300",
    coveredStroke: "stroke-white/70",
    shadow: "drop-shadow(0 24px 44px rgba(0,0,0,0.42))",
  },
} as const;

export function BrazilCoverageMap({
  states,
  hqId = "pr",
  hqTitle,
  tone = "light",
  variant = "full",
  showCities = true,
  header,
  children,
}: BrazilCoverageMapProps) {
  const isCompact = variant === "compact";
  const [hovered, setHovered] = useState<string | null>(null);
  const [tip, setTip] = useState<{ x: number; y: number; label: string } | null>(null);
  const [marker, setMarker] = useState<{ x: number; y: number } | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);
  const hqPathRef = useRef<SVGPathElement>(null);

  const covered = new Map(states.map((state) => [state.id, state]));
  const skin = TONE[tone];

  useEffect(() => {
    const box = hqPathRef.current?.getBBox();
    // approximate Curitiba: east-center of Paraná
    if (box) setMarker({ x: box.x + box.width * 0.82, y: box.y + box.height * 0.46 });
  }, []);

  function showTip(event: React.MouseEvent, label: string) {
    const rect = mapRef.current?.getBoundingClientRect();
    if (!rect) return;
    setTip({ x: event.clientX - rect.left, y: event.clientY - rect.top, label });
  }

  function hideTip() {
    setHovered(null);
    setTip(null);
  }

  return (
    <div
      className={`grid gap-10 lg:items-center lg:gap-14 ${
        isCompact
          ? "lg:grid-cols-2"
          : "lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]"
      }`}
    >
      <div className="order-2 lg:order-1">
        {header}
        {isCompact ? (
          <div className={`flex flex-wrap gap-2.5 ${header ? "mt-8" : ""}`}>
            {states.map((state) => {
              const isActive = hovered === state.id;
              return (
                <span
                  key={state.id}
                  onMouseEnter={() => setHovered(state.id)}
                  onMouseLeave={() => setHovered(null)}
                  className={`inline-flex cursor-default items-center gap-2.5 rounded-md border px-4 py-2.5 text-sm font-semibold text-ink transition ${
                    isActive ? "border-navy-300 bg-surface" : "border-line bg-surface/60"
                  }`}
                >
                  <span
                    className={`h-1.5 w-1.5 rounded-full transition ${
                      isActive ? "bg-accent" : "bg-navy-500"
                    }`}
                    aria-hidden
                  />
                  {state.name}
                </span>
              );
            })}
          </div>
        ) : (
          <ul className="space-y-3">
            {states.map((state) => {
              const isActive = hovered === state.id;
              return (
                <li
                  key={state.id}
                  onMouseEnter={() => setHovered(state.id)}
                  onMouseLeave={() => setHovered(null)}
                  className={`rounded-[10px] border p-4 transition ${
                    isActive
                      ? "border-navy-300 bg-surface shadow-sm"
                      : "border-line bg-surface/60"
                  }`}
                >
                  <p className="flex items-center gap-2.5 font-display text-[15px] font-semibold text-ink">
                    <span
                      className={`h-2 w-2 rounded-full transition ${
                        isActive ? "bg-accent" : "bg-navy-500"
                      }`}
                      aria-hidden
                    />
                    {state.name}
                  </p>
                  {showCities && state.cities.length > 0 && (
                    <p className="mt-1.5 pl-[18px] text-[13px] leading-relaxed text-ink-2">
                      {state.cities.join(" · ")}
                    </p>
                  )}
                </li>
              );
            })}
          </ul>
        )}
        {children}
      </div>

      <div className="order-1 flex justify-center lg:order-2 lg:justify-end">
        <div
          ref={mapRef}
          className={`relative w-full ${isCompact ? "max-w-[480px]" : "max-w-[600px]"}`}
        >
          <svg
            viewBox={BRAZIL_VIEWBOX}
            className="h-auto w-full"
            style={{ filter: skin.shadow }}
            aria-hidden
          >
            {brazilStates
              .filter((state) => !covered.has(state.id))
              .map((state) => (
                <path
                  key={state.id}
                  d={state.path}
                  className={skin.uncovered}
                  strokeWidth="0.75"
                />
              ))}
            {brazilStates
              .filter((state) => covered.has(state.id))
              .map((state) => {
                const info = covered.get(state.id)!;
                const isActive = hovered === state.id;
                return (
                  <path
                    key={state.id}
                    ref={state.id === hqId ? hqPathRef : undefined}
                    d={state.path}
                    strokeWidth="1"
                    className={`cursor-pointer transition-[fill] duration-200 ${skin.coveredStroke} ${
                      isActive ? skin.coveredActive : skin.coveredBase
                    }`}
                    onMouseEnter={() => setHovered(state.id)}
                    onMouseMove={(event) => showTip(event, info.name)}
                    onMouseLeave={hideTip}
                  />
                );
              })}
            {marker && (
              <g className="pointer-events-none">
                <circle
                  cx={marker.x}
                  cy={marker.y}
                  r="8"
                  className="animate-ping fill-accent/40"
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                />
                <circle
                  cx={marker.x}
                  cy={marker.y}
                  r="4.5"
                  strokeWidth="1.5"
                  className="fill-accent stroke-white"
                >
                  {hqTitle && <title>{hqTitle}</title>}
                </circle>
              </g>
            )}
          </svg>

          {tip && (
            <div
              className="pointer-events-none absolute z-10 -translate-x-1/2 -translate-y-[140%] rounded-md bg-navy-900 px-3 py-1.5 text-xs font-semibold whitespace-nowrap text-white shadow-lg"
              style={{ left: tip.x, top: tip.y }}
            >
              {tip.label}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
