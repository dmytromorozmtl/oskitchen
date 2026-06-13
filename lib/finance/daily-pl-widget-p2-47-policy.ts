/**
 * Blueprint P2-47 — Daily P&L widget (R365 parity).
 *
 * Revenue today vs yesterday vs target
 *
 * @see docs/daily-pl-widget-p2-47.md
 */

export const DAILY_PL_WIDGET_P2_47_POLICY_ID = "daily-pl-widget-p2-47-v1" as const;

export const DAILY_PL_WIDGET_P2_47_DOC = "docs/daily-pl-widget-p2-47.md" as const;

export const DAILY_PL_WIDGET_P2_47_ARTIFACT = "artifacts/daily-pl-widget-p2-47-registry.json" as const;

export const DAILY_PL_WIDGET_P2_47_TODAY_ROUTE = "/dashboard/today" as const;

export const DAILY_PL_WIDGET_P2_47_PNL_ROUTE = "/dashboard/reports/financial/pnl" as const;

export const DAILY_PL_WIDGET_P2_47_STRIP = "components/finance/daily-pl-widget-strip.tsx" as const;

export const DAILY_PL_WIDGET_P2_47_SERVICE = "services/finance/daily-pl-widget-p2-47-service.ts" as const;

export const DAILY_PL_WIDGET_P2_47_STORAGE = "lib/finance/daily-pl-widget-p2-47-storage.ts" as const;

export const DAILY_PL_WIDGET_P2_47_TODAY_PAGE = "app/dashboard/today/page.tsx" as const;

export const DAILY_PL_WIDGET_P2_47_ROOT_TEST_ID = "daily-pl-widget-p2-47" as const;

export const DAILY_PL_WIDGET_P2_47_TODAY_TEST_ID = "daily-pl-revenue-today" as const;

export const DAILY_PL_WIDGET_P2_47_YESTERDAY_TEST_ID = "daily-pl-revenue-yesterday" as const;

export const DAILY_PL_WIDGET_P2_47_TARGET_TEST_ID = "daily-pl-revenue-target" as const;

export const DAILY_PL_WIDGET_P2_47_STORAGE_KEY = "dailyPlWidgetP2_47" as const;

export const DAILY_PL_WIDGET_P2_47_AUDIT_SCRIPT = "scripts/audit-daily-pl-widget-p2-47.ts" as const;

export const DAILY_PL_WIDGET_P2_47_NPM_SCRIPT = "audit:daily-pl-widget-p2-47" as const;

export const DAILY_PL_WIDGET_P2_47_CHECK_NPM_SCRIPT = "check:daily-pl-widget-p2-47" as const;

export const DAILY_PL_WIDGET_P2_47_UNIT_TEST = "tests/unit/daily-pl-widget-p2-47.test.ts" as const;

export const DAILY_PL_WIDGET_P2_47_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const DAILY_PL_WIDGET_P2_47_REVENUE_STATUSES = [
  "CONFIRMED",
  "PREPARING",
  "READY",
  "COMPLETED",
] as const;

export const DAILY_PL_WIDGET_P2_47_FLOW_STEPS = [
  "aggregate_revenue_today",
  "aggregate_revenue_yesterday",
  "resolve_daily_target",
  "render_pl_widget",
] as const;

export const DAILY_PL_WIDGET_P2_47_HONESTY_MARKERS = [
  "R365 parity",
  "directional",
  "not audited",
  "BETA",
] as const;

export const DAILY_PL_WIDGET_P2_47_WIRING_PATHS = [
  DAILY_PL_WIDGET_P2_47_DOC,
  "lib/finance/daily-pl-widget-p2-47-audit.ts",
  "lib/finance/daily-pl-widget-p2-47-measurement.ts",
  DAILY_PL_WIDGET_P2_47_STORAGE,
  DAILY_PL_WIDGET_P2_47_SERVICE,
  DAILY_PL_WIDGET_P2_47_STRIP,
  DAILY_PL_WIDGET_P2_47_UNIT_TEST,
  DAILY_PL_WIDGET_P2_47_ARTIFACT,
] as const;
