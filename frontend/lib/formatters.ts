/** $1,234 — whole dollars, thousands separators. */
export function formatUsd(value: number): string {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

/** $12.3k — compact form for KPI tiles. */
export function formatUsdCompact(value: number, decimals = 0): string {
  return `$${(value / 1000).toFixed(decimals)}k`;
}

/** 1,234 kWh -> "1.2k" (bare number, caller adds the unit). */
export function formatKwhCompact(value: number, decimals = 0): string {
  return `${(value / 1000).toFixed(decimals)}k`;
}

export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export function formatMonthYear(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}
