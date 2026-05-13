"use client";

import { useMemo, useState } from "react";
import {
  calcFees,
  type FeeInput,
  type CreatorPlan,
  type LogisticsMode,
  type WeightTier,
  type ShopPerformanceScore,
} from "@/lib/fee-engine";
import { CATEGORIES, getCategory } from "@/lib/categories";
import { defaultsForCategory, type CalcInitial } from "@/lib/calc-init";
import { WaterfallChart } from "./WaterfallChart";
import { FeeBreakdownTable } from "./FeeBreakdownTable";
import { ScenarioCallouts } from "./ScenarioCallouts";
import { ShareButton } from "./ShareButton";
import { Tooltip } from "@/components/ui/Tooltip";
import { fmtUSD, fmtPct } from "@/lib/format";
import { siteConfig } from "@/lib/site-config";

interface CalculatorProps {
  initial: CalcInitial;
  embedded?: boolean;
}

type NumericKey =
  | "sellingPrice"
  | "units"
  | "cogs"
  | "shippingChargedToBuyer"
  | "platformFundedDiscount"
  | "sellerFundedDiscount"
  | "expectedReturnShipCost";

type RawNumeric = Record<NumericKey, string>;

function toRawNumeric(input: FeeInput): RawNumeric {
  return {
    sellingPrice: String(input.sellingPrice),
    units: String(input.units),
    cogs: String(input.cogs),
    shippingChargedToBuyer: String(input.shippingChargedToBuyer),
    platformFundedDiscount: String(input.platformFundedDiscount),
    sellerFundedDiscount: String(input.sellerFundedDiscount),
    expectedReturnShipCost: String(input.expectedReturnShipCost),
  };
}

interface FieldConfig {
  min: number;
  integer?: boolean;
}

const NUMERIC_CONFIG: Record<NumericKey, FieldConfig> = {
  sellingPrice: { min: 0 },
  units: { min: 1, integer: true },
  cogs: { min: 0 },
  shippingChargedToBuyer: { min: 0 },
  platformFundedDiscount: { min: 0 },
  sellerFundedDiscount: { min: 0 },
  expectedReturnShipCost: { min: 0 },
};

function validateNumeric(key: NumericKey, raw: string): { value: number | null; error: string | null } {
  const cfg = NUMERIC_CONFIG[key];
  const trimmed = raw.trim();
  if (trimmed === "") return { value: null, error: "Required" };
  const cleaned = trimmed.replace(/,/g, "");
  const parsed = cfg.integer ? parseInt(cleaned, 10) : parseFloat(cleaned);
  if (!Number.isFinite(parsed)) return { value: null, error: "Enter a number" };
  if (parsed < cfg.min) return { value: null, error: `Min ${cfg.min}` };
  if (cfg.integer && !Number.isInteger(parsed)) return { value: null, error: "Whole number only" };
  return { value: parsed, error: null };
}

export function Calculator({ initial, embedded = false }: CalculatorProps) {
  const [{ input, selectedSlug }, setState] = useState(() => ({
    input: initial.input,
    selectedSlug: initial.selectedSlug,
  }));
  const [raw, setRaw] = useState<RawNumeric>(() => toRawNumeric(initial.input));
  const [errors, setErrors] = useState<Partial<Record<NumericKey, string>>>({});
  const [advancedOpen, setAdvancedOpen] = useState(false);

  const r = useMemo(() => calcFees(input), [input]);

  function setInput(updater: (prev: FeeInput) => FeeInput) {
    setState((prev) => ({ ...prev, input: updater(prev.input) }));
  }

  function onCategoryChange(slug: string) {
    const cat = getCategory(slug);
    if (!cat) return;
    setState((prev) => ({
      selectedSlug: slug,
      input: {
        ...prev.input,
        sellingPrice: cat.defaults.sellingPrice,
        cogs: cat.defaults.cogs,
        referralRate: cat.rate,
        weightTier: cat.weightTierDefault,
        creatorCommissionPct: cat.defaults.creatorPct,
        refundRatePct: cat.defaults.refundRatePct,
      },
    }));
    setRaw((prev) => ({
      ...prev,
      sellingPrice: String(cat.defaults.sellingPrice),
      cogs: String(cat.defaults.cogs),
    }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next.sellingPrice;
      delete next.cogs;
      return next;
    });
  }

  function update<K extends keyof FeeInput>(key: K, value: FeeInput[K]) {
    setInput((prev) => ({ ...prev, [key]: value }));
  }

  function updateNumeric(key: NumericKey, rawValue: string) {
    setRaw((prev) => ({ ...prev, [key]: rawValue }));
    const { value, error } = validateNumeric(key, rawValue);
    setErrors((prev) => {
      const next = { ...prev };
      if (error) next[key] = error;
      else delete next[key];
      return next;
    });
    if (value !== null) {
      setInput((prev) => ({ ...prev, [key]: value }));
    }
  }

  function resetToDefaults() {
    const fresh = defaultsForCategory(selectedSlug);
    setState({ input: fresh, selectedSlug });
    setRaw(toRawNumeric(fresh));
    setErrors({});
  }

  const hasErrors = Object.keys(errors).length > 0;

  const ctaUrl = `${siteConfig.monetization.gumroad.productUrl}?utm_source=tiktokshopcalc&utm_medium=calc-cta&utm_campaign=${selectedSlug}`;
  // Outcome-bridging copy: speaks to the post-shock state the seller is in
  // after watching their own margin drop. Doesn't lead with the price.
  const ctaLabel = `See your margin survive a viral order — $${siteConfig.monetization.gumroad.price} Bible`;
  // The sticky bar repeats the offer in a softer, fact-style register so it
  // reads as a footer note instead of a second sales pitch.
  const stickyCtaLabel = `Margin Bible · $${siteConfig.monetization.gumroad.price} · 14-day refund`;

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
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "1rem",
              gap: "0.5rem",
            }}
          >
            <h2 style={{ margin: 0, fontSize: "1.125rem" }}>Inputs</h2>
            <button
              type="button"
              className="btn-ghost-sm"
              onClick={resetToDefaults}
              aria-label="Reset all inputs to category defaults"
            >
              Reset
            </button>
          </div>

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
            <NumberField
              label="Selling price (USD)"
              fieldKey="sellingPrice"
              raw={raw.sellingPrice}
              error={errors.sellingPrice}
              onChange={updateNumeric}
              inputMode="decimal"
              step="0.01"
            />
            <NumberField
              label="Units per order"
              fieldKey="units"
              raw={raw.units}
              error={errors.units}
              onChange={updateNumeric}
              inputMode="numeric"
              step="1"
            />
          </div>

          <NumberField
            label="Cost of goods (per unit)"
            fieldKey="cogs"
            raw={raw.cogs}
            error={errors.cogs}
            onChange={updateNumeric}
            inputMode="decimal"
            step="0.01"
          />

          <Field
            label={`Creator plan & commission (${(input.creatorCommissionPct * 100).toFixed(0)}%)`}
            tooltip={
              <>
                <strong>Open</strong>: creators can promote without your approval (5–15% commission).
                <br />
                <strong>Targeted</strong>: you invite specific creators with higher commissions (15–30%+).
              </>
            }
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

          <Field
            label="Logistics"
            tooltip={
              <>
                <strong>FBT</strong> (Fulfilled by TikTok): TikTok warehouses and ships your inventory.
                <br />
                <strong>Upgraded TikTok Shipping</strong>: you ship, TikTok provides label discounts.
                <br />
                <strong>Collections by TikTok</strong>: TikTok picks up from your warehouse.
              </>
            }
          >
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

          <details
            style={{ marginTop: "1rem" }}
            open={advancedOpen}
            onToggle={(e) => setAdvancedOpen((e.target as HTMLDetailsElement).open)}
          >
            <summary style={{ cursor: "pointer", fontWeight: 600, padding: "0.5rem 0" }}>
              Advanced
            </summary>

            <Field label="Weight tier (drives FBT cost)">
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

            <NumberField
              label="Shipping charged to buyer (usually $0)"
              fieldKey="shippingChargedToBuyer"
              raw={raw.shippingChargedToBuyer}
              error={errors.shippingChargedToBuyer}
              onChange={updateNumeric}
              inputMode="decimal"
              step="0.01"
            />

            <Toggle
              label="New seller (first 30 days — 3% referral)"
              value={input.newSellerPromo}
              onChange={(v) => update("newSellerPromo", v)}
            />
            <Toggle
              label="Shop Performance Score ≥ 4"
              tooltip="TikTok's seller quality score (0–5). Shops below 4.0 lose access to Open creator program and pay higher refund-admin fees."
              value={input.shopPerformanceScore === "ge4"}
              onChange={(v) =>
                update("shopPerformanceScore", (v ? "ge4" : "lt4") as ShopPerformanceScore)
              }
            />
            <Toggle
              label="FBT multi-unit discount (Jan 2026+)"
              tooltip="As of Jan 2026, FBT orders with 2+ units of the same SKU get a per-unit fulfillment discount."
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
              tooltip="As of Nov 2025, TikTok charges sales tax on the referral fee itself in states that tax marketplace services."
              value={input.salesTaxOnReferralFee}
              onChange={(v) => update("salesTaxOnReferralFee", v)}
            />

            <div
              style={{
                maxHeight: input.salesTaxOnReferralFee ? "200px" : "0",
                overflow: "hidden",
                transition: "max-height 180ms ease",
              }}
              aria-hidden={!input.salesTaxOnReferralFee}
            >
              <Field label={`Buyer state tax rate (${(input.buyerStateTaxRate * 100).toFixed(2)}%)`}>
                <input
                  type="range"
                  min={0}
                  max={0.1}
                  step={0.0025}
                  value={input.buyerStateTaxRate}
                  onChange={(e) => update("buyerStateTaxRate", parseFloat(e.target.value))}
                  style={{ width: "100%" }}
                  tabIndex={input.salesTaxOnReferralFee ? 0 : -1}
                />
              </Field>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              <NumberField
                label="Platform-funded discount"
                fieldKey="platformFundedDiscount"
                raw={raw.platformFundedDiscount}
                error={errors.platformFundedDiscount}
                onChange={updateNumeric}
                inputMode="decimal"
                step="0.01"
              />
              <NumberField
                label="Seller-funded discount"
                fieldKey="sellerFundedDiscount"
                raw={raw.sellerFundedDiscount}
                error={errors.sellerFundedDiscount}
                onChange={updateNumeric}
                inputMode="decimal"
                step="0.01"
              />
            </div>

            <NumberField
              label="Expected return shipping cost per refund"
              fieldKey="expectedReturnShipCost"
              raw={raw.expectedReturnShipCost}
              error={errors.expectedReturnShipCost}
              onChange={updateNumeric}
              inputMode="decimal"
              step="0.01"
            />
          </details>
        </div>

        {/* ===== RESULTS ===== */}
        <div style={{ display: "flex", flexDirection: "column", gap: "1.25rem" }}>
          <div
            role="status"
            aria-live="polite"
            aria-atomic="false"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
              gap: "0.75rem",
            }}
          >
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

          {hasErrors && (
            <div
              role="alert"
              className="card"
              style={{
                padding: "0.75rem 1rem",
                borderLeft: "3px solid var(--color-danger)",
                background: "var(--color-surface-2)",
                fontSize: "0.875rem",
              }}
            >
              Fix the highlighted input{Object.keys(errors).length > 1 ? "s" : ""} — using last
              valid value for now.
            </div>
          )}

          {!embedded && (
            <div
              style={{
                display: "flex",
                gap: "0.75rem",
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <a href={ctaUrl} className="btn-primary">
                {ctaLabel}
              </a>
              <ShareButton input={input} />
            </div>
          )}

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

          {!embedded && <ScenarioCallouts input={input} r={r} />}
        </div>
      </div>

      {!embedded && (
        <a href={ctaUrl} className="sticky-mobile-cta" aria-label={stickyCtaLabel}>
          {stickyCtaLabel}
        </a>
      )}

      <style>{`
        @media (max-width: 880px) {
          .calc-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </div>
  );
}

function Field({
  label,
  children,
  tooltip,
}: {
  label: string;
  children: React.ReactNode;
  tooltip?: React.ReactNode;
}) {
  return (
    <label style={{ display: "block", marginBottom: "0.75rem" }}>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.375rem",
          fontSize: "0.75rem",
          color: "var(--color-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "0.25rem",
        }}
      >
        {label}
        {tooltip && <Tooltip label={label}>{tooltip}</Tooltip>}
      </span>
      {children}
    </label>
  );
}

function NumberField({
  label,
  fieldKey,
  raw,
  error,
  onChange,
  inputMode,
  step,
  tooltip,
}: {
  label: string;
  fieldKey: NumericKey;
  raw: string;
  error?: string;
  onChange: (key: NumericKey, value: string) => void;
  inputMode: "decimal" | "numeric";
  step: string;
  tooltip?: React.ReactNode;
}) {
  const errorId = error ? `${fieldKey}-error` : undefined;
  return (
    <label style={{ display: "block", marginBottom: "0.75rem" }}>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.375rem",
          fontSize: "0.75rem",
          color: "var(--color-muted)",
          textTransform: "uppercase",
          letterSpacing: "0.05em",
          marginBottom: "0.25rem",
        }}
      >
        {label}
        {tooltip && <Tooltip label={label}>{tooltip}</Tooltip>}
      </span>
      <input
        type="text"
        inputMode={inputMode}
        step={step}
        className={`input ${error ? "input-error" : ""}`}
        value={raw}
        onChange={(e) => onChange(fieldKey, e.target.value)}
        aria-invalid={!!error}
        aria-describedby={errorId}
      />
      {error && (
        <span id={errorId} className="field-error-msg" role="alert">
          {error}
        </span>
      )}
    </label>
  );
}

function Toggle({
  label,
  value,
  onChange,
  tooltip,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
  tooltip?: React.ReactNode;
}) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", padding: "0.375rem 0" }}>
      <label
        style={{
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          cursor: "pointer",
          flex: 1,
        }}
      >
        <input type="checkbox" checked={value} onChange={(e) => onChange(e.target.checked)} />
        <span style={{ fontSize: "0.875rem" }}>{label}</span>
      </label>
      {tooltip && <Tooltip label={label}>{tooltip}</Tooltip>}
    </div>
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
