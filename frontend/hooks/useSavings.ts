"use client";

import { useQuery } from "@tanstack/react-query";
import { getSavings, getSavingsSummary } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

export function useSavings() {
  return useQuery({
    queryKey: queryKeys.savings.perBuilding,
    queryFn: getSavings,
  });
}

export function useSavingsSummary() {
  return useQuery({
    queryKey: queryKeys.savings.summary,
    queryFn: getSavingsSummary,
  });
}
