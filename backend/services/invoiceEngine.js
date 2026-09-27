const PROVIDERS = ['Metro Power Co', 'Green Grid Utilities'];
const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAYS_IN_MONTH = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

function seasonalFactor(monthIndex) {
  return 1 + 0.15 * Math.cos(((monthIndex - 6) / 12) * 2 * Math.PI);
}

function buildingCode(name) {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase();
}

// Deterministic invoice history: last 3 billing months per building, most recent first.
function generateInvoices(buildings) {
  const now = new Date('2026-09-27T00:00:00Z');
  const currentMonth = now.getUTCMonth(); // 8 = September
  const invoices = [];

  buildings.forEach((building, buildingIndex) => {
    const dailyKwh = building.usageKwh.reduce((s, p) => s + p.kwh, 0);
    const provider = PROVIDERS[buildingIndex % PROVIDERS.length];

    for (let back = 0; back < 3; back++) {
      const monthIndex = (currentMonth - back + 12) % 12;
      const year = currentMonth - back < 0 ? 2025 : 2026;
      const days = DAYS_IN_MONTH[monthIndex];
      const factor = seasonalFactor(monthIndex);

      const kWh = Math.round(dailyKwh * days * factor);
      const amount = Math.round(kWh * building.costPerKwh);

      const issueDate = new Date(Date.UTC(year, monthIndex, 1));
      const dueDate = new Date(Date.UTC(year, monthIndex, 20));

      let status = 'Paid';
      if (back === 0) status = 'Pending';
      // one deliberately overdue invoice for demo purposes: the oldest invoice of the second building
      if (back === 2 && buildingIndex === 1) status = 'Overdue';

      invoices.push({
        id: `INV-${year}-${buildingCode(building.name)}${String(monthIndex + 1).padStart(2, '0')}`,
        buildingId: building.id,
        building: building.name,
        period: `${MONTH_NAMES[monthIndex]} ${year}`,
        issueDate: issueDate.toISOString(),
        dueDate: dueDate.toISOString(),
        kWh,
        amount,
        status,
        provider,
      });
    }
  });

  invoices.sort((a, b) => new Date(b.issueDate) - new Date(a.issueDate));
  return invoices;
}

module.exports = { generateInvoices };
