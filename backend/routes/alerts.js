const express = require('express');
const { loadBuildings } = require('../services/dataStore');
const { detectAlertsForBuildings } = require('../services/alertEngine');

const router = express.Router();

router.get('/', (req, res) => {
  const buildings = loadBuildings();
  res.json(detectAlertsForBuildings(buildings));
});

module.exports = router;
