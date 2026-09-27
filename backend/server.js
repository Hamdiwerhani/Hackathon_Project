require('dotenv').config();
const express = require('express');
const cors = require('cors');

const energyRoutes = require('./routes/energy');
const recommendationsRoutes = require('./routes/recommendations');
const alertsRoutes = require('./routes/alerts');
const savingsRoutes = require('./routes/savings');
const invoicesRoutes = require('./routes/invoices');
const buildingsRoutes = require('./routes/buildings');
const assistantRoutes = require('./routes/assistant');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/energy', energyRoutes);
app.use('/api/recommendations', recommendationsRoutes);
app.use('/api/alerts', alertsRoutes);
app.use('/api/savings', savingsRoutes);
app.use('/api/invoices', invoicesRoutes);
app.use('/api/buildings', buildingsRoutes);
app.use('/api/assistant', assistantRoutes);

app.use((req, res) => res.status(404).json({ error: 'Not found' }));

app.listen(PORT, () => {
  console.log(`Energy efficiency backend running on http://localhost:${PORT}`);
});
