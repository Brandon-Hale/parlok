import { ImageResponse } from "next/og";

export const dynamic = "force-dynamic";
export const alt = "parlok — Agent firewall & tool-call guardrails";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "80px 96px",
          background: "#fafafa",
          backgroundImage:
            "linear-gradient(to right, rgba(10,10,10,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(10,10,10,0.04) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          color: "#0a0a0a",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 32,
            fontFamily: "monospace",
          }}
        >
          <div
            style={{
              width: 18,
              height: 18,
              background: "#2a4d7a",
              borderRadius: 4,
            }}
          />
          parlok
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 28,
          }}
        >
          <div
            style={{
              fontSize: 124,
              lineHeight: 1.0,
              letterSpacing: -3,
              fontFamily: "serif",
              display: "flex",
              flexWrap: "wrap",
              gap: 24,
            }}
          >
            <span>Guardrails for</span>
            <span style={{ color: "#2a4d7a", fontStyle: "italic" }}>
              agents.
            </span>
          </div>
          <div
            style={{
              fontSize: 30,
              color: "#6b6b6b",
              fontFamily: "monospace",
              maxWidth: 940,
              lineHeight: 1.4,
            }}
          >
            A firewall for agent tool calls. Allow, rewrite, approve, or deny
            every call.
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            fontFamily: "monospace",
            fontSize: 22,
            color: "#6b6b6b",
            borderTop: "1px solid #e8e8e8",
            paddingTop: 24,
          }}
        >
          <span>pip install parlok</span>
          <span>github.com/Brandon-Hale/parlok</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
