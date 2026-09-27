import { DollarSign, Target, TrendingDown, Leaf } from "lucide-react";
import { api } from "@/lib/api";
import KpiCard from "@/components/KpiCard";
import MonthlyCostChart from "@/components/MonthlyCostChart";
import CumulativeSavingsChart from "@/components/CumulativeSavingsChart";

export default async function CostSavingsPage() {
  const summary = await api.getSavingsSummary();
  const lastMonth = summary.monthly[summary.monthly.length - 1];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 660, color: "var(--text-primary)", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
          Cost &amp; Savings Projection
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--text-tertiary)", marginTop: 4 }}>
          Baseline vs. AI-optimized spend · full-year forecast
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Annual Baseline"
          value={`$${(summary.annualBaseline / 1000).toFixed(0)}k`}
          icon={DollarSign}
          color="#F87171"
          valueSize={24}
        />
        <KpiCard
          label="Projected Cost"
          value={`$${(summary.annualOptimized / 1000).toFixed(0)}k`}
          icon={Target}
          color="#FCD34D"
          valueSize={24}
        />
        <KpiCard
          label="Total Savings"
          value={`$${(summary.annualSavings / 1000).toFixed(0)}k`}
          icon={TrendingDown}
          color="#34D399"
          valueSize={24}
        />
        <KpiCard label="Projected ROI" value={`${summary.roiPct}%`} icon={Leaf} color="#A78BFA" valueSize={24} />
      </div>

      <div className="p-5" style={{ borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 12 }}>
          Monthly Cost Comparison
        </h2>
        <MonthlyCostChart monthly={summary.monthly} />
      </div>

      <div className="p-5" style={{ borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Cumulative Savings</h2>
          <span
            className="px-2.5 py-1 rounded-full"
            style={{ fontSize: 11.5, fontWeight: 560, color: "#34D399", background: "rgba(52,211,153,0.12)" }}
          >
            ${(lastMonth.cumulativeSavings / 1000).toFixed(1)}k by year-end
          </span>
        </div>
        <CumulativeSavingsChart monthly={summary.monthly} breakEvenUsd={summary.assumedImplementationCostUsd} />
        <p style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 8 }}>
          Break-even projected in {summary.breakEvenMonth ?? "next year"}, assuming a ${(summary.assumedImplementationCostUsd / 1000).toFixed(0)}k
          implementation cost.
        </p>
      </div>
    </div>
  );
}
