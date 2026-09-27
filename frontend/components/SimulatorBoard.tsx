"use client";

import { useMemo, useState } from "react";
import { RotateCcw, Wind, Lightbulb, Sun, Clock, TrendingDown, DollarSign, Zap, Leaf } from "lucide-react";
import { LEVERS, SEASONAL_FACTORS, MONTH_NAMES, computeSimulation, type LeverValues } from "@/lib/simulator";
import MonthlyCostChart from "@/components/MonthlyCostChart";
import CumulativeSavingsChart from "@/components/CumulativeSavingsChart";

const ICONS = { hvac: Wind, lighting: Lightbulb, solar: Sun, occupancy: Clock, peakDemand: TrendingDown };

const ZERO: LeverValues = { hvac: 0, lighting: 0, solar: 0, occupancy: 0, peakDemand: 0 };

export type BuildingPreset = { name: string; monthlyCost: number; monthlyKwh: number };

export default function SimulatorBoard({ presets }: { presets: BuildingPreset[] }) {
  const [buildingName, setBuildingName] = useState(presets[0]?.name ?? "All Buildings");
  const [levers, setLevers] = useState<LeverValues>(ZERO);

  const preset = presets.find((p) => p.name === buildingName) ?? presets[0];
  const hasChanges = Object.values(levers).some((v) => v > 0);

  const result = useMemo(() => computeSimulation(preset.monthlyCost, preset.monthlyKwh, levers), [preset, levers]);

  const monthly = useMemo(() => {
    let cumulative = 0;
    return SEASONAL_FACTORS.map((factor, i) => {
      const baseline = Math.round(preset.monthlyCost * factor);
      const optimized = Math.round(result.simCost * factor);
      cumulative += baseline - optimized;
      return { month: MONTH_NAMES[i], baseline, optimized, cumulativeSavings: cumulative };
    });
  }, [preset, result.simCost]);

  const pct = preset.monthlyCost > 0 ? (result.totalSavings / preset.monthlyCost) * 100 : 0;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-3">
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 660, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
            Savings Simulator
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--text-tertiary)", marginTop: 4 }}>
            Adjust optimization levers and see projected savings update in real time
          </p>
        </div>
        {hasChanges && (
          <button
            onClick={() => setLevers(ZERO)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px]"
            style={{ fontSize: 12, color: "var(--text-secondary)", background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            <RotateCcw size={13} /> Reset
          </button>
        )}
      </div>

      <div className="inline-flex items-center gap-1 p-1 rounded-[9px] self-start flex-wrap" style={{ background: "var(--bg-inset)" }}>
        {presets.map((p) => (
          <button
            key={p.name}
            onClick={() => setBuildingName(p.name)}
            className="px-3 py-1.5 rounded-[7px]"
            style={{
              fontSize: 12.5,
              fontWeight: p.name === buildingName ? 560 : 460,
              color: p.name === buildingName ? "var(--text-primary)" : "var(--text-tertiary)",
              background: p.name === buildingName ? "var(--bg-card-solid)" : "transparent",
              boxShadow: p.name === buildingName ? "var(--shadow-card)" : "none",
            }}
          >
            {p.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_320px] gap-4">
        <div className="p-5 flex flex-col gap-5" style={{ borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}>
          {LEVERS.map((lever) => {
            const Icon = ICONS[lever.key];
            const value = levers[lever.key];
            const monthlySaving =
              lever.key === "solar" ? value * 112 : preset.monthlyCost * lever.weight * (value / 100);
            return (
              <div key={lever.key}>
                <div className="flex items-center justify-between mb-2">
                  <span className="flex items-center gap-2" style={{ fontSize: 12.5, fontWeight: 560, color: "var(--text-primary)" }}>
                    <Icon size={15} style={{ color: lever.color }} /> {lever.label}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                    {value}
                    {lever.unit} · ${monthlySaving.toFixed(0)}/mo
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={lever.max}
                  value={value}
                  onChange={(e) => setLevers((prev) => ({ ...prev, [lever.key]: Number(e.target.value) }))}
                  className="w-full sim-range"
                  style={{ color: lever.color }}
                />
              </div>
            );
          })}
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            {[
              { label: "Monthly Savings", value: result.totalSavings > 0 ? `$${result.totalSavings.toFixed(0)}` : "—", icon: DollarSign, color: "#34D399" },
              { label: "Annual Savings", value: result.totalSavings > 0 ? `$${(result.totalSavings * 12).toFixed(0)}` : "—", icon: TrendingDown, color: "#FCD34D" },
              { label: "kWh Reduction", value: result.kwhReduction > 0 ? result.kwhReduction.toLocaleString() : "—", icon: Zap, color: "#60A5FA" },
              { label: "CO2 Reduction", value: result.co2TonsPerYear > 0 ? `${result.co2TonsPerYear}t` : "—", icon: Leaf, color: "#A78BFA" },
            ].map((k) => (
              <div key={k.label} className="p-3" style={{ borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                <div className="flex items-center gap-1.5 mb-1">
                  <k.icon size={13} style={{ color: k.color }} />
                  <span style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{k.label}</span>
                </div>
                <p style={{ fontSize: 18, fontWeight: 680, color: "var(--text-primary)" }}>{k.value}</p>
              </div>
            ))}
          </div>

          {result.totalInvestment > 0 && (
            <div className="p-3" style={{ borderRadius: 12, background: "var(--bg-inset)", border: "1px solid var(--border-subtle)" }}>
              <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Est. Investment</p>
              <p style={{ fontSize: 16, fontWeight: 640, color: "var(--text-primary)" }}>${result.totalInvestment.toFixed(0)}</p>
              {result.paybackMonths !== null && (
                <p style={{ fontSize: 11, color: "var(--text-tertiary)" }}>{result.paybackMonths} months to payback</p>
              )}
            </div>
          )}

          <div className="p-3" style={{ borderRadius: 12, background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
            <p style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>{pct.toFixed(0)}% cost reduction</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 6 }}>
              from ${preset.monthlyCost.toFixed(0)}/mo down to ${result.simCost.toFixed(0)}/mo
            </p>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: "var(--bg-inset)" }}>
              <div
                className="h-full rounded-full"
                style={{ width: `${pct}%`, background: "linear-gradient(90deg, #34D399, #60A5FA)" }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="p-5" style={{ borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}>
        <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 12 }}>
          Monthly Cost Comparison
        </h2>
        <MonthlyCostChart monthly={monthly} />
      </div>

      {result.totalSavings > 0 && (
        <div className="p-5" style={{ borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}>
          <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
            <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>Cumulative Savings</h2>
            <span className="px-2.5 py-1 rounded-full" style={{ fontSize: 11.5, fontWeight: 560, color: "#34D399", background: "rgba(52,211,153,0.12)" }}>
              ${monthly[11].cumulativeSavings.toLocaleString()} by year-end
            </span>
          </div>
          <CumulativeSavingsChart monthly={monthly} breakEvenUsd={result.totalInvestment} />
        </div>
      )}
    </div>
  );
}
