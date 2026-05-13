import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { Calculator } from "@/components/calc/Calculator";
import { JsonLd } from "@/components/seo/JsonLd";
import { financeApplicationJsonLd, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";
import { CATEGORIES } from "@/lib/categories";

export const metadata: Metadata = {
  title: `${siteConfig.tagline} — ${siteConfig.name}`,
  description: siteConfig.description,
  alternates: { canonical: siteConfig.url },
};

const homeFaqs = [
  {
    question: "How much does TikTok Shop take from sellers in 2026?",
    answer:
      "The base referral fee in the US is 6% for most categories, 5% for precious jewelry (gold, diamond, jade, platinum, ruby/sapphire/emerald) and pre-owned items, and 3% for new sellers in their first 30 days. On top of that, you pay payment processing (typically 2.9% + $0.30 per order), creator affiliate commission (5–30%+ depending on plan), FBT fulfillment (starting at $3.58 per unit), and a refund admin fee of up to $5 per SKU.",
  },
  {
    question: "Is the calculator's math accurate?",
    answer:
      "Every formula is sourced from TikTok Seller University (the official rate cards) and reconciled across four independent calculators. The full reasoning is in the project's open-source PLAN.md. If you spot something off, the repo is public — file an issue.",
  },
  {
    question: "Does this work for the UK or EU?",
    answer:
      "Version 1 is US-only. UK uses 9%, and EU5 (Germany, Spain, France, Italy, Ireland) moved to 9% in January 2026. Cross-region support is on the roadmap.",
  },
];

export default function HomePage() {
  return (
    <>
      <JsonLd
        data={financeApplicationJsonLd({
          name: `${siteConfig.name} — ${siteConfig.tagline}`,
          description: siteConfig.description,
        })}
      />
      <JsonLd
        data={breadcrumbJsonLd([{ name: "Home", url: siteConfig.url }])}
      />
      <JsonLd data={faqJsonLd(homeFaqs)} />

      <SiteHeader />

      <main>
        <section className="container-page" style={{ padding: "3rem 1.25rem 1.5rem" }}>
          <div style={{ maxWidth: 820 }}>
            <span className="pill">
              <span style={{ color: "var(--color-success)" }}>●</span> 2026 fee schedule · browser
              math · no signup
            </span>
            <h1
              style={{
                fontSize: "clamp(2rem, 5vw, 3.25rem)",
                margin: "1.25rem 0 1rem",
                lineHeight: 1.05,
              }}
            >
              See your true TikTok Shop margin{" "}
              <span className="text-accent">before the fees eat it.</span>
            </h1>
            <p
              className="text-muted"
              style={{ fontSize: "1.125rem", lineHeight: 1.6, maxWidth: 720 }}
            >
              Most TikTok Shop sellers lose money on viral orders without knowing it. Referral fee,
              creator commission, FBT fulfillment, refund admin, return-shipping reserve — they
              compound fast. Adjust the inputs below and watch the waterfall.
            </p>
          </div>
        </section>

        <section className="container-page" style={{ padding: "0 1.25rem 4rem" }}>
          <Calculator />
        </section>

        <section className="container-page" style={{ padding: "0 1.25rem 4rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>Profit math by product category</h2>
          <p className="text-muted" style={{ marginBottom: "1.5rem" }}>
            Pre-filled scenarios for the {CATEGORIES.length} categories that move the most volume
            on TikTok Shop. Tap any to load category-specific defaults.
          </p>
          <ul
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
              gap: "0.5rem",
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            {CATEGORIES.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/tiktok-shop-fees/${c.slug}`}
                  className="card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "0.75rem 1rem",
                    height: "100%",
                    color: "var(--color-on-bg)",
                    textDecoration: "none",
                  }}
                >
                  <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{c.title}</span>
                  <span
                    className="text-muted"
                    style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}
                  >
                    {(c.rate * 100).toFixed(0)}% referral · {(c.creatorBand[0] * 100).toFixed(0)}
                    –{(c.creatorBand[1] * 100).toFixed(0)}% creator
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>

        <section className="container-page" style={{ padding: "0 1.25rem 4rem" }}>
          <h2 style={{ marginBottom: "1rem" }}>FAQ</h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            {homeFaqs.map((f) => (
              <details key={f.question} className="card" style={{ padding: "1rem 1.25rem" }}>
                <summary style={{ fontWeight: 600, cursor: "pointer" }}>{f.question}</summary>
                <p className="text-muted" style={{ marginTop: "0.75rem" }}>
                  {f.answer}
                </p>
              </details>
            ))}
          </div>
        </section>
      </main>

      <SiteFooter />
    </>
  );
}
