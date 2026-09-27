"use client";

import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";
import type { MonthlyCost } from "@/types";

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  const baseline = payload.find((p) => p.name === "Baseline")?.value ?? 0;
  const optimized = payload.find((p) => p.name === "Optimized")?.value ?? 0;
  return (
    <div className="px-3 py-2 rounded-[10px]" style={{ background: "var(--bg-sidebar-solid)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card-hover)" }}>
      <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 12, color: "#F87171" }}>Baseline: ${baseline}k</p>
      <p style={{ fontSize: 12, color: "#34D399" }}>Optimized: ${optimized}k</p>
      <p style={{ fontSize: 12, color: "#34D399", fontWeight: 600, marginTop: 2 }}>Savings: ${(baseline - optimized).toFixed(0)}k</p>
    </div>
  );
}

export default function MonthlyCostChart({ monthly }: { monthly: MonthlyCost[] }) {
  const data = monthly.map((m) => ({ month: m.month, Baseline: +(m.baseline / 1000).toFixed(1), Optimized: +(m.optimized / 1000).toFixed(1) }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} barGap={4} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `$${v}k`} />
        <Tooltip content={<CustomTooltip />} />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Bar dataKey="Baseline" fill="#F87171" fillOpacity={0.75} radius={[4, 4, 0, 0]} />
        <Bar dataKey="Optimized" fill="#34D399" fillOpacity={0.85} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
