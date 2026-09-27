"use client";

import { useQuery } from "@tanstack/react-query";
import { getBuildings, getBuilding } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

export function useBuildings() {
  return useQuery({
    queryKey: queryKeys.buildings.all,
    queryFn: getBuildings,
  });
}

export function useBuilding(id: string) {
  return useQuery({
    queryKey: queryKeys.buildings.detail(id),
    queryFn: () => getBuilding(id),
    enabled: Boolean(id),
  });
}
