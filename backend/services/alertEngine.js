const OFF_HOURS = new Set([23, 0, 1, 2, 3, 4, 5]);
const SPIKE_JUMP_FACTOR = 1.6; // vs previous hour
const SPIKE_ABOVE_AVG_FACTOR = 1.3; // must also be well above the daily average
const LEAK_FACTOR = 1.5;
const LEAK_MIN_CONSECUTIVE_HOURS = 2;

function hourOf(timestamp) {
  return new Date(timestamp).getUTCHours();
}

function zoneForType(building, type) {
  const zones = building.zones || [];
  if (type === 'leak') {
    return zones.find((z) => z.status === 'Cooling' || z.status === 'Standby')?.zone || 'HVAC System';
  }
  if (type === 'spike') {
    return zones.find((z) => z.status === 'Active')?.zone || 'Main Electrical Panel';
  }
  return 'Climate Control';
}

function detectAlertsForBuilding(building) {
  const alerts = [];
  const points = building.usageKwh;

  const avgKwh = points.reduce((sum, p) => sum + p.kwh, 0) / points.length;

  points.forEach((point, i) => {
    if (i === 0) return;
    const prev = points[i - 1];
    const suddenJump = point.kwh > prev.kwh * SPIKE_JUMP_FACTOR;
    const wellAboveAverage = point.kwh > avgKwh * SPIKE_ABOVE_AVG_FACTOR;

    if (suddenJump && wellAboveAverage) {
      alerts.push({
        id: `${building.id}-spike-${point.timestamp}`,
        buildingId: building.id,
        buildingName: building.name,
        zone: zoneForType(building, 'spike'),
        type: 'spike',
        severity: 'warning',
        status: 'active',
        title: 'Abnormal Usage Spike',
        message: `${building.name} usage jumped to ${point.kwh} kWh at ${new Date(point.timestamp).toISOString().slice(11, 16)} UTC — a sudden rise from ${prev.kwh} kWh the hour before, well above its ${avgKwh.toFixed(1)} kWh average.`,
        detectedAt: point.timestamp,
      });
    }
  });

  let consecutive = 0;
  let leakStart = null;
  const pushLeak = () => {
    alerts.push({
      id: `${building.id}-leak-${leakStart}`,
      buildingId: building.id,
      buildingName: building.name,
      zone: zoneForType(building, 'leak'),
      type: 'leak',
      severity: 'critical',
      status: 'active',
      title: 'Possible Energy Leak',
      message: `${building.name} ran well above its idle baseline for ${consecutive} straight overnight hours starting ${new Date(leakStart).toISOString().slice(11, 16)} UTC — likely equipment left on or a system leak.`,
      detectedAt: leakStart,
    });
  };

  for (let i = 0; i < points.length; i++) {
    const point = points[i];
    const hot = OFF_HOURS.has(hourOf(point.timestamp)) && point.kwh > building.expectedIdleKwh * LEAK_FACTOR;

    if (hot) {
      if (consecutive === 0) leakStart = point.timestamp;
      consecutive += 1;
    } else {
      if (consecutive >= LEAK_MIN_CONSECUTIVE_HOURS) pushLeak();
      consecutive = 0;
    }
  }
  if (consecutive >= LEAK_MIN_CONSECUTIVE_HOURS) pushLeak();

  if (building.hvacSetpointC <= 18) {
    alerts.push({
      id: `${building.id}-setpoint`,
      buildingId: building.id,
      buildingName: building.name,
      zone: zoneForType(building, 'setpoint'),
      type: 'setpoint',
      severity: 'info',
      status: 'active',
      title: 'HVAC Setpoint Out of Range',
      message: `${building.name}'s HVAC setpoint (${building.hvacSetpointC}°C) is colder than the recommended 19-21°C efficiency range.`,
      detectedAt: new Date().toISOString(),
    });
  }

  return alerts;
}

function detectAlertsForBuildings(buildings) {
  const alerts = buildings.flatMap(detectAlertsForBuilding);
  const severityRank = { critical: 0, warning: 1, info: 2 };
  alerts.sort((a, b) => severityRank[a.severity] - severityRank[b.severity]);
  return alerts;
}

module.exports = { detectAlertsForBuildings };
