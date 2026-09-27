// Mirrors frontend/lib/simulator.ts so the AI agent's simulate_savings tool
// produces numbers consistent with what the user sees on the Simulator page.

const LEVERS = {
  hvac: { weight: 0.38, investPer: 280, max: 50 },
  lighting: { weight: 0.2, investPer: 180, max: 40 },
  solar: { weight: 0, investPer: 1200, max: 500 }, // flat $/kW, not weight-based
  occupancy: { weight: 0.14, investPer: 60, max: 30 },
  peakDemand: { weight: 0.15, investPer: 140, max: 25 },
};

function computeSimulation(monthlyCost, monthlyKwh, levers) {
  const hvac = Math.min(levers.hvac ?? 0, LEVERS.hvac.max);
  const lighting = Math.min(levers.lighting ?? 0, LEVERS.lighting.max);
  const solar = Math.min(levers.solar ?? 0, LEVERS.solar.max);
  const occupancy = Math.min(levers.occupancy ?? 0, LEVERS.occupancy.max);
  const peakDemand = Math.min(levers.peakDemand ?? 0, LEVERS.peakDemand.max);

  const hvacSavings = monthlyCost * 0.38 * (hvac / 100);
  const lightingSavings = monthlyCost * 0.2 * (lighting / 100);
  const solarSavings = solar * 112;
  const occupancySavings = monthlyCost * 0.14 * (occupancy / 100);
  const peakSavings = monthlyCost * 0.15 * (peakDemand / 100);

  const totalSavings = Math.min(
    hvacSavings + lightingSavings + solarSavings + occupancySavings + peakSavings,
    monthlyCost * 0.78
  );
  const simCost = monthlyCost - totalSavings;
  const kwhReduction = monthlyCost > 0 ? Math.round((totalSavings / monthlyCost) * monthlyKwh) : 0;
  const co2TonsPerYear = +(kwhReduction * 0.00049 * 12).toFixed(1);

  const totalInvestment =
    hvac * LEVERS.hvac.investPer +
    lighting * LEVERS.lighting.investPer +
    solar * LEVERS.solar.investPer +
    occupancy * LEVERS.occupancy.investPer +
    peakDemand * LEVERS.peakDemand.investPer;
  const paybackMonths = totalSavings > 0 ? Math.round(totalInvestment / totalSavings) : null;

  return {
    monthlySavingsUsd: Math.round(totalSavings),
    annualSavingsUsd: Math.round(totalSavings * 12),
    newMonthlyCostUsd: Math.round(simCost),
    kwhReductionPerMonth: kwhReduction,
    co2TonsPerYear,
    totalInvestmentUsd: Math.round(totalInvestment),
    paybackMonths,
  };
}

module.exports = { computeSimulation, LEVERS };
