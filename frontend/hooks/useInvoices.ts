"use client";

import { useQuery } from "@tanstack/react-query";
import { getInvoices } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";

export function useInvoices() {
  return useQuery({
    queryKey: queryKeys.invoices,
    queryFn: getInvoices,
  });
}
