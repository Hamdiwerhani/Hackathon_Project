import { getJson } from "./http";
import type { Alert } from "@/types";

export function getAlerts(): Promise<Alert[]> {
  return getJson<Alert[]>("/api/alerts");
}
