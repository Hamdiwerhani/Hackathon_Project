"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Building, Layers, Zap, CircleCheck, Plus } from "lucide-react";
import { api } from "@/lib/api";

const STEPS = [
  { title: "Identity", subtitle: "Basic building info" },
  { title: "Physical", subtitle: "Size & floors" },
  { title: "Energy", subtitle: "Targets & utility" },
];

const BUILDING_TYPES = [
  "Office Tower",
  "Data Center",
  "Campus / Multi-building",
  "Retail / Commercial",
  "Industrial",
  "Residential",
  "Healthcare",
  "Education",
];
const HVAC_TYPES = [
  "Centralized Chiller",
  "Variable Refrigerant Flow (VRF)",
  "Split Units",
  "HVAC + Heat Pump",
  "Rooftop Units (RTU)",
  "District Cooling",
];
const LIGHTING_TYPES = ["LED (full)", "LED (partial)", "Fluorescent", "HID / Metal Halide", "Mixed"];
const CLIMATE_ZONES = [
  "Zone 1 – Very Hot/Dry",
  "Zone 2 – Hot/Dry",
  "Zone 3 – Warm/Dry",
  "Zone 4 – Mixed",
  "Zone 5 – Cool",
  "Zone 6 – Cold",
  "Zone 7 – Very Cold",
];
const UTILITY_PROVIDERS = ["Metro Power Co", "Green Grid Utilities", "City Power", "National Grid", "Other"];

const DEFAULT_FORM = {
  name: "",
  type: "",
  address: "",
  city: "",
  country: "",
  floors: "",
  area: "",
  yearBuilt: "",
  occupancy: "",
  hvac: "",
  lighting: "",
  climateZone: "",
  utilityProvider: "",
  utilityAccountNo: "",
  annualTarget: "",
  baselineConsumption: "",
};

function Field({ label, required, children }: { label: string; required?: boolean; children: React.ReactNode }) {
  return (
    <label className="flex flex-col gap-1.5">
      <span style={{ fontSize: 12, fontWeight: 540, color: "var(--text-secondary)" }}>
        {label}
        {required && <span style={{ color: "#F87171" }}> *</span>}
      </span>
      {children}
    </label>
  );
}

const inputStyle: React.CSSProperties = {
  fontSize: 13,
  padding: "8px 10px",
  borderRadius: 8,
  background: "var(--bg-inset)",
  border: "1px solid var(--border)",
  color: "var(--text-primary)",
  outline: "none",
};

function TextInput(props: React.InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} style={inputStyle} className="w-full" />;
}

function Select({ options, ...props }: React.SelectHTMLAttributes<HTMLSelectElement> & { options: string[] }) {
  return (
    <select {...props} style={inputStyle} className="w-full">
      <option value="">Select...</option>
      {options.map((o) => (
        <option key={o} value={o}>
          {o}
        </option>
      ))}
    </select>
  );
}

export default function AddBuildingWizard() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(DEFAULT_FORM);
  const [submitted, setSubmitted] = useState(false);
  const [addedThisSession, setAddedThisSession] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: keyof typeof DEFAULT_FORM) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }));

  const stepValid = [
    !!(form.name && form.type && form.address),
    !!(form.floors && form.area),
    !!form.utilityProvider,
  ];

  const handleSubmit = async () => {
    setSubmitting(true);
    setError(null);
    try {
      await api.addBuilding({
        name: form.name,
        type: form.type,
        address: form.address,
        city: form.city || undefined,
        country: form.country || undefined,
        floors: Number(form.floors),
        area: Number(form.area),
        yearBuilt: form.yearBuilt ? Number(form.yearBuilt) : undefined,
        occupancy: form.occupancy ? Number(form.occupancy) : undefined,
        hvac: form.hvac || undefined,
        lighting: form.lighting || undefined,
        climateZone: form.climateZone || undefined,
        utilityProvider: form.utilityProvider,
        utilityAccountNo: form.utilityAccountNo || undefined,
        annualTarget: form.annualTarget ? Number(form.annualTarget) : undefined,
        baselineConsumption: form.baselineConsumption ? Number(form.baselineConsumption) : undefined,
      });
      setAddedThisSession((prev) => [...prev, form.name]);
      setSubmitted(true);
    } catch {
      setError("Could not reach the backend. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <div className="flex items-center justify-center" style={{ width: 56, height: 56, borderRadius: "50%", background: "rgba(52,211,153,0.12)" }}>
          <CircleCheck size={28} style={{ color: "#34D399" }} />
        </div>
        <h2 style={{ fontSize: 18, fontWeight: 640, color: "var(--text-primary)" }}>Building Added!</h2>
        <p style={{ fontSize: 13, color: "var(--text-tertiary)", maxWidth: 420 }}>
          {form.name} has been registered in EnergyIQ. Monitoring will begin as soon as meters are connected.
        </p>
        {addedThisSession.length > 0 && (
          <p style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
            {addedThisSession.length} building{addedThisSession.length > 1 ? "s" : ""} added this session
          </p>
        )}
        <div className="flex items-center gap-2 mt-2">
          <button
            onClick={() => {
              setForm(DEFAULT_FORM);
              setStep(0);
              setSubmitted(false);
            }}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-[8px]"
            style={{ fontSize: 12.5, fontWeight: 540, color: "var(--bg-page)", background: "var(--text-primary)" }}
          >
            <Plus size={13} /> Add Another
          </button>
          <button
            onClick={() => router.push("/buildings")}
            className="px-3.5 py-2 rounded-[8px]"
            style={{ fontSize: 12.5, fontWeight: 480, color: "var(--text-secondary)", background: "var(--bg-card)", border: "1px solid var(--border)" }}
          >
            View Buildings
          </button>
        </div>
      </div>
    );
  }

  const stepIcons = [Building, Layers, Zap];
  const stepColors = ["rgba(96,165,250,0.12)", "rgba(252,211,77,0.12)", "rgba(167,139,250,0.12)"];

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h1 style={{ fontSize: 22, fontWeight: 660, color: "var(--text-primary)", letterSpacing: "-0.03em" }}>Add New Building</h1>
        <p style={{ fontSize: 13.5, color: "var(--text-tertiary)", marginTop: 4 }}>
          Register a new facility to start monitoring energy consumption
        </p>
      </div>

      <div className="flex items-center">
        {STEPS.map((s, i) => (
          <div key={s.title} className="flex items-center flex-1 last:flex-none">
            <div className="flex items-center gap-2">
              <div
                className="flex items-center justify-center shrink-0"
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: "50%",
                  background: i < step ? "#34D399" : i === step ? "var(--bg-elevated)" : "var(--bg-inset)",
                  color: i < step ? "#0b0b0c" : i === step ? "var(--text-primary)" : "var(--text-muted)",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                {i < step ? <CircleCheck size={14} /> : i + 1}
              </div>
              <div className="hidden sm:block">
                <p style={{ fontSize: 12.5, fontWeight: 560, color: i === step ? "var(--text-primary)" : "var(--text-muted)" }}>{s.title}</p>
                <p style={{ fontSize: 10.5, color: "var(--text-muted)" }}>{s.subtitle}</p>
              </div>
            </div>
            {i < STEPS.length - 1 && (
              <div className="flex-1 mx-3" style={{ height: 2, background: i < step ? "#34D399" : "var(--border)" }} />
            )}
          </div>
        ))}
      </div>

      <div className="p-5 flex flex-col gap-4" style={{ borderRadius: 16, background: "var(--bg-card)", border: "1px solid var(--border-subtle)", boxShadow: "var(--shadow-card)" }}>
        <div className="flex items-center gap-2.5">
          <div className="flex items-center justify-center" style={{ width: 32, height: 32, borderRadius: 9, background: stepColors[step] }}>
            {(() => {
              const Icon = stepIcons[step];
              return <Icon size={16} style={{ color: "var(--text-primary)" }} strokeWidth={1.75} />;
            })()}
          </div>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: "var(--text-primary)" }}>
            {step === 0 ? "Building Identity" : step === 1 ? "Physical Characteristics" : "Energy Settings"}
          </h2>
        </div>

        {step === 0 && (
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Building Name" required>
              <TextInput value={form.name} onChange={set("name")} placeholder="e.g. HQ Tower North" />
            </Field>
            <Field label="Building Type" required>
              <Select options={BUILDING_TYPES} value={form.type} onChange={set("type")} />
            </Field>
            <Field label="Street Address" required>
              <TextInput value={form.address} onChange={set("address")} placeholder="123 Energy Avenue" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="City">
                <TextInput value={form.city} onChange={set("city")} placeholder="New York" />
              </Field>
              <Field label="Country">
                <TextInput value={form.country} onChange={set("country")} placeholder="United States" />
              </Field>
            </div>
          </div>
        )}

        {step === 1 && (
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="Total Floors" required>
              <TextInput type="number" value={form.floors} onChange={set("floors")} placeholder="12" />
            </Field>
            <Field label="Floor Area (m²)" required>
              <TextInput type="number" value={form.area} onChange={set("area")} placeholder="18,000" />
            </Field>
            <Field label="Year Built">
              <TextInput type="number" value={form.yearBuilt} onChange={set("yearBuilt")} placeholder="2012" />
            </Field>
            <Field label="Peak Occupancy (persons)">
              <TextInput type="number" value={form.occupancy} onChange={set("occupancy")} placeholder="850" />
            </Field>
            <Field label="HVAC System Type">
              <Select options={HVAC_TYPES} value={form.hvac} onChange={set("hvac")} />
            </Field>
            <Field label="Lighting Type">
              <Select options={LIGHTING_TYPES} value={form.lighting} onChange={set("lighting")} />
            </Field>
            <Field label="Climate Zone">
              <Select options={CLIMATE_ZONES} value={form.climateZone} onChange={set("climateZone")} />
            </Field>
          </div>
        )}

        {step === 2 && (
          <div className="flex flex-col gap-3">
            <div className="grid sm:grid-cols-2 gap-3">
              <Field label="Utility Provider" required>
                <Select options={UTILITY_PROVIDERS} value={form.utilityProvider} onChange={set("utilityProvider")} />
              </Field>
              <Field label="Utility Account No.">
                <TextInput value={form.utilityAccountNo} onChange={set("utilityAccountNo")} placeholder="ACC-00000000" />
              </Field>
              <Field label="Annual Energy Target (kWh)">
                <TextInput type="number" value={form.annualTarget} onChange={set("annualTarget")} placeholder="1,200,000" />
              </Field>
              <Field label="Baseline Consumption (kWh/yr)">
                <TextInput type="number" value={form.baselineConsumption} onChange={set("baselineConsumption")} placeholder="1,420,000" />
              </Field>
            </div>

            {(form.name || form.type) && (
              <div className="p-3 flex flex-col gap-1" style={{ borderRadius: 10, background: "var(--bg-inset)", border: "1px solid var(--border-subtle)" }}>
                <p style={{ fontSize: 11, color: "var(--text-muted)", marginBottom: 2 }}>Preview</p>
                {form.name && <p style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>Name: {form.name}</p>}
                {form.type && <p style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>Type: {form.type}</p>}
                {(form.city || form.country) && (
                  <p style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                    Location: {form.city}
                    {form.city && form.country ? ", " : ""}
                    {form.country}
                  </p>
                )}
                {(form.floors || form.area) && (
                  <p style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>
                    Floors: {form.floors} floors · {form.area} m²
                  </p>
                )}
                {form.hvac && <p style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>HVAC: {form.hvac}</p>}
                {form.utilityProvider && <p style={{ fontSize: 12.5, color: "var(--text-secondary)" }}>Utility: {form.utilityProvider}</p>}
              </div>
            )}
          </div>
        )}

        {error && <p style={{ fontSize: 12, color: "#F87171" }}>{error}</p>}

        <div className="flex items-center justify-between pt-2" style={{ borderTop: "1px solid var(--border-subtle)" }}>
          <button
            disabled={step === 0}
            onClick={() => setStep((s) => s - 1)}
            className="px-3.5 py-2 rounded-[8px]"
            style={{
              fontSize: 12.5,
              color: step === 0 ? "var(--text-muted)" : "var(--text-secondary)",
              background: "transparent",
              opacity: step === 0 ? 0.5 : 1,
              cursor: step === 0 ? "default" : "pointer",
            }}
          >
            Back
          </button>
          {step < STEPS.length - 1 ? (
            <button
              disabled={!stepValid[step]}
              onClick={() => setStep((s) => s + 1)}
              className="px-3.5 py-2 rounded-[8px]"
              style={{
                fontSize: 12.5,
                fontWeight: 540,
                color: "var(--bg-page)",
                background: "var(--text-primary)",
                opacity: stepValid[step] ? 1 : 0.4,
                cursor: stepValid[step] ? "pointer" : "default",
              }}
            >
              Continue
            </button>
          ) : (
            <button
              disabled={!stepValid[2] || submitting}
              onClick={handleSubmit}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-[8px]"
              style={{
                fontSize: 12.5,
                fontWeight: 540,
                color: "#0b0b0c",
                background: "#34D399",
                opacity: stepValid[2] && !submitting ? 1 : 0.4,
                cursor: stepValid[2] && !submitting ? "pointer" : "default",
              }}
            >
              <CircleCheck size={13} /> {submitting ? "Adding..." : "Add Building"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
