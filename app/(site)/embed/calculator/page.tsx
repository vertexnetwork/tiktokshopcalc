import type { Metadata } from "next";
import { Calculator } from "@/components/calc/Calculator";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Embedded calculator — ${siteConfig.name}`,
  robots: { index: false, follow: false },
};

export default function EmbeddedCalculator() {
  return (
    <div style={{ padding: "1rem", minHeight: "100vh" }}>
      <Calculator embedded />
      <p
        style={{
          marginTop: "1rem",
          textAlign: "center",
          fontSize: "0.75rem",
          color: "var(--color-muted)",
        }}
      >
        Powered by{" "}
        <a href={siteConfig.url} target="_blank" rel="noopener noreferrer">
          {siteConfig.name}
        </a>
      </p>
    </div>
  );
}
