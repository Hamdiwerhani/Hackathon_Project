const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-20b';

const CATEGORIES = ['HVAC', 'Lighting', 'Demand', 'Renewable', 'IT', 'Scheduling'];
const PRIORITIES = ['Critical', 'High', 'Medium', 'Low'];
const EFFORTS = ['Quick Win', 'Moderate', 'Strategic'];

function buildingStats(building) {
  const avgKwh = building.usageKwh.reduce((s, p) => s + p.kwh, 0) / building.usageKwh.length;
  const peakKwh = Math.max(...building.usageKwh.map((p) => p.kwh));
  return { avgKwh, peakKwh };
}

function fallbackRecommendations(buildings, alerts) {
  const byBuilding = Object.fromEntries(buildings.map((b) => [b.id, b]));
  const leakAlert = alerts.find((a) => a.type === 'leak');
  const spikeAlert = alerts.find((a) => a.type === 'spike');
  const setpointAlert = alerts.find((a) => a.type === 'setpoint');

  const recs = [];

  if (leakAlert) {
    const b = byBuilding[leakAlert.buildingId];
    const { avgKwh } = buildingStats(b);
    recs.push({
      title: `Fix Overnight Energy Leak at ${b.name}`,
      category: 'HVAC',
      priority: 'Critical',
      effort: 'Quick Win',
      buildingName: b.name,
      description: `Equipment in ${b.name} is running well above idle levels overnight. Scheduling automatic shutdown or investigating the stuck equipment should recover most of this waste.`,
      monthlySavingsUsd: Math.round(avgKwh * b.costPerKwh * 6 * 30),
      annualSavingsUsd: Math.round(avgKwh * b.costPerKwh * 6 * 365),
    });
  }

  if (spikeAlert) {
    const b = byBuilding[spikeAlert.buildingId];
    const { peakKwh } = buildingStats(b);
    recs.push({
      title: `Investigate Demand Spike at ${b.name}`,
      category: 'Demand',
      priority: 'High',
      effort: 'Quick Win',
      buildingName: b.name,
      description: `${b.name} showed a sudden usage spike well above its normal pattern. Load-shedding non-critical equipment during peak hours can prevent repeat spikes and demand charges.`,
      monthlySavingsUsd: Math.round(peakKwh * b.costPerKwh * 0.3 * 30),
      annualSavingsUsd: Math.round(peakKwh * b.costPerKwh * 0.3 * 365),
    });
  }

  if (setpointAlert) {
    const b = byBuilding[setpointAlert.buildingId];
    const { avgKwh } = buildingStats(b);
    recs.push({
      title: `Raise HVAC Setpoint at ${b.name}`,
      category: 'HVAC',
      priority: 'Medium',
      effort: 'Quick Win',
      buildingName: b.name,
      description: `${b.name}'s HVAC setpoint (${b.hvacSetpointC}°C) runs colder than necessary. Raising it by 1-2°C during occupied hours cuts compressor load with negligible comfort impact.`,
      monthlySavingsUsd: Math.round(avgKwh * b.costPerKwh * 24 * 0.06 * 30),
      annualSavingsUsd: Math.round(avgKwh * b.costPerKwh * 24 * 0.06 * 365),
    });
  }

  const largest = [...buildings].sort((a, b) => buildingStats(b).avgKwh - buildingStats(a).avgKwh)[0];
  const largestStats = buildingStats(largest);

  recs.push({
    title: 'LED Retrofit + Occupancy Sensors',
    category: 'Lighting',
    priority: 'Medium',
    effort: 'Moderate',
    buildingName: 'All Buildings',
    description: 'Replacing legacy fixtures with LEDs and adding occupancy sensors in low-traffic areas typically cuts lighting load by 30-40% campus-wide.',
    monthlySavingsUsd: Math.round(largestStats.avgKwh * largest.costPerKwh * 0.15 * 30),
    annualSavingsUsd: Math.round(largestStats.avgKwh * largest.costPerKwh * 0.15 * 365),
  });

  recs.push({
    title: 'Rooftop Solar + Battery Storage',
    category: 'Renewable',
    priority: 'High',
    effort: 'Strategic',
    buildingName: largest.name,
    description: `${largest.name} has the highest baseline load on campus, making it the best candidate for rooftop solar paired with battery storage to shave daytime peak costs.`,
    monthlySavingsUsd: Math.round(largestStats.peakKwh * largest.costPerKwh * 0.4 * 30),
    annualSavingsUsd: Math.round(largestStats.peakKwh * largest.costPerKwh * 0.4 * 365),
  });

  recs.push({
    title: 'Night Setback Scheduling Across Campus',
    category: 'Scheduling',
    priority: 'Low',
    effort: 'Quick Win',
    buildingName: 'All Buildings',
    description: 'Automating night/weekend HVAC setbacks campus-wide, beyond the buildings already flagged, captures additional savings with no hardware cost.',
    monthlySavingsUsd: Math.round(buildings.reduce((s, b) => s + b.expectedIdleKwh, 0) * 0.14 * 8 * 30),
    annualSavingsUsd: Math.round(buildings.reduce((s, b) => s + b.expectedIdleKwh, 0) * 0.14 * 8 * 365),
  });

  return recs;
}

async function getPortfolioRecommendations(buildings, alerts) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return fallbackRecommendations(buildings, alerts);
  }

  const summary = buildings.map((b) => {
    const { avgKwh, peakKwh } = buildingStats(b);
    return {
      name: b.name,
      hvacSetpointC: b.hvacSetpointC,
      costPerKwh: b.costPerKwh,
      avgKwh: +avgKwh.toFixed(1),
      peakKwh,
    };
  });

  const prompt = `You are an AI energy optimization engine for a university campus with these buildings: ${JSON.stringify(summary)}
Active alerts detected: ${JSON.stringify(alerts.map((a) => ({ building: a.buildingName, type: a.type, severity: a.severity })))}

Generate exactly 6 concrete energy-saving recommendations for the portfolio.
Respond with ONLY a JSON array, no prose, in this exact shape:
[{"title": "short title", "category": "HVAC|Lighting|Demand|Renewable|IT|Scheduling", "priority": "Critical|High|Medium|Low", "effort": "Quick Win|Moderate|Strategic", "buildingName": "building name or All Buildings", "description": "1-2 sentence explanation", "monthlySavingsUsd": number, "annualSavingsUsd": number}]
Base savings estimates on the given cost-per-kWh and usage figures so they are realistic.`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.4,
      }),
    });

    if (!response.ok) throw new Error(`Groq API error: ${response.status}`);

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content ?? '';
    const jsonMatch = content.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error('No JSON array found in AI response');

    const parsed = JSON.parse(jsonMatch[0]);
    if (!Array.isArray(parsed) || parsed.length === 0) throw new Error('Empty AI response');

    return parsed;
  } catch (err) {
    console.error('AI recommendations failed, using fallback:', err.message);
    return fallbackRecommendations(buildings, alerts);
  }
}

module.exports = { getPortfolioRecommendations, CATEGORIES, PRIORITIES, EFFORTS };
