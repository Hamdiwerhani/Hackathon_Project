const express = require('express');
const { loadBuildings } = require('../services/dataStore');
const { generateInvoices } = require('../services/invoiceEngine');

const router = express.Router();

router.get('/', (req, res) => {
  const buildings = loadBuildings();
  res.json(generateInvoices(buildings));
});

module.exports = router;
