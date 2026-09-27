import Link from "next/link";
import type { Building } from "@/types";

type Status = { label: string; color: string };

export function statusForBuilding(building: Building, hasCritical: boolean, hasWarning: boolean): Status {
  if (hasCritical) return { label: "High Load", color: "#F87171" };
  if (hasWarning) return { label: "Attention", color: "#FCD34D" };
  return { label: "Optimal", color: "#34D399" };
}

export default function BuildingStatusCard({
  building,
  totalKwh,
  pctOfTotal,
  status,
}: {
  building: Building;
  totalKwh: number;
  pctOfTotal: number;
  status: Status;
}) {
  return (
    <Link
      href="/buildings"
      className="p-4 flex flex-col gap-3 hover:border-[var(--border-hover)] transition-colors block"
      style={{ borderRadius: 14, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}
    >
      <div className="flex items-center justify-between">
        <span style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.012em" }}>
          {building.name}
        </span>
        <span
          className="px-[8px] py-[2px] rounded-full"
          style={{ fontSize: "10.5px", fontWeight: 540, color: status.color, background: `${status.color}18` }}
        >
          {status.label}
        </span>
      </div>
      <div className="flex items-baseline gap-1">
        <span style={{ fontSize: 20, fontWeight: 680, color: "var(--text-primary)", letterSpacing: "-0.015em" }}>
          {totalKwh.toFixed(0)}
        </span>
        <span style={{ fontSize: 12, color: "var(--text-muted)" }}>kWh</span>
      </div>
      <div className="h-1 rounded-full overflow-hidden" style={{ background: "var(--bg-inset)" }}>
        <div className="h-full rounded-full" style={{ width: `${pctOfTotal}%`, background: status.color, opacity: 0.8 }} />
      </div>
      <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
        {pctOfTotal.toFixed(0)}% of total · {building.floors} floors
      </span>
    </Link>
  );
}
