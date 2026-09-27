import type { UsagePoint } from "./api";

// Deterministic "comparison period" derived from real usage points — same input always
// produces the same output (unlike Math.random()), so server/client renders stay in sync
// and repeated views are stable. Used where the UI wants a second reference line/delta
// but we don't have real multi-day history yet.
export function deriveComparisonSeries(points: UsagePoint[], seedOffset: number): number[] {
  return points.map((p, i) => +(p.kwh * (0.88 + 0.24 * Math.abs(Math.sin(i * 0.7 + seedOffset)))).toFixed(1));
}

export function percentDelta(current: number, previous: number): number {
  if (previous === 0) return 0;
  return +(Math.abs(((current - previous) / previous) * 100).toFixed(1));
}

export function relativeTime(isoTimestamp: string): string {
  const diffMs = Date.now() - new Date(isoTimestamp).getTime();
  const minutes = Math.floor(diffMs / 60000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes} min ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} hr${hours > 1 ? "s" : ""} ago`;
  const days = Math.floor(hours / 24);
  return `${days} day${days > 1 ? "s" : ""} ago`;
}
