"use client";

import { Area, AreaChart, CartesianGrid, Tooltip, XAxis, YAxis, ResponsiveContainer } from "recharts";
import type { Building } from "@/types";

const COLORS = ["#FCD34D", "#60A5FA", "#A78BFA", "#F87171"];

function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string }) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="px-3 py-2 rounded-[10px]"
      style={{ background: "var(--bg-sidebar-solid)", border: "1px solid var(--border)", boxShadow: "var(--shadow-card-hover)" }}
    >
      <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 4 }}>{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ fontSize: 12, color: p.color, fontWeight: 560 }}>
          {p.name}: {p.value} kWh
        </p>
      ))}
    </div>
  );
}

export default function OverviewChart({ buildings }: { buildings: Building[] }) {
  const hours = buildings[0]?.usageKwh.map((p) => new Date(p.timestamp).toISOString().slice(11, 16)) ?? [];
  const data = hours.map((hour, i) => {
    const row: Record<string, string | number> = { hour };
    buildings.forEach((b) => {
      row[b.name] = b.usageKwh[i]?.kwh ?? 0;
    });
    return row;
  });

  return (
    <div>
      <div className="flex items-center gap-4 mb-2">
        {buildings.map((b, i) => (
          <div key={b.id} className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
            <span style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>{b.name}</span>
          </div>
        ))}
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 8, right: 8, left: -8, bottom: 0 }}>
          <defs>
            {buildings.map((b, i) => (
              <linearGradient key={b.id} id={`grad-${b.id}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0.22} />
                <stop offset="100%" stopColor={COLORS[i % COLORS.length]} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" strokeOpacity={0.5} vertical={false} />
          <XAxis dataKey="hour" tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} interval={3} />
          <YAxis tick={{ fontSize: 11, fill: "var(--text-muted)" }} axisLine={false} tickLine={false} width={40} />
          <Tooltip content={<CustomTooltip />} />
          {buildings.map((b, i) => (
            <Area
              key={b.id}
              type="monotone"
              dataKey={b.name}
              stroke={COLORS[i % COLORS.length]}
              strokeWidth={1.8}
              fill={`url(#grad-${b.id})`}
              dot={false}
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
