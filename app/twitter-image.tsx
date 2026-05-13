import { ImageResponse } from "next/og";
import { siteConfig } from "@/lib/site-config";

export const runtime = "edge";
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function TwitterImage() {
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
          <div
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
            }}
          >
            TT
          </div>
          {siteConfig.name}
        </div>
        <div
          style={{
            fontSize: 76,
            fontWeight: 800,
            lineHeight: 1.05,
            marginTop: 64,
            letterSpacing: -2,
            display: "flex",
          }}
        >
          See your true TikTok Shop margin before the fees eat it.
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 56,
            right: 80,
            fontSize: 24,
            color: "#8A8FA3",
            display: "flex",
          }}
        >
          {siteConfig.domain}
        </div>
      </div>
    ),
    { ...size },
  );
}
