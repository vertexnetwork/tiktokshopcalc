/**
 * pSEO copy generator. Produces category-attribute-driven content arrays
 * for /tiktok-shop-fees/[slug] so each of the 60 pages renders genuinely
 * different intro / mistakes / recommendations / checklist / FAQ blocks
 * — not the same template with the title swapped.
 *
 * Variance axes:
 *   - rate (0.05 jewelry-precious & pre-owned, 0.06 everything else)
 *   - high-tier $10K threshold (collectibles only)
 *   - creator band (5 distinct bands per Category.creatorBand)
 *   - weight tier (drives FBT cost story)
 *   - AOV bracket (low <$25, mid $25–60, high $60–200, premium $200+)
 *   - refund rate band (low <3%, mid 3–5%, high 5%+)
 *   - intent (C / I / N — drives tone)
 *   - L1 segment (beauty vs tech vs fashion etc. — drives the
 *     "what creators expect" prose)
 *
 * Each generator returns strings (or string[] of bullets) so the page
 * template can compose them with H2/H3s and JSON-LD.
 */

import type { Category } from "./categories";
import { calcFees, type FeeBreakdown } from "./fee-engine";

function fmt(n: number): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: 0 });
}
function fmt2(n: number): string {
  return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}
function pct(n: number, digits = 0): string {
  return `${(n * 100).toFixed(digits)}%`;
}
function band(b: [number, number]): string {
  return `${pct(b[0])}–${pct(b[1])}`;
}

type AovBracket = "low" | "mid" | "high" | "premium";
function aovBracket(cat: Category): AovBracket {
  const p = cat.defaults.sellingPrice;
  if (p < 25) return "low";
  if (p < 60) return "mid";
  if (p < 200) return "high";
  return "premium";
}

type RefundBand = "low" | "mid" | "high";
function refundBand(cat: Category): RefundBand {
  const r = cat.defaults.refundRatePct;
  if (r < 0.03) return "low";
  if (r < 0.05) return "mid";
  return "high";
}

function weightCostStory(cat: Category): string {
  const t = cat.weightTierDefault;
  if (t === "0-4lb") {
    return "FBT charges $3.58 per unit at the 0–4 lb tier, with a 24% multi-unit discount that kicks in at two units per order. Bundling matters here — a two-pack drops your per-unit fulfillment fee to about $2.72.";
  }
  if (t === "4-10lb") {
    return "At the 4–10 lb tier, FBT runs roughly $5.50 per unit and the multi-unit discount no longer applies. Heavier products live or die on AOV — a $20 listing in this tier loses 27% of revenue to FBT alone before any other fee.";
  }
  if (t === "10-30lb") {
    return "10–30 lb products pay roughly $8.50 per unit to FBT — almost 2.4× the lightest tier. Anyone listing under $40 in this weight band is fighting gravity, both literally and on the P&L.";
  }
  return "30 lb+ FBT runs $14+ per unit. Sellers in this tier almost always run Collections by TikTok or Upgraded TikTok Shipping instead, where the math is flat per order rather than per pound.";
}

function lowAovWarning(cat: Category): string | null {
  if (aovBracket(cat) !== "low") return null;
  return `${cat.title} sits in the sub-$25 AOV bracket, which means every fixed cost — $0.30 payment processing, the per-unit FBT charge, the $5 refund-admin cap — eats a disproportionate share of revenue. Bundle SKUs or raise AOV before chasing volume.`;
}

function premiumAovNote(cat: Category): string | null {
  if (aovBracket(cat) !== "premium") return null;
  return `${cat.title} clears the $200 AOV threshold, which puts you in the rare TikTok Shop band where the percentage-based fees (referral, payment processing, creator) dominate and the fixed costs (FBT, $5 refund-admin cap) become rounding errors. Optimize for take-rate, not per-unit cost.`;
}

function rateStory(cat: Category): string {
  if (cat.highTierRate) {
    return `Most ${cat.title.toLowerCase()} orders pay the standard ${pct(cat.rate)} referral rate, but any portion of a single order above $10,000 drops to ${pct(cat.highTierRate)}. A $15K order, for example, pays ${pct(cat.rate)} on the first $10K and ${pct(cat.highTierRate)} on the remaining $5K — a meaningful saving at scale, but not something to architect a product around if your typical order is under $1,000.`;
  }
  if (cat.rate === 0.05) {
    return `${cat.title} pays the ${pct(cat.rate)} referral rate — TikTok's reduced rate for precious jewelry (Gold, Diamond, Jade, Platinum, Ruby/Sapphire/Emerald) and pre-owned items. Adjacent L2s like Silver, Pearl, or non-natural Crystal stay at ${pct(0.06)}, so the L2 you classify under inside Seller Center has a direct effect on your take-rate.`;
  }
  return `${cat.title} pays the standard ${pct(cat.rate)} referral rate in 2026. New sellers get ${pct(0.03)} for their first 30 days post-first-sale — a meaningful runway, but the cliff at day 31 is real (run the calculator with the New Seller toggle off to see the dollar delta).`;
}

function creatorStory(cat: Category): string {
  const [lo, hi] = cat.creatorBand;
  const segment = cat.l1.toLowerCase();
  if (lo >= 0.15) {
    return `Beauty- and wellness-adjacent categories like ${cat.title.toLowerCase()} sit in the ${band(cat.creatorBand)} creator-commission band on Open Plan. That's the highest commission expectation on the platform — creators in this segment are used to UGC-heavy verticals where ${pct(hi)} is the price of getting in the lineup.`;
  }
  if (lo >= 0.12) {
    return `${cat.title} typically runs ${band(cat.creatorBand)} commission on Open Plan. That's the middle band — high enough that the math matters, low enough that you can absorb it with a 25%+ gross margin. Targeted Plan pushes to ${pct(0.25)}+ and only makes sense once you've proven the product converts at ${pct(hi)} Open commission.`;
  }
  if (lo >= 0.1) {
    return `${cat.title} creators typically work in the ${band(cat.creatorBand)} band. Lower than beauty, but higher than tech — these are content-driven categories where storytelling beats spec-heavy demo, and creators expect to be paid for the storytelling.`;
  }
  return `Tech- and ${segment}-style categories see the lowest creator commissions on TikTok Shop — typically ${band(cat.creatorBand)} on Open Plan. The flip side is that conversion rates are also lower (skeptical, spec-hungry buyers), so the lower commission isn't actually free — it's compensation for harder content.`;
}

function refundStory(cat: Category): string {
  const tier = refundBand(cat);
  const defaultRate = pct(cat.defaults.refundRatePct, 1);
  if (tier === "high") {
    return `${cat.title} carries a high baseline refund rate (default ${defaultRate}). That makes Shop Performance Score management non-negotiable: SPS ≥ 4 splits return shipping 20% seller / 80% TikTok, but a drop below 4 flips it to 50/50 overnight. Two weeks of slow shipping in this category can turn a profitable line into a money pit.`;
  }
  if (tier === "mid") {
    return `${cat.title}'s refund rate sits in the mid band (default ${defaultRate}). At that rate, the return-shipping reserve is a meaningful cost line but not catastrophic — as long as SPS stays above 4. The refund-admin fee (20% of referral, capped at $5 per SKU, applied at refund rate) is the more interesting lever here.`;
  }
  return `${cat.title} is a low-refund category (default ${defaultRate}). That means your return-shipping reserve is small and the refund-admin fee barely registers — both fees scale linearly with refund rate. The implication: you can run thinner margins here than in fashion or fit-sensitive categories without immediate risk.`;
}

function rateMistake(cat: Category): string {
  if (cat.highTierRate) {
    return `Treating every collectibles order as ${pct(cat.rate)} flat. Orders above $10,000 get a tier blend — ${pct(cat.rate)} on the first $10K and ${pct(cat.highTierRate)} on the rest. The calculator's "high-tier portion" field models this; ignoring it means you misprice big-ticket items by hundreds of dollars.`;
  }
  if (cat.rate === 0.05) {
    return `Forgetting which L2 you're classified under. Gold, Diamond, Jade, Platinum, and Ruby/Sapphire/Emerald pay ${pct(0.05)}; Silver, Pearl, Amber, and non-natural Crystal pay ${pct(0.06)}. The Seller Center classification is the only thing that determines the rate — not what you call the product in your listing.`;
  }
  return `Confusing the 6% referral fee with the total cost of selling on TikTok Shop. The ${pct(0.06)} rate is the *starting* line on a fee stack that typically reaches ${pct(0.35)}–${pct(0.55)} of gross revenue by the time payment processing, creator commission, FBT, refund admin, and return shipping are all included.`;
}

function creatorMistake(cat: Category): string {
  const [, hi] = cat.creatorBand;
  return `Promising a ${pct(hi)} creator commission during a viral push and discovering the 30-day commission lock means you cannot lower it for a month. Creator commission is one-way: you can raise it instantly, but the rate floor is locked until the cooldown clears. Always model the worst-case commission scenario before publishing a campaign.`;
}

function fbtMistake(cat: Category): string {
  if (cat.weightTierDefault === "0-4lb") {
    return `Listing single-unit packs in a category where the FBT multi-unit discount could give you a 24% per-unit fee reduction. ${cat.title} sits in the 0–4 lb tier where 2+ units of the same SKU per order drops the per-unit FBT from $3.58 to about $2.72.`;
  }
  if (cat.weightTierDefault === "4-10lb") {
    return `Underestimating FBT cost on heavier ${cat.title.toLowerCase()} listings. At the 4–10 lb tier, FBT is roughly $5.50 per unit with no multi-unit discount — that's ~$5.50 of fixed cost on every order, regardless of price. A $19 listing here loses 29% of revenue to FBT alone.`;
  }
  return `Treating FBT cost as a small percentage when ${cat.title.toLowerCase()} weight tiers ($${cat.weightTierDefault}) make it a fixed-dollar line item. Bundle SKUs to amortize, or move to Collections by TikTok if your per-order weight justifies the flat rate.`;
}

function refundMistake(cat: Category): string {
  if (refundBand(cat) === "high") {
    return `Letting Shop Performance Score drop below 4 without immediate triage. In ${cat.title.toLowerCase()} the default refund rate is ${pct(cat.defaults.refundRatePct, 1)} — at SPS < 4 you eat 50% of return shipping instead of 20%, which on this refund rate doubles your effective per-order returns cost.`;
  }
  if (refundBand(cat) === "mid") {
    return `Ignoring the refund-admin fee because "it's only 20% of the referral fee." That's true, but it's also capped at $5 *per SKU* and multiplied by your refund rate — and ${cat.title.toLowerCase()}'s default refund rate (${pct(cat.defaults.refundRatePct, 1)}) makes that a real line on every order.`;
  }
  return `Assuming low refund rates stay low under viral velocity. ${cat.title} runs ${pct(cat.defaults.refundRatePct, 1)} refunds in the steady state — but a viral order spike can pull in customers outside your usual audience, and refund rates often double in the first two weeks of a velocity event.`;
}

function discountMistake(): string {
  return `Treating TikTok-funded platform discounts as if they reduced the referral base. They don't: when TikTok runs a "$10 off" promotion, the referral fee is still charged on the *pre-discount* price. Seller-funded discounts behave normally (reduce net), but platform-funded ones are a stealth surcharge.`;
}

function salesTaxMistake(): string {
  return `Skipping the sales-tax-on-referral-fee toggle for high-tax states. As of November 2025, TikTok charges state sales tax on the referral fee itself in states that tax marketplace services. In a 7% state on a $50 referral fee that's $3.50 per order — small individually, real at scale.`;
}

function spsRec(cat: Category): string {
  if (refundBand(cat) === "high") {
    return `Set up a weekly SPS dashboard check. In ${cat.title.toLowerCase()} the gap between SPS 4 and SPS 3.9 is the gap between a 20% and 50% return-shipping share. The math gets worse every refund.`;
  }
  return `Audit SPS monthly even though ${cat.title.toLowerCase()} sits in a low-refund band. The 20%/50% split kicks in regardless of category — the only thing the low refund rate gives you is more recovery runway.`;
}

function commissionRec(cat: Category): string {
  const [lo, hi] = cat.creatorBand;
  const mid = ((lo + hi) / 2);
  return `Test creator commission in the ${pct(lo)}–${pct(mid)} range first. Open Plan ${pct(mid)} is the sweet spot for most ${cat.title.toLowerCase()} sellers — high enough that creators actually pick you up, low enough that you preserve the ad-spend headroom you need on day-30 when the New Seller 3% promo expires.`;
}

function aovRec(cat: Category): string {
  const a = aovBracket(cat);
  if (a === "low") {
    return `Raise AOV before you raise volume. Sub-$${Math.round(cat.defaults.sellingPrice)} listings give back too much to fixed fees ($0.30 payment processing + FBT base + refund-admin cap). Bundle two units, add a tiered "buy 3 save 10%" promotion, or build a higher-priced hero SKU.`;
  }
  if (a === "mid") {
    return `Lean into bundles to push AOV from $${Math.round(cat.defaults.sellingPrice)} to $${Math.round(cat.defaults.sellingPrice * 1.5)}. A 50% AOV bump in this bracket meaningfully shifts the fee mix away from fixed-dollar fees and toward percentage fees you can model precisely.`;
  }
  if (a === "high") {
    return `Hold AOV around $${Math.round(cat.defaults.sellingPrice)} unless you can justify the conversion-rate drop that comes with higher prices. At this bracket, take-rate is dominated by percentage fees — incremental dollars of AOV barely change your unit economics.`;
  }
  return `At $${Math.round(cat.defaults.sellingPrice)}+ AOV, your percentage fees (referral + creator + payment processing) are the entire game. Cut creator commission by 2% and you'll feel it more than any FBT optimization.`;
}

function marginRec(cat: Category): string {
  const targetCogsRatio = cat.defaults.cogs / cat.defaults.sellingPrice;
  const target = pct(1 - targetCogsRatio - 0.25, 0); // crude proxy
  return `Target ${pct(0.25)}+ net margin after every fee. In ${cat.title.toLowerCase()} that typically means keeping COGS below ${pct(targetCogsRatio + 0.05)} of sale price. ${target ? "" : ""}Anything tighter and you have no room for paid acquisition or refund spikes.`;
}

function bundlingRec(cat: Category): string {
  if (cat.weightTierDefault !== "0-4lb") return creatorRecAlt(cat);
  return `Always offer a 2-pack option even if your hero SKU is single-unit. The FBT multi-unit discount (24% off per-unit in the 0–4 lb tier) is one of the few times TikTok hands sellers money back; turning it down is leaving margin on the table.`;
}

function creatorRecAlt(cat: Category): string {
  return `Don't graduate to Targeted Plan until your Open Plan ROAS is above ${cat.weightTierDefault === "30lb+" ? "3×" : "2.5×"}. Targeted commissions start at ${pct(0.15)} and routinely run ${pct(0.25)}+ — that's a 50–100% commission hike, and it only pays off if the conversion lift is real (typically requires a creator who matches the audience, not just a creator with reach).`;
}

function viralRec(cat: Category): string {
  if (cat.intent !== "N") return checklistFallback(cat);
  return `Model the "viral spike" scenario before you fund a creator push. ${cat.title} viral cycles in 2026 typically deliver a 4–7× volume bump for 5–10 days, then taper. Cash flow can break before unit economics do — make sure your COGS supplier can support 5× normal volume for two weeks, or your fee math becomes academic.`;
}

function checklistFallback(cat: Category): string {
  return `Re-run the calculator against your actual settlement report after the first 50 ${cat.title.toLowerCase()} orders ship. The defaults here are reasonable category midpoints, but your specific creator mix, refund pattern, and weight tier will shift the math by 2–5 percentage points of margin.`;
}

function categoryFaqRate(cat: Category): { question: string; answer: string } {
  if (cat.highTierRate) {
    return {
      question: `What's the TikTok Shop referral fee on a $15,000 ${cat.title.toLowerCase()} order?`,
      answer: `The first $10,000 of the order pays the standard ${pct(cat.rate)} rate ($${fmt(10000 * cat.rate)}), and the remaining $5,000 drops to the high-tier ${pct(cat.highTierRate)} rate ($${fmt(5000 * cat.highTierRate)}). Total referral fee on a $15K order: $${fmt(10000 * cat.rate + 5000 * cat.highTierRate)}. New sellers in their first 30 days pay ${pct(0.03)} flat across the whole order.`,
    };
  }
  if (cat.rate === 0.05) {
    return {
      question: `Why does ${cat.title} pay 5% instead of the standard 6%?`,
      answer: `TikTok Shop classifies a specific list of L2s under a reduced ${pct(0.05)} referral rate: Gold, Diamond, Jade, Platinum/Carat Gold, Ruby/Sapphire/Emerald, and every pre-owned L2. ${cat.title} qualifies. Adjacent categories like Silver, Pearl, Amber, Mellite, and non-natural Crystal stay at ${pct(0.06)}. The classification you choose inside Seller Center is what determines the rate — not the product description.`,
    };
  }
  return {
    question: `What's the TikTok Shop referral fee for ${cat.title} in 2026?`,
    answer: `${cat.title} pays the standard ${pct(cat.rate)} US referral rate in 2026. New sellers get ${pct(0.03)} for their first 30 days post-first-sale, then revert to ${pct(cat.rate)}. As of November 2025, state sales tax also applies to the referral fee itself in states that tax marketplace services — typically 5–9% on top of the referral, so a $${fmt2(cat.defaults.sellingPrice * cat.rate)} referral becomes roughly $${fmt2(cat.defaults.sellingPrice * cat.rate * 1.07)} in a 7% state.`,
  };
}

function categoryFaqCreator(cat: Category): { question: string; answer: string } {
  const [lo, hi] = cat.creatorBand;
  const exampleSale = cat.defaults.sellingPrice;
  const loDollars = fmt2(exampleSale * lo);
  const hiDollars = fmt2(exampleSale * hi);
  return {
    question: `What creator commission should I offer for ${cat.title}?`,
    answer: `Open Plan creators in ${cat.title.toLowerCase()} typically take ${band(cat.creatorBand)} of the item subtotal (shipping excluded). On a $${fmt2(exampleSale)} sale that's $${loDollars} at ${pct(lo)} and $${hiDollars} at ${pct(hi)}. Targeted Plan runs ${pct(0.25)}+ but you cannot drop commission for 30 days once a campaign is live — model the worst case before you publish.`,
  };
}

function categoryFaqMargin(cat: Category): { question: string; answer: string } {
  const aov = cat.defaults.sellingPrice;
  const aovStr = fmt(aov);
  const cogsStr = fmt(cat.defaults.cogs);
  return {
    question: `What's a healthy net margin for ${cat.title} on TikTok Shop?`,
    answer: `Most successful ${cat.title.toLowerCase()} sellers target ${pct(0.2)}–${pct(0.3)} net margin after every fee. Below ${pct(0.15)} leaves no room for ad spend or a refund spike. A typical ${cat.title.toLowerCase()} listing at $${aovStr} sale price with $${cogsStr} COGS clears that threshold on FBT 0–4 lb single-unit at Open Plan ${pct(cat.defaults.creatorPct)} commission — the calculator's ROAS breakeven number tells you exactly how much ad spend each order can absorb before margin goes negative.`,
  };
}

function categoryFaqFbt(cat: Category): { question: string; answer: string } {
  return {
    question: `How does TikTok Shop FBT pricing work for ${cat.title}?`,
    answer: `${cat.title} typically ships in the ${cat.weightTierDefault} weight tier. FBT bills at $3.58 per unit at 0–4 lb (with a 24% multi-unit discount for 2+ identical units per order), ~$5.50 at 4–10 lb, ~$8.50 at 10–30 lb, and $14+ above 30 lb — no multi-unit discount above the lightest tier. ${weightCostStory(cat)}`,
  };
}

export interface PseoCopy {
  /** 2-3 paragraphs of category-attribute-driven intro prose. */
  intro: string[];
  /** Section title + body for "How the fees stack up". */
  feeStackTitle: string;
  feeStackParagraphs: string[];
  /** Section title + 4-5 bullets for "Mistakes that quietly bleed margin". */
  mistakesTitle: string;
  mistakes: string[];
  /** Section title + 4-5 bullets for "Pricing playbook". */
  recommendationsTitle: string;
  recommendations: string[];
  /** Section title + 4-5 bullets for "Pre-launch checklist". */
  checklistTitle: string;
  checklist: string[];
  /** 4-5 question/answer pairs for the FAQ block + FAQ JSON-LD. */
  faqs: { question: string; answer: string }[];
}

export function generatePseoCopy(cat: Category, breakdown: FeeBreakdown): PseoCopy {
  const intro: string[] = [
    cat.hookAngle,
    rateStory(cat),
    creatorStory(cat),
    refundStory(cat),
    weightCostStory(cat),
  ];
  const aovNote = lowAovWarning(cat) || premiumAovNote(cat);
  if (aovNote) intro.push(aovNote);

  const referralPct = (breakdown.referralFee / breakdown.grossRevenue) * 100;
  const creatorPctOnGross = (breakdown.creatorCommission / breakdown.grossRevenue) * 100;
  const fbtPctOnGross = (breakdown.fbtFee / breakdown.grossRevenue) * 100;
  const totalTakeRate = (breakdown.totalFees / breakdown.grossRevenue) * 100;

  const feeStackParagraphs: string[] = [
    `At the ${cat.title.toLowerCase()} default of $${fmt2(cat.defaults.sellingPrice)} sale price and $${fmt2(cat.defaults.cogs)} COGS, the fee stack pulls ${totalTakeRate.toFixed(1)}% of gross revenue — about $${fmt2(breakdown.totalFees)} on a single-unit order. Referral fee alone is $${fmt2(breakdown.referralFee)} (${referralPct.toFixed(1)}% of gross), creator commission at Open Plan ${pct(cat.defaults.creatorPct)} adds $${fmt2(breakdown.creatorCommission)} (${creatorPctOnGross.toFixed(1)}%), and FBT fulfillment at the ${cat.weightTierDefault} tier adds $${fmt2(breakdown.fbtFee)} (${fbtPctOnGross.toFixed(1)}%).`,
    `That leaves net profit of $${fmt2(breakdown.netProfit)} per order, or a ${(breakdown.marginPct * 100).toFixed(1)}% net margin. ROAS breakeven sits at ${Number.isFinite(breakdown.roasBreakeven) ? `${breakdown.roasBreakeven.toFixed(2)}×` : "infinity"} — every dollar of ad spend per order has to deliver at least that much new revenue to keep the math above water.`,
    `The four fees most sellers underweight in ${cat.title.toLowerCase()}: (1) payment processing at 2.9% + $0.30/order, which on $${fmt2(cat.defaults.sellingPrice)} works out to $${fmt2(breakdown.paymentProcessing)}; (2) the refund admin reserve (20% of the referral fee, capped at $5 per SKU, multiplied by your refund rate); (3) the return-shipping reserve, which splits 20/80 in your favor at SPS ≥ 4 and flips to 50/50 below; and (4) the optional $0.05 cash-out fee — small per withdrawal, but a daily withdrawal habit costs $18/year per shop.`,
  ];

  const mistakes: string[] = [
    rateMistake(cat),
    creatorMistake(cat),
    fbtMistake(cat),
    refundMistake(cat),
    discountMistake(),
    salesTaxMistake(),
  ];

  const recommendations: string[] = [
    marginRec(cat),
    commissionRec(cat),
    bundlingRec(cat),
    aovRec(cat),
    spsRec(cat),
    viralRec(cat),
  ];

  const checklist: string[] = [
    `Verify your TikTok Shop L2 classification matches the rate you're modeling here. ${cat.title} is mapped to ${cat.l1} → ${cat.l2}; adjacent L2s can pay different rates.`,
    `Set your Open Plan creator commission floor at ${pct(cat.creatorBand[0])} and your ceiling at ${pct(cat.creatorBand[1])}. Don't authorize Targeted Plan invites until Open Plan ROAS is documented in your dashboard.`,
    `Confirm your weight tier inside Seller Center — ${cat.title} defaults to ${cat.weightTierDefault} but variants can fall into adjacent tiers, and FBT bills the actual tier, not the default.`,
    `Check Shop Performance Score weekly during your first 90 days. ${refundBand(cat) === "high" ? `In ${cat.title.toLowerCase()} the SPS-4 cliff is the single biggest cost lever you control.` : `Even in a low-refund category, an SPS dip below 4 doubles your return-shipping share.`}`,
    `Run the calculator with the "Sales tax on referral fee" toggle on and your target buyer state's rate (Nov 2025+). Then run it again with the New Seller toggle off so you know exactly how much net drops on day 31 when the ${pct(0.03)} promo expires.`,
    `Re-baseline these numbers against your actual settlement report after your first 50 orders ship.`,
  ];

  const faqs: { question: string; answer: string }[] = [
    categoryFaqRate(cat),
    categoryFaqCreator(cat),
    categoryFaqMargin(cat),
    categoryFaqFbt(cat),
  ];

  return {
    intro,
    feeStackTitle: `How the fees actually stack up on a ${cat.title.toLowerCase()} order`,
    feeStackParagraphs,
    mistakesTitle: `Mistakes that quietly bleed ${cat.title.toLowerCase()} margin`,
    mistakes,
    recommendationsTitle: `Pricing playbook for ${cat.title.toLowerCase()}`,
    recommendations,
    checklistTitle: `Pre-launch checklist`,
    checklist,
    faqs,
  };
}

/** Smoke-test helper used by build-time SEO invariants. Recomputes the
 *  breakdown at category defaults and returns the generated copy. */
export function generatePseoCopyAtDefaults(cat: Category): PseoCopy {
  const breakdown = calcFees({
    sellingPrice: cat.defaults.sellingPrice,
    units: 1,
    cogs: cat.defaults.cogs,
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
  return generatePseoCopy(cat, breakdown);
}
