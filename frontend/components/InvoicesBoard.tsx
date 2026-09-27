"use client";

import { useMemo, useRef, useState } from "react";
import {
  CircleCheck,
  Clock,
  DollarSign,
  Zap,
  Upload,
  FileText,
  Search,
  Building,
  Calendar,
  Eye,
  Download,
  CircleAlert,
} from "lucide-react";
import type { Invoice, InvoiceStatus } from "@/types";
import KpiCard from "@/components/KpiCard";
import { formatUsd, formatUsdCompact, formatKwhCompact, formatDateShort, formatMonthYear } from "@/lib/formatters";

const STATUS_STYLE: Record<InvoiceStatus, { color: string; bg: string; icon: typeof CircleCheck }> = {
  Paid: { color: "#34D399", bg: "rgba(52,211,153,0.1)", icon: CircleCheck },
  Pending: { color: "#FCD34D", bg: "rgba(252,211,77,0.1)", icon: Clock },
  Overdue: { color: "#F87171", bg: "rgba(248,113,113,0.1)", icon: CircleAlert },
};

const STATUS_FILTERS = ["All", "Paid", "Pending", "Overdue"] as const;

export default function InvoicesBoard({ invoices: baseInvoices }: { invoices: Invoice[] }) {
  const [manualInvoices, setManualInvoices] = useState<Invoice[]>([]);
  const invoices = useMemo(() => [...manualInvoices, ...baseInvoices], [manualInvoices, baseInvoices]);

  const buildingNames = useMemo(() => ["All", ...Array.from(new Set(baseInvoices.map((i) => i.building)))], [baseInvoices]);

  const [buildingFilter, setBuildingFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState<(typeof STATUS_FILTERS)[number]>("All");
  const [search, setSearch] = useState("");
  const [uploaded, setUploaded] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const paidSum = invoices.filter((i) => i.status === "Paid").reduce((s, i) => s + i.amount, 0);
  const unpaidSum = invoices.filter((i) => i.status !== "Paid").reduce((s, i) => s + i.amount, 0);
  const avgMonthly = invoices.length ? Math.round(invoices.reduce((s, i) => s + i.amount, 0) / invoices.length) : 0;
  const totalKwh = invoices.reduce((s, i) => s + i.kWh, 0);

  const filtered = invoices.filter((inv) => {
    if (buildingFilter !== "All" && inv.building !== buildingFilter) return false;
    if (statusFilter !== "All" && inv.status !== statusFilter) return false;
    if (search && !`${inv.id} ${inv.building} ${inv.period}`.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const addUploaded = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const names = Array.from(files).map((f) => f.name);
    setUploaded((prev) => [...names, ...prev]);

    const now = new Date();
    const building = buildingFilter !== "All" ? buildingFilter : baseInvoices[0]?.building ?? "Unassigned";
    const issueDate = now.toISOString();
    const dueDate = new Date(now.getTime() + 20 * 24 * 60 * 60 * 1000).toISOString();

    const newRows: Invoice[] = Array.from(files).map((f, i) => ({
      id: `UPL-${now.getTime()}-${i}`,
      buildingId: "manual-upload",
      building,
      period: formatMonthYear(issueDate),
      issueDate,
      dueDate,
      kWh: 0,
      amount: 0,
      status: "Pending",
      provider: f.name,
    }));

    setManualInvoices((prev) => [...newRows, ...prev]);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    addUploaded(e.dataTransfer.files);
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 660, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>
          Electricity Invoices
        </h1>
        <p style={{ fontSize: 13.5, color: "var(--text-tertiary)", marginTop: 4 }}>
          {invoices.length} invoices across all buildings · {new Date().getFullYear()}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard label="Total Paid" value={formatUsdCompact(paidSum)} icon={CircleCheck} color="#34D399" valueSize={22} />
        <KpiCard label="Outstanding" value={formatUsdCompact(unpaidSum, 1)} icon={Clock} color="#FCD34D" valueSize={22} />
        <KpiCard label="Avg Monthly" value={formatUsd(avgMonthly)} icon={DollarSign} color="#60A5FA" valueSize={22} />
        <KpiCard label="Total kWh" value={formatKwhCompact(totalKwh)} icon={Zap} color="#A78BFA" valueSize={22} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">
        <div className="flex flex-col gap-4">
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className="p-4 flex flex-col items-center gap-2 text-center cursor-pointer transition-colors"
            style={{
              borderRadius: 14,
              border: `2px dashed ${dragActive ? "#A78BFA" : "var(--border-hover)"}`,
              background: "var(--bg-card)",
            }}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
              onChange={(e) => {
                addUploaded(e.target.files);
                e.target.value = "";
              }}
            />
            <Upload size={20} style={{ color: "var(--text-tertiary)" }} />
            <p style={{ fontSize: 12.5, fontWeight: 560, color: "var(--text-primary)" }}>Upload Invoice</p>
            <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Drag &amp; drop a PDF or image, or click to browse</p>
            <p style={{ fontSize: 10, color: "var(--text-muted)" }}>PDF, PNG, JPG · max 10 MB</p>
          </div>

          {uploaded.length > 0 && (
            <div className="flex flex-col gap-1.5">
              <p style={{ fontSize: 11, color: "var(--text-muted)" }}>Just uploaded</p>
              {uploaded.map((name, i) => (
                <div key={i} className="flex items-center gap-2 px-2.5 py-1.5 rounded-[8px]" style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)" }}>
                  <FileText size={13} style={{ color: "var(--text-tertiary)" }} />
                  <span className="flex-1 truncate" style={{ fontSize: 11.5, color: "var(--text-secondary)" }}>{name}</span>
                  <CircleCheck size={13} style={{ color: "#34D399" }} />
                </div>
              ))}
            </div>
          )}

          <div className="flex flex-col gap-1">
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Building</p>
            {buildingNames.map((name) => (
              <button
                key={name}
                onClick={() => setBuildingFilter(name)}
                className="text-left px-2.5 py-1.5 rounded-[7px]"
                style={{
                  fontSize: 12,
                  fontWeight: buildingFilter === name ? 560 : 460,
                  color: buildingFilter === name ? "var(--text-primary)" : "var(--text-tertiary)",
                  background: buildingFilter === name ? "var(--bg-elevated)" : "transparent",
                }}
              >
                {name}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Status</p>
            {STATUS_FILTERS.map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className="text-left px-2.5 py-1.5 rounded-[7px]"
                style={{
                  fontSize: 12,
                  fontWeight: statusFilter === s ? 560 : 460,
                  color: statusFilter === s ? "var(--text-primary)" : "var(--text-tertiary)",
                  background: statusFilter === s ? "var(--bg-elevated)" : "transparent",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <div
            className="flex items-center gap-2.5 rounded-[9px] px-3 py-[6px]"
            style={{ background: "var(--bg-inset)", border: "1px solid var(--border)" }}
          >
            <Search size={13} style={{ color: "var(--text-muted)" }} />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by invoice ID, building, or period..."
              className="flex-1 bg-transparent outline-none"
              style={{ fontSize: 12.5, color: "var(--text-primary)" }}
            />
            {search && (
              <button onClick={() => setSearch("")} style={{ fontSize: 11, color: "var(--text-muted)" }}>
                Clear
              </button>
            )}
          </div>

          <div
            className="rounded-[14px] overflow-hidden"
            style={{ background: "var(--bg-card)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}
          >
            <div
              className="grid px-4 py-2"
              style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 0.8fr auto", borderBottom: "1px solid var(--border-subtle)" }}
            >
              {["Invoice", "Period", "kWh", "Amount", "Due", "Status", ""].map((h) => (
                <span key={h} style={{ fontSize: 11, fontWeight: 560, color: "var(--text-muted)" }}>
                  {h}
                </span>
              ))}
            </div>

            {filtered.length === 0 && (
              <p className="p-6 text-center" style={{ fontSize: 13, color: "var(--text-muted)" }}>
                No invoices matching filters
              </p>
            )}

            {filtered.map((inv) => {
              const style = STATUS_STYLE[inv.status];
              const StatusIcon = style.icon;
              const isManualUpload = inv.buildingId === "manual-upload";
              return (
                <div
                  key={inv.id}
                  className="grid px-4 py-3 items-center"
                  style={{ gridTemplateColumns: "2fr 1.5fr 1fr 1fr 1fr 0.8fr auto", borderBottom: "1px solid var(--border-subtle)" }}
                >
                  <div>
                    <p style={{ fontSize: 12.5, fontWeight: 560, color: "var(--text-primary)" }}>
                      {isManualUpload ? inv.provider : inv.id}
                    </p>
                    <p className="flex items-center gap-1" style={{ fontSize: 11, color: "var(--text-muted)" }}>
                      <Building size={11} /> {inv.building}
                    </p>
                  </div>
                  <span className="flex items-center gap-1" style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                    <Calendar size={12} /> {inv.period}
                  </span>
                  <span style={{ fontSize: 12, color: "var(--text-tertiary)" }}>
                    {isManualUpload ? "—" : formatKwhCompact(inv.kWh, 1)}
                  </span>
                  <span style={{ fontSize: 12.5, fontWeight: 560, color: "var(--text-primary)" }}>
                    {isManualUpload ? "—" : formatUsd(inv.amount)}
                  </span>
                  <span style={{ fontSize: 12, color: inv.status === "Overdue" ? "#F87171" : "var(--text-tertiary)" }}>
                    {isManualUpload ? "Awaiting review" : formatDateShort(inv.dueDate)}
                  </span>
                  <span
                    className="flex items-center gap-1 px-2 py-[2px] rounded-full w-fit"
                    style={{ fontSize: 10.5, fontWeight: 540, color: style.color, background: style.bg }}
                  >
                    <StatusIcon size={11} /> {inv.status}
                  </span>
                  <div className="flex items-center gap-1">
                    <button className="w-6 h-6 flex items-center justify-center rounded-[6px] hover:bg-[var(--bg-card-hover)]" title="View">
                      <Eye size={13} style={{ color: "var(--text-muted)" }} />
                    </button>
                    <button className="w-6 h-6 flex items-center justify-center rounded-[6px] hover:bg-[var(--bg-card-hover)]" title="Download">
                      <Download size={13} style={{ color: "var(--text-muted)" }} />
                    </button>
                  </div>
                </div>
              );
            })}

            <p className="px-4 py-2.5" style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
              Showing {filtered.length} of {invoices.length} invoices
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
