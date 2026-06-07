/**
 * Absolute Final Task 68 — unified KPI dashboard (MRR, NPS, TTF, uptime, error rate, DAU).
 *
 * @see docs/kpi-dashboard.md
 * @see app/platform/kpi/page.tsx
 */

export const KPI_DASHBOARD_ABSOLUTE_FINAL_POLICY_ID = "kpi-dashboard-absolute-final-v1" as const;

export const KPI_DASHBOARD_DOC_PATH = "docs/kpi-dashboard.md" as const;

export const KPI_DASHBOARD_ROUTE = "/platform/kpi" as const;

export const KPI_DASHBOARD_METRIC_IDS = [
  "mrr",
  "nps",
  "ttf",
  "uptime",
  "error_rate",
  "dau",
] as const;

export type KpiDashboardMetricId = (typeof KPI_DASHBOARD_METRIC_IDS)[number];

export const KPI_DASHBOARD_METRIC_DEFINITIONS: ReadonlyArray<{
  id: KpiDashboardMetricId;
  label: string;
  unit: string;
  description: string;
}> = [
  {
    id: "mrr",
    label: "MRR",
    unit: "usd",
    description: "Monthly recurring revenue from Stripe-linked subscriptions or partner MRR rollups",
  },
  {
    id: "nps",
    label: "NPS",
    unit: "score",
    description: "Portfolio Net Promoter Score from day-30 operator surveys (AppFeedback nps_day30)",
  },
  {
    id: "ttf",
    label: "TTF",
    unit: "hours",
    description: "Median time-to-first-order from signup to first order in Order Hub",
  },
  {
    id: "uptime",
    label: "Uptime",
    unit: "percent",
    description: "Platform availability composite from DB, cron, and integration fleet signals",
  },
  {
    id: "error_rate",
    label: "Error rate",
    unit: "percent",
    description: "Operational error signals (7d) relative to order volume — not client-side JS errors",
  },
  {
    id: "dau",
    label: "DAU",
    unit: "users",
    description: "Distinct operators with usage events in the last 24 hours",
  },
] as const;

export const KPI_DASHBOARD_REQUIRED_HEADINGS = [
  "## Six core KPIs",
  "## Data sources",
  "## Honesty rules",
  "MRR",
  "NPS",
  "TTF",
  "uptime",
  "error rate",
  "DAU",
] as const;

export const KPI_DASHBOARD_HONESTY_MARKERS = [
  "Never guess paid state",
  "awaiting_data",
  "Stripe revenue pipeline",
] as const;

export const KPI_DASHBOARD_WIRING_PATHS = [
  KPI_DASHBOARD_DOC_PATH,
  "lib/platform/kpi-dashboard-absolute-final-policy.ts",
  "lib/platform/kpi-dashboard-metrics.ts",
  "lib/platform/kpi-dashboard-audit.ts",
  "services/platform/kpi-dashboard-service.ts",
  "components/platform/kpi-dashboard-panel.tsx",
  "app/platform/kpi/page.tsx",
  "tests/unit/kpi-dashboard-absolute-final.test.ts",
] as const;

export const KPI_DASHBOARD_UNIT_TEST = "tests/unit/kpi-dashboard-absolute-final.test.ts" as const;

export const KPI_DASHBOARD_CI_SCRIPTS = [
  "test:ci:kpi-dashboard",
  "test:ci:kpi-dashboard:cert",
] as const;
