import { ImageResponse } from "next/og";

const INK = "#0a1428";
const BRAND = "#14335f";
const ACCENT = "#d7282f";

/** Shared branded 1200x630 social card, used by opengraph-image and twitter-image. */
export function renderOgCard() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: INK,
          backgroundImage: `linear-gradient(135deg, ${INK} 0%, ${BRAND} 100%)`,
          padding: "72px 84px",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: 16,
            backgroundColor: ACCENT,
            display: "flex",
          }}
        />
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <div style={{ width: 18, height: 18, borderRadius: 9999, backgroundColor: ACCENT, display: "flex" }} />
          <div
            style={{
              display: "flex",
              color: "rgba(255,255,255,0.72)",
              fontSize: 28,
              letterSpacing: 8,
              textTransform: "uppercase",
            }}
          >
            Desde 1998 · Curitiba-PR
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", color: "#ffffff", fontSize: 184, fontWeight: 800, letterSpacing: -4, lineHeight: 1 }}>
            DANCOLD
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 30, color: "rgba(255,255,255,0.92)", fontSize: 46 }}>
            <span style={{ display: "flex" }}>Ar condicionado</span>
            <span style={{ display: "flex", color: ACCENT }}>/</span>
            <span style={{ display: "flex" }}>Refrigeração</span>
            <span style={{ display: "flex", color: ACCENT }}>/</span>
            <span style={{ display: "flex" }}>Automação</span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", color: "rgba(255,255,255,0.6)", fontSize: 26 }}>
            HVAC · Refrigeração industrial · PMOC · Comissionamento
          </div>
          <div style={{ display: "flex", color: "rgba(255,255,255,0.8)", fontSize: 26 }}>dancold.com.br</div>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
