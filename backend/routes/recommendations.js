const express = require('express');
const { loadBuildings } = require('../services/dataStore');
const { getPortfolioRecommendations } = require('../services/aiClient');
const { detectAlertsForBuildings } = require('../services/alertEngine');

const router = express.Router();

// simple in-memory cache so a demo doesn't re-call the AI on every refresh
let cache = null;

router.get('/', async (req, res) => {
  if (cache) return res.json(cache);

  const buildings = loadBuildings();
  const alerts = detectAlertsForBuildings(buildings);
  const suggestions = await getPortfolioRecommendations(buildings, alerts);

  const result = suggestions.map((s, i) => ({
    id: `rec-${i}`,
    applied: false,
    ...s,
  }));

  cache = result;
  res.json(result);
});

module.exports = router;
