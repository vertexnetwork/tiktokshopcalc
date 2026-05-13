import type { FeeInput } from "./fee-engine";
import { CATEGORIES, getCategory } from "./categories";
import { decodeShareState } from "./share";

export interface CalcInitial {
  input: FeeInput;
  selectedSlug: string;
}

export function defaultsForCategory(slug: string): FeeInput {
  const cat = getCategory(slug) || CATEGORIES[1];
  return {
    sellingPrice: cat.defaults.sellingPrice,
    units: 1,
    cogs: cat.defaults.cogs,
    shippingChargedToBuyer: 0,
    referralRate: cat.rate,
    logistics: "FBT",
    weightTier: cat.weightTierDefault,
    fbtMultiUnitDiscount: true,
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
  };
}

type RawSearchParams = Record<string, string | string[] | undefined> | undefined;

function firstParam(params: RawSearchParams, key: string): string | undefined {
  if (!params) return undefined;
  const v = params[key];
  if (Array.isArray(v)) return v[0];
  return v;
}

export function computeInitialCalcState(
  categorySlug: string | undefined,
  searchParams: RawSearchParams,
): CalcInitial {
  const fallbackSlug = categorySlug || "skincare";
  const fallback = defaultsForCategory(fallbackSlug);

  const s = firstParam(searchParams, "s");
  if (s) {
    try {
      const decoded = decodeShareState(s);
      return {
        input: { ...fallback, ...decoded } as FeeInput,
        selectedSlug: fallbackSlug,
      };
    } catch {
      return { input: fallback, selectedSlug: fallbackSlug };
    }
  }

  const cat = firstParam(searchParams, "cat");
  if (cat && getCategory(cat)) {
    return { input: defaultsForCategory(cat), selectedSlug: cat };
  }

  return { input: fallback, selectedSlug: fallbackSlug };
}
