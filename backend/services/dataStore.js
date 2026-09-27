const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, '..', 'data', 'energy.json');

function loadBuildings() {
  const raw = fs.readFileSync(DATA_PATH, 'utf-8');
  return JSON.parse(raw).buildings;
}

function getBuilding(id) {
  return loadBuildings().find((b) => b.id === id);
}

module.exports = { loadBuildings, getBuilding };
