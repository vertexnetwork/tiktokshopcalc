import type { Metadata } from "next";
import { Calculator } from "@/components/calc/Calculator";
import { siteConfig } from "@/lib/site-config";
import { computeInitialCalcState } from "@/lib/calc-init";

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

export const metadata: Metadata = {
  title: `Embedded calculator — ${siteConfig.name}`,
  robots: { index: false, follow: false },
};

export default async function EmbeddedCalculator({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const sp = await searchParams;
  const initial = computeInitialCalcState(undefined, sp);
  return (
    <div style={{ padding: "1rem", minHeight: "100vh" }}>
      <Calculator initial={initial} embedded />
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
