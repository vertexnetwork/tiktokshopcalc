"use client";

import type { FeeBreakdown, FeeInput } from "@/lib/fee-engine";
import { calcFees } from "@/lib/fee-engine";
import { fmtUSD } from "@/lib/format";

interface Props {
  input: FeeInput;
  r: FeeBreakdown;
}

export function ScenarioCallouts({ input, r }: Props) {
  const callouts: { tone: "info" | "warn" | "good"; title: string; body: string }[] = [];

  // 1. Commission drop scenario
  if (input.creatorPlan !== "None" && input.creatorCommissionPct > 0.05) {
    const lowerPct = Math.max(0.05, input.creatorCommissionPct - 0.05);
    const alt = calcFees({ ...input, creatorCommissionPct: lowerPct });
    const delta = alt.netProfit - r.netProfit;
    if (delta > 0.1) {
      callouts.push({
        tone: "info",
        title: `Drop creator commission by 5%`,
        body: `Lowering creator commission from ${(input.creatorCommissionPct * 100).toFixed(0)}% to ${(lowerPct * 100).toFixed(0)}% adds ${fmtUSD(delta)} to net per order.`,
      });
    }
  }

  // 2. Targeted plan tradeoff
  if (input.creatorPlan === "Open") {
    const targeted = calcFees({
      ...input,
      creatorPlan: "Targeted",
      creatorCommissionPct: 0.25,
    });
    const loss = r.netProfit - targeted.netProfit;
    if (loss > 0) {
      const requiredLift = (loss / r.netProfit) * 100;
      callouts.push({
        tone: "info",
        title: `Targeted Plan at 25% requires a ${requiredLift.toFixed(1)}% conversion lift to be net-positive`,
        body: `Targeted creators typically deliver 2–3× the conversion rate of Open, so this lift is usually achievable.`,
      });
    }
  }

  // 3. SPS drop penalty
  if (input.shopPerformanceScore === "ge4" && input.refundRatePct > 0) {
    const lowScore = calcFees({ ...input, shopPerformanceScore: "lt4" });
    const hit = r.netProfit - lowScore.netProfit;
    if (hit > 0.1) {
      callouts.push({
        tone: "warn",
        title: `Falling below SPS 4 would cost you ${fmtUSD(hit)} per order`,
        body: `Below 4, your return-shipping share jumps from 20% to 50%.`,
      });
    }
  }

  // 4. New seller cliff
  if (input.newSellerPromo) {
    const standard = calcFees({ ...input, newSellerPromo: false });
    const cliff = r.netProfit - standard.netProfit;
    if (cliff > 0.1) {
      callouts.push({
        tone: "warn",
        title: `Your new-seller 3% expires in 30 days`,
        body: `When standard ${(input.referralRate * 100).toFixed(0)}% kicks in, net drops by ${fmtUSD(cliff)} per order.`,
      });
    }
  }

  // 5. Margin grade
  if (r.netProfit > 0) {
    if (r.marginPct >= 0.25) {
      callouts.push({
        tone: "good",
        title: `Healthy ${(r.marginPct * 100).toFixed(0)}% margin`,
        body: `You have ${Number.isFinite(r.roasBreakeven) ? `${r.roasBreakeven.toFixed(2)}×` : "unbounded"} ROAS room for ad spend per order.`,
      });
    } else if (r.marginPct < 0.1) {
      callouts.push({
        tone: "warn",
        title: `Razor-thin ${(r.marginPct * 100).toFixed(0)}% margin`,
        body: `Below 10% margin leaves almost no headroom for ad spend or returns.`,
      });
    }
  }

  if (callouts.length === 0) return null;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
      {callouts.map((c, i) => (
        <div
          key={i}
          className="card"
          style={{
            padding: "0.875rem 1rem",
            borderLeft: `3px solid ${
              c.tone === "warn"
                ? "var(--color-danger)"
                : c.tone === "good"
                  ? "var(--color-success)"
                  : "var(--color-accent)"
            }`,
          }}
        >
          <p style={{ margin: 0, fontWeight: 600 }}>{c.title}</p>
          <p className="text-muted" style={{ margin: "0.25rem 0 0", fontSize: "0.875rem" }}>
            {c.body}
          </p>
        </div>
      ))}
    </div>
  );
}
