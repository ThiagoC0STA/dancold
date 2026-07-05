import { ImageResponse } from "next/og";

export const size = { width: 48, height: 48 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#0a1428",
          borderRadius: 10,
          position: "relative",
          color: "#ffffff",
          fontSize: 32,
          fontWeight: 800,
          letterSpacing: "-0.04em",
        }}
      >
        D
        <div
          style={{
            position: "absolute",
            bottom: 8,
            width: 18,
            height: 4,
            borderRadius: 2,
            background: "#d7282f",
            display: "flex",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
