import { getJson, postJson } from "./http";
import type { Building, NewBuildingPayload, RegisteredBuilding } from "@/types";

export function getBuildings(): Promise<Building[]> {
  return getJson<Building[]>("/api/energy");
}

export function getBuilding(id: string): Promise<Building> {
  return getJson<Building>(`/api/energy/${id}`);
}

export function addBuilding(payload: NewBuildingPayload): Promise<RegisteredBuilding> {
  return postJson<RegisteredBuilding>("/api/buildings", payload);
}
