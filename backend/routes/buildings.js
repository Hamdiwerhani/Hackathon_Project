const express = require('express');

const router = express.Router();

// Buildings registered via the "Add Building" form this server session.
// Kept separate from data/energy.json so the core demo dataset (used by
// alerts/recommendations/savings) stays stable.
const registeredBuildings = [];

router.get('/', (req, res) => {
  res.json(registeredBuildings);
});

router.post('/', (req, res) => {
  const { name, type, address, city, country, floors, area, utilityProvider } = req.body || {};

  if (!name || !type || !address || !floors || !area || !utilityProvider) {
    return res.status(400).json({ error: 'Missing required building fields' });
  }

  const building = {
    id: `custom-${Date.now()}`,
    name,
    type,
    address,
    city: city || '',
    country: country || '',
    floors: Number(floors),
    area: Number(area),
    utilityProvider,
    registeredAt: new Date().toISOString(),
  };

  registeredBuildings.push(building);
  res.status(201).json(building);
});

module.exports = router;
