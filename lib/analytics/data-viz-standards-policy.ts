/**
 * Absolute Final Task 59 — data viz standards: waterfall charts + contribution margin.
 *
 * Extends DES-19 profit margin visualization with canonical chart types for
 * operator P&L storytelling on `/dashboard/today/profit`.
 *
 * @see lib/analytics/profit-dashboard-margin-visualization-policy.ts
 * @see components/analytics/waterfall-chart.tsx
 * @see components/analytics/contribution-margin-chart.tsx
 */

import { PROFIT_DASHBOARD_MARGIN_VIZ_POLICY_ID } from "@/lib/analytics/profit-dashboard-margin-visualization-policy";
import { colorVar } from "@/lib/design/color-tokens";

export const DATA_VIZ_STANDARDS_POLICY_ID = "data-viz-standards-absolute-final-v1" as const;

export const DATA_VIZ_STANDARDS_UPSTREAM_POLICY_ID = PROFIT_DASHBOARD_MARGIN_VIZ_POLICY_ID;

export const WATERFALL_CHART_TEST_ID = "data-viz-waterfall-chart" as const;

export const CONTRIBUTION_MARGIN_CHART_TEST_ID = "data-viz-contribution-margin-chart" as const;

export const DATA_VIZ_PROFIT_DASHBOARD_MODULE =
  "components/analytics/real-time-profit-dashboard.tsx" as const;

export const DATA_VIZ_WATERFALL_MODULE = "components/analytics/waterfall-chart.tsx" as const;

export const DATA_VIZ_CONTRIBUTION_MARGIN_MODULE =
  "components/analytics/contribution-margin-chart.tsx" as const;

/** Recharts fill tokens — semantic colors from design system. */
export const DATA_VIZ_WATERFALL_FILLS = {
  revenue: colorVar.success,
  cost: colorVar.error,
  labor: "var(--color-accent-2)",
  delivery: colorVar.info,
  profit: colorVar.success,
  loss: colorVar.error,
} as const;

export const DATA_VIZ_CONTRIBUTION_MARGIN_MIN_GREEN = 55 as const;

export const DATA_VIZ_CONTRIBUTION_MARGIN_MIN_YELLOW = 40 as const;

export const DATA_VIZ_STANDARDS_CHART_TYPES = ["waterfall", "contribution_margin"] as const;

export const DATA_VIZ_STANDARDS_WIRING_PATHS = [
  "lib/analytics/data-viz-standards-policy.ts",
  "lib/analytics/data-viz-standards-audit.ts",
  "lib/analytics/waterfall-chart-data.ts",
  "lib/analytics/contribution-margin-data.ts",
  DATA_VIZ_WATERFALL_MODULE,
  DATA_VIZ_CONTRIBUTION_MARGIN_MODULE,
  DATA_VIZ_PROFIT_DASHBOARD_MODULE,
  "tests/unit/data-viz-standards.test.ts",
] as const;

export const DATA_VIZ_STANDARDS_UNIT_TEST = "tests/unit/data-viz-standards.test.ts" as const;

export const DATA_VIZ_STANDARDS_CI_SCRIPTS = [
  "test:ci:data-viz-standards",
  "test:ci:data-viz-standards:cert",
] as const;
