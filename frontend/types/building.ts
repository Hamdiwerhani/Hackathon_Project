export type UsagePoint = {
  timestamp: string;
  kwh: number;
};

export type ZoneStatus = "Active" | "Eco Mode" | "Cooling" | "Standby";

export type Zone = {
  zone: string;
  floor: string;
  temp: number;
  humidity: number;
  fanPct: number;
  status: ZoneStatus;
};

export type Building = {
  id: string;
  name: string;
  hvacSetpointC: number;
  costPerKwh: number;
  expectedIdleKwh: number;
  floors: number;
  zones: Zone[];
  usageKwh: UsagePoint[];
};

export type NewBuildingPayload = {
  name: string;
  type: string;
  address: string;
  city?: string;
  country?: string;
  floors: number;
  area: number;
  yearBuilt?: number;
  occupancy?: number;
  hvac?: string;
  lighting?: string;
  climateZone?: string;
  utilityProvider: string;
  utilityAccountNo?: string;
  annualTarget?: number;
  baselineConsumption?: number;
};

export type RegisteredBuilding = NewBuildingPayload & {
  id: string;
  registeredAt: string;
};
