import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";
import { getSisterSites } from "@/lib/network";
import { JsonLd } from "@/components/seo/JsonLd";
import { networkCollectionJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: `Vertex Network — ${siteConfig.name}`,
  description:
    "Part of the Vertex Network — a small portfolio of free, focused tools for sellers, creators, and developers.",
  alternates: { canonical: `${siteConfig.url}/network` },
};

export default async function NetworkPage() {
  const sisters = await getSisterSites();
  return (
    <>
      <JsonLd
        data={networkCollectionJsonLd(
          sisters.map((s) => ({ name: s.name, url: s.url })),
        )}
      />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: siteConfig.url },
          { name: "Network", url: `${siteConfig.url}/network` },
        ])}
      />
      <div style={{ maxWidth: 980 }}>
        <h1>Vertex Network</h1>
        <p className="text-muted" style={{ fontSize: "1.125rem", lineHeight: 1.6, maxWidth: 720 }}>
          {siteConfig.name} is one of {sisters.length === 0 ? "several" : `${sisters.length + 1}`}{" "}
          indie tools in the Vertex Network. Each one is small, focused, and free — no signup,
          browser-side math, no upsell-to-SaaS funnel.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
            gap: "1rem",
            marginTop: "2rem",
          }}
        >
          {sisters.length === 0 ? (
            <p className="text-muted">
              The sister-site registry hasn&apos;t synced yet. Refresh after the first hub sync.
            </p>
          ) : (
            sisters.map((s) => (
              <a
                key={s.slug}
                href={s.url}
                className="card"
                style={{
                  padding: "1.25rem",
                  textDecoration: "none",
                  color: "var(--color-on-bg)",
                  display: "flex",
                  flexDirection: "column",
                  gap: "0.5rem",
                }}
              >
                <span style={{ fontWeight: 700, fontSize: "1.125rem" }}>{s.name}</span>
                <span className="text-muted" style={{ fontSize: "0.875rem" }}>
                  {s.tagline}
                </span>
                <span className="text-muted" style={{ fontSize: "0.75rem", marginTop: "0.5rem" }}>
                  {s.audience} · {s.domain}
                </span>
              </a>
            ))
          )}
        </div>
      </div>
    </>
  );
}
