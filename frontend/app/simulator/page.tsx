import { api } from "@/lib/api";
import SimulatorBoard, { type BuildingPreset } from "@/components/SimulatorBoard";

export default async function SimulatorPage() {
  const [buildings, savings] = await Promise.all([api.getBuildings(), api.getSavings()]);

  const perBuilding: BuildingPreset[] = buildings.map((b) => {
    const saving = savings.find((s) => s.buildingId === b.id);
    const dailyKwh = b.usageKwh.reduce((s, p) => s + p.kwh, 0);
    return {
      name: b.name,
      monthlyCost: Math.round((saving?.baselineCost ?? dailyKwh * b.costPerKwh) * 30),
      monthlyKwh: Math.round(dailyKwh * 30),
    };
  });

  const allBuildings: BuildingPreset = perBuilding.reduce(
    (acc, p) => ({ name: "All Buildings", monthlyCost: acc.monthlyCost + p.monthlyCost, monthlyKwh: acc.monthlyKwh + p.monthlyKwh }),
    { name: "All Buildings", monthlyCost: 0, monthlyKwh: 0 }
  );

  return <SimulatorBoard presets={[allBuildings, ...perBuilding]} />;
}
