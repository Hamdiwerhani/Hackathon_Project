import { Thermometer, Droplets, Wind } from "lucide-react";
import type { Zone } from "@/lib/api";

const STATUS_STYLE: Record<Zone["status"], { color: string; bg: string }> = {
  Active: { color: "#34D399", bg: "rgba(52,211,153,0.12)" },
  "Eco Mode": { color: "#60A5FA", bg: "rgba(96,165,250,0.12)" },
  Cooling: { color: "#A78BFA", bg: "rgba(167,139,250,0.12)" },
  Standby: { color: "#78787F", bg: "rgba(120,120,127,0.1)" },
};

export default function ZonesList({ zones }: { zones: Zone[] }) {
  return (
    <div className="flex flex-col gap-2 overflow-y-auto" style={{ maxHeight: 300 }}>
      {zones.map((z) => {
        const style = STATUS_STYLE[z.status];
        return (
          <div
            key={z.zone}
            className="p-3 flex flex-col gap-2"
            style={{ borderRadius: 11, background: "var(--bg-inset)", border: "1px solid var(--border-subtle)" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p style={{ fontSize: 12.5, fontWeight: 560, color: "var(--text-primary)" }}>{z.zone}</p>
                <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{z.floor}</p>
              </div>
              <span
                className="px-[7px] py-[1px] rounded-full"
                style={{ fontSize: 10, fontWeight: 540, color: style.color, background: style.bg }}
              >
                {z.status}
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1" style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>
                <Thermometer size={12} style={{ color: "#F87171" }} /> {z.temp}°C
              </span>
              <span className="flex items-center gap-1" style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>
                <Droplets size={12} style={{ color: "#60A5FA" }} /> {z.humidity}%
              </span>
              <span className="flex items-center gap-1" style={{ fontSize: 11.5, color: "var(--text-tertiary)" }}>
                <Wind size={12} style={{ color: "#A78BFA" }} /> {z.fanPct}%
              </span>
            </div>
            <div className="h-[3px] rounded-full overflow-hidden" style={{ background: "var(--bg-page)" }}>
              <div className="h-full rounded-full" style={{ width: `${z.fanPct}%`, background: "#A78BFA" }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
