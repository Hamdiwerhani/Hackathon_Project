const { TOOL_DEFINITIONS, executeTool } = require('./agentTools');
const { loadBuildings } = require('./dataStore');
const { detectAlertsForBuildings } = require('./alertEngine');
const { computeSummary } = require('./savingsEngine');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
// Tool-calling needs a stronger model than the 8B one used for recommendations JSON.
const GROQ_AGENT_MODEL = process.env.GROQ_AGENT_MODEL || 'openai/gpt-oss-120b';
const MAX_TOOL_ITERATIONS = 4;

const SYSTEM_PROMPT = `You are ARIA, the AI assistant embedded in EnergyIQ, a campus energy management platform.
You have live tool access to the campus's real building data, alerts, savings projections, invoices, and a savings simulator.
Always call a tool to look up real numbers before answering questions about consumption, cost, alerts, or savings — never invent figures.
When asked "what if" questions about efficiency upgrades, call simulate_savings with reasonable lever values.
Keep answers concise (2-4 sentences), concrete, and grounded in the tool results. Building names in this system: Science Hall, Library, Engineering Building, Student Union.`;

function fallbackKeywordResponse(message) {
  const buildings = loadBuildings();
  const lower = message.toLowerCase();

  if (/alert|leak|spike|warning/.test(lower)) {
    const alerts = detectAlertsForBuildings(buildings);
    const critical = alerts.filter((a) => a.severity === 'critical');
    if (critical.length === 0) return "No critical alerts right now — all buildings are within normal range.";
    return `${critical.length} critical alert(s): ${critical.map((a) => `${a.title} at ${a.buildingName}`).join('; ')}.`;
  }

  if (/saving|cost|money|roi/.test(lower)) {
    const summary = computeSummary(buildings);
    return `Projected annual savings: $${summary.annualSavings.toLocaleString()} (${summary.roiPct}% ROI), breaking even around ${summary.breakEvenMonth}.`;
  }

  if (/building|campus/.test(lower)) {
    return `Tracking ${buildings.length} buildings: ${buildings.map((b) => b.name).join(', ')}.`;
  }

  return "I can answer questions about alerts, savings, invoices, and buildings — set GROQ_API_KEY in backend/.env for full conversational answers and what-if simulations.";
}

async function callGroq(messages) {
  const apiKey = process.env.GROQ_API_KEY;
  const response = await fetch(GROQ_API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: GROQ_AGENT_MODEL,
      messages,
      tools: TOOL_DEFINITIONS,
      tool_choice: 'auto',
      temperature: 0.3,
    }),
  });

  if (!response.ok) {
    const text = await response.text().catch(() => '');
    throw new Error(`Groq API error ${response.status}: ${text.slice(0, 300)}`);
  }
  return response.json();
}

async function chat(userMessage, history = []) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return { reply: fallbackKeywordResponse(userMessage), toolsUsed: [], usedFallback: true };
  }

  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: 'user', content: userMessage },
  ];

  const toolsUsed = [];

  try {
    for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
      const data = await callGroq(messages);
      const message = data.choices?.[0]?.message;
      if (!message) throw new Error('No message in Groq response');

      if (message.tool_calls?.length) {
        messages.push({ role: 'assistant', content: message.content || null, tool_calls: message.tool_calls });

        for (const call of message.tool_calls) {
          let args = {};
          try {
            args = JSON.parse(call.function.arguments || '{}');
          } catch {
            args = {};
          }
          toolsUsed.push(call.function.name);
          const result = await executeTool(call.function.name, args);
          messages.push({ role: 'tool', tool_call_id: call.id, content: JSON.stringify(result) });
        }
        continue; // ask the model again with tool results in context
      }

      return { reply: message.content || "I couldn't generate a response.", toolsUsed, usedFallback: false };
    }

    return { reply: "I gathered the data but ran out of reasoning steps — try a more specific question.", toolsUsed, usedFallback: false };
  } catch (err) {
    console.error('Agent chat failed, using fallback:', err.message);
    return { reply: fallbackKeywordResponse(userMessage), toolsUsed, usedFallback: true };
  }
}

module.exports = { chat };
