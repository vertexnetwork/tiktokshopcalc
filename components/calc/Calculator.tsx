"use client";

import { useEffect, useMemo, useState } from "react";
import {
  calcFees,
  type FeeInput,
  type CreatorPlan,
  type LogisticsMode,
  type WeightTier,
  type ShopPerformanceScore,
} from "@/lib/fee-engine";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { decodeShareState } from "@/lib/share";
import { WaterfallChart } from "./WaterfallChart";
import { FeeBreakdownTable } from "./FeeBreakdownTable";
import { ScenarioCallouts } from "./ScenarioCallouts";
import { ShareButton } from "./ShareButton";
import { fmtUSD, fmtPct } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";

interface CalculatorProps {
  categorySlug?: string;
  embedded?: boolean;
}

function defaultsForCategory(slug: string): FeeInput {
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

export function Calculator({ categorySlug, embedded = false }: CalculatorProps) {
  const initial = useMemo(
    () => defaultsForCategory(categorySlug || "skincare"),
    [categorySlug],
  );
  const [input, setInput] = useState<FeeInput>(initial);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [selectedSlug, setSelectedSlug] = useState<string>(categorySlug || "skincare");

  // Hydrate from ?s= or ?cat=
  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const s = params.get("s");
    if (s) {
      const decoded = decodeShareState(s);
      setInput((prev) => ({ ...prev, ...decoded } as FeeInput));
      return;
    }
    const cat = params.get("cat");
    if (cat) {
      setSelectedSlug(cat);
      setInput(defaultsForCategory(cat));
    }
  }, []);

  const r = useMemo(() => calcFees(input), [input]);

  function onCategoryChange(slug: string) {
    setSelectedSlug(slug);
    const cat = getCategory(slug);
    if (!cat) return;
    setInput((prev) => ({
      ...prev,
      sellingPrice: cat.defaults.sellingPrice,
      cogs: cat.defaults.cogs,
      referralRate: cat.rate,
      weightTier: cat.weightTierDefault,
      creatorCommissionPct: cat.defaults.creatorPct,
      refundRatePct: cat.defaults.refundRatePct,
    }));
  }

  function update<K extends keyof FeeInput>(key: K, value: FeeInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: embedded ? "1fr" : "minmax(0, 1fr)",
        gap: "1.5rem",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1.4fr)",
          gap: "1.5rem",
        }}
        className="calc-grid"
      >
        {/* ===== INPUTS ===== */}
        <div className="card" style={{ padding: "1.5rem" }}>
          <h2 style={{ marginTop: 0, marginBottom: "1rem", fontSize: "1.125rem" }}>Inputs</h2>

          <Field label="Category">
            <select
              className="select"
              value={selectedSlug}
              onChange={(e) => onCategoryChange(e.target.value)}
            >
              {CATEGORIES.map((c) => (
                <option key={c.slug} value={c.slug}>
                  {c.title} ({(c.rate * 100).toFixed(0)}%)
                </option>
              ))}
            </select>
          </Field>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Selling price (USD)">
              <input
                type="number"
                step="0.01"
                min="0"
                className="input"
                value={input.sellingPrice}
                onChange={(e) => update("sellingPrice", parseFloat(e.target.value) || 0)}
              />
            </Field>
            <Field label="Units per order">
              <input
                type="number"
                step="1"
                min="1"
                className="input"
                value={input.units}
                onChange={(e) => update("units", parseInt(e.target.value, 10) || 1)}
              />
            </Field>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Field label="Cost of goods (per unit)">
              <input
                type="number"
                step="0.01"
                min="0"
                className="input"
                value={input.cogs}
                onChange={(e) => update("cogs", parseFloat(e.target.value) || 0)}
              />
            </Field>
            <Field label="Shipping charged to buyer">
              <input
                type="number"
                step="0.01"
                min="0"
                className="input"
                value={input.shippingChargedToBuyer}
                onChange={(e) =>
                  update("shippingChargedToBuyer", parseFloat(e.target.value) || 0)
                }
              />
            </Field>
          </div>

          <Field
            label={`Creator plan & commission (${(input.creatorCommissionPct * 100).toFixed(0)}%)`}
          >
            <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "0.5rem" }}>
              <select
                className="select"
                value={input.creatorPlan}
                onChange={(e) => update("creatorPlan", e.target.value as CreatorPlan)}
              >
                <option value="None">None</option>
                <option value="Open">Open (5–15%)</option>
                <option value="Targeted">Targeted (15–30%+)</option>
              </select>
              <input
                type="range"
                min={0}
                max={0.5}
                step={0.01}
                value={input.creatorCommissionPct}
                onChange={(e) => update("creatorCommissionPct", parseFloat(e.target.value))}
                aria-label="Creator commission percentage"
                disabled={input.creatorPlan === "None"}
              />
            </div>
          </Field>

          <Field label={`Expected refund rate (${(input.refundRatePct * 100).toFixed(0)}%)`}>
            <input
              type="range"
              min={0}
              max={0.2}
              step={0.005}
              value={input.refundRatePct}
              onChange={(e) => update("refundRatePct", parseFloat(e.target.value))}
              aria-label="Expected refund rate"
              style={{ width: "100%" }}
            />
          </Field>

          <Field label="Logistics">
            <select
              className="select"
              value={input.logistics}
              onChange={(e) => update("logistics", e.target.value as LogisticsMode)}
            >
              <option value="FBT">FBT (Fulfilled by TikTok)</option>
              <option value="UpgradedTikTokShipping">Upgraded TikTok Shipping</option>
              <option value="CollectionsByTikTok">Collections by TikTok</option>
            </select>
          </Field>

          <Field label="Weight tier">
            <select
              className="select"
              value={input.weightTier}
              onChange={(e) => update("weightTier", e.target.value as WeightTier)}
            >
              <option value="0-4lb">0–4 lb</option>
              <option value="4-10lb">4–10 lb</option>
              <option value="10-30lb">10–30 lb</option>
              <option value="30lb+">30 lb+</option>
            </select>
          </Field>

          <details
            style={{ marginTop: "1rem" }}
            open={advancedOpen}
            onToggle={(e) => setAdvancedOpen((e.target as HTMLDetailsElement).open)}
          >
            <summary style={{ cursor: "pointer", fontWeight: 600, padding: "0.5rem 0" }}>
              Advanced
            </summary>

            <Toggle
              label="New seller (first 30 days — 3% referral)"
              value={input.newSellerPromo}
              onChange={(v) => update("newSellerPromo", v)}
            />
            <Toggle
              label="Shop Performance Score ≥ 4"
              value={input.shopPerformanceScore === "ge4"}
              onChange={(v) =>
                update("shopPerformanceScore", (v ? "ge4" : "lt4") as ShopPerformanceScore)
              }
            />
            <Toggle
              label="FBT multi-unit discount (Jan 2026+)"
              value={input.fbtMultiUnitDiscount}
              onChange={(v) => update("fbtMultiUnitDiscount", v)}
            />
            <Toggle
              label="Include $0.05 cash-out fee"
              value={input.includeCashoutFee}
              onChange={(v) => update("includeCashoutFee", v)}
            />
            <Toggle
              label="Sales tax on referral fee (Nov 2025+)"
              value={input.salesTaxOnReferralFee}
              onChange={(v) => update("salesTaxOnReferralFee", v)}
            />

            {input.salesTaxOnReferralFee && (
              <Field label={`Buyer state tax rate (${(input.buyerStateTaxRate * 100).toFixed(2)}%)`}>
                <input
                  type="range"
                  min={0}
                  max={0.1}
                  step={0.0025}
                  value={input.buyerStateTaxRate}
                  onChange={(e) => update("buyerStateTaxRate", parseFloat(e.target.value))}
                  style={{ width: "100%" }}
                />
              </Field>
            )}

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <Field label="Platform-funded discount">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input"
                  value={input.platformFundedDiscount}
                  onChange={(e) =>
                    update("platformFundedDiscount", parseFloat(e.target.value) || 0)
                  }
                />
              </Field>
              <Field label="Seller-funded discount">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input"
                  value={input.sellerFundedDiscount}
                  onChange={(e) =>
                    update("sellerFundedDiscount", parseFloat(e.target.value) || 0)
                  }
                />
              </Field>
            </div>

            <Field label="Expected return shipping cost per refund">
              <input
                type="number"
                step="0.01"
                min="0"
                className="input"
                value={input.expectedReturnShipCost}
                onChange={(e) =>
                  update("expectedReturnShipCost", parseFloat(e.target.value) || 0)
                }
              />
            </Field>
          </details>
        </div>

        {/* ===== RESULTS ===== */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
            <Kpi
              label="Net profit"
              value={fmtUSD(r.netProfit)}
              tone={r.netProfit > 0 ? "good" : "bad"}
            />
            <Kpi
              label="Margin"
              value={fmtPct(r.marginPct)}
              tone={r.marginPct >= 0.25 ? "good" : r.marginPct >= 0.1 ? "warn" : "bad"}
            />
            <Kpi label="Fee take-rate" value={fmtPct(r.feeTakeRate)} tone="info" />
            <Kpi
              label="ROAS breakeven"
              value={Number.isFinite(r.roasBreakeven) ? `${r.roasBreakeven.toFixed(2)}×` : "∞"}
              tone="info"
            />
          </div>

          {r.warnings.length > 0 && (
            <div
              className="card"
              style={{
                padding: "0.75rem 1rem",
                borderLeft: "3px solid var(--color-warning)",
                background: "var(--color-surface-2)",
              }}
            >
              <ul style={{ margin: 0, paddingLeft: "1.25rem" }}>
                {r.warnings.map((w, i) => (
                  <li
                    key={i}
                    style={{ fontSize: "0.875rem", color: "var(--color-on-bg)", lineHeight: 1.5 }}
                  >
                    {w}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="card" style={{ padding: "1rem 1rem 0" }}>
            <p
              style={{
                fontSize: "0.75rem",
                color: "var(--color-muted)",
                textTransform: "uppercase",
                letterSpacing: "0.05em",
                margin: "0 0 0.5rem",
              }}
            >
              Waterfall: gross → net
            </p>
            <WaterfallChart steps={r.steps} />
          </div>

          <FeeBreakdownTable r={r} />

          <ScenarioCallouts input={input} r={r} />

          {!embedded && (
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <ShareButton input={input} />
              <a
                href={`${siteConfig.monetization.gumroad.productUrl}?utm_source=tiktokshopcalc&utm_medium=calc-cta&utm_campaign=${selectedSlug}`}
                className="btn-primary"
              >
                Get every category in the Margin Bible — ${siteConfig.monetization.gumroad.price}
              </a>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @media (max-width: 880px) {
          .calc-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label style={{ display: "block", marginBottom: "0.75rem" }}>
      <span
        style={{
          display: "block",
          fontSize: "0.75rem",
          color: "var(--color-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "0.25rem",
        }}
      >
        {label}
      </span>
      {children}
    </label>
  );
}

function Toggle({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label
      style={{
        display: "flex",
        alignItems: "center",
        gap: "0.5rem",
        padding: "0.375rem 0",
        cursor: "pointer",
      }}
    >
      <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
      <span style={{ fontSize: "0.875rem" }}>{label}</span>
    </label>
  );
}

function Kpi({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: "good" | "warn" | "bad" | "info";
}) {
  const color =
    tone === "good"
      ? "var(--color-success)"
      : tone === "bad"
        ? "var(--color-danger)"
        : tone === "warn"
          ? "var(--color-warning)"
          : "var(--color-on-bg)";
  return (
    <div className="card" style={{ padding: "0.875rem 1rem" }}>
      <div
        style={{
          fontSize: "0.7rem",
          color: "var(--color-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "1.5rem",
          fontWeight: 800,
          color,
          fontVariantNumeric: "tabular-nums",
          marginTop: "0.25rem",
        }}
      >
        {value}
      </div>
    </div>
  );
}
