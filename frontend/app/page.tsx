import { Zap, DollarSign, Leaf, TrendingDown } from "lucide-react";
import { api } from "@/lib/api";
import KpiCard from "@/components/KpiCard";
import OverviewChart from "@/components/OverviewChart";
import BuildingStatusCard, { statusForBuilding } from "@/components/BuildingStatusCard";
import { deriveComparisonSeries, percentDelta } from "@/lib/derived";

const CO2_KG_PER_KWH = 0.42;

export default async function OverviewPage() {
  const [buildings, alerts, savings] = await Promise.all([
    api.getBuildings(),
    api.getAlerts(),
    api.getSavings(),
  ]);

  const totalKwh = buildings.reduce((sum, b) => sum + b.usageKwh.reduce((s, p) => s + p.kwh, 0), 0);
  const totalBaselineCost = savings.reduce((sum, s) => sum + s.baselineCost, 0);
  const totalOptimizedCost = savings.reduce((sum, s) => sum + s.optimizedCost, 0);
  const totalSavingsUsd = totalBaselineCost - totalOptimizedCost;
  const avgSavingsPct = totalBaselineCost ? (totalSavingsUsd / totalBaselineCost) * 100 : 0;
  const co2Tonnes = (totalKwh * CO2_KG_PER_KWH) / 1000;

  const comparisonTotal = buildings.reduce(
    (sum, b, i) => sum + deriveComparisonSeries(b.usageKwh, i).reduce((s, v) => s + v, 0),
    0
  );
  const comparisonCost = comparisonTotal * (totalBaselineCost / totalKwh || 0.14);

  const today = new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 660, color: "var(--text-primary)", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
            Energy Overview
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--text-tertiary)", marginTop: 4 }}>
            Real-time monitoring across {buildings.length} buildings · {today}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-[8px]"
            style={{ background: "rgba(52,211,153,0.12)", border: "1px solid rgba(52,211,153,0.2)" }}
          >
            <span className="w-1.5 h-1.5 rounded-full animate-pulse" style={{ background: "#34D399" }} />
            <span style={{ fontSize: 11.5, fontWeight: 560, color: "#34D399" }}>Live</span>
          </div>
          <button
            className="px-3 py-1 rounded-[8px]"
            style={{ fontSize: 12, fontWeight: 480, background: "var(--bg-card)", border: "1px solid var(--border)", color: "var(--text-secondary)" }}
          >
            Last 24 hours
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Total Consumption"
          value={totalKwh.toFixed(0)}
          unit="kWh"
          icon={Zap}
          color="#FCD34D"
          delta={{ pct: percentDelta(totalKwh, comparisonTotal), good: totalKwh <= comparisonTotal }}
        />
        <KpiCard
          label="Daily Cost"
          value={`$${totalBaselineCost.toFixed(0)}`}
          icon={DollarSign}
          color="#34D399"
          delta={{ pct: percentDelta(totalBaselineCost, comparisonCost), good: totalBaselineCost <= comparisonCost }}
        />
        <KpiCard
          label="CO2 Emissions"
          value={co2Tonnes.toFixed(2)}
          unit="t"
          icon={Leaf}
          color="#60A5FA"
          delta={{ pct: percentDelta(co2Tonnes, (comparisonTotal * CO2_KG_PER_KWH) / 1000), good: true }}
        />
        <KpiCard
          label="Energy Savings"
          value={`${avgSavingsPct.toFixed(1)}%`}
          icon={TrendingDown}
          color="#A78BFA"
          delta={{ pct: percentDelta(avgSavingsPct, avgSavingsPct * 0.85), good: true }}
        />
      </div>

      <div
        className="p-5"
        style={{ borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}
      >
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 12 }}>
          Consumption — Last 24 Hours
        </h2>
        <OverviewChart buildings={buildings} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {buildings.map((b) => {
          const buildingKwh = b.usageKwh.reduce((s, p) => s + p.kwh, 0);
          const hasCritical = alerts.some((a) => a.buildingId === b.id && a.severity === "critical");
          const hasWarning = alerts.some((a) => a.buildingId === b.id && a.severity === "warning");
          return (
            <BuildingStatusCard
              key={b.id}
              building={b}
              totalKwh={buildingKwh}
              pctOfTotal={(buildingKwh / totalKwh) * 100}
              status={statusForBuilding(b, hasCritical, hasWarning)}
            />
          );
        })}
      </div>
    </div>
  );
}
