# EnergyIQ — Hackathon Pitch

*Come Build with AI Hackathon · 27 September 2026*
*[Your Team Name] · [Lead Email] · [Country]*

Copy each section below into a slide (Google Slides, PowerPoint, or plain PDF). Bracketed items are placeholders only you can fill in — nothing else here is invented.

---

## Slide 1 — Cover

**EnergyIQ**
AI-Powered Campus Energy Platform

Live monitoring, leak detection, AI recommendations, and a tool-calling assistant — built for campus facilities teams who can't wait for the next utility bill to find out something's wrong.

[Your Team Name] · [Lead Email]
Come Build with AI Hackathon · 27 September 2026

---

## Slide 2 — The Problem

**Energy waste hides until the bill arrives.**

- Facilities teams find leaks only after the utility bill, not when they happen
- No real-time visibility into HVAC load, occupancy, or peak demand across buildings
- Manual reviews miss anomalies until they're expensive to fix

EnergyIQ closes that gap — live.

---

## Slide 3 — The Solution

**One live platform, five ways to save**

1. **Live Monitoring** — real-time consumption and KPI totals across every building
2. **Leak & Spike Detection** — automatic rule-based anomaly detection on live usage data
3. **AI Recommendations** — portfolio-wide savings suggestions, prioritized by impact
4. **Live Simulator** — "what-if" modeling for HVAC, LED, solar, occupancy, peak demand
5. **ARIA Assistant** — a tool-calling AI agent that answers questions grounded in live data

---

## Slide 4 — Quality of AI Use

**Not a chatbot bolted on — an agent with real tools**

- Model provider: **Groq** (`openai/gpt-oss-20b` for recommendations, `openai/gpt-oss-120b` for tool-calling)
- ARIA has live tool access to: `get_alerts`, `get_savings_summary`, `get_recommendations`, `get_invoices`, `get_building_zones`, `simulate_savings`
- It doesn't recite scripted answers — it calls these tools against the running backend and reasons over the actual result

**Real captured example from testing:**
> **Q:** "Which building has the most critical alerts and what should we do?"
> **A:** "Both Science Hall and the Student Union each have one active critical alert (energy-leak warnings from overnight usage)... inspect the indicated zones (Server Closet in Science Hall, Admin Offices in the Union) for any standing-water or HVAC leaks..."
> *(toolsUsed: `get_alerts`, usedFallback: false)*

---

## Slide 5 — Impact

**Real figures, computed live by our backend — not hardcoded**

- **$20,053** projected annual savings across the demo portfolio
- **134%** ROI on a $15K efficiency upgrade assumption
- **6** AI-prioritized recommendations generated from live alert/usage data

All numbers are recalculated from the same underlying dataset every time — the Overview, Cost & Savings, and AI Insights pages never disagree with each other.

---

## Slide 6 — How It's Built

**A real full-stack app, not a mockup**

```
Next.js 15 Frontend  →  Express Backend  →  Groq AI (gpt-oss-20b / gpt-oss-120b)
```

- **Frontend:** Next.js 15, TypeScript, Tailwind CSS, Recharts
- **Backend:** Node.js, Express, deterministic mock dataset
- **AI:** Groq (OpenAI-compatible API), tool-calling agent loop
- 8 live pages: Overview, Buildings, AI Insights, Cost & Savings, Alerts, Invoices, Simulator, Add Building

---

## Slide 7 — Responsible AI & Data

**Built to be trusted, not just impressive**

- **Synthetic data only** — no real personal or proprietary data used; clearly disclosed, not hidden
- **Tested fallback logic** — every AI feature has a deterministic fallback if the model is unavailable or a call fails
- **Human-in-the-loop** — recommendations and simulator changes are surfaced for a person to review; the AI never autonomously controls a building
- **Secrets handled correctly** — API keys stay server-side and are excluded from the repo via `.gitignore`

---

## Slide 8 — What's Next

**From simulated campus to a real one**

- Connect real utility/IoT meter APIs in place of the synthetic dataset
- Voice input for ARIA via Groq's Whisper models (already available on the same API key)
- Multi-campus portfolio view for larger institutions

---

## Slide 9 — Thank You

**EnergyIQ**
[Your Team Name] · [Lead Email]

Questions?

---

## Notes for the 90-second video

Pair this deck with the video script from earlier — update it to mention Invoices, Simulator, Add Building, and ARIA in the middle beat, since those were added after the original script was drafted. Keep the video screen-recording + narration approach (Loom is explicitly recommended by the hackathon organizers).
