/**
 * Blueprint P1-70 — Integration Health dashboard (score cards, sparklines, alerts).
 *
 * @see components/integrations/integration-health-live-panel.tsx
 * @see components/integrations/integration-health-score-card.tsx
 * @see app/dashboard/integration-health/page.tsx
 */

import { cn } from "@/lib/utils";
import type { IntegrationHealthScoreBand } from "@/lib/integration-health/health-scoring-policy";

export const INTEGRATION_HEALTH_DASHBOARD_POLICY_ID =
  "integration-health-dashboard-p1-70-v1" as const;

export const INTEGRATION_HEALTH_DASHBOARD_LIVE_PANEL_MODULE =
  "components/integrations/integration-health-live-panel.tsx" as const;

export const INTEGRATION_HEALTH_DASHBOARD_SCORE_CARD_MODULE =
  "components/integrations/integration-health-score-card.tsx" as const;

export const INTEGRATION_HEALTH_DASHBOARD_SPARKLINE_MODULE =
  "components/integrations/integration-health-sparkline.tsx" as const;

export const INTEGRATION_HEALTH_DASHBOARD_ALERTS_MODULE =
  "components/integrations/integration-health-alerts-panel.tsx" as const;

export const INTEGRATION_HEALTH_DASHBOARD_SECTION_MODULE =
  "components/integrations/integration-health-live-dashboard-section.tsx" as const;

export const INTEGRATION_HEALTH_DASHBOARD_PAGE_MODULE =
  "app/dashboard/integration-health/page.tsx" as const;

export const INTEGRATION_HEALTH_DASHBOARD_PANEL_TEST_ID =
  "integration-health-live-panel" as const;

export const INTEGRATION_HEALTH_DASHBOARD_SPARKLINE_TEST_ID =
  "integration-health-sparkline" as const;

export const INTEGRATION_HEALTH_DASHBOARD_ALERTS_TEST_ID =
  "integration-health-alerts-panel" as const;

export const INTEGRATION_HEALTH_DASHBOARD_SECTION_TEST_ID =
  "integration-health-live-dashboard-section" as const;

export const INTEGRATION_HEALTH_DASHBOARD_SCORE_CARD_TEST_PREFIX =
  "integration-health-score-card" as const;

/** Score card grid — responsive fleet overview. */
export const INTEGRATION_HEALTH_DASHBOARD_SCORE_GRID_CLASS = cn(
  "grid gap-3 sm:grid-cols-2 xl:grid-cols-3",
);

export const INTEGRATION_HEALTH_DASHBOARD_FLEET_SCORE_CLASS =
  "text-4xl font-semibold tabular-nums" as const;

export const INTEGRATION_HEALTH_DASHBOARD_ROW_SCORE_CLASS =
  "text-2xl font-semibold tabular-nums" as const;

export const INTEGRATION_HEALTH_DASHBOARD_SPARKLINE_SIZE = {
  width: 72,
  height: 24,
} as const;

export type IntegrationHealthDashboardBandMeta = {
  label: string;
  badge: "default" | "secondary" | "destructive";
  scoreClass: string;
  ringClass: string;
};

export const INTEGRATION_HEALTH_DASHBOARD_BAND_META: Record<
  IntegrationHealthScoreBand,
  IntegrationHealthDashboardBandMeta
> = {
  healthy: {
    label: "Healthy",
    badge: "default",
    scoreClass: "text-emerald-600 dark:text-emerald-400",
    ringClass: "border-emerald-500/40",
  },
  watch: {
    label: "Watch",
    badge: "secondary",
    scoreClass: "text-amber-600 dark:text-amber-400",
    ringClass: "border-amber-500/40",
  },
  critical: {
    label: "Critical",
    badge: "destructive",
    scoreClass: "text-rose-600 dark:text-rose-400",
    ringClass: "border-rose-500/40",
  },
};

export const INTEGRATION_HEALTH_DASHBOARD_ALERTS_CARD_CLASS = cn(
  "border-amber-500/40 bg-amber-500/5",
);

export const INTEGRATION_HEALTH_DASHBOARD_AUDIT_SCRIPT =
  "scripts/audit-integration-health-dashboard.ts" as const;

export const INTEGRATION_HEALTH_DASHBOARD_NPM_SCRIPT =
  "audit:integration-health-dashboard" as const;

export const INTEGRATION_HEALTH_DASHBOARD_UNIT_TEST =
  "tests/unit/integration-health-dashboard.test.ts" as const;

export const INTEGRATION_HEALTH_DASHBOARD_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export function integrationHealthScoreCardTestId(integrationId: string): string {
  return `${INTEGRATION_HEALTH_DASHBOARD_SCORE_CARD_TEST_PREFIX}-${integrationId}`;
}
