# EnergyIQ — Campus Energy Efficiency Platform

AI-powered dashboard for monitoring campus building energy use, detecting leaks/anomalies, generating cost-saving recommendations, simulating "what-if" upgrades, and answering live questions through a tool-calling AI assistant (ARIA). Built for the Come Build with AI Hackathon.

## Stack

- **Backend:** Node.js + Express, deterministic mock dataset (4 campus buildings), rule-based alert detection, AI recommendations + a tool-calling agent via Groq (with rule-based/data-grounded fallbacks when no API key is set)
- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS + Recharts

## Running locally

**Backend** (port 4000):
```
cd backend
npm install
npm start
```

**Frontend** (port 3000):
```
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

## Enabling real AI (Groq)

By default `backend/.env` has an empty `GROQ_API_KEY`, so the app runs on data-grounded fallback logic with no setup required — nothing is fake, it's just rules/math instead of an LLM. To enable real AI:

1. Get a free API key at https://console.groq.com
2. Set `GROQ_API_KEY=your_key` in `backend/.env`
3. Restart the backend

Two models are used:
- `GROQ_MODEL` (default `openai/gpt-oss-20b`) — writes the AI Insights recommendations
- `GROQ_AGENT_MODEL` (default `openai/gpt-oss-120b`) — powers ARIA's tool-calling (needs a stronger model for reliable function-calling)

## Screens

- `/` — Overview: KPI totals, 24h consumption chart, per-building status cards
- `/buildings` — Building switcher tabs, hourly demand chart, HVAC zone detail
- `/ai-insights` — AI-generated, portfolio-wide savings recommendations with priority/effort filtering
- `/cost-savings` — Annual cost projection, monthly comparison, cumulative savings & break-even
- `/alerts` — Live leak/spike/setpoint alerts with severity filters and acknowledge/resolve actions
- `/invoices` — Generated electricity invoice history with filters, search, and a working (static) upload dropzone
- `/simulator` — Live savings simulator: HVAC/lighting/solar/occupancy/peak-demand levers with real formulas
- `/add-building` — 3-step wizard to register a new building (posts to the backend)
- **ARIA** (floating widget, every page) — AI assistant with live tool access to alerts, savings, invoices, zones, and the simulator

## API

| Route | Description |
|---|---|
| `GET /api/energy` | All buildings' usage, zone, and floor data |
| `GET /api/energy/:id` | One building's data |
| `GET /api/alerts` | Detected leaks, spikes, setpoint issues |
| `GET /api/recommendations` | AI/rule-based portfolio savings recommendations |
| `GET /api/savings` | Per-building baseline vs. optimized cost |
| `GET /api/savings/summary` | Annual projection, monthly breakdown, ROI, break-even |
| `GET /api/invoices` | Generated invoice history per building |
| `GET/POST /api/buildings` | List/register buildings added via the wizard |
| `POST /api/assistant` | ARIA chat endpoint (tool-calling agent) |

## AI usage disclosure

- **Model provider:** Groq (`openai/gpt-oss-20b` and `openai/gpt-oss-120b`), OpenAI-compatible API
- **Where AI is used:** (1) writing the AI Insights recommendation cards from live usage/alert data, (2) ARIA, a tool-calling assistant that queries this app's own backend (alerts, savings, invoices, zones, simulator) to answer questions grounded in real numbers — not scripted responses
- **Data:** entirely synthetic/deterministic mock data generated for this demo (no real personal or proprietary data)
- **Fallback plan:** every AI-backed feature has a deterministic, rule-based fallback that runs automatically if no API key is set or a request fails, so the app is always fully functional
- **Oversight:** recommendations and simulator changes are surfaced for a human to review/apply — the AI does not autonomously act on building systems
