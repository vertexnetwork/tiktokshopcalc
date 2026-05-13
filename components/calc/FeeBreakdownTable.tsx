"use client";

import type { FeeBreakdown } from "@/lib/fee-engine";
import { fmtUSD, fmtPct } from "@/lib/format";

interface Props {
  r: FeeBreakdown;
}

export function FeeBreakdownTable({ r }: Props) {
  return (
    <div className="card" style={{ overflow: "hidden" }}>
      <table style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr style={{ borderBottom: "1px solid var(--color-border)" }}>
            <th style={{ textAlign: "left", padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Line item
            </th>
            <th style={{ textAlign: "right", padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Amount
            </th>
            <th style={{ textAlign: "right", padding: "0.75rem 1rem", fontSize: "0.75rem", color: "var(--color-muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Running
            </th>
          </tr>
        </thead>
        <tbody>
          {r.steps.map((s, i) => {
            const isFee = s.kind === "fee";
            const isResult = s.kind === "result";
            const isCost = s.kind === "cost";
            const color = isFee
              ? "var(--color-danger)"
              : isCost
                ? "var(--color-warning)"
                : isResult
                  ? r.netProfit > 0
                    ? "var(--color-success)"
                    : "var(--color-danger)"
                  : "var(--color-on-bg)";
            return (
              <tr
                key={`${s.label}-${i}`}
                style={{
                  borderBottom: i < r.steps.length - 1 ? "1px solid var(--color-border)" : "none",
                  background: isResult ? "var(--color-surface-2)" : "transparent",
                }}
              >
                <td style={{ padding: "0.65rem 1rem", fontSize: "0.9375rem" }}>
                  <div style={{ fontWeight: isResult ? 700 : 500 }}>{s.label}</div>
                  <div className="text-muted" style={{ fontSize: "0.75rem", marginTop: 2 }}>
                    {s.explain}
                  </div>
                </td>
                <td
                  style={{
                    padding: "0.65rem 1rem",
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                    color,
                    fontWeight: isResult ? 700 : 500,
                  }}
                >
                  {fmtUSD(s.delta)}
                </td>
                <td
                  style={{
                    padding: "0.65rem 1rem",
                    textAlign: "right",
                    fontVariantNumeric: "tabular-nums",
                    color: "var(--color-muted)",
                  }}
                >
                  {fmtUSD(s.running)}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div
        style={{
          padding: "0.75rem 1rem",
          background: "var(--color-bg)",
          borderTop: "1px solid var(--color-border)",
          display: "flex",
          gap: "1.5rem",
          flexWrap: "wrap",
          fontSize: "0.875rem",
          color: "var(--color-muted)",
        }}
      >
        <span>
          Fee take-rate:{" "}
          <strong style={{ color: "var(--color-on-bg)" }}>{fmtPct(r.feeTakeRate)}</strong>
        </span>
        <span>
          Margin:{" "}
          <strong
            style={{
              color:
                r.marginPct >= 0.25
                  ? "var(--color-success)"
                  : r.marginPct >= 0.1
                    ? "var(--color-warning)"
                    : "var(--color-danger)",
            }}
          >
            {fmtPct(r.marginPct)}
          </strong>
        </span>
        <span>
          ROAS breakeven:{" "}
          <strong style={{ color: "var(--color-on-bg)" }}>
            {Number.isFinite(r.roasBreakeven) ? `${r.roasBreakeven.toFixed(2)}×` : "∞"}
          </strong>
        </span>
      </div>
    </div>
  );
}
