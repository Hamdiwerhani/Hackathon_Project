"use client";

import { Line, LineChart, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer, Legend } from "recharts";
import type { UsagePoint } from "@/types";
import { deriveComparisonSeries } from "@/lib/derived";

export default function HourlyDemandChart({ usageKwh, seed }: { usageKwh: UsagePoint[]; seed: number }) {
  const yesterday = deriveComparisonSeries(usageKwh, seed);
  const data = usageKwh.map((p, i) => ({
    hour: new Date(p.timestamp).toISOString().slice(11, 16),
    Today: p.kwh,
    Yesterday: yesterday[i],
  }));

  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
        <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} interval={2} />
        <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} width={40} unit=" kWh" />
        <Tooltip
          contentStyle={{ background: "var(--bg-sidebar-solid)", border: "1px solid var(--border)", borderRadius: 10, fontSize: 12 }}
        />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        <Line type="monotone" dataKey="Today" stroke="#FCD34D" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="Yesterday" stroke="#60A5FA" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
