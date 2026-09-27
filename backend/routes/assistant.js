const express = require('express');
const { chat } = require('../services/agentClient');

const router = express.Router();

router.post('/', async (req, res) => {
  const { message, history } = req.body || {};

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'message is required' });
  }

  const safeHistory = Array.isArray(history)
    ? history
        .filter((h) => h && (h.role === 'user' || h.role === 'assistant') && typeof h.content === 'string')
        .slice(-10)
    : [];

  const result = await chat(message, safeHistory);
  res.json(result);
});

module.exports = router;
