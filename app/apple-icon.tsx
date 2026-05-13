import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          background: "#0A0A0F",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: 32,
          position: "relative",
        }}
      >
        <div
          style={{
            color: "#00E5FF",
            fontSize: 96,
            fontWeight: 800,
            fontFamily: "system-ui",
            letterSpacing: -4,
          }}
        >
          TT
        </div>
        <div
          style={{
            position: "absolute",
            bottom: 28,
            right: 28,
            width: 28,
            height: 28,
            background: "#FF2D6A",
            borderRadius: "50%",
          }}
        />
      </div>
    ),
    { ...size },
  );
}
