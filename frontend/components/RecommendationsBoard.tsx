"use client";

import { useMemo, useState } from "react";
import {
  Sparkles,
  Wind,
  Lightbulb,
  ChartColumn,
  Sun,
  Server,
  Clock,
  Zap,
  ChevronRight,
  CircleCheck,
} from "lucide-react";
import type { Category, Priority, Recommendation } from "@/types";
import { formatUsdCompact, formatUsd } from "@/lib/formatters";

const CATEGORY_ICON: Record<Category, typeof Wind> = {
  HVAC: Wind,
  Lighting: Lightbulb,
  Demand: ChartColumn,
  Renewable: Sun,
  IT: Server,
  Scheduling: Clock,
};

const CATEGORY_COLOR: Record<Category, string> = {
  HVAC: "#60A5FA",
  Lighting: "#FCD34D",
  Demand: "#F87171",
  Renewable: "#34D399",
  IT: "#A78BFA",
  Scheduling: "#FB923C",
};

const PRIORITY_COLOR: Record<Priority, string> = {
  Critical: "#F87171",
  High: "#FB923C",
  Medium: "#FCD34D",
  Low: "#78787F",
};

const EFFORT_COLOR: Record<Recommendation["effort"], string> = {
  "Quick Win": "#34D399",
  Moderate: "#60A5FA",
  Strategic: "#A78BFA",
};

const PRIORITY_FILTERS = ["All", "Critical", "High", "Medium", "Low"] as const;

export default function RecommendationsBoard({ recommendations: initial }: { recommendations: Recommendation[] }) {
  const [applied, setApplied] = useState<Set<string>>(new Set());
  const [priorityFilter, setPriorityFilter] = useState<(typeof PRIORITY_FILTERS)[number]>("All");
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const recommendations = useMemo(
    () => initial.map((r) => ({ ...r, applied: applied.has(r.id) || r.applied })),
    [initial, applied]
  );

  const totalAnnualSavings = recommendations.reduce((s, r) => s + r.annualSavingsUsd, 0);
  const appliedCount = recommendations.filter((r) => r.applied).length;

  const filtered = recommendations.filter((r) => priorityFilter === "All" || r.priority === priorityFilter);

  const toggleApplied = (id: string) =>
    setApplied((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const toggleExpanded = (id: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between flex-wrap gap-4">
        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <Sparkles size={12} style={{ color: "#A78BFA" }} />
            <span style={{ fontSize: 11.5, fontWeight: 540, color: "#A78BFA", letterSpacing: "0.05em", textTransform: "uppercase" }}>
              AI Optimization Engine
            </span>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 660, color: "var(--text-primary)", letterSpacing: "-0.03em", lineHeight: 1.15 }}>
            Smart Recommendations
          </h1>
          <p style={{ fontSize: 13.5, color: "var(--text-tertiary)", marginTop: 4 }}>
            {recommendations.length} optimizations identified · {appliedCount} applied so far
          </p>
        </div>
        <div className="text-right">
          <p style={{ fontSize: 11, fontWeight: 520, color: "var(--text-tertiary)", letterSpacing: "0.05em", textTransform: "uppercase" }}>
            Total Potential Savings
          </p>
          <p style={{ fontSize: 28, fontWeight: 720, color: "#34D399", letterSpacing: "-0.02em" }}>
            {formatUsdCompact(totalAnnualSavings)}
          </p>
          <p style={{ fontSize: 11.5, color: "var(--text-muted)" }}>per year</p>
        </div>
      </div>

      <div className="flex items-center gap-4 flex-wrap">
        <div className="flex items-center gap-1">
          {PRIORITY_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setPriorityFilter(f)}
              className="px-2.5 py-1 rounded-[7px]"
              style={{
                fontSize: 12,
                fontWeight: priorityFilter === f ? 560 : 460,
                color: priorityFilter === f ? "var(--text-primary)" : "var(--text-tertiary)",
                background: priorityFilter === f ? "var(--bg-elevated)" : "transparent",
              }}
            >
              {f}
            </button>
          ))}
        </div>
        <span className="ml-auto" style={{ fontSize: 12, color: "var(--text-muted)" }}>
          {filtered.length} showing
        </span>
      </div>

      <div className="flex flex-col gap-3">
        {filtered.map((rec) => {
          const CategoryIcon = CATEGORY_ICON[rec.category];
          const catColor = CATEGORY_COLOR[rec.category];
          const isExpanded = expanded.has(rec.id);
          return (
            <div
              key={rec.id}
              className="p-4 flex flex-col gap-3"
              style={{
                borderRadius: 14,
                background: rec.applied ? "rgba(52,211,153,0.05)" : "var(--bg-card)",
                border: rec.applied ? "1px solid rgba(52,211,153,0.25)" : "1px solid var(--border-subtle)",
                boxShadow: "var(--shadow-card)",
              }}
            >
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3">
                  <div
                    className="flex items-center justify-center shrink-0"
                    style={{ width: 32, height: 32, borderRadius: 9, background: `${catColor}1A` }}
                  >
                    <CategoryIcon size={16} style={{ color: catColor }} strokeWidth={1.75} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 style={{ fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{rec.title}</h3>
                      <span
                        className="px-[7px] py-[1px] rounded-full"
                        style={{ fontSize: 10, fontWeight: 540, color: PRIORITY_COLOR[rec.priority], background: `${PRIORITY_COLOR[rec.priority]}18` }}
                      >
                        {rec.priority}
                      </span>
                      <span style={{ fontSize: 11, color: EFFORT_COLOR[rec.effort] }}>· {rec.effort}</span>
                    </div>
                    <p style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>{rec.buildingName}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p style={{ fontSize: 16, fontWeight: 680, color: "#34D399" }}>{formatUsd(rec.monthlySavingsUsd)}/mo</p>
                  <p style={{ fontSize: 11, color: "var(--text-muted)" }}>{formatUsd(rec.annualSavingsUsd)}/yr</p>
                </div>
              </div>

              {isExpanded && (
                <p style={{ fontSize: 12.5, color: "var(--text-tertiary)", lineHeight: 1.55, letterSpacing: "-0.006em" }}>
                  {rec.description}
                </p>
              )}

              <div className="flex items-center gap-2">
                {rec.applied ? (
                  <span className="flex items-center gap-1" style={{ fontSize: 12, color: "#34D399", fontWeight: 540 }}>
                    <CircleCheck size={14} /> Applied
                  </span>
                ) : (
                  <>
                    <button
                      onClick={() => toggleApplied(rec.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-[8px]"
                      style={{ fontSize: 12, fontWeight: 540, color: "var(--bg-page)", background: "var(--text-primary)" }}
                    >
                      <Zap size={12} /> Apply Now
                    </button>
                    <button
                      onClick={() => toggleExpanded(rec.id)}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-[8px]"
                      style={{ fontSize: 12, fontWeight: 480, color: "var(--text-secondary)" }}
                    >
                      {isExpanded ? "Show less" : "Learn more"} <ChevronRight size={12} />
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
