/**
 * URL state codec for the calculator. Encodes the full FeeInput as a compact
 * base64url string in the ?s= query param so users can share their scenario.
 */

import type { FeeInput, CreatorPlan, LogisticsMode, WeightTier, ShopPerformanceScore } from "./fee-engine";

type PartialInput = Partial<FeeInput>;

const ORDER: (keyof FeeInput)[] = [
  "sellingPrice",
  "units",
  "cogs",
  "shippingChargedToBuyer",
  "referralRate",
  "highTierPortion",
  "logistics",
  "weightTier",
  "fbtMultiUnitDiscount",
  "creatorPlan",
  "creatorCommissionPct",
  "refundRatePct",
  "shopPerformanceScore",
  "expectedReturnShipCost",
  "newSellerPromo",
  "sellerFundedDiscount",
  "platformFundedDiscount",
  "salesTaxOnReferralFee",
  "buyerStateTaxRate",
  "paymentProcessingPctOverride",
  "paymentProcessingFixedOverride",
  "includeCashoutFee",
  "sellerInboundShipping",
];

const LOGISTICS_CODES: Record<LogisticsMode, string> = {
  FBT: "f",
  UpgradedTikTokShipping: "u",
  CollectionsByTikTok: "c",
};
const LOGISTICS_DECODE: Record<string, LogisticsMode> = {
  f: "FBT",
  u: "UpgradedTikTokShipping",
  c: "CollectionsByTikTok",
};

const PLAN_CODES: Record<CreatorPlan, string> = { None: "n", Open: "o", Targeted: "t" };
const PLAN_DECODE: Record<string, CreatorPlan> = { n: "None", o: "Open", t: "Targeted" };

const TIER_CODES: Record<WeightTier, string> = {
  "0-4lb": "a",
  "4-10lb": "b",
  "10-30lb": "c",
  "30lb+": "d",
};
const TIER_DECODE: Record<string, WeightTier> = {
  a: "0-4lb",
  b: "4-10lb",
  c: "10-30lb",
  d: "30lb+",
};

const SPS_CODES: Record<ShopPerformanceScore, string> = { ge4: "h", lt4: "l" };
const SPS_DECODE: Record<string, ShopPerformanceScore> = { h: "ge4", l: "lt4" };

function encodeValue(key: keyof FeeInput, value: unknown): string {
  if (value === undefined || value === null) return "";
  if (typeof value === "boolean") return value ? "1" : "0";
  if (key === "logistics") return LOGISTICS_CODES[value as LogisticsMode];
  if (key === "creatorPlan") return PLAN_CODES[value as CreatorPlan];
  if (key === "weightTier") return TIER_CODES[value as WeightTier];
  if (key === "shopPerformanceScore") return SPS_CODES[value as ShopPerformanceScore];
  if (typeof value === "number") {
    // Trim trailing zeros for compactness.
    return Number(value).toString();
  }
  return String(value);
}

function decodeValue(key: keyof FeeInput, raw: string): unknown {
  if (raw === "") return undefined;
  switch (key) {
    case "logistics":
      return LOGISTICS_DECODE[raw];
    case "creatorPlan":
      return PLAN_DECODE[raw];
    case "weightTier":
      return TIER_DECODE[raw];
    case "shopPerformanceScore":
      return SPS_DECODE[raw];
    case "fbtMultiUnitDiscount":
    case "newSellerPromo":
    case "salesTaxOnReferralFee":
    case "includeCashoutFee":
      return raw === "1";
    case "units": {
      const n = parseInt(raw, 10);
      return Number.isFinite(n) ? n : undefined;
    }
    default: {
      const n = parseFloat(raw);
      return Number.isFinite(n) ? n : undefined;
    }
  }
}

function toBase64Url(s: string): string {
  if (typeof btoa === "function") {
    return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
  }
  // Node fallback
  return Buffer.from(s, "utf8").toString("base64url");
}

function fromBase64Url(s: string): string {
  const padded = s.replace(/-/g, "+").replace(/_/g, "/") + "==".slice(0, (4 - (s.length % 4)) % 4);
  if (typeof atob === "function") return atob(padded);
  return Buffer.from(s, "base64url").toString("utf8");
}

export function encodeShareState(input: PartialInput): string {
  const parts = ORDER.map((key) => encodeValue(key, input[key]));
  return toBase64Url(parts.join("|"));
}

export function decodeShareState(s: string): PartialInput {
  let raw: string;
  try {
    raw = fromBase64Url(s);
  } catch {
    return {};
  }
  const parts = raw.split("|");
  const out: PartialInput = {};
  for (let i = 0; i < ORDER.length && i < parts.length; i++) {
    const key = ORDER[i];
    const value = decodeValue(key, parts[i]);
    if (value !== undefined) {
      (out as Record<string, unknown>)[key] = value;
    }
  }
  return out;
}
