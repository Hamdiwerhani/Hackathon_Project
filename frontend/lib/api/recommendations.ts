import { getJson } from "./http";
import type { Recommendation } from "@/types";

export function getRecommendations(): Promise<Recommendation[]> {
  return getJson<Recommendation[]>("/api/recommendations");
}
