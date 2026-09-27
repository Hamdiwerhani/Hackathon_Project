import { getJson } from "./http";
import type { Invoice } from "@/types";

export function getInvoices(): Promise<Invoice[]> {
  return getJson<Invoice[]>("/api/invoices");
}
