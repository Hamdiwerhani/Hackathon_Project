const express = require('express');
const { loadBuildings } = require('../services/dataStore');
const { computeSavings, computeSummary } = require('../services/savingsEngine');

const router = express.Router();

router.get('/', (req, res) => {
  const buildings = loadBuildings();
  res.json(buildings.map(computeSavings));
});

router.get('/summary', (req, res) => {
  const buildings = loadBuildings();
  res.json(computeSummary(buildings));
});

module.exports = router;
