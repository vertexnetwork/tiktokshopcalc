import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { JsonLd } from "@/components/seo/JsonLd";
import { aboutPageJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: `About — ${siteConfig.name}`,
  description: `Why ${siteConfig.name} exists, who built it, and how the math works.`,
  alternates: { canonical: `${siteConfig.url}/about` },
};

export default function AboutPage() {
  return (
    <>
      <JsonLd data={aboutPageJsonLd()} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: siteConfig.url },
          { name: "About", url: `${siteConfig.url}/about` },
        ])}
      />
      <div style={{ maxWidth: 720 }}>
        <h1>About {siteConfig.name}</h1>
        <p className="text-muted" style={{ fontSize: "1.125rem", lineHeight: 1.6 }}>
          {siteConfig.tagline}
        </p>

        <h2 style={{ marginTop: "2.5rem" }}>Why this exists</h2>
        <p>
          TikTok Shop&apos;s fee stack is hostile. Sellers see a 6% &quot;referral fee&quot; on the
          dashboard and assume that&apos;s the cost of doing business. The reality: by the time
          you stack creator affiliate commissions (5–30%), FBT fulfillment ($3.58+/unit), payment
          processing (2.9% + $0.30/order), the refund admin reserve, and the SPS-dependent return
          shipping split, TikTok Shop&apos;s effective take rate runs <strong>35–55% of revenue</strong> for
          most categories. Sellers go viral on a product, run a campaign, and realize three weeks
          later they were losing money on every order.
        </p>
        <p>
          This tool surfaces that math <em>before</em> you commit. Every formula is sourced from
          TikTok Seller University&apos;s public rate cards and reconciled against four
          independent calculators. Inputs run client-side in the browser — no signup, no API
          calls, no tracking beyond opt-in Vercel Analytics.
        </p>

        <h2 style={{ marginTop: "2.5rem" }}>How the math works</h2>
        <p>
          The calculation engine lives in a single pure module —{" "}
          <code>lib/fee-engine.ts</code> — with 40+ golden test cases that act as its contract.
          Same inputs, same outputs, always.{" "}
          {siteConfig.github.public ? (
            <>
              You can read the full source at{" "}
              <Link href={`${siteConfig.github.repoUrl}/blob/main/lib/fee-engine.ts`}>
                {siteConfig.github.repoUrl.replace("https://github.com/", "")}/lib/fee-engine.ts
              </Link>
              .
            </>
          ) : (
            <>The source goes public alongside our v1 launch.</>
          )}
        </p>

        <h2 style={{ marginTop: "2.5rem" }}>Trademarks</h2>
        <p className="text-muted">{siteConfig.trademarkDisclaimer}</p>

        <h2 style={{ marginTop: "2.5rem" }}>Part of the Vertex Network</h2>
        <p>
          {siteConfig.name} is one of several indie tools in the{" "}
          <Link href="/network">Vertex Network</Link> — a small portfolio of free, focused
          calculators and utilities for sellers, creators, and developers.
        </p>
      </div>
    </>
  );
}
