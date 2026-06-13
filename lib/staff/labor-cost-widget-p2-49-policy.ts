/**
 * Blueprint P2-49 — Labor cost % widget (7shifts parity).
 *
 * Real-time labor / revenue on Today
 *
 * @see docs/labor-cost-widget-p2-49.md
 */

export const LABOR_COST_WIDGET_P2_49_POLICY_ID = "labor-cost-widget-p2-49-v1" as const;

export const LABOR_COST_WIDGET_P2_49_DOC = "docs/labor-cost-widget-p2-49.md" as const;

export const LABOR_COST_WIDGET_P2_49_ARTIFACT =
  "artifacts/labor-cost-widget-p2-49-registry.json" as const;

export const LABOR_COST_WIDGET_P2_49_TODAY_ROUTE = "/dashboard/today" as const;

export const LABOR_COST_WIDGET_P2_49_LABOR_ROUTE = "/dashboard/staff/labor-realtime" as const;

export const LABOR_COST_WIDGET_P2_49_STRIP = "components/staff/labor-cost-widget-strip.tsx" as const;

export const LABOR_COST_WIDGET_P2_49_SERVICE =
  "services/staff/labor-cost-widget-p2-49-service.ts" as const;

export const LABOR_COST_WIDGET_P2_49_STORAGE = "lib/staff/labor-cost-widget-p2-49-storage.ts" as const;

export const LABOR_COST_WIDGET_P2_49_TODAY_PAGE = "app/dashboard/today/page.tsx" as const;

export const LABOR_COST_WIDGET_P2_49_ROOT_TEST_ID = "labor-cost-widget-p2-49" as const;

export const LABOR_COST_WIDGET_P2_49_PERCENT_TEST_ID = "labor-cost-percent" as const;

export const LABOR_COST_WIDGET_P2_49_REVENUE_TEST_ID = "labor-cost-revenue" as const;

export const LABOR_COST_WIDGET_P2_49_TARGET_TEST_ID = "labor-cost-target" as const;

export const LABOR_COST_WIDGET_P2_49_STORAGE_KEY = "laborCostWidgetP2_49" as const;

export const LABOR_COST_WIDGET_P2_49_DEFAULT_TARGET_PCT = 30 as const;

export const LABOR_COST_WIDGET_P2_49_AUDIT_SCRIPT = "scripts/audit-labor-cost-widget-p2-49.ts" as const;

export const LABOR_COST_WIDGET_P2_49_NPM_SCRIPT = "audit:labor-cost-widget-p2-49" as const;

export const LABOR_COST_WIDGET_P2_49_CHECK_NPM_SCRIPT = "check:labor-cost-widget-p2-49" as const;

export const LABOR_COST_WIDGET_P2_49_UNIT_TEST = "tests/unit/labor-cost-widget-p2-49.test.ts" as const;

export const LABOR_COST_WIDGET_P2_49_CI_WORKFLOW = ".github/workflows/deploy-prod-gate.yml" as const;

export const LABOR_COST_WIDGET_P2_49_FLOW_STEPS = [
  "aggregate_labor_hours_today",
  "aggregate_revenue_today",
  "compute_labor_percent",
  "render_labor_widget",
] as const;

export const LABOR_COST_WIDGET_P2_49_HONESTY_MARKERS = [
  "7shifts parity",
  "real-time",
  "directional",
  "BETA",
] as const;

export const LABOR_COST_WIDGET_P2_49_WIRING_PATHS = [
  LABOR_COST_WIDGET_P2_49_DOC,
  "lib/staff/labor-cost-widget-p2-49-audit.ts",
  "lib/staff/labor-cost-widget-p2-49-measurement.ts",
  LABOR_COST_WIDGET_P2_49_STORAGE,
  LABOR_COST_WIDGET_P2_49_SERVICE,
  LABOR_COST_WIDGET_P2_49_STRIP,
  LABOR_COST_WIDGET_P2_49_UNIT_TEST,
  LABOR_COST_WIDGET_P2_49_ARTIFACT,
] as const;
