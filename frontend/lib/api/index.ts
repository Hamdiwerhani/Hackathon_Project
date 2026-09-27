// Barrel for the API client. Server Components can `await` these functions
// directly (SSR fetch, always fresh); Client Components should go through
// the React Query hooks in `@/hooks` instead, so requests are cached and
// shared across components (see hooks/useAlerts.ts, etc.).

export * from "./http";
export * from "./buildings";
export * from "./alerts";
export * from "./recommendations";
export * from "./savings";
export * from "./invoices";
export * from "./assistant";

import { getBuildings, getBuilding, addBuilding } from "./buildings";
import { getAlerts } from "./alerts";
import { getRecommendations } from "./recommendations";
import { getSavings, getSavingsSummary } from "./savings";
import { getInvoices } from "./invoices";
import { askAssistant } from "./assistant";

/** Convenience aggregate for Server Components, e.g. `api.getBuildings()`. */
export const api = {
  getBuildings,
  getBuilding,
  addBuilding,
  getAlerts,
  getRecommendations,
  getSavings,
  getSavingsSummary,
  getInvoices,
  askAssistant,
};
