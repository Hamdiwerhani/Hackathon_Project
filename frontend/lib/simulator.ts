export type Lever = {
  key: "hvac" | "lighting" | "solar" | "occupancy" | "peakDemand";
  label: string;
  color: string;
  max: number;
  unit: string;
  weight: number;
  investPer: number;
};

export const LEVERS: Lever[] = [
  { key: "hvac", label: "HVAC Efficiency", color: "#60A5FA", max: 50, unit: "%", weight: 0.38, investPer: 280 },
  { key: "lighting", label: "LED Lighting Upgrade", color: "#FCD34D", max: 40, unit: "%", weight: 0.2, investPer: 180 },
  { key: "solar", label: "Solar Capacity", color: "#34D399", max: 500, unit: "kW", weight: 0, investPer: 1200 },
  { key: "occupancy", label: "Occupancy Scheduling", color: "#FB923C", max: 30, unit: "%", weight: 0.14, investPer: 60 },
  { key: "peakDemand", label: "Peak Demand Reduction", color: "#A78BFA", max: 25, unit: "%", weight: 0.15, investPer: 140 },
];

export const SEASONAL_FACTORS = [1.05, 1.02, 0.98, 0.95, 1.08, 1.18, 1.22, 1.2, 1.1, 1, 0.96, 1.05];
export const MONTH_NAMES = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export type LeverValues = Record<Lever["key"], number>;

export function computeSimulation(monthlyCost: number, monthlyKwh: number, levers: LeverValues) {
  const hvacSavings = monthlyCost * 0.38 * (levers.hvac / 100);
  const lightingSavings = monthlyCost * 0.2 * (levers.lighting / 100);
  const solarSavings = levers.solar * 112;
  const occupancySavings = monthlyCost * 0.14 * (levers.occupancy / 100);
  const peakSavings = monthlyCost * 0.15 * (levers.peakDemand / 100);

  const totalSavings = Math.min(
    hvacSavings + lightingSavings + solarSavings + occupancySavings + peakSavings,
    monthlyCost * 0.78
  );
  const simCost = monthlyCost - totalSavings;
  const kwhReduction = monthlyCost > 0 ? Math.round((totalSavings / monthlyCost) * monthlyKwh) : 0;
  const co2TonsPerYear = +(kwhReduction * 0.00049 * 12).toFixed(1);

  const totalInvestment = LEVERS.reduce((sum, l) => sum + levers[l.key] * l.investPer, 0);
  const paybackMonths = totalSavings > 0 ? Math.round(totalInvestment / totalSavings) : null;

  return { totalSavings, simCost, kwhReduction, co2TonsPerYear, totalInvestment, paybackMonths };
}
