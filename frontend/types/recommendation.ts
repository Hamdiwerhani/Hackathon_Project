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
