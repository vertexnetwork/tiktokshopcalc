import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";
import { siteConfig } from "@/lib/site-config";

export const runtime = "edge";

export function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const title = (searchParams.get("title") || siteConfig.tagline).slice(0, 100);
  const subtitle = (searchParams.get("subtitle") || siteConfig.description).slice(0, 160);

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
            fontSize: 64,
            fontWeight: 800,
            lineHeight: 1.1,
            marginTop: 48,
            letterSpacing: -2,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        <div
          style={{
            fontSize: 28,
            color: "#8A8FA3",
            marginTop: 24,
            lineHeight: 1.4,
            maxWidth: 1000,
          }}
        >
          {subtitle}
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
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
