const GENERAL_OPTIMIZATION_FACTOR = 0.08; // modest HVAC/scheduling tuning
const OFF_HOURS = new Set([23, 0, 1, 2, 3, 4, 5]);
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
// Typical small-campus HVAC + LED retrofit bundle, used only to express ROI/break-even.
const ASSUMED_IMPLEMENTATION_COST_USD = 15000;

function isOffHours(timestamp) {
  return OFF_HOURS.has(new Date(timestamp).getUTCHours());
}

function computeSavings(building) {
  let baselineKwh = 0;
  let optimizedKwh = 0;

  for (const point of building.usageKwh) {
    baselineKwh += point.kwh;

    const isLeak = isOffHours(point.timestamp) && point.kwh > building.expectedIdleKwh * 1.5;
    const optimizedPoint = isLeak
      ? building.expectedIdleKwh
      : point.kwh * (1 - GENERAL_OPTIMIZATION_FACTOR);

    optimizedKwh += optimizedPoint;
  }

  const baselineCost = +(baselineKwh * building.costPerKwh).toFixed(2);
  const optimizedCost = +(optimizedKwh * building.costPerKwh).toFixed(2);
  const savingsPct = +(((baselineCost - optimizedCost) / baselineCost) * 100).toFixed(1);

  return {
    buildingId: building.id,
    buildingName: building.name,
    baselineCost,
    optimizedCost,
    savingsUsd: +(baselineCost - optimizedCost).toFixed(2),
    savingsPct,
  };
}

function computeSummary(buildings) {
  const perBuilding = buildings.map(computeSavings);

  const dailyBaselineCost = perBuilding.reduce((s, b) => s + b.baselineCost, 0);
  const dailyOptimizedCost = perBuilding.reduce((s, b) => s + b.optimizedCost, 0);

  let cumulative = 0;
  let breakEvenMonth = null;

  const monthly = MONTH_NAMES.map((month, i) => {
    const seasonalFactor = 1 + 0.15 * Math.cos(((i - 6) / 12) * 2 * Math.PI);
    const days = DAYS_IN_MONTH[i];
    const baseline = +(dailyBaselineCost * days * seasonalFactor).toFixed(0);
    const optimized = +(dailyOptimizedCost * days * seasonalFactor).toFixed(0);
    cumulative += baseline - optimized;
    if (breakEvenMonth === null && cumulative >= ASSUMED_IMPLEMENTATION_COST_USD) {
      breakEvenMonth = month;
    }
    return { month, baseline, optimized, cumulativeSavings: Math.round(cumulative) };
  });

  const annualBaseline = monthly.reduce((s, m) => s + m.baseline, 0);
  const annualOptimized = monthly.reduce((s, m) => s + m.optimized, 0);
  const annualSavings = annualBaseline - annualOptimized;
  const roiPct = +((annualSavings / ASSUMED_IMPLEMENTATION_COST_USD) * 100).toFixed(0);

  return {
    annualBaseline,
    annualOptimized,
    annualSavings,
    roiPct,
    assumedImplementationCostUsd: ASSUMED_IMPLEMENTATION_COST_USD,
    breakEvenMonth,
    monthly,
  };
}

module.exports = { computeSavings, computeSummary };
