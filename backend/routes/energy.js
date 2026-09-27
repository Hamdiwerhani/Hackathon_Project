const express = require('express');
const { loadBuildings, getBuilding } = require('../services/dataStore');

const router = express.Router();

router.get('/', (req, res) => {
  res.json(loadBuildings());
});

router.get('/:id', (req, res) => {
  const building = getBuilding(req.params.id);
  if (!building) return res.status(404).json({ error: 'Building not found' });
  res.json(building);
});

module.exports = router;
