"use client";

import type { BreakdownStep } from "@/lib/fee-engine";
import { fmtUSD } from "@/lib/format";

interface WaterfallChartProps {
  steps: BreakdownStep[];
}

const WIDTH = 800;
const HEIGHT = 320;
const PADDING_X = 16;
const PADDING_TOP = 16;
const PADDING_BOTTOM = 56;

export function WaterfallChart({ steps }: WaterfallChartProps) {
  if (steps.length === 0) return null;

  const gross = steps[0].running;
  const min = Math.min(0, ...steps.map((s) => s.running));
  const max = gross;
  const range = Math.max(1, max - min);
  const usableH = HEIGHT - PADDING_TOP - PADDING_BOTTOM;

  function yFor(value: number): number {
    return PADDING_TOP + ((max - value) / range) * usableH;
  }

  const barWidth = (WIDTH - PADDING_X * 2) / steps.length - 8;

  function colorFor(kind: BreakdownStep["kind"]): string {
    if (kind === "revenue") return "var(--color-success)";
    if (kind === "result") return "var(--color-success)";
    if (kind === "cost") return "var(--color-warning)";
    return "var(--color-danger)";
  }

  return (
    <div
      role="img"
      aria-label="Profit waterfall from gross revenue to net profit"
      style={{ minHeight: HEIGHT }}
    >
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        preserveAspectRatio="none"
        style={{ width: "100%", height: HEIGHT, display: "block" }}
      >
        {/* baseline at 0 */}
        <line
          x1={PADDING_X}
          x2={WIDTH - PADDING_X}
          y1={yFor(0)}
          y2={yFor(0)}
          stroke="var(--color-border)"
          strokeDasharray="3 3"
        />
        {steps.map((s, i) => {
          const x = PADDING_X + i * ((WIDTH - PADDING_X * 2) / steps.length) + 4;
          const top = yFor(Math.max(s.running, s.running - s.delta));
          const bottom = yFor(Math.min(s.running, s.running - s.delta));
          const h = Math.max(2, bottom - top);
          const color = colorFor(s.kind);
          return (
            <g key={`${s.label}-${i}`}>
              <title>{`${s.label}: ${fmtUSD(s.delta)} — ${s.explain}`}</title>
              <rect
                x={x}
                y={top}
                width={barWidth}
                height={h}
                fill={color}
                rx={3}
                opacity={s.kind === "fee" ? 0.9 : 1}
              />
              <text
                x={x + barWidth / 2}
                y={HEIGHT - PADDING_BOTTOM + 18}
                fontSize="10"
                textAnchor="middle"
                fill="var(--color-muted)"
              >
                {s.label.length > 14 ? s.label.slice(0, 13) + "…" : s.label}
              </text>
              <text
                x={x + barWidth / 2}
                y={HEIGHT - PADDING_BOTTOM + 32}
                fontSize="10"
                textAnchor="middle"
                fill={color}
                fontWeight={600}
              >
                {fmtUSD(s.delta)}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
