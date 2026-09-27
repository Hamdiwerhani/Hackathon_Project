"use client";

import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer, ReferenceLine } from "recharts";
import type { MonthlyCost } from "@/types";

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="px-3 py-2 rounded-[10px]" style={{ background: "var(--bg-sidebar-solid)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card-hover)" }}>
      <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{label}</p>
      <p style={{ fontSize: 12, color: "#34D399", fontWeight: 600 }}>${payload[0].value}k saved</p>
    </div>
  );
}

export default function CumulativeSavingsChart({
  monthly,
  breakEvenUsd,
}: {
  monthly: MonthlyCost[];
  breakEvenUsd: number;
}) {
  const data = monthly.map((m) => ({ month: m.month, cumulative: +(m.cumulativeSavings / 1000).toFixed(1) }));

  return (
    <ResponsiveContainer width="100%" height={180}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="gradCumulative" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34D399" stopOpacity={0.15} />
            <stop offset="100%" stopColor="#34D399" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
        <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} width={40} tickFormatter={(v) => `$${v}k`} />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine
          y={breakEvenUsd / 1000}
          stroke="#FCD34D"
          strokeDasharray="4 3"
          label={{ value: "Break-even", position: "insideTopRight", fill: "#FCD34D", fontSize: 11 }}
        />
        <Area type="monotone" dataKey="cumulative" stroke="#34D399" strokeWidth={2.2} fill="url(#gradCumulative)" dot={false} />
      </AreaChart>
    </ResponsiveContainer>
  );
}
