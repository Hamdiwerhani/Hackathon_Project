"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addBuilding } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

export function useAddBuilding() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: addBuilding,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.buildings.all });
    },
  });
}
