import { siteConfig } from "@/lib/site-config";

export function Wordmark({ size = 22 }: { size?: number }) {
  return (
    <span
      aria-label={siteConfig.name}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "0.5rem",
        fontFamily: "var(--font-display)",
        fontWeight: 800,
        fontSize: size,
        color: "var(--color-on-bg)",
        letterSpacing: "-0.02em",
      }}
    >
      <span
        aria-hidden
        style={{
          display: "inline-block",
          width: size * 1.1,
          height: size * 1.1,
          background: "var(--color-accent)",
          color: "var(--color-on-accent)",
          borderRadius: 6,
          fontWeight: 800,
          fontSize: size * 0.65,
          lineHeight: `${size * 1.1}px`,
          textAlign: "center",
        }}
      >
        TT
      </span>
      {siteConfig.name}
    </span>
  );
}
