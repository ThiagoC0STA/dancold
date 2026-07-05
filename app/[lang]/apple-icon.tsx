import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a1428",
          color: "#ffffff",
          fontSize: 104,
          fontWeight: 800,
          letterSpacing: "-0.05em",
        }}
      >
        D
        <div
          style={{
            marginTop: 12,
            width: 58,
            height: 8,
            borderRadius: 4,
            background: "#d7282f",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
