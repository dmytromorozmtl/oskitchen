/**
 * P2-66 — Labor forecasting AI: deep scheduling from demand signals (7shifts parity).
 *
 * @see docs/labor-forecasting-ai-p2-66.md
 */

export const LABOR_FORECASTING_AI_P2_66_POLICY_ID = "labor-forecasting-ai-p2-66-v1" as const;

export const LABOR_FORECASTING_AI_P2_66_DOC = "docs/labor-forecasting-ai-p2-66.md" as const;

export const LABOR_FORECASTING_AI_P2_66_ARTIFACT =
  "artifacts/labor-forecasting-ai-p2-66.json" as const;

export const LABOR_FORECASTING_AI_P2_66_PAGE =
  "app/dashboard/staff/ai-scheduling/page.tsx" as const;

export const LABOR_FORECASTING_AI_P2_66_PANEL =
  "components/dashboard/staff/ai-schedule-panel.tsx" as const;

export const LABOR_FORECASTING_AI_P2_66_BUILDER =
  "lib/labor/labor-forecasting-ai-p2-66-builder.ts" as const;

export const LABOR_FORECASTING_AI_P2_66_SERVICE =
  "services/forecast/labor-forecast-service.ts" as const;

export const LABOR_FORECASTING_AI_P2_66_SCHEDULING_SERVICE =
  "services/labor/ai-scheduling-service.ts" as const;

export const LABOR_FORECASTING_AI_P2_66_ACTION = "actions/labor/ai-scheduling.ts" as const;

export const LABOR_FORECASTING_AI_P2_66_CORPUS_MODULE =
  "lib/labor/labor-forecasting-ai-p2-66-corpus.ts" as const;

export const LABOR_FORECASTING_AI_P2_66_SCORING_MODULE =
  "lib/labor/labor-forecasting-ai-p2-66-scoring.ts" as const;

export const LABOR_FORECASTING_AI_P2_66_AUDIT_MODULE =
  "lib/labor/labor-forecasting-ai-p2-66-audit.ts" as const;

export const LABOR_FORECASTING_AI_P2_66_ROUTE = "/dashboard/staff/ai-scheduling" as const;

export const LABOR_FORECASTING_AI_P2_66_PANEL_TEST_ID = "labor-forecast-panel" as const;

export const LABOR_FORECASTING_AI_P2_66_SUMMARY_TEST_ID = "labor-forecast-summary" as const;

export const LABOR_FORECASTING_AI_P2_66_DEMAND_TABLE_TEST_ID = "labor-forecast-demand-table" as const;

export const LABOR_FORECASTING_AI_P2_66_SCENARIO_COUNT = 12 as const;

export const LABOR_FORECASTING_AI_P2_66_MIN_CAPABILITY_COVERAGE_PCT = 100 as const;

export const LABOR_FORECASTING_AI_P2_66_CHECK_NPM_SCRIPT =
  "check:labor-forecasting-ai-p2-66" as const;

export const LABOR_FORECASTING_AI_P2_66_CI_NPM_SCRIPT =
  "test:ci:labor-forecasting-ai-p2-66" as const;

export const LABOR_FORECASTING_AI_P2_66_UNIT_TEST =
  "tests/unit/labor-forecasting-ai-p2-66.test.ts" as const;

export const LABOR_FORECASTING_AI_P2_66_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const LABOR_FORECASTING_AI_P2_66_FLOW_STEPS = [
  "demand-by-dow",
  "headcount-recommendation",
  "labor-cost-projection",
  "shift-suggestions",
] as const;

export const LABOR_FORECASTING_AI_P2_66_FORECASTING_CAPABILITIES = [
  "demand_by_dow",
  "headcount_recommendation",
  "labor_cost_projection",
  "shift_window_suggestion",
  "labor_pct_target",
  "confidence_scoring",
  "apply_to_schedule",
] as const;

export type LaborForecastingCapability =
  (typeof LABOR_FORECASTING_AI_P2_66_FORECASTING_CAPABILITIES)[number];

export const LABOR_FORECASTING_AI_P2_66_SEVENSHIFTS_PARITY_NOTE =
  "Deep scheduling AI from order-demand signals — headcount, labor %, and shift drafts comparable to 7shifts forecasting, without claiming certified parity." as const;

export const LABOR_FORECASTING_AI_P2_66_WIRING_PATHS = [
  LABOR_FORECASTING_AI_P2_66_DOC,
  LABOR_FORECASTING_AI_P2_66_ARTIFACT,
  LABOR_FORECASTING_AI_P2_66_CORPUS_MODULE,
  LABOR_FORECASTING_AI_P2_66_SCORING_MODULE,
  LABOR_FORECASTING_AI_P2_66_AUDIT_MODULE,
  LABOR_FORECASTING_AI_P2_66_BUILDER,
  LABOR_FORECASTING_AI_P2_66_SERVICE,
  LABOR_FORECASTING_AI_P2_66_SCHEDULING_SERVICE,
  LABOR_FORECASTING_AI_P2_66_ACTION,
  LABOR_FORECASTING_AI_P2_66_PAGE,
  LABOR_FORECASTING_AI_P2_66_PANEL,
  LABOR_FORECASTING_AI_P2_66_UNIT_TEST,
  LABOR_FORECASTING_AI_P2_66_CI_WORKFLOW,
] as const;
