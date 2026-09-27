export type Saving = {
  buildingId: string;
  buildingName: string;
  baselineCost: number;
  optimizedCost: number;
  savingsUsd: number;
  savingsPct: number;
};

export type MonthlyCost = {
  month: string;
  baseline: number;
  optimized: number;
  cumulativeSavings: number;
};

export type SavingsSummary = {
  annualBaseline: number;
  annualOptimized: number;
  annualSavings: number;
  roiPct: number;
  assumedImplementationCostUsd: number;
  breakEvenMonth: string | null;
  monthly: MonthlyCost[];
};
