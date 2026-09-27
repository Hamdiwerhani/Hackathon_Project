"use client";

import { useQuery } from "@tanstack/react-query";
import { getAlerts } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

/** Live alerts, refetched periodically and shared across every component that uses it
 * (e.g. Sidebar and Topnav both read this — React Query dedupes them into one request). */
export function useAlerts() {
  return useQuery({
    queryKey: queryKeys.alerts,
    queryFn: getAlerts,
    refetchInterval: 60_000,
  });
}
