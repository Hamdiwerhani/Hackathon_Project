"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Building,
  Sparkles,
  TrendingUp,
  Bell,
  Users,
  FileChartColumn,
  Settings,
  ChevronDown,
  Receipt,
  Activity,
  CirclePlus,
  LucideIcon,
} from "lucide-react";
import { api } from "@/lib/api";

const NAV_ITEMS: { icon: LucideIcon; label: string; href: string }[] = [
  { icon: LayoutDashboard, label: "Overview", href: "/" },
  { icon: Building, label: "Buildings", href: "/buildings" },
  { icon: Sparkles, label: "AI Insights", href: "/ai-insights" },
  { icon: TrendingUp, label: "Cost & Savings", href: "/cost-savings" },
  { icon: Bell, label: "Alerts", href: "/alerts" },
];

const MANAGE_ITEMS: { icon: LucideIcon; label: string; href: string }[] = [
  { icon: Receipt, label: "Invoices", href: "/invoices" },
  { icon: Activity, label: "Simulator", href: "/simulator" },
  { icon: CirclePlus, label: "Add Building", href: "/add-building" },
];

function NavRow({
  icon: Icon,
  label,
  active,
  badge,
  href,
}: {
  icon: LucideIcon;
  label: string;
  active?: boolean;
  badge?: number;
  href?: string;
}) {
  const content = (
    <div
      className="flex items-center gap-3 px-3 py-[7px] rounded-[8px] cursor-pointer transition-colors"
      style={{
        background: active ? "var(--bg-elevated)" : "transparent",
        color: active ? "var(--text-primary)" : "var(--text-secondary)",
      }}
    >
      <Icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
      <span
        className="flex-1"
        style={{
          fontSize: "12.5px",
          fontWeight: active ? 560 : 440,
          letterSpacing: "-0.01em",
        }}
      >
        {label}
      </span>
      {badge !== undefined && badge > 0 && (
        <span
          className="px-[6px] py-[1px] rounded-full"
          style={{
            fontSize: "10px",
            fontWeight: 520,
            color: "var(--text-tertiary)",
            background: "var(--bg-badge)",
          }}
        >
          {badge}
        </span>
      )}
    </div>
  );

  if (!href) return content;
  return <Link href={href}>{content}</Link>;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [criticalAlerts, setCriticalAlerts] = useState(0);
  const [urgentRecs, setUrgentRecs] = useState(0);

  useEffect(() => {
    api.getAlerts().then((alerts) => {
      setCriticalAlerts(alerts.filter((a) => a.severity === "critical").length);
    });
    api.getRecommendations().then((recs) => {
      setUrgentRecs(
        recs.filter((r) => r.priority === "Critical" || r.priority === "High")
          .length,
      );
    });
  }, []);

  const badges: Record<string, number> = {
    "/ai-insights": urgentRecs,
    "/alerts": criticalAlerts,
  };

  return (
    <aside
      className="w-[240px] h-screen flex flex-col fixed left-0 top-0 z-20"
      style={{
        background: "var(--bg-sidebar)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderRight: "1px solid var(--border-subtle)",
        transition: "background 0.4s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      <div
        className="flex items-center gap-2.5 px-5 h-[60px]"
        style={{ borderBottom: "1px solid var(--border-subtle)" }}
      >
        <div
          className="w-[22px] h-[22px] rounded-[6px] flex items-center justify-center"
          style={{
            background: "var(--text-primary)",
            boxShadow: "0 1px 3px rgba(0,0,0,0.18)",
          }}
        >
          <span
            style={{
              fontSize: "11px",
              fontWeight: 750,
              color: "var(--bg-page)",
              letterSpacing: "-0.04em",
            }}
          >
            E
          </span>
        </div>
        <span
          style={{
            fontSize: "14.5px",
            fontWeight: 680,
            color: "var(--text-primary)",
            letterSpacing: "-0.025em",
          }}
        >
          EnergyIQ
        </span>
      </div>

      <div className="px-3 pt-4 pb-1">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] cursor-pointer hover:bg-[var(--bg-card-hover)] transition-colors">
          <div className="flex-1 min-w-0">
            <div
              className="truncate"
              style={{
                fontSize: "12.5px",
                fontWeight: 560,
                color: "var(--text-primary)",
                letterSpacing: "-0.012em",
              }}
            >
              Campus Ops
            </div>
            <div
              className="truncate"
              style={{ fontSize: "10.5px", color: "var(--text-muted)" }}
            >
              Hackathon Demo
            </div>
          </div>
          <ChevronDown
            className="w-3 h-3"
            style={{ color: "var(--text-muted)", opacity: 0.6 }}
          />
        </div>
      </div>

      <nav className="px-3 flex-1 overflow-y-auto pt-1">
        <div className="space-y-[1px]">
          {NAV_ITEMS.map((item) => (
            <NavRow
              key={item.href}
              {...item}
              active={pathname === item.href}
              badge={badges[item.href]}
            />
          ))}
        </div>
        <div className="mt-8">
          <div
            className="px-3 mb-[5px]"
            style={{
              fontSize: "10.5px",
              fontWeight: 600,
              color: "var(--text-muted)",
              letterSpacing: "0.07em",
              textTransform: "uppercase",
            }}
          >
            Manage
          </div>
          <div className="space-y-[1px]">
            {MANAGE_ITEMS.map((item) => (
              <NavRow
                key={item.href}
                {...item}
                active={pathname === item.href}
              />
            ))}
          </div>
        </div>
      </nav>

      <div
        className="px-3 py-3"
        style={{ borderTop: "1px solid var(--border-subtle)" }}
      >
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-[10px] cursor-pointer hover:bg-[var(--bg-card-hover)] transition-colors">
          <div
            className="rounded-full flex items-center justify-center shrink-0"
            style={{
              width: 28,
              height: 28,
              background: "var(--bg-elevated)",
              border: "1.5px solid var(--border)",
            }}
          >
            <span
              style={{
                fontSize: "11px",
                fontWeight: 600,
                color: "var(--text-secondary)",
              }}
            >
              FA
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <div
              className="truncate"
              style={{
                fontSize: "12.5px",
                fontWeight: 540,
                color: "var(--text-primary)",
                letterSpacing: "-0.012em",
              }}
            >
              Facilities Admin
            </div>
            <div
              className="truncate"
              style={{ fontSize: "10.5px", color: "var(--text-muted)" }}
            >
              admin@energyiq.app
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
