/**
 * TikTok Shop US fee engine — 2026 schema.
 *
 * Pure math. Zero IO. Every formula here cites a source in PLAN.md §13.
 * The 40+ golden tests in fee-engine.test.ts are the contract.
 */

export type LogisticsMode = "FBT" | "UpgradedTikTokShipping" | "CollectionsByTikTok";
export type CreatorPlan = "None" | "Open" | "Targeted";
export type WeightTier = "0-4lb" | "4-10lb" | "10-30lb" | "30lb+";
export type ShopPerformanceScore = "ge4" | "lt4";

export interface FeeInput {
  // Item economics
  sellingPrice: number;
  units: number;
  cogs: number;
  shippingChargedToBuyer: number;

  // Category drives referral rate. The slug must resolve in lib/categories.ts.
  // For the engine itself we accept the rate directly so this module stays
  // free of catalog coupling.
  referralRate: number; // 0.03 | 0.05 | 0.06
  highTierPortion?: number; // USD portion over $10K for collectibles/pre-owned (3% rate)

  // Logistics (independent shipping deprecated 2026-03-31).
  logistics: LogisticsMode;
  weightTier: WeightTier;
  fbtMultiUnitDiscount: boolean;

  // Creator
  creatorPlan: CreatorPlan;
  creatorCommissionPct: number; // 0..0.50

  // Risk / returns
  refundRatePct: number; // 0..0.30
  shopPerformanceScore: ShopPerformanceScore;
  expectedReturnShipCost: number;

  // Promotions / new seller
  newSellerPromo: boolean; // overrides referralRate to 0.03
  sellerFundedDiscount: number;
  platformFundedDiscount: number;

  // Sales tax on referral fee (effective 2025-11-01)
  salesTaxOnReferralFee: boolean;
  buyerStateTaxRate: number; // 0..0.10

  // Optional payment processing override.
  // Default: 2.9% + $0.30 per order (industry-standard credit card processing baseline).
  paymentProcessingPctOverride?: number;
  paymentProcessingFixedOverride?: number;

  // Cash-out
  includeCashoutFee: boolean;

  // Inbound seller shipping (only meaningful under UTS/CBT)
  sellerInboundShipping?: number;
}

export interface BreakdownStep {
  label: string;
  delta: number;
  running: number;
  explain: string;
  kind: "revenue" | "fee" | "cost" | "result";
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
  yourShippingCost: number;
  sellerDiscount: number;
  totalFees: number;
  netProfit: number;
  marginPct: number; // net / gross
  feeTakeRate: number; // totalFees / gross
  roasBreakeven: number; // gross / net — advertising headroom multiple
  steps: BreakdownStep[];
  warnings: string[];
}

const DEFAULT_PAYMENT_PROCESSING_PCT = 0.029;
const DEFAULT_PAYMENT_PROCESSING_FIXED = 0.3;
const HIGH_TIER_RATE = 0.03;
const NEW_SELLER_RATE = 0.03;
const REFUND_ADMIN_RATE = 0.2;
const REFUND_ADMIN_CAP = 5;
const SPS_GE4_SELLER_SHARE = 0.2;
const SPS_LT4_SELLER_SHARE = 0.5;
const CASHOUT_FEE = 0.05;

/**
 * FBT rate card (0-4lb tier confirmed in the official Jan 8 2026 update;
 * heavier tiers are placeholders pending official table extraction).
 * The 24% multi-unit discount applies only to the 0-4lb tier per the
 * Jan 12, 2026 update.
 */
const FBT_RATE_CARD: Record<WeightTier, { base: number; multiUnitDiscount: number }> = {
  "0-4lb": { base: 3.58, multiUnitDiscount: 0.24 },
  "4-10lb": { base: 5.5, multiUnitDiscount: 0.1 },
  "10-30lb": { base: 8.5, multiUnitDiscount: 0.05 },
  "30lb+": { base: 14.0, multiUnitDiscount: 0 },
};

const UTS_RATE_CARD: Record<WeightTier, number> = {
  "0-4lb": 4.25,
  "4-10lb": 6.5,
  "10-30lb": 10.0,
  "30lb+": 16.0,
};

const CBT_RATE_CARD: Record<WeightTier, number> = {
  "0-4lb": 3.99,
  "4-10lb": 6.0,
  "10-30lb": 9.25,
  "30lb+": 15.0,
};

function clamp(n: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, n));
}

function round(n: number, digits = 2): number {
  const m = Math.pow(10, digits);
  return Math.round(n * m) / m;
}

export function effectiveCreatorPct(plan: CreatorPlan, pct: number): number {
  if (plan === "None") return 0;
  if (plan === "Open") return clamp(pct, 0.05, 0.15);
  return clamp(pct, 0.15, 0.5);
}

function fbtPerUnit(input: FeeInput): number {
  const card = FBT_RATE_CARD[input.weightTier];
  const multiUnit = input.fbtMultiUnitDiscount && input.units >= 2;
  return card.base * (multiUnit ? 1 - card.multiUnitDiscount : 1);
}

function fbtFee(input: FeeInput): number {
  if (input.logistics === "FBT") return fbtPerUnit(input) * input.units;
  if (input.logistics === "UpgradedTikTokShipping") return UTS_RATE_CARD[input.weightTier];
  return CBT_RATE_CARD[input.weightTier];
}

export function calcFees(input: FeeInput): FeeBreakdown {
  const warnings: string[] = [];

  const units = Math.max(1, Math.floor(input.units));
  const sellingPrice = Math.max(0, input.sellingPrice);
  const shipping = Math.max(0, input.shippingChargedToBuyer);

  const grossRevenue = (sellingPrice + shipping) * units;
  const salesTaxPass = 0; // pass-through, never in our revenue base by convention

  // Referral fee
  const platformDiscount = Math.max(0, input.platformFundedDiscount);
  const referralBase = Math.max(0, grossRevenue - salesTaxPass + platformDiscount);
  const baseRate = input.newSellerPromo ? NEW_SELLER_RATE : input.referralRate;
  const highPortion = Math.min(Math.max(0, input.highTierPortion || 0), referralBase);
  const lowPortion = Math.max(0, referralBase - highPortion);
  const referralFee = lowPortion * baseRate + highPortion * HIGH_TIER_RATE;

  // Sales tax on referral fee
  const salesTaxOnFee = input.salesTaxOnReferralFee
    ? referralFee * clamp(input.buyerStateTaxRate, 0, 0.1)
    : 0;

  // Payment processing
  const pctRate = input.paymentProcessingPctOverride ?? DEFAULT_PAYMENT_PROCESSING_PCT;
  const fixedRate = input.paymentProcessingFixedOverride ?? DEFAULT_PAYMENT_PROCESSING_FIXED;
  const paymentProcessing = grossRevenue * pctRate + fixedRate * 1; // 1 order per calc

  // Creator commission (item subtotal only — shipping excluded)
  const creatorPct = effectiveCreatorPct(input.creatorPlan, input.creatorCommissionPct);
  const creatorCommission = sellingPrice * units * creatorPct;

  // FBT / logistics
  const fbt = fbtFee(input);

  // Refund admin fee (per-SKU cap × refund rate)
  const refundRate = clamp(input.refundRatePct, 0, 1);
  const refundAdminFee = Math.min(referralFee * REFUND_ADMIN_RATE, REFUND_ADMIN_CAP) * refundRate;

  // Return shipping reserve (SPS-dependent split)
  const sellerShare =
    input.shopPerformanceScore === "ge4" ? SPS_GE4_SELLER_SHARE : SPS_LT4_SELLER_SHARE;
  const returnShipReserve = refundRate * Math.max(0, input.expectedReturnShipCost) * sellerShare;

  // Cash-out
  const cashoutFee = input.includeCashoutFee ? CASHOUT_FEE : 0;

  // Direct costs
  const cogsTotal = Math.max(0, input.cogs) * units;
  const yourShippingCost =
    input.logistics === "FBT" ? 0 : Math.max(0, input.sellerInboundShipping || 0);
  const sellerDiscount = Math.max(0, input.sellerFundedDiscount);

  const totalFees =
    referralFee +
    salesTaxOnFee +
    paymentProcessing +
    creatorCommission +
    fbt +
    refundAdminFee +
    returnShipReserve +
    cashoutFee;

  const netProfit = grossRevenue - totalFees - cogsTotal - yourShippingCost - sellerDiscount;
  const marginPct = grossRevenue > 0 ? netProfit / grossRevenue : 0;
  const feeTakeRate = grossRevenue > 0 ? totalFees / grossRevenue : 0;
  const roasBreakeven = netProfit > 0 ? grossRevenue / netProfit : Infinity;

  // Warnings
  if (input.shopPerformanceScore === "lt4" && refundRate > 0) {
    warnings.push(
      "Your SPS is below 4 — you eat 50% of return shipping costs (vs 20% above 4).",
    );
  }
  if (input.newSellerPromo) {
    const cliffDelta =
      lowPortion * (input.referralRate - NEW_SELLER_RATE) +
      highPortion * (HIGH_TIER_RATE - HIGH_TIER_RATE);
    if (cliffDelta > 0) {
      warnings.push(
        `New-seller promo ends at day 31: standard referral kicks in, costing $${round(cliffDelta)} more per order.`,
      );
    }
  }
  if (input.creatorPlan === "Targeted" && creatorPct >= 0.25 && marginPct < 0.15) {
    warnings.push(
      "Targeted commission ≥25% with margin under 15% — consider switching to Open Plan or trimming commission.",
    );
  }
  if (platformDiscount > 0) {
    warnings.push(
      "Platform-funded discount: referral fee is charged on the pre-discount price. This often surprises sellers.",
    );
  }
  if (netProfit < 0) {
    warnings.push("Net is negative — you'll lose money on each order at these inputs.");
  }
  if (input.logistics !== "FBT") {
    warnings.push(
      "Independent shipping was deprecated on 2026-03-31. You must use FBT, Upgraded TikTok Shipping, or Collections by TikTok.",
    );
  }

  // Waterfall steps (gross → net)
  const steps: BreakdownStep[] = [];
  let running = grossRevenue;
  steps.push({
    label: "Gross revenue",
    delta: grossRevenue,
    running,
    explain: `(${round(sellingPrice)} item + ${round(shipping)} shipping) × ${units} units`,
    kind: "revenue",
  });

  const pushFee = (label: string, value: number, explain: string) => {
    if (value <= 0) return;
    running -= value;
    steps.push({ label, delta: -value, running, explain, kind: "fee" });
  };

  pushFee(
    "Referral fee",
    referralFee,
    `${(baseRate * 100).toFixed(1)}% on $${round(lowPortion)}${
      highPortion > 0 ? ` + 3% on $${round(highPortion)} >$10K portion` : ""
    }`,
  );
  pushFee(
    "Sales tax on fee",
    salesTaxOnFee,
    `${(clamp(input.buyerStateTaxRate, 0, 0.1) * 100).toFixed(2)}% applied to referral fee (post-Nov 2025)`,
  );
  pushFee(
    "Payment processing",
    paymentProcessing,
    `${(pctRate * 100).toFixed(2)}% + $${fixedRate.toFixed(2)}/order`,
  );
  pushFee(
    "Creator commission",
    creatorCommission,
    `${(creatorPct * 100).toFixed(1)}% on item subtotal ($${round(sellingPrice * units)})`,
  );
  pushFee(
    `${input.logistics} fulfillment`,
    fbt,
    input.logistics === "FBT"
      ? `$${round(fbtPerUnit(input))}/unit × ${units} (${input.weightTier})`
      : `${input.logistics} flat rate (${input.weightTier})`,
  );
  pushFee(
    "Refund admin reserve",
    refundAdminFee,
    `min(20% × referral, $5) × ${(refundRate * 100).toFixed(1)}% expected refund rate`,
  );
  pushFee(
    "Return shipping reserve",
    returnShipReserve,
    `$${round(input.expectedReturnShipCost)} × ${(refundRate * 100).toFixed(1)}% × ${(sellerShare * 100).toFixed(0)}% seller share`,
  );
  pushFee("Cash-out fee", cashoutFee, "$0.05 per withdrawal");

  const pushCost = (label: string, value: number, explain: string) => {
    if (value <= 0) return;
    running -= value;
    steps.push({ label, delta: -value, running, explain, kind: "cost" });
  };

  pushCost("Cost of goods", cogsTotal, `$${round(input.cogs)}/unit × ${units}`);
  pushCost("Your shipping cost", yourShippingCost, "Inbound to logistics partner");
  pushCost("Seller-funded discount", sellerDiscount, "Coupon or promo funded by you");

  steps.push({
    label: "Net profit",
    delta: netProfit,
    running: netProfit,
    explain: `${(marginPct * 100).toFixed(1)}% margin`,
    kind: "result",
  });

  return {
    grossRevenue: round(grossRevenue),
    referralBase: round(referralBase),
    referralRate: baseRate,
    referralFee: round(referralFee),
    salesTaxOnFee: round(salesTaxOnFee),
    paymentProcessing: round(paymentProcessing),
    creatorCommission: round(creatorCommission),
    fbtFee: round(fbt),
    refundAdminFee: round(refundAdminFee),
    returnShipReserve: round(returnShipReserve),
    cashoutFee: round(cashoutFee),
    cogsTotal: round(cogsTotal),
    yourShippingCost: round(yourShippingCost),
    sellerDiscount: round(sellerDiscount),
    totalFees: round(totalFees),
    netProfit: round(netProfit),
    marginPct,
    feeTakeRate,
    roasBreakeven: Number.isFinite(roasBreakeven) ? round(roasBreakeven, 3) : Infinity,
    steps,
    warnings,
  };
}

export const FEE_ENGINE_VERSION = "2026.05.12";
