import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { siteConfig } from "@/lib/site-config";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { Calculator } from "@/components/calc/Calculator";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  breadcrumbJsonLd,
  faqJsonLd,
  financeApplicationJsonLd,
  howToJsonLd,
} from "@/lib/seo";
import { fmtUSD } from "@/lib/format";
import { calcFees } from "@/lib/fee-engine";

interface Params {
  slug: string;
}

export async function generateStaticParams(): Promise<Params[]> {
  return CATEGORIES.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata(
  { params }: { params: Promise<Params> },
): Promise<Metadata> {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) return {};
  const title = `${cat.title} on TikTok Shop: 2026 fees & profit calculator`;
  const description = `${cat.hookAngle} ${(cat.rate * 100).toFixed(0)}% referral rate. ${(cat.creatorBand[0] * 100).toFixed(0)}–${(cat.creatorBand[1] * 100).toFixed(0)}% creator commission band.`;
  return {
    title,
    description: description.slice(0, 155),
    alternates: { canonical: `${siteConfig.url}/tiktok-shop-fees/${slug}` },
    openGraph: {
      title,
      description,
      url: `${siteConfig.url}/tiktok-shop-fees/${slug}`,
      images: [
        {
          url: `/api/og?title=${encodeURIComponent(cat.title + " on TikTok Shop")}&subtitle=${encodeURIComponent(
            `${(cat.rate * 100).toFixed(0)}% referral · ${(cat.creatorBand[0] * 100).toFixed(0)}–${(cat.creatorBand[1] * 100).toFixed(0)}% creator`,
          )}`,
          width: 1200,
          height: 630,
        },
      ],
    },
  };
}

export default async function PseoPage({ params }: { params: Promise<Params> }) {
  const { slug } = await params;
  const cat = getCategory(slug);
  if (!cat) notFound();

  const scenarios = [
    { name: "Low — conservative listing", price: cat.defaults.sellingPrice * 0.7, cogs: cat.defaults.cogs },
    { name: "Median — your baseline", price: cat.defaults.sellingPrice, cogs: cat.defaults.cogs },
    {
      name: "Viral — riding the algorithm",
      price: cat.defaults.sellingPrice * 1.3,
      cogs: cat.defaults.cogs,
    },
  ];
  const workedExamples = scenarios.map((s) => {
    const r = calcFees({
      sellingPrice: s.price,
      units: 1,
      cogs: s.cogs,
      shippingChargedToBuyer: 0,
      referralRate: cat.rate,
      logistics: "FBT",
      weightTier: cat.weightTierDefault,
      fbtMultiUnitDiscount: false,
      creatorPlan: "Open",
      creatorCommissionPct: cat.defaults.creatorPct,
      refundRatePct: cat.defaults.refundRatePct,
      shopPerformanceScore: "ge4",
      expectedReturnShipCost: 8,
      newSellerPromo: false,
      sellerFundedDiscount: 0,
      platformFundedDiscount: 0,
      salesTaxOnReferralFee: false,
      buyerStateTaxRate: 0,
      includeCashoutFee: false,
    });
    return { ...s, r };
  });

  const faqs = [
    {
      question: `What is the TikTok Shop referral fee for ${cat.title} in 2026?`,
      answer: `TikTok Shop charges a ${(cat.rate * 100).toFixed(0)}% referral fee on ${cat.title} sales in the US (2026 schedule). ${cat.rate === 0.05 ? "This is the reduced rate that applies to precious jewelry and pre-owned items." : "This is the standard rate."} New sellers get 3% for their first 30 days. Sales tax on the referral fee applies post-November 2025.`,
    },
    {
      question: `What creator commission should I offer for ${cat.title}?`,
      answer: `Open Plan creators in ${cat.title} typically take ${(cat.creatorBand[0] * 100).toFixed(0)}–${(cat.creatorBand[1] * 100).toFixed(0)}%. Targeted Plans run higher (often 25%+) but deliver 2–3× the conversion rate. Use the calculator to see how a 5% shift in commission changes your net.`,
    },
    {
      question: `What's a healthy profit margin for ${cat.title} on TikTok Shop?`,
      answer: `Most successful TikTok Shop sellers in ${cat.title} target 20–30% net margin after every fee. Anything under 15% leaves no room for ad spend. The calculator's ROAS breakeven multiple tells you exactly how much ad spend each order can absorb.`,
    },
  ];

  const related = cat.related
    .map((s) => getCategory(s))
    .filter((c): c is NonNullable<typeof c> => Boolean(c));

  return (
    <>
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", url: siteConfig.url },
          { name: "TikTok Shop fees", url: `${siteConfig.url}/tiktok-shop-fees` },
          {
            name: cat.title,
            url: `${siteConfig.url}/tiktok-shop-fees/${cat.slug}`,
          },
        ])}
      />
      <JsonLd
        data={financeApplicationJsonLd({
          name: `${cat.title} TikTok Shop Profit Calculator`,
          description: cat.hookAngle,
        })}
      />
      <JsonLd data={faqJsonLd(faqs)} />
      <JsonLd
        data={howToJsonLd({
          name: `How to price ${cat.title} on TikTok Shop`,
          description: cat.hookAngle,
          steps: [
            { name: "Enter your selling price and cost of goods", text: "Set your target sale price and the landed cost per unit." },
            { name: "Select your creator plan and commission %", text: `Open Plan creators in ${cat.title} typically take ${(cat.creatorBand[0] * 100).toFixed(0)}–${(cat.creatorBand[1] * 100).toFixed(0)}%.` },
            { name: "Confirm your FBT weight tier", text: `${cat.title} typically falls into the ${cat.weightTierDefault} weight tier — FBT charges $3.58+ per unit accordingly.` },
            { name: "Read the waterfall and net margin", text: "Aim for 20%+ margin post-fees to leave room for advertising and refunds." },
          ],
        })}
      />

      <nav style={{ fontSize: "0.875rem", marginBottom: "1rem" }} className="text-muted">
        <Link href="/">Home</Link> &nbsp;/&nbsp;{" "}
        <Link href="/tiktok-shop-fees">TikTok Shop fees</Link> &nbsp;/&nbsp; {cat.title}
      </nav>

      <span className="pill">
        {cat.l1} · {cat.l2} · {(cat.rate * 100).toFixed(0)}% referral
      </span>
      <h1 style={{ marginTop: "1rem" }}>
        Pricing {cat.title.toLowerCase()} on TikTok Shop without giving up{" "}
        <span className="text-accent">{(cat.rate * 100).toFixed(0)}%+ in fees</span> (2026)
      </h1>
      <p style={{ fontSize: "1.125rem", lineHeight: 1.6, maxWidth: 720 }} className="text-muted">
        {cat.hookAngle}
      </p>

      <div style={{ marginTop: "2rem" }}>
        <Calculator categorySlug={cat.slug} />
      </div>

      <section style={{ marginTop: "3rem" }}>
        <h2>Worked examples for {cat.title.toLowerCase()}</h2>
        <p className="text-muted">Three scenarios at FBT default weight tier, Open Plan creator.</p>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1rem",
            marginTop: "1rem",
          }}
        >
          {workedExamples.map((s) => (
            <div key={s.name} className="card" style={{ padding: "1.25rem" }}>
              <p style={{ margin: 0, fontWeight: 600 }}>{s.name}</p>
              <p className="text-muted" style={{ margin: "0.25rem 0 1rem", fontSize: "0.875rem" }}>
                {fmtUSD(s.price)} sale · {fmtUSD(s.cogs)} COGS
              </p>
              <p style={{ margin: "0.25rem 0" }}>
                Net:{" "}
                <strong style={{ color: s.r.netProfit > 0 ? "var(--color-success)" : "var(--color-danger)" }}>
                  {fmtUSD(s.r.netProfit)}
                </strong>
              </p>
              <p style={{ margin: "0.25rem 0" }} className="text-muted">
                Margin: {(s.r.marginPct * 100).toFixed(1)}% · Fees:{" "}
                {(s.r.feeTakeRate * 100).toFixed(1)}%
              </p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ marginTop: "3rem" }}>
        <h2>Common mistakes</h2>
        <ul>
          <li>
            Treating creator commission as a flat percentage when it&apos;s actually paid only on
            item subtotal — shipping doesn&apos;t count toward the calculation.
          </li>
          <li>
            Forgetting the 30-day rate-lock on creator commission — you can&apos;t drop a rate
            once it&apos;s set during a live campaign.
          </li>
          <li>
            Missing the platform-funded discount paradox: when TikTok funds a discount, the
            referral fee is still charged on the <em>pre-discount</em> price.
          </li>
          <li>
            Letting Shop Performance Score drop below 4 — the return shipping split flips from
            20/80 to 50/50 overnight.
          </li>
        </ul>
      </section>

      <section style={{ marginTop: "3rem" }}>
        <h2>Recommendations</h2>
        <ul>
          <li>
            Aim for <strong>20%+ net margin</strong> after every fee in this category. Anything
            less and you have no room for paid acquisition.
          </li>
          <li>
            Test creator commission in the <strong>{(cat.creatorBand[0] * 100).toFixed(0)}–
            {((cat.creatorBand[0] + cat.creatorBand[1]) / 2 * 100).toFixed(0)}%
            </strong>{" "}
            range first — graduate to Targeted Plans only after you&apos;ve nailed the offer.
          </li>
          <li>
            If you ship at <strong>{cat.weightTierDefault}</strong>, the FBT multi-unit discount
            kicks in at units ≥ 2 — bundle to win.
          </li>
          <li>
            Watch your Shop Performance Score weekly. Falling below 4 is the silent margin killer
            in {cat.title.toLowerCase()}.
          </li>
        </ul>
      </section>

      <section style={{ marginTop: "3rem" }}>
        <h2>FAQ</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {faqs.map((f) => (
            <details key={f.question} className="card" style={{ padding: "1rem 1.25rem" }}>
              <summary style={{ fontWeight: 600, cursor: "pointer" }}>{f.question}</summary>
              <p className="text-muted" style={{ marginTop: "0.75rem" }}>
                {f.answer}
              </p>
            </details>
          ))}
        </div>
      </section>

      <section style={{ marginTop: "3rem" }}>
        <h2>Related</h2>
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
          {related.map((r) => (
            <li key={r.slug}>
              <Link
                href={`/tiktok-shop-fees/${r.slug}`}
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
                <span style={{ fontWeight: 600, fontSize: "0.95rem" }}>{r.title}</span>
                <span className="text-muted" style={{ fontSize: "0.75rem" }}>
                  {(r.rate * 100).toFixed(0)}% referral
                </span>
              </Link>
            </li>
          ))}
        </ul>
        <p style={{ marginTop: "1.5rem" }} className="text-muted">
          Also selling on Etsy? Try{" "}
          <a href="https://etsymargin.tools" target="_blank" rel="noopener noreferrer">
            etsymargin.tools
          </a>{" "}
          — same idea, different platform.
        </p>
      </section>

      <section
        className="card"
        style={{
          marginTop: "3rem",
          padding: "2rem",
          textAlign: "center",
          borderColor: "var(--color-accent)",
        }}
      >
        <h3 style={{ marginTop: 0 }}>Want every category pre-modeled?</h3>
        <p className="text-muted" style={{ maxWidth: 480, margin: "0.5rem auto 1.5rem" }}>
          The {siteConfig.monetization.gumroad.productName} bundles every TikTok Shop category
          with worked viral / median / loss scenarios as a PDF + editable spreadsheet.
        </p>
        <a
          href={`${siteConfig.monetization.gumroad.productUrl}?utm_source=tiktokshopcalc&utm_medium=pseo&utm_campaign=${cat.slug}`}
          className="btn-primary"
        >
          Get the Bible — ${siteConfig.monetization.gumroad.price}
        </a>
      </section>
    </>
  );
}
