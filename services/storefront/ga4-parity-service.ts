import type { Ga4ParityHistoryPoint } from "@/lib/storefront/ga4-parity-json";
import { toJsonValue } from "@/lib/prisma/json";
import { computeGa4ParityErrorBudget, type Ga4ParityErrorBudget } from "@/lib/storefront/ga4-parity-budget";
import type { Ga4ParityScore } from "@/lib/storefront/ga4-parity-score";
import { refreshGa4ParityForStorefront } from "@/services/storefront/ga4-parity-refresh-service";

export type Ga4ParityDashboardContext = {
  score: Ga4ParityScore;
  history: Ga4ParityHistoryPoint[];
  budget: Ga4ParityErrorBudget;
};

export async function getGa4ParityScoreForStorefront(input: {
  storefrontId: string;
  themeExperimentJson: unknown;
  googleAnalyticsPropertyId: string | null;
  days: number;
  refresh?: boolean;
}): Promise<Ga4ParityDashboardContext> {
  const result = await refreshGa4ParityForStorefront({
    storefrontId: input.storefrontId,
    themeExperimentJson: input.themeExperimentJson,
    googleAnalyticsPropertyId: input.googleAnalyticsPropertyId,
    days: input.days,
    force: Boolean(input.refresh),
    recordHistory: Boolean(input.refresh),
    updateDriftStreak: false,
  });

  return {
    score: result.score,
    history: result.history,
    budget: computeGa4ParityErrorBudget(result.history),
  };
}
