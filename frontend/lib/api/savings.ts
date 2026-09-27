import { getJson } from "./http";
import type { Saving, SavingsSummary } from "@/types";

export function getSavings(): Promise<Saving[]> {
  return getJson<Saving[]>("/api/savings");
}

export function getSavingsSummary(): Promise<SavingsSummary> {
  return getJson<SavingsSummary>("/api/savings/summary");
}
