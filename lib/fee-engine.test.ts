import { describe, expect, it } from "vitest";
import {
  calcFees,
  effectiveCreatorPct,
  type FeeInput,
  FEE_ENGINE_VERSION,
} from "./fee-engine";

const baseInput: FeeInput = {
  sellingPrice: 24.99,
  units: 1,
  cogs: 6,
  shippingChargedToBuyer: 0,
  referralRate: 0.06,
  logistics: "FBT",
  weightTier: "0-4lb",
  fbtMultiUnitDiscount: false,
  creatorPlan: "Open",
  creatorCommissionPct: 0.15,
  refundRatePct: 0.03,
  shopPerformanceScore: "ge4",
  expectedReturnShipCost: 8,
  newSellerPromo: false,
  sellerFundedDiscount: 0,
  platformFundedDiscount: 0,
  salesTaxOnReferralFee: false,
  buyerStateTaxRate: 0,
  includeCashoutFee: false,
};

describe("fee-engine version", () => {
  it("ships a version string for cache busting", () => {
    expect(FEE_ENGINE_VERSION).toMatch(/^\d{4}\.\d{2}\.\d{2}$/);
  });
});

describe("calcFees — base 6% category, single unit", () => {
  const r = calcFees(baseInput);

  it("computes gross revenue", () => {
    expect(r.grossRevenue).toBe(24.99);
  });
  it("applies 6% referral on the full base", () => {
    expect(r.referralFee).toBeCloseTo(1.5, 2);
  });
  it("applies 2.9% + $0.30 payment processing", () => {
    expect(r.paymentProcessing).toBeCloseTo(24.99 * 0.029 + 0.3, 2);
  });
  it("applies 15% creator commission on item subtotal", () => {
    expect(r.creatorCommission).toBeCloseTo(24.99 * 0.15, 2);
  });
  it("applies $3.58 FBT single-unit fee", () => {
    expect(r.fbtFee).toBeCloseTo(3.58, 2);
  });
  it("includes a positive refund admin reserve at 3%", () => {
    expect(r.refundAdminFee).toBeGreaterThan(0);
  });
  it("does not include cash-out fee by default", () => {
    expect(r.cashoutFee).toBe(0);
  });
  it("yields a positive net profit at these inputs", () => {
    expect(r.netProfit).toBeGreaterThan(0);
  });
  it("emits a waterfall starting at gross and ending at net", () => {
    expect(r.steps[0].kind).toBe("revenue");
    expect(r.steps[r.steps.length - 1].kind).toBe("result");
    expect(r.steps[r.steps.length - 1].running).toBeCloseTo(r.netProfit, 2);
  });
});

describe("calcFees — new seller promo cliff", () => {
  it("uses 3% referral when the promo flag is on", () => {
    const r = calcFees({ ...baseInput, newSellerPromo: true });
    expect(r.referralRate).toBe(0.03);
    expect(r.referralFee).toBeCloseTo(0.7497, 2);
  });
  it("uses standard rate when promo is off", () => {
    const r = calcFees({ ...baseInput, newSellerPromo: false });
    expect(r.referralRate).toBe(0.06);
  });
});

describe("calcFees — jewelry rate differential (5% vs 6%)", () => {
  it("Gold L2 gets 5%", () => {
    const r = calcFees({ ...baseInput, referralRate: 0.05, sellingPrice: 100 });
    expect(r.referralFee).toBeCloseTo(5, 2);
  });
  it("Silver L2 gets 6%", () => {
    const r = calcFees({ ...baseInput, referralRate: 0.06, sellingPrice: 100 });
    expect(r.referralFee).toBeCloseTo(6, 2);
  });
});

describe("calcFees — collectibles $10K tier blending", () => {
  it("applies 3% only to the portion over $10K", () => {
    // $15K order, $5K is in the high tier
    const r = calcFees({
      ...baseInput,
      sellingPrice: 15000,
      cogs: 5000,
      highTierPortion: 5000,
    });
    // referral = (10000 * 0.06) + (5000 * 0.03) = 600 + 150 = 750
    expect(r.referralFee).toBeCloseTo(750, 2);
  });
  it("applies the base rate when nothing exceeds $10K", () => {
    const r = calcFees({ ...baseInput, sellingPrice: 5000 });
    expect(r.referralFee).toBeCloseTo(300, 2);
  });
});

describe("calcFees — platform-funded discount paradox", () => {
  it("referral fee is charged on pre-discount price", () => {
    const noDiscount = calcFees({ ...baseInput, sellingPrice: 50 });
    const withPlatformDiscount = calcFees({
      ...baseInput,
      sellingPrice: 40,
      platformFundedDiscount: 10,
    });
    expect(withPlatformDiscount.referralFee).toBeCloseTo(noDiscount.referralFee, 2);
  });
  it("surfaces a warning for the discount paradox", () => {
    const r = calcFees({ ...baseInput, platformFundedDiscount: 5 });
    expect(r.warnings.some((w) => w.includes("Platform-funded"))).toBe(true);
  });
});

describe("calcFees — seller-funded discount reduces net", () => {
  it("net drops by exactly the discount amount", () => {
    const a = calcFees(baseInput);
    const b = calcFees({ ...baseInput, sellerFundedDiscount: 3 });
    expect(b.netProfit).toBeCloseTo(a.netProfit - 3, 2);
  });
  it("seller discount does NOT affect the referral fee", () => {
    const a = calcFees(baseInput);
    const b = calcFees({ ...baseInput, sellerFundedDiscount: 3 });
    expect(b.referralFee).toBeCloseTo(a.referralFee, 2);
  });
});

describe("calcFees — sales tax on referral fee", () => {
  it("adds tax × rate when toggled on", () => {
    const a = calcFees(baseInput);
    const b = calcFees({
      ...baseInput,
      salesTaxOnReferralFee: true,
      buyerStateTaxRate: 0.07,
    });
    // Engine rounds before returning; compare with looser precision
    // to absorb rounding drift across two rounded values.
    expect(b.salesTaxOnFee).toBeCloseTo(a.referralFee * 0.07, 1);
  });
  it("zero when toggled off", () => {
    const r = calcFees({ ...baseInput, salesTaxOnReferralFee: false, buyerStateTaxRate: 0.07 });
    expect(r.salesTaxOnFee).toBe(0);
  });
});

describe("calcFees — FBT volume break (Jan 12, 2026 update)", () => {
  it("$3.58/unit single-unit", () => {
    const r = calcFees({ ...baseInput, units: 1, fbtMultiUnitDiscount: true });
    expect(r.fbtFee).toBeCloseTo(3.58, 2);
  });
  it("24% discount kicks in at units >= 2", () => {
    const r = calcFees({ ...baseInput, units: 4, fbtMultiUnitDiscount: true });
    // 3.58 * 0.76 * 4 = 10.8832
    expect(r.fbtFee).toBeCloseTo(3.58 * 0.76 * 4, 2);
  });
  it("no discount when fbtMultiUnitDiscount is false", () => {
    const r = calcFees({ ...baseInput, units: 4, fbtMultiUnitDiscount: false });
    expect(r.fbtFee).toBeCloseTo(3.58 * 4, 2);
  });
});

describe("calcFees — SPS return penalty", () => {
  it("ge4 uses 20% seller share", () => {
    const r = calcFees({ ...baseInput, refundRatePct: 0.1, shopPerformanceScore: "ge4" });
    expect(r.returnShipReserve).toBeCloseTo(0.1 * 8 * 0.2, 2);
  });
  it("lt4 doubles the seller share to 50%", () => {
    const r = calcFees({ ...baseInput, refundRatePct: 0.1, shopPerformanceScore: "lt4" });
    expect(r.returnShipReserve).toBeCloseTo(0.1 * 8 * 0.5, 2);
  });
  it("surfaces a warning at SPS<4 with refunds", () => {
    const r = calcFees({ ...baseInput, refundRatePct: 0.05, shopPerformanceScore: "lt4" });
    expect(r.warnings.some((w) => w.includes("SPS is below 4"))).toBe(true);
  });
});

describe("calcFees — creator plan clamping", () => {
  it("Open clamps to [5%, 15%]", () => {
    expect(effectiveCreatorPct("Open", 0.02)).toBe(0.05);
    expect(effectiveCreatorPct("Open", 0.25)).toBe(0.15);
    expect(effectiveCreatorPct("Open", 0.1)).toBe(0.1);
  });
  it("Targeted clamps to [15%, 50%]", () => {
    expect(effectiveCreatorPct("Targeted", 0.1)).toBe(0.15);
    expect(effectiveCreatorPct("Targeted", 0.6)).toBe(0.5);
    expect(effectiveCreatorPct("Targeted", 0.25)).toBe(0.25);
  });
  it("None forces 0", () => {
    expect(effectiveCreatorPct("None", 0.3)).toBe(0);
  });
});

describe("calcFees — creator commission excludes shipping", () => {
  it("commission only on item subtotal", () => {
    const r = calcFees({
      ...baseInput,
      sellingPrice: 20,
      shippingChargedToBuyer: 5,
      creatorCommissionPct: 0.15,
    });
    expect(r.creatorCommission).toBeCloseTo(20 * 0.15, 2);
  });
});

describe("calcFees — loss case", () => {
  it("negative net surfaces a warning and infinite ROAS breakeven", () => {
    const r = calcFees({ ...baseInput, sellingPrice: 5, cogs: 5 });
    expect(r.netProfit).toBeLessThan(0);
    expect(r.roasBreakeven).toBe(Infinity);
    expect(r.warnings.some((w) => w.includes("Net is negative"))).toBe(true);
  });
});

describe("calcFees — fee take rate and ROAS breakeven", () => {
  it("fee take rate equals totalFees / gross", () => {
    const r = calcFees(baseInput);
    expect(r.feeTakeRate).toBeCloseTo(r.totalFees / r.grossRevenue, 4);
  });
  it("ROAS breakeven equals gross / net for profitable orders", () => {
    const r = calcFees(baseInput);
    if (r.netProfit > 0) {
      expect(r.roasBreakeven).toBeCloseTo(r.grossRevenue / r.netProfit, 2);
    }
  });
});

describe("calcFees — logistics modes", () => {
  it("FBT charges per unit", () => {
    const r = calcFees({ ...baseInput, logistics: "FBT", units: 3 });
    expect(r.fbtFee).toBeCloseTo(3.58 * 3, 2);
  });
  it("Upgraded TikTok Shipping uses flat rate", () => {
    const r = calcFees({ ...baseInput, logistics: "UpgradedTikTokShipping", units: 3 });
    expect(r.fbtFee).toBeCloseTo(4.25, 2);
    expect(r.warnings.some((w) => w.includes("Independent shipping"))).toBe(true);
  });
  it("Collections by TikTok uses flat rate", () => {
    const r = calcFees({ ...baseInput, logistics: "CollectionsByTikTok", units: 3 });
    expect(r.fbtFee).toBeCloseTo(3.99, 2);
  });
});

describe("calcFees — cash-out fee toggle", () => {
  it("opt-in adds $0.05", () => {
    const r = calcFees({ ...baseInput, includeCashoutFee: true });
    expect(r.cashoutFee).toBe(0.05);
  });
});

describe("calcFees — refund admin per-SKU cap", () => {
  it("caps at $5 even on high-priced items", () => {
    const r = calcFees({ ...baseInput, sellingPrice: 1000, refundRatePct: 1 });
    // referral_fee = 1000 * 0.06 = 60; 20% of that = 12; capped at 5; * 100% refund = 5
    expect(r.refundAdminFee).toBeCloseTo(5, 2);
  });
  it("does not cap when 20% of referral is under $5", () => {
    const r = calcFees({ ...baseInput, sellingPrice: 20, refundRatePct: 1 });
    // 20 * 0.06 = 1.2; 20% = 0.24; uncapped
    expect(r.refundAdminFee).toBeCloseTo(0.24, 2);
  });
});

describe("calcFees — gross revenue includes buyer-paid shipping", () => {
  it("$0 shipping case", () => {
    const r = calcFees({ ...baseInput, sellingPrice: 25, shippingChargedToBuyer: 0 });
    expect(r.grossRevenue).toBe(25);
  });
  it("$5 shipping bumps gross", () => {
    const r = calcFees({ ...baseInput, sellingPrice: 25, shippingChargedToBuyer: 5 });
    expect(r.grossRevenue).toBe(30);
  });
});

describe("calcFees — Targeted plan with low margin warns", () => {
  it("flags Targeted ≥25% with margin <15%", () => {
    const r = calcFees({
      ...baseInput,
      sellingPrice: 20,
      cogs: 10,
      creatorPlan: "Targeted",
      creatorCommissionPct: 0.3,
    });
    if (r.marginPct < 0.15) {
      expect(r.warnings.some((w) => w.includes("Targeted commission"))).toBe(true);
    }
  });
});

describe("calcFees — multi-unit order economics", () => {
  it("3 units scales every per-unit fee correctly", () => {
    const r = calcFees({ ...baseInput, units: 3 });
    expect(r.cogsTotal).toBeCloseTo(18, 2);
    expect(r.creatorCommission).toBeCloseTo(24.99 * 3 * 0.15, 2);
    expect(r.fbtFee).toBeCloseTo(3.58 * 3, 2);
  });
});

describe("calcFees — payment processing override", () => {
  it("uses override pct when provided", () => {
    const r = calcFees({
      ...baseInput,
      paymentProcessingPctOverride: 0.0102,
      paymentProcessingFixedOverride: 0.3,
    });
    expect(r.paymentProcessing).toBeCloseTo(24.99 * 0.0102 + 0.3, 2);
  });
});
