"use client";

import { useMemo, useState } from "react";
import {
  Bell,
  CircleAlert,
  TriangleAlert,
  Info,
  CircleCheck,
  Clock,
  Building,
  MapPin,
  ChevronRight,
} from "lucide-react";
import type { Alert, AlertSeverity } from "@/lib/api";
import { relativeTime } from "@/lib/derived";

type Status = "active" | "acknowledged" | "resolved";

const SEVERITY_COLOR: Record<AlertSeverity, string> = {
  critical: "#F87171",
  warning: "#FCD34D",
  info: "#60A5FA",
};

const STATUS_COLOR: Record<Status, string> = {
  active: "#F87171",
  acknowledged: "#FCD34D",
  resolved: "#34D399",
};

const SEVERITY_ICON = { critical: CircleAlert, warning: TriangleAlert, info: Info };

const SEVERITY_FILTERS = ["All", "Critical", "Warning", "Info"] as const;
const STATUS_FILTERS = ["All", "Active", "Acknowledged", "Resolved"] as const;

function Pill({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-2.5 py-1 rounded-[7px] transition-colors"
      style={{
        fontSize: 12,
        fontWeight: active ? 560 : 460,
        color: active ? "var(--text-primary)" : "var(--text-tertiary)",
        background: active ? "var(--bg-elevated)" : "transparent",
      }}
    >
      {label}
    </button>
  );
}

export default function AlertsBoard({ alerts: initialAlerts }: { alerts: Alert[] }) {
  const [statusOverrides, setStatusOverrides] = useState<Record<string, Status>>({});
  const [severityFilter, setSeverityFilter] = useState<(typeof SEVERITY_FILTERS)[number]>("All");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("All");

  const alerts = useMemo(
    () => initialAlerts.map((a) => ({ ...a, status: statusOverrides[a.id] ?? a.status })),
    [initialAlerts, statusOverrides]
  );

  const counts = {
    critical: alerts.filter((a) => a.severity === "critical" && a.status !== "resolved").length,
    warning: alerts.filter((a) => a.severity === "warning" && a.status !== "resolved").length,
    info: alerts.filter((a) => a.severity === "info" && a.status !== "resolved").length,
    resolved: alerts.filter((a) => a.status === "resolved").length,
  };

  const filtered = alerts.filter((a) => {
    if (severityFilter !== "All" && a.severity !== severityFilter.toLowerCase()) return false;
    if (statusFilter !== "All" && a.status !== statusFilter.toLowerCase()) return false;
    return true;
  });

  const activeCount = alerts.filter((a) => a.status === "active").length;

  const setStatus = (id: string, status: Status) => setStatusOverrides((prev) => ({ ...prev, [id]: status }));

  return (
    <div className="flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-1.5 mb-1">
          <Bell size={12} style={{ color: "var(--text-muted)" }} />
          <span style={{ fontSize: 11.5, fontWeight: 520, color: "var(--text-muted)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Alert Center
          </span>
        </div>
        <h1 style={{ fontSize: 22, fontWeight: 660, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>System Alerts</h1>
        <p style={{ fontSize: 13.5, color: "var(--text-tertiary)", marginTop: 4 }}>
          {activeCount} active issues across {alerts.length} total alerts
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Critical", count: counts.critical, color: SEVERITY_COLOR.critical, icon: CircleAlert },
          { label: "Warnings", count: counts.warning, color: SEVERITY_COLOR.warning, icon: TriangleAlert },
          { label: "Info", count: counts.info, color: SEVERITY_COLOR.info, icon: Info },
          { label: "Resolved", count: counts.resolved, color: "#34D399", icon: CircleCheck },
        ].map((s) => (
          <div
            key={s.label}
            className="p-4 flex items-center justify-between"
            style={{ borderRadius: 14, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}
          >
            <div>
              <p style={{ fontSize: 11.5, color: "var(--text-tertiary)", marginBottom: 4 }}>{s.label}</p>
              <p style={{ fontSize: 22, fontWeight: 720, color: "var(--text-primary)" }}>{s.count}</p>
            </div>
            <div className="flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: 9, background: `${s.color}1A` }}>
              <s.icon size={16} style={{ color: s.color }} strokeWidth={1.75} />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1">
          {SEVERITY_FILTERS.map((f) => (
            <Pill key={f} label={f} active={severityFilter === f} onClick={() => setSeverityFilter(f)} />
          ))}
        </div>
        <div style={{ width: 1, height: 16, background: "var(--border)" }} />
        <div className="flex items-center gap-1">
          {STATUS_FILTERS.map((f) => (
            <Pill key={f} label={f} active={statusFilter === f} onClick={() => setStatusFilter(f)} />
          ))}
        </div>
        <span className="ml-auto" style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {filtered.length} alerts
        </span>
      </div>

      {filtered.length === 0 && (
        <div
          className="flex flex-col items-center justify-center gap-2 py-10"
          style={{ borderRadius: 14, background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}
        >
          <CircleCheck size={32} style={{ color: "#34D399" }} />
          <p style={{ fontSize: 13, color: "var(--text-muted)" }}>No alerts matching current filters</p>
        </div>
      )}

      <div className="flex flex-col gap-3">
        {filtered.map((alert) => {
          const SevIcon = SEVERITY_ICON[alert.severity];
          const resolved = alert.status === "resolved";
          return (
            <div
              key={alert.id}
              className="p-4 flex flex-col gap-3"
              style={{
                borderRadius: 14,
                background: resolved ? "var(--bg-card-hover)" : "var(--bg-card)",
                border: "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-card)",
                opacity: resolved ? 0.7 : 1,
              }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className="flex items-center justify-center shrink-0"
                    style={{ width: 32, height: 32, borderRadius: 9, background: `${SEVERITY_COLOR[alert.severity]}1A` }}
                  >
                    <SevIcon size={16} style={{ color: SEVERITY_COLOR[alert.severity] }} strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{alert.title}</h3>
                      <span
                        className="px-[7px] py-[1px] rounded-full"
                        style={{ fontSize: 10, fontWeight: 540, color: SEVERITY_COLOR[alert.severity], background: `${SEVERITY_COLOR[alert.severity]}18` }}
                      >
                        {alert.severity}
                      </span>
                      <span
                        className="px-[7px] py-[1px] rounded-full"
                        style={{ fontSize: 10, fontWeight: 540, color: STATUS_COLOR[alert.status], background: `${STATUS_COLOR[alert.status]}18` }}
                      >
                        {alert.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-1 shrink-0" style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                  <Clock size={12} />
                  {relativeTime(alert.detectedAt)}
                </div>
              </div>

              <p style={{ fontSize: 12.5, color: "var(--text-tertiary)", lineHeight: 1.55, letterSpacing: "-0.006em" }}>
                {alert.message}
              </p>

              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3" style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                  <span className="flex items-center gap-1">
                    <Building size={12} /> {alert.buildingName}
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin size={12} /> {alert.zone}
                  </span>
                </div>
                {resolved ? (
                  <span className="flex items-center gap-1" style={{ fontSize: 12, color: "#34D399", fontWeight: 540 }}>
                    <CircleCheck size={13} /> Resolved
                  </span>
                ) : (
                  <div className="flex items-center gap-2">
                    {alert.status === "active" && (
                      <button
                        onClick={() => setStatus(alert.id, "acknowledged")}
                        className="px-2.5 py-1 rounded-[8px]"
                        style={{ fontSize: 12, fontWeight: 500, color: "#FCD34D", background: "rgba(252,211,77,0.12)" }}
                      >
                        Acknowledge
                      </button>
                    )}
                    <button
                      onClick={() => setStatus(alert.id, "resolved")}
                      className="flex items-center gap-1 px-2.5 py-1 rounded-[8px]"
                      style={{ fontSize: 12, fontWeight: 500, color: "var(--bg-page)", background: "var(--text-primary)" }}
                    >
                      Resolve <ChevronRight size={12} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
