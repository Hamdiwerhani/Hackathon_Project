const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

export type UsagePoint = { timestamp: string; kwh: number };

export type Zone = {
  zone: string;
  floor: string;
  temp: number;
  humidity: number;
  fanPct: number;
  status: "Active" | "Eco Mode" | "Cooling" | "Standby";
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

export type AlertSeverity = "critical" | "warning" | "info";

export type Alert = {
  id: string;
  buildingId: string;
  buildingName: string;
  zone: string;
  type: "spike" | "leak" | "setpoint";
  severity: AlertSeverity;
  status: "active" | "acknowledged" | "resolved";
  title: string;
  message: string;
  detectedAt: string;
};

export type Priority = "Critical" | "High" | "Medium" | "Low";
export type Effort = "Quick Win" | "Moderate" | "Strategic";
export type Category = "HVAC" | "Lighting" | "Demand" | "Renewable" | "IT" | "Scheduling";

export type Recommendation = {
  id: string;
  applied: boolean;
  title: string;
  category: Category;
  priority: Priority;
  effort: Effort;
  buildingName: string;
  description: string;
  monthlySavingsUsd: number;
  annualSavingsUsd: number;
};

export type Saving = {
  buildingId: string;
  buildingName: string;
  baselineCost: number;
  optimizedCost: number;
  savingsUsd: number;
  savingsPct: number;
};

export type MonthlyCost = { month: string; baseline: number; optimized: number; cumulativeSavings: number };

export type SavingsSummary = {
  annualBaseline: number;
  annualOptimized: number;
  annualSavings: number;
  roiPct: number;
  assumedImplementationCostUsd: number;
  breakEvenMonth: string | null;
  monthly: MonthlyCost[];
};

export type InvoiceStatus = "Paid" | "Pending" | "Overdue";

export type Invoice = {
  id: string;
  buildingId: string;
  building: string;
  period: string;
  issueDate: string;
  dueDate: string;
  kWh: number;
  amount: number;
  status: InvoiceStatus;
  provider: string;
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

async function fetchJson<T>(path: string): Promise<T> {
  const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
  if (!res.ok) throw new Error(`Request to ${path} failed: ${res.status}`);
  return res.json();
}

export type ChatMessage = { role: "user" | "assistant"; content: string };
export type AssistantResponse = { reply: string; toolsUsed: string[]; usedFallback: boolean };

export const api = {
  askAssistant: async (message: string, history: ChatMessage[]): Promise<AssistantResponse> => {
    const res = await fetch(`${API_URL}/api/assistant`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, history }),
    });
    if (!res.ok) throw new Error(`Assistant request failed: ${res.status}`);
    return res.json();
  },
  getBuildings: () => fetchJson<Building[]>("/api/energy"),
  getBuilding: (id: string) => fetchJson<Building>(`/api/energy/${id}`),
  getAlerts: () => fetchJson<Alert[]>("/api/alerts"),
  getRecommendations: () => fetchJson<Recommendation[]>("/api/recommendations"),
  getSavings: () => fetchJson<Saving[]>("/api/savings"),
  getSavingsSummary: () => fetchJson<SavingsSummary>("/api/savings/summary"),
  getInvoices: () => fetchJson<Invoice[]>("/api/invoices"),
  addBuilding: async (payload: NewBuildingPayload) => {
    const res = await fetch(`${API_URL}/api/buildings`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) throw new Error(`Failed to register building: ${res.status}`);
    return res.json();
  },
};
