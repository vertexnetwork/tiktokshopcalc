import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const runtime = "edge";
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OG() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background:
            "linear-gradient(135deg, #0A0A0F 0%, #14141C 60%, #1A0A14 100%)",
          color: "#F5F7FA",
          fontFamily: "system-ui",
          display: "flex",
          flexDirection: "column",
          padding: "72px 80px",
          position: "relative",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            fontSize: 28,
            fontWeight: 600,
            color: "#00E5FF",
          }}
        >
          <span
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 36,
              height: 36,
              background: "#00E5FF",
              color: "#0A0A0F",
              fontWeight: 800,
              fontSize: 22,
              borderRadius: 8,
              textAlign: "center",
              lineHeight: "36px",
            }}
          >
            TT
          </span>
          {siteConfig.name}
        </div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.05,
            marginTop: 64,
            letterSpacing: -2,
            maxWidth: 1000,
          }}
        >
          See your true TikTok Shop margin{" "}
          <span style={{ color: "#00E5FF" }}>before the fees eat it.</span>
        </div>
        <div
          style={{
            marginTop: 32,
            display: "flex",
            gap: 12,
            flexWrap: "wrap",
          }}
        >
          {["2026 fee schedule", "Browser math", "No signup", "60 categories"].map((tag) => (
            <span
              key={tag}
              style={{
                fontSize: 20,
                padding: "8px 20px",
                background: "#14141C",
                border: "1px solid #2A2A38",
                borderRadius: 999,
                color: "#8A8FA3",
              }}
            >
              {tag}
            </span>
          ))}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 56,
            right: 80,
            fontSize: 24,
            color: "#8A8FA3",
          }}
        >
          {siteConfig.domain}
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 56,
            left: 80,
            fontSize: 20,
            color: "#8A8FA3",
          }}
        >
          Part of the Vertex Network
        </div>
      </div>
    ),
    { ...size },
  );
}
