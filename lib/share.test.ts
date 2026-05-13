import { describe, expect, it } from "vitest";
import { encodeShareState, decodeShareState } from "./share";
import type { FeeInput } from "./fee-engine";

const sample: FeeInput = {
  sellingPrice: 24.99,
  units: 3,
  cogs: 6,
  shippingChargedToBuyer: 0,
  referralRate: 0.06,
  logistics: "FBT",
  weightTier: "0-4lb",
  fbtMultiUnitDiscount: true,
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

describe("share codec", () => {
  it("roundtrips a full FeeInput", () => {
    const encoded = encodeShareState(sample);
    const decoded = decodeShareState(encoded);
    expect(decoded.sellingPrice).toBe(24.99);
    expect(decoded.units).toBe(3);
    expect(decoded.creatorPlan).toBe("Open");
    expect(decoded.weightTier).toBe("0-4lb");
    expect(decoded.fbtMultiUnitDiscount).toBe(true);
    expect(decoded.shopPerformanceScore).toBe("ge4");
    expect(decoded.logistics).toBe("FBT");
  });

  it("handles all logistics modes", () => {
    for (const logistics of ["FBT", "UpgradedTikTokShipping", "CollectionsByTikTok"] as const) {
      const r = decodeShareState(encodeShareState({ ...sample, logistics }));
      expect(r.logistics).toBe(logistics);
    }
  });

  it("handles all creator plans", () => {
    for (const creatorPlan of ["None", "Open", "Targeted"] as const) {
      const r = decodeShareState(encodeShareState({ ...sample, creatorPlan }));
      expect(r.creatorPlan).toBe(creatorPlan);
    }
  });

  it("handles boolean toggles", () => {
    const r = decodeShareState(
      encodeShareState({ ...sample, newSellerPromo: true, salesTaxOnReferralFee: true }),
    );
    expect(r.newSellerPromo).toBe(true);
    expect(r.salesTaxOnReferralFee).toBe(true);
  });

  it("rejects malformed payloads gracefully", () => {
    const r = decodeShareState("not-a-valid-payload!!!");
    expect(typeof r).toBe("object");
  });

  it("rejects empty input", () => {
    const r = decodeShareState("");
    expect(r).toEqual({});
  });

  it("produces a URL-safe encoded string", () => {
    const encoded = encodeShareState(sample);
    expect(encoded).not.toMatch(/[+/=]/);
  });
});
