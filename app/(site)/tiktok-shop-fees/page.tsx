import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig } from "@/lib/site-config";
import { CATEGORIES } from "@/lib/categories";
import { JsonLd } from "@/components/seo/JsonLd";
import { breadcrumbJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: `TikTok Shop fees by category (2026) — ${siteConfig.name}`,
  description:
    "Every TikTok Shop product category with its 2026 referral rate, creator commission band, and a pre-filled profit calculator.",
  alternates: { canonical: `${siteConfig.url}/tiktok-shop-fees` },
};

export default function CategoriesIndex() {
  const tier1 = CATEGORIES.filter((c) => c.l1 === "Beauty & Personal Care");
  const tier2 = CATEGORIES.filter((c) => c.l1 === "Health" || c.slug === "weighted-plush" || c.slug === "whitening-strips");
  const tier3 = CATEGORIES.filter(
    (c) =>
      ["Home Supplies", "Textiles & Soft Furnishings", "Kitchenware", "Phones & Electronics"].includes(c.l1) &&
      !tier1.some((x) => x.slug === c.slug) &&
      !tier2.some((x) => x.slug === c.slug),
  );
  const tier4 = CATEGORIES.filter(
    (c) =>
      ["Womenswear & Underwear", "Fashion Accessories", "Jewelry Accessories & Derivatives", "Shoes"].includes(c.l1),
  );
  const remaining = CATEGORIES.filter(
    (c) =>
      !tier1.some((x) => x.slug === c.slug) &&
      !tier2.some((x) => x.slug === c.slug) &&
      !tier3.some((x) => x.slug === c.slug) &&
      !tier4.some((x) => x.slug === c.slug),
  );

  const groups: { title: string; subtitle: string; items: typeof CATEGORIES }[] = [
    {
      title: "Tier 1: Beauty & Personal Care",
      subtitle: "22.5% of TikTok Shop global GMV. Highest creator commission bands.",
      items: tier1,
    },
    {
      title: "Tier 2: Health, Wellness & Soft Life",
      subtitle: "The 2026 breakout category — anxiety, recovery, supplements.",
      items: tier2,
    },
    {
      title: "Tier 3: Home, Kitchen, Electronics",
      subtitle: "Practical-gadget surge. Lower creator commission than beauty.",
      items: tier3,
    },
    {
      title: "Tier 4: Fashion, Jewelry, Accessories",
      subtitle: "Jewelry pages call out the 5% rate (vs the standard 6%).",
      items: tier4,
    },
    {
      title: "Long-tail and L1 catch-alls",
      subtitle: "Pet, food, toys, automotive, tools — slower velocity but lower competition.",
      items: remaining,
    },
  ];

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: siteConfig.url },
          { name: "TikTok Shop fees", url: `${siteConfig.url}/tiktok-shop-fees` },
        ])}
      />
      <h1>TikTok Shop fees by category (2026)</h1>
      <p className="text-muted" style={{ maxWidth: 720, fontSize: "1.125rem", lineHeight: 1.6 }}>
        Pre-filled calculator scenarios for {CATEGORIES.length} TikTok Shop categories. Each page
        starts you with realistic defaults for that niche so you can see the fee stack
        immediately, then customize.
      </p>

      {groups.map((g) => (
        <section key={g.title} style={{ marginTop: "3rem" }}>
          <h2 style={{ marginBottom: "0.25rem" }}>{g.title}</h2>
          <p className="text-muted" style={{ marginBottom: "1rem" }}>
            {g.subtitle}
          </p>
          <ul
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(240px, 1fr))",
              gap: "0.75rem",
              listStyle: "none",
              padding: 0,
              margin: 0,
            }}
          >
            {g.items.map((c) => (
              <li key={c.slug}>
                <Link
                  href={`/tiktok-shop-fees/${c.slug}`}
                  className="card"
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    padding: "1rem 1.25rem",
                    height: "100%",
                    color: "var(--color-on-bg)",
                    textDecoration: "none",
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{c.title}</span>
                  <span
                    className="text-muted"
                    style={{ fontSize: "0.75rem", marginTop: "0.25rem" }}
                  >
                    {(c.rate * 100).toFixed(0)}% referral · {(c.creatorBand[0] * 100).toFixed(0)}–
                    {(c.creatorBand[1] * 100).toFixed(0)}% creator
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </>
  );
}
