"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Sun, Moon, Search, Share2, Plus, Bell } from "lucide-react";
import { useTheme } from "@/components/ThemeProvider";
import { api } from "@/lib/api";

const PAGE_TITLES: Record<string, string> = {
  "/": "Overview",
  "/buildings": "Buildings",
  "/ai-insights": "AI Insights",
  "/cost-savings": "Cost & Savings",
  "/alerts": "Alerts",
  "/invoices": "Invoices",
  "/simulator": "Simulator",
  "/add-building": "Add Building",
};

function IconButton({ children, onClick, title }: { children: React.ReactNode; onClick?: () => void; title?: string }) {
  return (
    <button
      onClick={onClick}
      title={title}
      className="w-8 h-8 flex items-center justify-center rounded-[8px] cursor-pointer border-none hover:bg-[var(--bg-card-hover)] transition-colors"
      style={{ color: "var(--text-tertiary)", background: "transparent" }}
    >
      {children}
    </button>
  );
}

export default function Topnav() {
  const pathname = usePathname();
  const { theme, toggle } = useTheme();
  const [hasCritical, setHasCritical] = useState(false);

  useEffect(() => {
    api.getAlerts().then((alerts) => {
      setHasCritical(alerts.some((a) => a.severity === "critical"));
    });
  }, []);

  const pageTitle = PAGE_TITLES[pathname] ?? "Overview";

  return (
    <header
      className="h-[60px] flex items-center justify-between px-6 fixed top-0 left-[240px] right-0 z-10"
      style={{
        background: "var(--bg-topnav)",
        backdropFilter: "blur(24px) saturate(180%)",
        WebkitBackdropFilter: "blur(24px) saturate(180%)",
        borderBottom: "1px solid var(--border-subtle)",
      }}
    >
      <div className="flex items-center gap-2">
        <span style={{ fontSize: "13px", fontWeight: 560, color: "var(--text-primary)", letterSpacing: "-0.012em" }}>
          Campus
        </span>
        <span style={{ fontSize: "13px", color: "var(--text-muted)", fontWeight: 300 }}>/</span>
        <span style={{ fontSize: "13px", fontWeight: 440, color: "var(--text-tertiary)", letterSpacing: "-0.01em" }}>
          {pageTitle}
        </span>
      </div>

      <div
        className="hidden md:flex items-center gap-2.5 rounded-[9px] px-3 py-[6px] w-[240px] cursor-pointer"
        style={{ background: "var(--bg-inset)", border: "1px solid var(--border)" }}
      >
        <Search className="w-[13px] h-[13px]" style={{ color: "var(--text-muted)" }} strokeWidth={1.5} />
        <span style={{ fontSize: "12.5px", color: "var(--text-muted)", fontWeight: 400 }}>Search...</span>
        <div className="ml-auto flex items-center gap-[3px]">
          <kbd className="px-[5px] py-[1px] rounded-[4px]" style={{ fontSize: "10px", color: "var(--text-muted)", background: "var(--bg-card-hover)", fontWeight: 520 }}>
            ⌘
          </kbd>
          <kbd className="px-[5px] py-[1px] rounded-[4px]" style={{ fontSize: "10px", color: "var(--text-muted)", background: "var(--bg-card-hover)", fontWeight: 520 }}>
            K
          </kbd>
        </div>
      </div>

      <div className="flex items-center gap-[2px]">
        <IconButton onClick={toggle} title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}>
          {theme === "dark" ? <Sun className="w-[15px] h-[15px]" strokeWidth={1.5} /> : <Moon className="w-[15px] h-[15px]" strokeWidth={1.5} />}
        </IconButton>
        <IconButton title="Share">
          <Share2 className="w-[15px] h-[15px]" strokeWidth={1.5} />
        </IconButton>
        <IconButton title="New">
          <Plus className="w-[15px] h-[15px]" strokeWidth={1.5} />
        </IconButton>
        <div className="relative">
          <IconButton title="Alerts">
            <Bell className="w-[15px] h-[15px]" strokeWidth={1.5} />
          </IconButton>
          {hasCritical && (
            <span
              className="absolute top-[6px] right-[6px] w-[6px] h-[6px] rounded-full"
              style={{ background: "#EF4444", boxShadow: "0 0 0 2px var(--bg-sidebar-solid)" }}
            />
          )}
        </div>
        <div
          className="ml-2 rounded-full flex items-center justify-center shrink-0"
          style={{ width: 30, height: 30, background: "var(--bg-elevated)", border: "2px solid var(--border)" }}
        >
          <span style={{ fontSize: "11px", fontWeight: 600, color: "var(--text-secondary)" }}>FA</span>
        </div>
      </div>
    </header>
  );
}
