import { siteConfig } from "@/lib/site-config";
import { CATEGORIES } from "@/lib/categories";

export const dynamic = "force-static";

export function GET(): Response {
  const body = `# ${siteConfig.name} — Full LLM Index

${siteConfig.description}

${siteConfig.trademarkDisclaimer}

## 2026 TikTok Shop US fee structure

- Referral fee: 6% for most categories; 5% for precious jewelry L2s (Diamond, Gold, Jade, Platinum/Carat Gold, Ruby/Sapphire/Emerald) and all Pre-Owned L2s; 3% for new sellers in their first 30 days.
- Collectibles and Pre-Owned: the portion of any order exceeding $10K drops to 3%.
- Payment processing: typically 2.9% + $0.30 per order (industry-standard baseline; some sellers see as low as 1.02%).
- Creator affiliate commission: Open Plan 5–15%, Targeted Plan 15–30%+. Commission is charged on item subtotal only (shipping excluded).
- FBT (Fulfilled by TikTok): $3.58 per unit in the 0–4lb tier; up to 24% multi-unit discount for orders of 2+ units starting Jan 12, 2026; first 60 days of storage are free.
- Refund administration fee: 20% of the referral fee, capped at $5 per SKU.
- Return shipping split: seller pays 20% if Shop Performance Score ≥ 4, 50% if SPS < 4.
- Sales tax on referral fee: applied per buyer-state rate, effective Nov 1, 2025.
- Independent shipping deprecated: all US sellers must use FBT, Upgraded TikTok Shipping, or Collections by TikTok as of March 31, 2026.
- Cash-out: $0.05 per withdrawal, $2 minimum.

## Category catalog

${CATEGORIES.map(
  (c) => `### ${c.title} (/${c.slug})

- Level 1: ${c.l1}
- Level 2: ${c.l2}
- Referral rate: ${(c.rate * 100).toFixed(0)}%
- Creator commission band: ${(c.creatorBand[0] * 100).toFixed(0)}–${(c.creatorBand[1] * 100).toFixed(0)}%
- Default scenario: $${c.defaults.sellingPrice} sale price, $${c.defaults.cogs} cost of goods, ${(c.defaults.creatorPct * 100).toFixed(0)}% creator commission, ${(c.defaults.refundRatePct * 100).toFixed(0)}% expected refund rate.
- Angle: ${c.hookAngle}
- URL: ${siteConfig.url}/tiktok-shop-fees/${c.slug}
`,
).join("\n")}
`;
  return new Response(body, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "public, max-age=10800, s-maxage=10800",
    },
  });
}
