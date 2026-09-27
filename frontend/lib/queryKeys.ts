// Centralized query key factory so keys can't drift between hooks/invalidations.
export const queryKeys = {
  buildings: {
    all: ["buildings"] as const,
    detail: (id: string) => ["buildings", id] as const,
  },
  alerts: ["alerts"] as const,
  recommendations: ["recommendations"] as const,
  savings: {
    perBuilding: ["savings"] as const,
    summary: ["savings", "summary"] as const,
  },
  invoices: ["invoices"] as const,
};
