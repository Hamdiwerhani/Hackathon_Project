const express = require('express');
const { loadBuildings } = require('../services/dataStore');
const { getPortfolioRecommendations } = require('../services/aiClient');
const { detectAlertsForBuildings } = require('../services/alertEngine');

const router = express.Router();

// Cache only real AI-generated results so a demo doesn't re-call Groq on every
// refresh. A fallback result is deliberately NOT cached, so a transient
// failure (rate limit, network blip) gets retried on the next request
// instead of permanently sticking the app on the fallback.
let cache = null;

router.get('/', async (req, res) => {
  if (cache) return res.json(cache);

  const buildings = loadBuildings();
  const alerts = detectAlertsForBuildings(buildings);
  const { suggestions, usedFallback } = await getPortfolioRecommendations(buildings, alerts);

  const result = suggestions.map((s, i) => ({
    id: `rec-${i}`,
    applied: false,
    ...s,
  }));

  if (!usedFallback) cache = result;
  res.json(result);
});

module.exports = router;
