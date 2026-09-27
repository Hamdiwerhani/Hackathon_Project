import { LucideIcon, ArrowUpRight, ArrowDownRight } from "lucide-react";

type Props = {
  label: string;
  value: string;
  unit?: string;
  icon: LucideIcon;
  color: string;
  delta?: { pct: number; good: boolean };
  valueSize?: number;
};

export default function KpiCard({ label, value, unit, icon: Icon, color, delta, valueSize = 26 }: Props) {
  return (
    <div
      className="p-4 flex flex-col gap-3"
      style={{
        borderRadius: 14,
        background: "var(--bg-card)",
        border: "1px solid var(--border-subtle)",
        boxShadow: "var(--shadow-card)",
      }}
    >
      <div className="flex items-center justify-between">
        <span style={{ fontSize: "11.5px", fontWeight: 520, color: "var(--text-tertiary)", letterSpacing: "-0.005em" }}>
          {label}
        </span>
        <div
          className="flex items-center justify-center shrink-0"
          style={{ width: 32, height: 32, borderRadius: 9, background: `${color}1A` }}
        >
          <Icon size={16} style={{ color }} strokeWidth={1.75} />
        </div>
      </div>
      <div className="flex items-baseline gap-1.5">
        <span style={{ fontSize: valueSize, fontWeight: 700, color: "var(--text-primary)", letterSpacing: "-0.02em" }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: 12, fontWeight: 500, color: "var(--text-muted)" }}>{unit}</span>
        )}
      </div>
      {delta && (
        <div className="flex items-center gap-1">
          {delta.good ? (
            <ArrowDownRight size={13} style={{ color: "#34D399" }} />
          ) : (
            <ArrowUpRight size={13} style={{ color: "#F87171" }} />
          )}
          <span style={{ fontSize: 11.5, fontWeight: 540, color: delta.good ? "#34D399" : "#F87171" }}>
            {delta.pct}% vs last month
          </span>
        </div>
      )}
    </div>
  );
}
