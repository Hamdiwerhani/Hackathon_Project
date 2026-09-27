"use client";

import { useState } from "react";
import type { Building } from "@/lib/api";
import HourlyDemandChart from "@/components/HourlyDemandChart";
import ZonesList from "@/components/ZonesList";

export default function BuildingsBoard({ buildings }: { buildings: Building[] }) {
  const [activeId, setActiveId] = useState(buildings[0]?.id);
  const active = buildings.find((b) => b.id === activeId) ?? buildings[0];
  const activeIndex = buildings.findIndex((b) => b.id === activeId);

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 660, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>Building Detail</h1>
        <p style={{ fontSize: 13.5, color: "var(--text-tertiary)", marginTop: 4 }}>Per-building usage and HVAC zone status</p>
      </div>

      <div
        className="inline-flex items-center gap-1 p-1 rounded-[9px] self-start"
        style={{ background: "var(--bg-inset)" }}
      >
        {buildings.map((b) => (
          <button
            key={b.id}
            onClick={() => setActiveId(b.id)}
            className="px-3 py-1.5 rounded-[7px] transition-colors"
            style={{
              fontSize: 12.5,
              fontWeight: b.id === activeId ? 560 : 460,
              color: b.id === activeId ? "var(--text-primary)" : "var(--text-tertiary)",
              background: b.id === activeId ? "var(--bg-card-solid)" : "transparent",
              boxShadow: b.id === activeId ? "var(--shadow-card)" : "none",
            }}
          >
            {b.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-4">
        <div className="p-5" style={{ borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 4 }}>
            Hourly Demand
          </h2>
          <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginBottom: 8 }}>
            {active.floors} floors · HVAC setpoint {active.hvacSetpointC}°C
          </p>
          <HourlyDemandChart usageKwh={active.usageKwh} seed={activeIndex} />
        </div>

        <div className="p-4" style={{ borderRadius: 11, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)", letterSpacing: "-0.02em", marginBottom: 4 }}>
            HVAC Zones
          </h2>
          <ZonesList zones={active.zones} />
        </div>
      </div>
    </div>
  );
}
