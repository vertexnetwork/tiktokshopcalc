/**
 * Currency / percentage / number formatters. Locale-stable so SSR and client
 * match exactly — important for hydration parity.
 */

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});
const usdRound = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});
const pct1 = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});
const pct0 = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 0,
  maximumFractionDigits: 0,
});

export function fmtUSD(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return usd.format(n);
}

export function fmtUSDRound(n: number): string {
  if (!Number.isFinite(n)) return "—";
  return usdRound.format(n);
}

export function fmtPct(n: number, digits = 1): string {
  if (!Number.isFinite(n)) return "—";
  return digits === 0 ? pct0.format(n) : pct1.format(n);
}

export function fmtMultiple(n: number): string {
  if (!Number.isFinite(n)) return "∞";
  return `${n.toFixed(2)}×`;
}
