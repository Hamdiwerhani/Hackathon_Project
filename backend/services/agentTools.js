const { loadBuildings } = require('./dataStore');
const { detectAlertsForBuildings } = require('./alertEngine');
const { computeSavings, computeSummary } = require('./savingsEngine');
const { generateInvoices } = require('./invoiceEngine');
const { getPortfolioRecommendations } = require('./aiClient');
const { computeSimulation } = require('./simulatorEngine');

function findBuilding(buildings, name) {
  if (!name || /all/i.test(name)) return null;
  const lower = name.toLowerCase();
  return buildings.find((b) => b.name.toLowerCase().includes(lower)) || null;
}

function buildingPreset(buildings, name) {
  const building = findBuilding(buildings, name);
  if (building) {
    const saving = computeSavings(building);
    const dailyKwh = building.usageKwh.reduce((s, p) => s + p.kwh, 0);
    return { name: building.name, monthlyCost: Math.round(saving.baselineCost * 30), monthlyKwh: Math.round(dailyKwh * 30) };
  }
  // "All Buildings" aggregate
  const totals = buildings.reduce(
    (acc, b) => {
      const saving = computeSavings(b);
      const dailyKwh = b.usageKwh.reduce((s, p) => s + p.kwh, 0);
      acc.monthlyCost += saving.baselineCost * 30;
      acc.monthlyKwh += dailyKwh * 30;
      return acc;
    },
    { monthlyCost: 0, monthlyKwh: 0 }
  );
  return { name: 'All Buildings', monthlyCost: Math.round(totals.monthlyCost), monthlyKwh: Math.round(totals.monthlyKwh) };
}

const TOOL_DEFINITIONS = [
  {
    type: 'function',
    function: {
      name: 'get_alerts',
      description: 'Get the current live list of energy alerts (leaks, usage spikes, HVAC setpoint issues) across all campus buildings.',
      parameters: { type: 'object', properties: {}, additionalProperties: false },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_savings_summary',
      description: 'Get the portfolio-wide annual cost/savings projection: baseline vs optimized cost, ROI, and monthly breakdown.',
      parameters: { type: 'object', properties: {}, additionalProperties: false },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_recommendations',
      description: 'Get the current AI-generated energy-saving recommendations for the campus, with priority, effort, and estimated $ savings.',
      parameters: { type: 'object', properties: {}, additionalProperties: false },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_invoices',
      description: 'Get electricity invoices, optionally filtered by status or building name.',
      parameters: {
        type: 'object',
        properties: {
          status: { type: 'string', enum: ['Paid', 'Pending', 'Overdue'], description: 'Filter by invoice status' },
          building: { type: 'string', description: 'Filter by building name (partial match)' },
        },
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'get_building_zones',
      description: 'Get HVAC zone-level detail (temperature, humidity, fan %, status) for one campus building.',
      parameters: {
        type: 'object',
        properties: {
          buildingName: { type: 'string', description: 'Building name, e.g. "Science Hall"' },
        },
        required: ['buildingName'],
        additionalProperties: false,
      },
    },
  },
  {
    type: 'function',
    function: {
      name: 'simulate_savings',
      description:
        'Run the savings simulator for a building (or "All Buildings") with given optimization lever values, and return projected monthly/annual savings, kWh reduction, CO2 reduction, investment cost, and payback period. Use this whenever the user asks "what if" questions about HVAC efficiency, LED lighting, solar capacity, occupancy scheduling, or peak demand reduction.',
      parameters: {
        type: 'object',
        properties: {
          buildingName: { type: 'string', description: 'Building name or "All Buildings"' },
          hvac: { type: 'number', description: 'HVAC efficiency improvement, 0-50 (%)' },
          lighting: { type: 'number', description: 'LED lighting upgrade, 0-40 (%)' },
          solar: { type: 'number', description: 'Solar capacity installed, 0-500 (kW)' },
          occupancy: { type: 'number', description: 'Occupancy-based scheduling, 0-30 (%)' },
          peakDemand: { type: 'number', description: 'Peak demand reduction, 0-25 (%)' },
        },
        required: ['buildingName'],
        additionalProperties: false,
      },
    },
  },
];

async function executeTool(name, args) {
  const buildings = loadBuildings();

  switch (name) {
    case 'get_alerts':
      return detectAlertsForBuildings(buildings);

    case 'get_savings_summary':
      return computeSummary(buildings);

    case 'get_recommendations': {
      const alerts = detectAlertsForBuildings(buildings);
      const { suggestions } = await getPortfolioRecommendations(buildings, alerts);
      return suggestions;
    }

    case 'get_invoices': {
      let invoices = generateInvoices(buildings);
      if (args.status) invoices = invoices.filter((i) => i.status === args.status);
      if (args.building) invoices = invoices.filter((i) => i.building.toLowerCase().includes(args.building.toLowerCase()));
      return invoices;
    }

    case 'get_building_zones': {
      const building = findBuilding(buildings, args.buildingName);
      if (!building) return { error: `No building found matching "${args.buildingName}"` };
      return { building: building.name, zones: building.zones };
    }

    case 'simulate_savings': {
      const preset = buildingPreset(buildings, args.buildingName);
      const result = computeSimulation(preset.monthlyCost, preset.monthlyKwh, {
        hvac: args.hvac || 0,
        lighting: args.lighting || 0,
        solar: args.solar || 0,
        occupancy: args.occupancy || 0,
        peakDemand: args.peakDemand || 0,
      });
      return { building: preset.name, currentMonthlyCostUsd: preset.monthlyCost, ...result };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

module.exports = { TOOL_DEFINITIONS, executeTool };
