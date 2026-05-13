import type { Metadata } from "next";
import { siteConfig } from "@/lib/site-config";

export const metadata: Metadata = {
  title: `Pricing — ${siteConfig.name}`,
  description: `The calculator is free. The optional ${siteConfig.monetization.gumroad.productName} bundles every category pre-modeled.`,
  alternates: { canonical: `${siteConfig.url}/pricing` },
};

export default function PricingPage() {
  const gum = siteConfig.monetization.gumroad;
  return (
    <div style={{ maxWidth: 880 }}>
      <h1>Pricing</h1>
      <p className="text-muted" style={{ fontSize: "1.125rem", lineHeight: 1.6 }}>
        The calculator stays free, forever. The only paid product is the optional Margin Bible —
        useful if you sell across 5+ categories and don&apos;t want to keep tweaking inputs.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "1.25rem",
          marginTop: "2.5rem",
        }}
      >
        <div className="card" style={{ padding: "2rem" }}>
          <h2 style={{ marginTop: 0 }}>Free</h2>
          <p style={{ fontSize: "2.5rem", fontWeight: 800, margin: "0.5rem 0" }}>$0</p>
          <p className="text-muted">forever</p>
          <ul style={{ listStyle: "none", padding: 0, marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li>✓ Full calculator</li>
            <li>✓ All 60 category pages</li>
            <li>✓ Share-link URL state</li>
            <li>✓ Embed on your site</li>
            <li>✓ No signup, no email</li>
          </ul>
          <a href="/" className="btn-ghost" style={{ marginTop: "1.5rem", width: "100%", justifyContent: "center" }}>
            Open calculator →
          </a>
        </div>

        <div className="card" style={{ padding: "2rem", borderColor: "var(--color-accent)" }}>
          <h2 style={{ marginTop: 0 }}>{gum.productName}</h2>
          <p style={{ fontSize: "2.5rem", fontWeight: 800, margin: "0.5rem 0" }}>${gum.price}</p>
          <p className="text-muted">one-time</p>
          <ul style={{ listStyle: "none", padding: 0, marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            <li>✓ Every category pre-modeled (PDF)</li>
            <li>✓ Spreadsheet with editable formulas</li>
            <li>✓ Worked viral / median / loss scenarios</li>
            <li>✓ 2026 fee schedule reference</li>
            <li>✓ Free updates for 12 months</li>
          </ul>
          <a
            href={`${gum.productUrl}?utm_source=tiktokshopcalc&utm_medium=pricing&utm_campaign=pricing-page`}
            className="btn-primary"
            style={{ marginTop: "1.5rem", width: "100%", justifyContent: "center" }}
          >
            Get the Bible
          </a>
          <p className="text-muted" style={{ marginTop: "0.75rem", fontSize: "0.75rem", textAlign: "center" }}>
            Delivered via Gumroad. 14-day refund.
          </p>
        </div>
      </div>
    </div>
  );
}
