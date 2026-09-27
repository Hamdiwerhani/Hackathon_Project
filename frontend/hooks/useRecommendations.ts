"use client";

import { useQuery } from "@tanstack/react-query";
import { getRecommendations } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

export function useRecommendations() {
  return useQuery({
    queryKey: queryKeys.recommendations,
    queryFn: getRecommendations,
  });
}
