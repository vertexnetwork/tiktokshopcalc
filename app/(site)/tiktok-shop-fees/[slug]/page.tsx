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
import { computeInitialCalcState } from "@/lib/calc-init";
import { generatePseoCopy } from "@/lib/pseo-copy";

interface Params {
  slug: string;
}

type SearchParams = Promise<{ [key: string]: string | string[] | undefined }>;

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

export default async function PseoPage({
  params,
  searchParams,
}: {
  params: Promise<Params>;
  searchParams: SearchParams;
}) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const cat = getCategory(slug);
  if (!cat) notFound();
  const initial = computeInitialCalcState(slug, sp);

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

  // Procedural copy — every section below is driven by the category's
  // attributes (rate, weight tier, creator band, refund rate, AOV bracket,
  // intent class) so the 60 pSEO pages render genuinely different prose
  // instead of the same template with the title swapped.
  const copy = generatePseoCopy(cat, workedExamples[1].r);
  const faqs = copy.faqs;

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
      <div style={{ maxWidth: 760, marginTop: "1rem" }}>
        {copy.intro.map((p, i) => (
          <p
            key={i}
            className={i === 0 ? undefined : "text-muted"}
            style={{
              fontSize: i === 0 ? "1.125rem" : "1rem",
              lineHeight: 1.65,
              margin: "0 0 1rem",
            }}
          >
            {p}
          </p>
        ))}
      </div>

      <div style={{ marginTop: "2rem" }}>
        <Calculator initial={initial} />
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

      <section style={{ marginTop: "3rem", maxWidth: 760 }}>
        <h2>{copy.feeStackTitle}</h2>
        {copy.feeStackParagraphs.map((p, i) => (
          <p key={i} style={{ lineHeight: 1.65, margin: "0 0 1rem" }}>
            {p}
          </p>
        ))}
      </section>

      <section style={{ marginTop: "3rem", maxWidth: 760 }}>
        <h2>{copy.mistakesTitle}</h2>
        <ul style={{ lineHeight: 1.65, paddingLeft: "1.25rem" }}>
          {copy.mistakes.map((m, i) => (
            <li key={i} style={{ marginBottom: "0.75rem" }}>
              {m}
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: "3rem", maxWidth: 760 }}>
        <h2>{copy.recommendationsTitle}</h2>
        <ul style={{ lineHeight: 1.65, paddingLeft: "1.25rem" }}>
          {copy.recommendations.map((rec, i) => (
            <li key={i} style={{ marginBottom: "0.75rem" }}>
              {rec}
            </li>
          ))}
        </ul>
      </section>

      <section style={{ marginTop: "3rem", maxWidth: 760 }}>
        <h2>{copy.checklistTitle}</h2>
        <ul style={{ lineHeight: 1.65, paddingLeft: "1.25rem" }}>
          {copy.checklist.map((item, i) => (
            <li key={i} style={{ marginBottom: "0.75rem" }}>
              {item}
            </li>
          ))}
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
