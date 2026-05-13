# tiktokshopcalc — Implementation Plan

**Status:** Plan v1 · 2026-05-12
**Architect:** Indie Systems Architect (GSV stack)
**Position in network:** New spoke under [vertexnetwork/hub](https://github.com/vertexnetwork/hub), sibling to `etsymargin`, `kdpcover`, `shopifont`, `tokenmath`, `captionsnap`.

---

## 0. Executive summary

A free, client-side, programmatic-SEO calculator for TikTok Shop US sellers that exposes their **true net margin** after the full 2026 fee stack: referral fee + payment processing + sales-tax-on-referral-fee + creator affiliate commission + refund admin reserve + FBT logistics (now mandatory post-March 31, 2026). Modeled structurally on the proven sibling [etsymargin.tools](https://etsymargin.tools): single hero calc, waterfall fee breakdown, ~60 category-specific pSEO landing pages, $39 Gumroad "Bible" upsell, mandatory Vertex Network footer link.

**Score against the Vertex Network playbook:** 92/100 (per ideation). Earning potential high (B2B e-com RPM $15–18.50), implementation pure client-side math (zero backend, zero DB), maintenance budget <1hr/mo.

**Path to $200/mo at $18.50 RPM:** 10,810 monthly pageviews. Plan reaches that via ~60 pSEO pages + community seeding in r/TikTokMarketing, r/dropship, r/ecommerce.

---

## 1. Identity & registration

| Field | Value | Constraint |
|---|---|---|
| `slug` | `tiktokshopcalc` | lowercase, single word, used in `spokes.json` |
| `name` | `TikTok Shop Calc` | display name |
| `shortName` | `TTShopCalc` | ≤12 chars (manifest, storage prefix) |
| `domain` | `tiktokshopcalc.tools` | apex; vercel.json enforces apex↔www 308 |
| `url` | `https://tiktokshopcalc.tools` | absolute, no trailing slash |
| `tagline` | `See your true TikTok Shop margin before the fees eat it.` | ≤80 chars |
| `description` | `Free 2026 TikTok Shop profit calculator — referral fee, creator commission, FBT, refund admin, sales tax. Browser math, no signup.` | ≤160 chars |
| `audience` | `TikTok Shop sellers and creator-affiliate brands` | |
| `tags` | `["tiktok-shop", "calculator", "ecommerce"]` | |
| `status` | `soon` → `live` | flip after deploy |

**PRs to hub on Day 1 (before first deploy):**
1. Add the above entry to `config/network.json` (sites array) with `status: "soon"`.
2. Add `{ "slug": "tiktokshopcalc", "repo": "vertexnetwork/tiktokshopcalc" }` to `config/spokes.json`.
3. Merge → hub's `propagate.yml` fans the change out to every other spoke automatically.

**Trademark disclaimer (in `siteConfig.trademarkDisclaimer` and footer):**
`TikTok and TikTok Shop are trademarks of ByteDance Ltd. This is an independent tool, not affiliated with, endorsed by, or sponsored by TikTok or ByteDance.`

---

## 2. Branding (per ideation, hub-conformant tokens)

Defined as values in `app/globals.css` under `@theme {…}` — token **names** are network-wide; values are per-spoke.

```css
@theme {
  --color-bg: #0A0A0F;              /* Deep Black */
  --color-surface: #14141C;
  --color-accent: #00E5FF;          /* Electric Cyan — primary CTA, focus ring */
  --color-on-bg: #F5F7FA;
  --color-on-accent: #0A0A0F;
  --color-muted: #8A8FA3;
  --color-border: #2A2A38;
  --color-success: #4ADE80;
  --color-danger: #FF2D6A;          /* TikTok Pink/Red — fee bars in waterfall */
  --font-display: "Poppins", system-ui, sans-serif;
  --font-body: "Inter", system-ui, sans-serif;
}
```

**Hard rule (P0 audit gate):** zero hardcoded hex in JSX/MDX outside this block. Use Tailwind v4 arbitrary syntax: `bg-(--color-surface)`, `text-(--color-on-bg)`, etc.

---

## 3. The fee engine (the core IP)

All math runs client-side in a single pure module: `lib/fee-engine.ts`. No API calls. No state library — React hooks. Every formula here is sourced from TikTok Seller University and reconciled against four independent calculators (EchoTik, Dashboardly, OneCart, SimpTok). Source URLs in §13.

### 3.1 TypeScript types (locked)

```ts
// lib/fee-engine.ts

export type LogisticsMode = "FBT" | "UpgradedTikTokShipping" | "CollectionsByTikTok";
export type CreatorPlan  = "None" | "Open" | "Targeted";
export type WeightTier   = "0-4lb" | "4-10lb" | "10-30lb" | "30lb+";

export interface FeeInput {
  // Item economics
  sellingPrice: number;          // USD per unit, > 0
  units: number;                 // integer >= 1
  cogs: number;                  // landed cost per unit
  shippingChargedToBuyer: number; // usually 0 in TikTok Shop

  // Category — drives referral rate via lib/categories.ts lookup
  categorySlug: string;
  // Optional: override the looked-up rate (advanced users / future-proofing)
  referralRateOverride?: number;

  // Logistics (independent shipping deprecated 2026-03-31)
  logistics: LogisticsMode;
  weightTier: WeightTier;        // drives FBT fee
  fbtMultiUnitDiscount: boolean; // applies the up-to-24% multi-unit discount (Jan 12, 2026+)

  // Creator
  creatorPlan: CreatorPlan;
  creatorCommissionPct: number;  // 0..0.50

  // Risk / returns
  refundRatePct: number;         // 0..0.30, expected fraction of orders refunded
  shopPerformanceScore: "ge4" | "lt4";
  expectedReturnShipCost: number; // USD per returned order

  // Promotions / new seller
  newSellerPromo: boolean;       // 3% referral for first 30 days
  sellerFundedDiscount: number;  // USD, reduces revenue
  platformFundedDiscount: number; // USD, does NOT reduce referral base
  collectiblesOver10kPortion?: number; // USD portion above $10K (3% rate)

  // Tax (effective 2025-11-01)
  salesTaxOnReferralFee: boolean;
  buyerStateTaxRate: number;     // 0..0.10 — only applied if above is true

  // Cash-out (optional toggle)
  includeCashoutFee: boolean;    // adds $0.05 per cash-out
}

export interface FeeBreakdown {
  grossRevenue: number;
  referralBase: number;
  referralRate: number;
  referralFee: number;
  salesTaxOnFee: number;
  paymentProcessing: number;
  creatorCommission: number;
  fbtFee: number;
  refundAdminFee: number;
  returnShipReserve: number;
  cashoutFee: number;
  cogsTotal: number;
  yourShippingCost: number;       // 0 under mandatory FBT/UTS/CBT
  sellerDiscount: number;
  totalFees: number;
  netProfit: number;
  marginPct: number;              // net / gross
  feeTakeRate: number;            // totalFees / gross
  roasBreakeven: number;          // gross / net  (advertising headroom)
  // Diagnostics for the waterfall + callouts
  steps: Array<{ label: string; delta: number; running: number; explain: string }>;
  warnings: string[];             // SPS<4 penalty, new-seller cliff, etc.
}

export function calcFees(input: FeeInput): FeeBreakdown;
```

### 3.2 Formulas (locked, 2026 US — every line cites a source in §13)

```
// REVENUE
gross_revenue      = (selling_price + shipping_charged_to_buyer) * units

// REFERRAL FEE
//   - new seller promo overrides everything: 3% for first 30 days post-first-sale
//   - per-category rate from lib/categories.ts (5% for precious jewelry L2s + all pre-owned;
//     6% for everything else)
//   - collectibles & pre-owned drop to 3% on the portion over $10K (single order)
//   - platform-funded discount is ADDED back into the referral base (charged pre-discount)
//   - sales tax passthrough is EXCLUDED from the referral base
referral_base      = (gross_revenue - sales_tax_passthrough) + platform_funded_discount
referral_rate      = newSellerPromo ? 0.03
                   : categories[categorySlug].rate   // 0.06 default, 0.05 jewelry-precious + pre-owned
base_portion       = max(0, referral_base - collectiblesOver10kPortion)
high_portion       = max(0, collectiblesOver10kPortion)
referral_fee       = base_portion * referral_rate + high_portion * 0.03

// SALES TAX ON REFERRAL FEE (effective 2025-11-01)
sales_tax_on_fee   = salesTaxOnReferralFee
                       ? referral_fee * buyerStateTaxRate
                       : 0

// PAYMENT PROCESSING
// Default model: 2.9% + $0.30/order (industry baseline, Stripe-equivalent)
// Conservative alt available via input.paymentProcessingOverride if user knows their card mix.
payment_processing = gross_revenue * 0.029 + 0.30 * orders

// CREATOR COMMISSION (item subtotal only — shipping excluded)
//   - plan bounds enforced in UI: Open clamps to [0.05, 0.15], Targeted [0.15, 0.30]
//   - None forces 0
creator_commission = creatorPlan === "None"
                       ? 0
                       : (selling_price * units) * creatorCommissionPct

// FBT FULFILLMENT (mandatory post-2026-03-31 unless UTS or CBT chosen)
// 0-4lb weight tier: single-unit $3.58, multi-unit discounted up to 24% from Jan 12, 2026
fbt_per_unit       = fbtRateCard[weightTier].base
                   * (fbtMultiUnitDiscount && units >= 2 ? 0.76 : 1.00)
fbt_fee            = logistics === "FBT" ? fbt_per_unit * units
                   : logistics === "UpgradedTikTokShipping" ? utsRateCard[weightTier]
                   : cbtRateCard[weightTier]

// REFUND ADMIN FEE
//   - 20% of referral_fee, capped at $5 PER SKU
//   - amortized over expected refund rate
refund_admin_fee   = min(referral_fee * 0.20, 5.00) * refundRatePct

// RETURN SHIPPING RESERVE
//   - 20% to seller if SPS >= 4, 50% if SPS < 4
//   - reserve = orders * refund_rate * cost_per_return * seller_share
return_ship_reserve = orders * refundRatePct * expectedReturnShipCost
                    * (shopPerformanceScore === "ge4" ? 0.20 : 0.50)

// CASH-OUT
cashout_fee        = includeCashoutFee ? 0.05 : 0

// COGS & DIRECT COSTS
cogs_total         = cogs * units
your_shipping      = logistics === "FBT" ? 0
                   : max(0, sellerInboundShipping)  // only matters for UTS/CBT
seller_discount    = sellerFundedDiscount

// TOTALS
total_fees         = referral_fee + sales_tax_on_fee + payment_processing
                   + creator_commission + fbt_fee + refund_admin_fee
                   + return_ship_reserve + cashout_fee
net_profit         = gross_revenue - total_fees - cogs_total - your_shipping - seller_discount
margin_pct         = net_profit / gross_revenue
fee_take_rate      = total_fees / gross_revenue
roas_breakeven     = net_profit > 0 ? (gross_revenue / net_profit) : Infinity
```

### 3.3 The category rate lookup (`lib/categories.ts`)

The full TikTok Shop US L1/L2 chart resolves to **three rate tiers**:

- **6%** — every L2 in Automotive, Baby & Maternity, Beauty & Personal Care, Books, Collectibles (base portion), Computers, Fashion Accessories, Food & Beverages, Furniture, Health, Home Improvement, Home Supplies, Household Appliances, Kids' Fashion, Kitchenware, Luggage & Bags, Menswear, Pet Supplies, Phones & Electronics, Shoes, Sports & Outdoor, Textiles, Tools & Hardware, Toys & Hobbies, Womenswear, **and** Jewelry L2s: Amber, Artificial Gemstones, Mellite, Natural/Non-natural Crystal, Pearl, Semiprecious Stones, Silver.
- **5%** — Jewelry L2s: Diamond, Gold, Jade, Platinum/Carat Gold, Ruby/Sapphire/Emerald. All Pre-Owned L2s (Bags, Cards, Luggage, Watches, Footwear, Refurb Electronics, Fashion Accessories, Menswear, Womenswear, Collectible Coins, Collectible Figures, Collectible Comics).
- **3%** — Portion of any Collectibles or Pre-Owned order exceeding $10K. New-seller promo for 30 days.

Schema:

```ts
// lib/categories.ts
export interface Category {
  slug: string;            // pSEO URL slug
  l1: string;              // Level-1 name
  l2: string;              // Level-2 name
  rate: 0.05 | 0.06;       // base referral rate
  highTierRate?: 0.03;     // applies to portion over $10K (collectibles, pre-owned)
  creatorBand: [number, number];  // suggested commission band, e.g. [0.15, 0.30] for beauty
  defaults: {
    sellingPrice: number;
    cogs: number;
    creatorPct: number;
    refundRatePct: number;
  };
  hookAngle: string;       // one-line pSEO problem framing
  weightTierDefault: WeightTier;
  related: string[];       // 6 sibling slugs for cross-linking
}

export const CATEGORIES: Record<string, Category> = { /* 60+ entries — see §5 */ };
```

### 3.4 Output blocks

1. **Hero KPIs:** Net profit (currency), margin % (color-coded: red <10%, amber 10–25%, green >25%), fee take-rate %, ROAS breakeven.
2. **Waterfall chart:** horizontal bars from gross → net, one red bar per fee in `--color-danger`, net profit bar in `--color-success`. Pure SVG, fixed `viewBox`, CLS=0.
3. **Line-item table:** every fee row with amount + running total + % of revenue.
4. **Scenario callouts (auto-generated):**
   - "Dropping creator commission 20% → 15% adds $X net per order."
   - "Targeted Plan at 25% breaks even when conversion lift ≥ Y%."
   - "If you fall under SPS 4, your return cost doubles to $X per refund."
   - "Your new-seller 3% expires in N days; net drops by $X/order at standard 6%."
5. **Share link:** state-encoded URL (`?s=<base64url>`) via `lib/share.ts`. Same encoding as `tokenmath`.
6. **Single CTA below results:** Gumroad Bible, $39.

### 3.5 Edge cases the engine handles (and competitors miss)

- **Platform-funded discount paradox** — referral fee charged on pre-discount price.
- **Sales tax on referral fee** — effective 2025-11-01.
- **Independent shipping is gone** (2026-03-31) — logistics select offers only FBT / UTS / CBT.
- **FBT multi-unit discount** — up to 24% off for 2+ units in 0–4lb tier, effective 2026-01-12.
- **Storage 60 days free** (not 30 — verified against the official FBT Rate Card knowledge article, updated 2026-01-08).
- **30-day commission lock** — surface a warning if user just lowered their rate.
- **SPS<4 return penalty** — return cost split flips from 20/80 to 50/50.
- **New-seller cliff** — when toggled off, surface the dollar delta the seller will lose at day 31.
- **Collectibles/Pre-Owned >$10K tier** — automatic 3% rate on the high portion.
- **Cash-out fee** — $0.05 per withdrawal, $2 minimum; default off, surfaced as optional.

### 3.6 Test plan (`lib/fee-engine.test.ts`)

40+ golden cases pinned to specific real-world TikTok Shop scenarios. Each case is `{ name, input, expected: Partial<FeeBreakdown> }`. Minimum coverage:

- 1 case per L1 category at median price
- New-seller promo on vs off (verify 3% → 6% cliff)
- Jewelry: Gold (5%) vs Silver (6%) at same price
- Collectibles: $5K order vs $15K order (tier blending)
- Creator: None / Open 10% / Targeted 25% on the same product
- FBT single-unit vs FBT 4-unit (volume discount)
- SPS ge4 vs SPS lt4 (return reserve doubling)
- Platform-funded discount: referral fee unchanged at $50 order regardless of $10 platform discount
- Seller-funded discount: net drops by the discount amount, referral unchanged
- Sales tax on fee: 0% baseline vs 7% TX rate
- Loss case: COGS > selling price * (1 - take rate) → negative net, ROAS = Infinity, warning surfaces

Tests run in **<200ms total** and pass on a clean checkout before any UI work.

---

## 4. Hub-conformant file tree

Generated from the hub's `_scaffold-spec.md`. Every file is one of: **HUB** (synced), **SPOKE** (we own), **CONFIG** (driven by `siteConfig`), **GENERATED** (script-produced), **ENV** (env-driven), **OPT-IN** (feature-flagged).

```
tiktokshopcalc/
├── .github/
│   ├── workflows/
│   │   ├── ci.yml                       # uses: vertex-network/.github/workflows/ci.yml@v1
│   │   ├── lighthouse.yml               # hub reusable
│   │   ├── sync-from-hub.yml            # copied verbatim from templates/spoke/.github/workflows/
│   │   └── sitemap-ping.yml             # GSC + Bing IndexNow on prod deploy
│   ├── CODEOWNERS
│   ├── PULL_REQUEST_TEMPLATE.md
│   ├── ISSUE_TEMPLATE/{bug,feature}.md
│   └── dependabot.yml                   # npm + actions, weekly grouped
├── app/
│   ├── layout.tsx                       # CONFIG: root metadata, fonts, providers
│   ├── globals.css                      # SPOKE: @theme tokens (cyan/black/pink palette)
│   ├── page.tsx                         # SPOKE: hero + calculator
│   ├── (site)/
│   │   ├── layout.tsx                   # SiteHeader + main + SiteFooter
│   │   ├── about/page.tsx               # SPOKE: why this tool exists
│   │   ├── changelog/page.tsx           # GENERATED from content/changelog.json
│   │   ├── contact/page.tsx             # CONFIG: mailto only
│   │   ├── network/page.tsx             # HUB: reads public/network.json
│   │   ├── privacy/page.tsx             # HUB MDX + placeholders
│   │   ├── terms/page.tsx               # HUB MDX + placeholders
│   │   ├── pricing/page.tsx             # SPOKE (Gumroad upsell page; not Stripe v1)
│   │   └── embed/page.tsx               # OPT-IN: iframe-able calc (CSP frame-ancestors *)
│   ├── (pseo)/tiktok-shop-fees/[slug]/page.tsx   # generateStaticParams + generateMetadata
│   ├── api/og/route.tsx                 # Edge ImageResponse — state-encoded OG image
│   ├── robots.ts                        # reads public/ai-bots.json
│   ├── sitemap.ts                       # static + pSEO; <45k URLs so single shard
│   ├── llms.txt/route.ts                # text/plain, 3h cache, ≤15 KB
│   ├── llms-full.txt/route.ts           # text/plain, 3h cache, ≤100 KB
│   ├── ads.txt/route.ts                 # HUB
│   ├── app-ads.txt/route.ts             # HUB
│   ├── .well-known/security.txt         # CONFIG: RFC 9116
│   ├── manifest.ts                      # CONFIG
│   ├── icon.svg                         # SPOKE: brand mark
│   ├── apple-icon.tsx                   # 180x180 via next/og
│   ├── opengraph-image.tsx              # 1200x630 via next/og
│   ├── twitter-image.tsx                # re-export
│   └── not-found.tsx                    # CONFIG
├── components/
│   ├── calc/
│   │   ├── Calculator.tsx               # main form + results, the centerpiece
│   │   ├── InputRow.tsx
│   │   ├── CategorySelect.tsx
│   │   ├── WaterfallChart.tsx           # SVG, no chart lib (CLS=0 mandate)
│   │   ├── FeeBreakdownTable.tsx
│   │   ├── ScenarioCallouts.tsx
│   │   └── ShareButton.tsx
│   ├── layout/{SiteHeader,SiteFooter,MobileMenu,StickyMobileCta}.tsx
│   ├── analytics/{Analytics,Clarity}.tsx
│   ├── ads/{AdsProviderScript,AdSlot}.tsx     # CLS-safe slots, AdSense after threshold
│   ├── seo/{JsonLd,SoftwareApplicationSchema,FaqSchema,BreadcrumbSchema,AboutPageSchema,FinanceApplicationSchema}.tsx
│   ├── consent/{ConsentProvider,CookieConsent}.tsx
│   ├── affiliate/AffiliateSlot.tsx
│   ├── brand/{Wordmark,Logo}.tsx
│   └── mdx/MdxComponents.tsx
├── content/
│   ├── changelog.json                   # GENERATED by scripts/build-changelog.ts
│   └── pseo/                            # SPOKE — see §5
│       ├── beauty-personal-care.mdx
│       ├── fashion-apparel.mdx
│       ├── … 60+ files
├── lib/
│   ├── site-config.ts                   # KEYSTONE — every brand string lives here
│   ├── fee-engine.ts                    # pure math, fully tested with vitest
│   ├── fee-engine.test.ts
│   ├── categories.ts                    # category catalog: slug, label, referral %, creator suggested band
│   ├── csp.ts                           # buildCSP({ providers })
│   ├── network.ts                       # loads public/network.json
│   ├── seo.ts                           # JSON-LD builders
│   ├── analytics.ts                     # safeTrack
│   ├── storage.ts                       # versioned localStorage (last-used inputs)
│   ├── share.ts                         # URL <-> state codec
│   └── mdx.ts                           # loadPseoMdx
├── public/
│   ├── network.json                     # HUB-synced
│   ├── ai-bots.json                     # HUB-synced
│   ├── ads.txt, app-ads.txt             # GENERATED per-site
│   ├── humans.txt                       # GENERATED
│   ├── .well-known/security.txt         # GENERATED
│   ├── og-default.png                   # SPOKE 1200x630
│   ├── favicon.ico, favicon-16.png, favicon-32.png
│   ├── icon-192.png, icon-512.png
│   └── apple-touch-icon-180.png
├── scripts/
│   ├── build-changelog.ts
│   ├── build-llms-txt.ts
│   ├── build-llms-full-txt.ts
│   ├── build-discovery.ts               # ads/app-ads/security/humans/favicons
│   └── generate-favicon.ts              # sharp pipeline
├── tests/
│   ├── unit/fee-engine.test.ts          # the critical suite
│   ├── unit/share.test.ts
│   └── e2e/calculator.spec.ts           # Playwright
├── .env.example                         # mirrors hub env.template.json
├── .gitattributes, .gitignore, .nvmrc (22), .prettierrc.json
├── eslint.config.mjs, lighthouserc.json (perf>=0.9, a11y/bp/seo>=0.95, CLS=0)
├── next.config.ts (uses lib/csp.ts)
├── package.json, playwright.config.ts, postcss.config.mjs (@tailwindcss/postcss)
├── tsconfig.json (paths: @/*), vercel.json (HSTS 2y, X-Frame-Options DENY except /embed/*)
└── vitest.config.ts
```

---

## 5. Programmatic SEO — 60 category pages, ranked by 2026 search intent

**URL pattern:** `/tiktok-shop-fees/[slug]` (mirrors etsymargin's `/etsy-profit-margin/[slug]`).

**Page intent classes** (each slug is tagged so we can balance the index):

- **C = Commercial** — "{product} profit calculator", "how much does TikTok Shop take from {product}". High conversion. Direct calc embedded with category defaults pre-filled.
- **I = Informational** — "TikTok Shop {category} fees explained", "why your {product} margins are negative". Long-form, ranks for top-of-funnel queries.
- **N = Niche / Viral** — specific viral products from 2026 trend data (hair growth, weighted plush, hyaluronic serum). High volume, low competition.

### 5.1 Final 60-slug seed list (ranked tier 1 → tier 3 by expected traffic)

**Tier 1 — Beauty & Personal Care (22.5% of TikTok Shop GMV; this is where the volume is):**

| Slug | Intent | Notes |
|---|---|---|
| `beauty-personal-care` | I | L1 hub page, links to all beauty L2s |
| `skincare` | C | Top-3 GMV L2; pre-fill $32 price / $8 cogs / 20% creator |
| `hyaluronic-acid-serum` | N | "AM/PM routine" viral pattern in 2026 |
| `brightening-serum` | N | Before/after content viral driver |
| `face-masks` | N | High repeat-purchase; lower margin trap |
| `lip-products` | N | "Lip oil" category exploded post-2025 |
| `false-lashes` | N | Classic TT Shop viral category |
| `lash-serum` | N | Eyelash growth — high AOV |
| `nail-polish` | N | Press-ons sub-niche too |
| `press-on-nails` | N | Distinct from polish; higher AOV |
| `makeup` | C | L2 hub, links to lip/eye/face |
| `hair-extensions` | N | Canvas Beauty $1M live = social proof |
| `hair-growth` | N | Highest-margin in haircare |
| `haircare` | C | L2 hub |
| `fragrance` | I | High margin but lower velocity |
| `bath-body` | I | Soaps, scrubs, bath bombs |
| `mens-grooming` | N | Growing 2026 segment |

**Tier 2 — Health & Wellness + viral "Soft Life" products:**

| Slug | Intent | Notes |
|---|---|---|
| `health-wellness` | I | L1 hub |
| `vitamins-supplements` | C | "Soft Life" category; high AOV |
| `protein-powder` | N | Repeat purchase |
| `weighted-plush` | N | 2026 viral, anxiety/insomnia angle |
| `red-light-therapy` | N | Fastest-growing wellness sub-niche |
| `whitening-strips` | N | Recurring viral |
| `posture-correctors` | N | Cheap, high-margin gadget |

**Tier 3 — Home, Kitchen, Electronics (practical-gadget surge):**

| Slug | Intent | Notes |
|---|---|---|
| `home-supplies` | I | L1 hub |
| `home-decor` | C | Highest L2 volume in home |
| `kitchen-gadgets` | N | Viral kitchen tools (chopper, peeler, etc.) |
| `cleaning-products` | N | Viral content category |
| `home-organizers` | C | Closet/pantry organization |
| `bedding` | C | High AOV |
| `candles` | N | Mid-AOV, repeat purchase |
| `phones-electronics` | I | L1 hub |
| `phone-cases` | C | Volume play, thin margin |
| `wireless-earbuds` | C | Tech & Electronics commission band 5–10% |
| `smart-home` | N | Smart bulbs, plugs, sensors |
| `gaming-accessories` | N | Controllers, headsets |

**Tier 4 — Fashion, Jewelry, Accessories:**

| Slug | Intent | Notes |
|---|---|---|
| `womenswear` | I | L1 hub |
| `dropshipping-fashion` | N | High-intent commercial query |
| `dresses` | C | Top womenswear L2 |
| `activewear` | C | "Soft Life" + wellness overlap |
| `print-on-demand-tshirts` | N | POD-specific economics page |
| `shoes` | I | L1 hub |
| `fashion-accessories` | I | L1 hub |
| `eyewear` | N | Margins surprisingly thin |
| `gold-jewelry` | N | **5% referral rate** — highlight the discount |
| `silver-jewelry` | N | **6% referral rate** — explain the difference |
| `diamond-jewelry` | N | 5% rate, high AOV |
| `personalized-jewelry` | N | Engraved/custom — high margin |

**Tier 5 — Long-tail / specific viral niches + L1 catch-alls:**

| Slug | Intent | Notes |
|---|---|---|
| `food-beverages` | I | L1 hub |
| `snacks` | N | Asian snacks viral in 2026 |
| `coffee` | C | Specialty / instant |
| `pet-supplies` | I | L1 hub |
| `dog-treats` | C | Repeat purchase |
| `cat-toys` | N | Lower AOV but high volume |
| `toys-hobbies` | I | L1 hub |
| `plush-toys` | C | Distinct from weighted-plush |
| `lego-sets` | N | Specific high-volume search |
| `trading-cards` | N | **5% referral on pre-owned** — angle |
| `collectibles` | I | $10K tier explainer |
| `baby-maternity` | I | L1 hub |
| `baby-clothing` | C | Top baby L2 |
| `tools-hardware` | I | L1 hub |
| `power-tools` | C | High AOV |
| `automotive` | I | L1 hub |
| `car-accessories` | C | Volume L2 |
| `books` | I | L1 hub, lowest priority |
| `sports-outdoor` | I | L1 hub |
| `fitness-equipment` | C | "Soft Life" wellness overlap |

**Total: 60 slugs.** Tier 1 is 17 pages (28% of pages, expected ~50% of organic traffic). Tier 2+3 are the practical-gadget surge. Tier 4 carries the jewelry-rate differentiation story (the 5% vs 6% distinction is a powerful link bait).

### 5.2 What changed from v1

- Dropped weak slugs (`stickers`, `wall-art`, `vintage-clothing`, `journals-planners`, `desk-accessories`, `cookbooks`, `yoga-gear`, `baby-feeding`, `educational-toys`, `tumblers-mugs`) — low TikTok Shop GMV share or low search-volume signal.
- Added 2026-specific viral product slugs from current trend data (`hyaluronic-acid-serum`, `brightening-serum`, `weighted-plush`, `red-light-therapy`, `posture-correctors`, `hair-growth`, `lash-serum`, `press-on-nails`, `mens-grooming`).
- Replaced generic `jewelry-precious` with the 5%-rate L2s explicitly (`gold-jewelry`, `silver-jewelry`, `diamond-jewelry`) — each page leads with the rate differential as the SEO hook.
- Tagged every slug as C / I / N so the editorial pass knows what kind of page to write.

### 5.3 pSEO page template (~1200 words per page)

1. **H1** — pattern: `"How [Category] sellers actually price on TikTok Shop without giving up [X%] in fees (2026)"`.
2. **Intro 80–100 words** — category-specific problem framing.
3. **Pre-filled calculator** — same `<Calculator>` with `?cat=<slug>` injecting defaults.
4. **Real fee breakdown** — itemized table with the category's actual referral rate (5% vs 6%) called out.
5. **3 worked examples** — Low / Median / Viral scenarios from `category.defaults`.
6. **Common mistakes** — 4 tactical bullets per category.
7. **Recommendations** — 4 bullets ("aim for X% margin", "test Y commission band").
8. **FAQ** — 2–3 Q&As (FAQ JSON-LD).
9. **Related** — 6 sibling pSEO links + 3 cross-network links to `etsymargin` / `kdpcover` / `shopifont` for multi-channel sellers.
10. **CTA** — Gumroad Bible link with UTM `?utm_source=tiktokshopcalc&utm_medium=pseo&utm_campaign=<slug>`.

### 5.4 JSON-LD on every pSEO page

- `BreadcrumbList`: Home → TikTok Shop fees → {Category}
- `FAQPage` from the 2–3 Q&As
- `FinanceApplication` (via `siteConfig.jsonLd.type`)
- `HowTo` (the "how to price" angle)
- `AboutPage` on `/about` (required if/when Mediavine kicks in)

### 5.5 SEO invariants (build-time enforced in vitest)

- Meta title ≤60 chars
- Meta description ≤155 chars
- Each pSEO body ≥250 words
- FAQ question strings deduped network-wide (no copy-paste between pages)
- No raw hex in MDX
- Canonical URL exact-match to `siteConfig.url + path`
- Every page links to ≥6 siblings and ≥1 cross-network spoke

### 5.2 pSEO page template (per page, ~1200 words)

1. **H1** — pattern: `"How [Category] sellers actually price on TikTok Shop without giving up [X%] in fees (2026)"`.
2. **Intro 80–100 words** — problem framing specific to the category (e.g., for `electronics`: low creator commission band 5–10% but ad-CPMs are brutal; for `beauty`: 15–30% creator band devours margin without batch testing).
3. **Pre-filled calculator** (the same `<Calculator>` component with category defaults injected via URL param `?cat=<slug>`).
4. **Real fee breakdown** — itemized table with the category's specific numbers.
5. **3 worked examples** — Low / Median / Viral scenarios using `category.examples`.
6. **Common mistakes** — 4 tactical bullets per category.
7. **Recommendations** — 4 bullets ("aim for X% margin", "test Y commission band", "watch for Z").
8. **FAQ** — 2–3 Q&As (FAQ JSON-LD emitted).
9. **Related** — 6 sibling pSEO links + 3 cross-network links (etsymargin if seller is multi-channel, etc.).
10. **CTA** — Gumroad Bible link.

### 5.3 JSON-LD on every pSEO page

- `BreadcrumbList`: Home → TikTok Shop fees → {Category}
- `FAQPage`: from the 2–3 Q&As
- `FinanceApplication`: from `siteConfig.jsonLd.type = "FinanceApplication"`, `applicationCategory: "FinanceApplication"`, `price: "0"`
- `Article` (or `HowTo` for the "how to price" angle)
- `AboutPage` on `/about` (required if/when Mediavine kicks in)

### 5.4 SEO invariants (build-time enforced in vitest)

- Meta title ≤60 chars
- Meta description ≤155 chars
- Each pSEO body ≥250 words
- FAQ question strings deduped network-wide
- No raw hex in MDX
- Canonical URL exact-match to `siteConfig.url + path`

---

## 6. Monetization (toggleable, free-tier validated first)

| Channel | Status v1 | Mechanism | Activates when |
|---|---|---|---|
| **Gumroad — "2026 TikTok Shop Margin Bible"** ($39) | **ON** | `NEXT_PUBLIC_GUMROAD_PRODUCT_URL`, `NEXT_PUBLIC_GUMROAD_PRICE=39` | Day 1. PDF + spreadsheet bundle with every category pre-modeled. |
| **Embed widget licensing** | ON (free) | `/embed`, `NEXT_PUBLIC_EMBED_ENABLED=1` | Day 1. Free embed builds backlinks; iframe code with copy-button. |
| **Affiliate slot** | OFF v1 | `NEXT_PUBLIC_AFFILIATE_ENABLED=0` | Flip when EchoTik / Shopify TikTok app affiliate approved (~30 days). |
| **AdSense** | OFF v1 | `NEXT_PUBLIC_AD_PROVIDER=adsense` after approval | Flip after ~500 pageviews + AdSense approval. |
| **Mediavine** | OFF v1 | Future | At 50k sessions/mo (Mediavine threshold). |
| **Stripe Pro tier** | OFF v1 | Hub supports it; we don't need it. | Possibly never — Gumroad covers the upsell economically. |

**Single affiliate slot principle** (network-wide rule): one affiliate link visible at a time, clearly disclosed in footer with `<AffiliateSlot>` rendering the disclosure when `features.affiliate.enabled`.

---

## 7. Env vars (`.env.example`, matches hub `env.template.json`)

```bash
# Identity
NEXT_PUBLIC_SITE_NAME="TikTok Shop Calc"
NEXT_PUBLIC_SITE_SHORT_NAME="TTShopCalc"
NEXT_PUBLIC_SITE_DOMAIN="tiktokshopcalc.tools"
NEXT_PUBLIC_SITE_URL="https://tiktokshopcalc.tools"
NEXT_PUBLIC_SITE_DESCRIPTION="Free 2026 TikTok Shop profit calculator."
NEXT_PUBLIC_SITE_CONTACT_EMAIL="hello@tiktokshopcalc.tools"

# SEO verification (filled in launch checklist step)
NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION=""
NEXT_PUBLIC_BING_SITE_VERIFICATION=""

# Analytics
NEXT_PUBLIC_VERCEL_ANALYTICS="1"
NEXT_PUBLIC_CLARITY_PROJECT_ID=""

# Ads (OFF v1)
NEXT_PUBLIC_AD_PROVIDER="none"

# Affiliate (OFF v1)
NEXT_PUBLIC_AFFILIATE_ENABLED="0"

# Email (OFF v1 — no signup form)
# RESEND_API_KEY=

# Stripe (OFF v1)
NEXT_PUBLIC_PRO_ENABLED="0"

# Gumroad (ON v1)
NEXT_PUBLIC_GUMROAD_PRODUCT_URL="https://gumroad.com/l/tiktok-shop-margin-bible"
NEXT_PUBLIC_GUMROAD_PRICE="39"

# Embed (ON v1)
NEXT_PUBLIC_EMBED_ENABLED="1"
```

---

## 8. CI / CD

**Workflows the spoke must ship:**
- `.github/workflows/ci.yml` → `uses: vertex-network/.github/workflows/ci.yml@v1` (pnpm install → typecheck → lint → vitest → build → LHCI).
- `.github/workflows/sync-from-hub.yml` → copied **verbatim** from `templates/spoke/.github/workflows/sync-from-hub.yml` in the hub. Listens for `repository_dispatch: vertex-hub-sync`, runs daily safety cron at 06:00 UTC, opens PRs to branch `hub-sync` with labels `hub-sync, automated`.
- `.github/workflows/lighthouse.yml` → reusable LHCI on Vercel preview deploys.
- `.github/workflows/sitemap-ping.yml` → on prod deploy, POST sitemap to GSC IndexNow + Bing IndexNow.

**Lighthouse budgets (non-negotiable):** Perf ≥0.9, A11y/BP/SEO ≥0.95, **CLS = 0** (waterfall chart must reserve height; ad slots use `--ad-slot-*-h` tokens).

**Vercel project setup:**
- Framework: Next.js 15 (auto-detected)
- Node: 22 (from `.nvmrc`)
- Build: `pnpm build`
- Output: `.next`
- Environment vars seeded via Vercel CLI from `.env.example` template
- Apex domain `tiktokshopcalc.tools` + `www` redirect via `vercel.json`

---

## 9. Test strategy

| Layer | Tool | What it covers |
|---|---|---|
| **Fee engine unit tests** | Vitest | Every formula in §3.2 with golden values per category. ~40 cases. Includes regression for the platform-funded-discount paradox, FBT volume break, new-seller cliff, SPS return split. |
| **Share-link codec** | Vitest | Roundtrip encode/decode for every input field; rejects malformed `?s=` payloads. |
| **SEO invariants** | Vitest | Title ≤60, description ≤155, pSEO body ≥250 words, FAQ dedup, no raw hex. |
| **E2E** | Playwright | Calc renders, inputs update outputs in <100ms, waterfall draws, share URL works, mobile hamburger opens/closes, /embed loads in iframe. |
| **Lighthouse** | LHCI | Budgets above on every PR preview. |

---

## 10. Launch checklist (sequenced)

### Phase A — Spin-up (Day 0–2)
- [ ] Create empty GitHub repo `ThatMovieGuyOriginal/tiktokshopcalc` (public).
- [ ] Open PR to hub adding entries in `config/network.json` (`status: "soon"`) and `config/spokes.json`. Merge.
- [ ] `pnpm create next-app@latest tiktokshopcalc --typescript --tailwind --app --src-dir=false --import-alias "@/*"`.
- [ ] Scaffold the file tree in §4 — start by cloning [etsymargin's](https://github.com/ThatMovieGuyOriginal/etsymargin) structure and rebranding (with permission from network owner / per network conventions).
- [ ] Drop in `sync-from-hub.yml` verbatim from hub `templates/spoke/`.
- [ ] Drop in `ci.yml` referencing `vertex-network/.github/workflows/ci.yml@v1`.

### Phase B — Engine (Day 2–4)
- [ ] Build `lib/fee-engine.ts` with the formulas in §3.2.
- [ ] Write `lib/fee-engine.test.ts` — 40+ cases pinned to specific real-world TikTok Shop fee scenarios. **Tests pass before any UI.**
- [ ] Build `lib/categories.ts` with the 60 entries from §5.1, each with category-specific referral rate, creator band, defaults, examples, related[].

### Phase C — UI (Day 4–6)
- [ ] `<Calculator>` component: form on the left (mobile: top), results on the right (mobile: below).
- [ ] `<WaterfallChart>`: pure SVG, no chart lib (CLS=0), each fee bar in `--color-danger`, net profit bar in `--color-success`.
- [ ] `<FeeBreakdownTable>`: line items with running total column.
- [ ] `<ScenarioCallouts>`: 2–3 auto-generated insights based on current input state.
- [ ] Share button + state-encoded URL.
- [ ] All required pages from §4 (about, contact, changelog, network, privacy, terms, /embed).
- [ ] Mandatory hamburger menu under 640px (zero-JS `<details>`).
- [ ] Mandatory footer link "Part of the Vertex Network" → `/network`, fires `vertex_footer_opened` analytics event.

### Phase D — pSEO (Day 6–10)
- [ ] Write the 60 MDX templates. Bulk-generate skeletons via a script, then hand-tune the intro + mistakes + recommendations per category for E-E-A-T.
- [ ] Wire `app/(pseo)/tiktok-shop-fees/[slug]/page.tsx` with `generateStaticParams` + `generateMetadata`.
- [ ] Add pSEO routes to `app/sitemap.ts`.
- [ ] Cross-link each page to 6 sibling pSEO pages.

### Phase E — Polish + ship (Day 10–12)
- [ ] OG image generator (`app/opengraph-image.tsx`) — state-encoded for share links.
- [ ] Generate favicon set via `scripts/generate-favicon.ts`.
- [ ] Fill `siteConfig.security.contact` + expires (1y).
- [ ] Run audit prompt from hub `docs/_canonical-audit-prompt.md` against the spoke. Resolve every P0.
- [ ] LHCI green.
- [ ] Deploy to Vercel.
- [ ] DNS: Namecheap → Vercel.
- [ ] GSC site claim (paste verification token into env).
- [ ] Bing Webmaster claim.
- [ ] Bundle the "Margin Bible" PDF + spreadsheet, publish to Gumroad with UTM-tagged listing.

### Phase F — Flip network status (Day 12)
- [ ] PR to hub flipping `config/network.json` entry for `tiktokshopcalc` from `"soon"` → `"live"`.
- [ ] Merge → fan-out hits every sibling spoke; their `/network` pages auto-reflect us.

### Phase G — Traffic (Day 12 onward)
- [ ] Reddit value-first posts in r/TikTokShopSellers, r/dropship, r/ecommerce, r/sweatystartup. **No links in title** — tool linked in a top-level comment with a worked example for the OP's category.
- [ ] X / TikTok Shop seller communities: post 3 worked examples ("here's why your 8% margin is actually 2% after the 30-day commission lock").
- [ ] Hacker News Show HN (the angle: "I rebuilt the etsymargin pattern for TikTok Shop after the 2026 mandatory-FBT rule").
- [ ] Reach 10,810 PV target (~$200 at $18.50 RPM); flip on AdSense once approved.

---

## 11. Risks & mitigations

| Risk | Mitigation |
|---|---|
| **TikTok fee schema changes mid-quarter.** | Version `lib/categories.ts` with a `feeSchemaVersion` string; surface "last updated YYYY-MM-DD" in footer. Subscribe to TikTok Seller University updates (Reference: [seller-us.tiktok.com/university](https://seller-us.tiktok.com/university)). Update path is one file, one PR. |
| **Saturated keyword market** (EchoTik, Dashboardly, OneCart, Kixmon, SimpTok, Futureproof, Zebracat). | Differentiate on: (a) **zero signup**, (b) **client-side math** (instant), (c) **2026-specific accuracy** including mandatory-FBT + sales-tax-on-fee, (d) **60 category-specific pSEO pages** competitors don't have, (e) **embed widget** for backlinks. |
| **AdSense approval delay** on a new domain. | Gumroad Bible + embed-driven backlinks are non-AdSense revenue paths. AdSense flipping on Day 30+ doesn't gate $200/mo. |
| **CLS regression from the waterfall chart.** | Pure-SVG implementation with fixed `viewBox` and reserved container height. LHCI gate set to CLS=0. |
| **Trademark / impersonation concern.** | Visible disclaimer in `<SiteFooter>` and `siteConfig.trademarkDisclaimer`. Domain `tiktokshopcalc.tools` is generic-descriptive. |
| **Sibling-network drift** (e.g., env var renames). | `sync-from-hub.yml` daily cron + `audit prompt` re-run before each deploy. |

---

## 12. Decisions locked (made without asking, per user directive)

1. **Domain:** `tiktokshopcalc.tools` (matches ideation; `.tools` is consistent with `etsymargin.tools`).
2. **No Supabase v1.** Pure client-side. Hub permits this — Supabase is optional. We toggle it on **only** when we add user accounts (not on roadmap).
3. **Pro tier:** Gumroad PDF/spreadsheet, **not** Stripe. Lower friction, no recurring billing infra, matches sibling pattern. Stripe envs left empty.
4. **No email capture v1.** Resend wiring stays dormant. We do not need a list to hit $200/mo via display + pSEO.
5. **pSEO URL prefix:** `/tiktok-shop-fees/[slug]` (not `/category/[slug]`) — keyword-rich, mirrors etsymargin's `/etsy-profit-margin/[slug]`.
6. **Logistics input is a select, not a checkbox** — because independent shipping is **gone** as of 2026-03-31; surfacing this teaches the user something and improves trust.
7. **Repo owner:** `vertexnetwork/tiktokshopcalc` (per user direction 2026-05-12). The hub PR for `spokes.json` should reference this org.
8. **Vertex Network footer link is mandatory** — non-negotiable per hub spec; P0 audit gate.

---

## 13. References

- Hub: [vertexnetwork/hub](https://github.com/vertexnetwork/hub) — scaffold spec, env contract, audit prompt
- Sibling reference: [etsymargin.tools](https://etsymargin.tools) — proven structural pattern
- TikTok Shop fee policy: [seller-us.tiktok.com/university](https://seller-us.tiktok.com/university/essay?knowledge_id=5982454398175018&lang=en)
- 2026 fee guide (cross-reference): [dashboardly.io/post/tiktok-shop-fees-2026-the-complete-seller-fee-guide](https://www.dashboardly.io/post/tiktok-shop-fees-2026-the-complete-seller-fee-guide)
- Sales tax on referral fee (effective 2025-11-01): [seller-us.tiktok.com/university/essay?knowledge_id=1017269682849550](https://seller-us.tiktok.com/university/essay?knowledge_id=1017269682849550&lang=en)
- Independent shipping deprecation (effective 2026-03-31): documented in [darkroomagency.com TikTok Shop fees breakdown](https://www.darkroomagency.com/observatory/tiktok-shop-fees-seller-cost-breakdown-2026)
- Creator Open vs Targeted plans: [dashboardly.io/post/tiktok-shop-affiliate-commissions-2026](https://www.dashboardly.io/post/tiktok-shop-affiliate-commissions-2026-payouts-clawbacks-profit-math)

---

## 14. Next action

Approve the plan or redirect on §3.1 (input set), §5.1 (60-page seed list), or §12 (locked decisions). On approval, Phase A scaffolds in one session — repo init, hub PR for `network.json` + `spokes.json`, fee engine + tests, then the UI.
