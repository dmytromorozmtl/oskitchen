/**
 * P2-53 — Maintenance mode panel Lighthouse perf budget.
 *
 * @see lighthouserc.maintenance-mode-panel.cjs
 * @see docs/maintenance-mode-panel-perf-budget-p2-53.md
 */

import {
  MAINTENANCE_MODE_PANEL_CLS_MAX,
  MAINTENANCE_MODE_PANEL_COMPONENT_PATH,
  MAINTENANCE_MODE_PANEL_FCP_MAX_MS,
  MAINTENANCE_MODE_PANEL_LCP_MAX_MS,
  MAINTENANCE_MODE_PANEL_LHCI_CONFIG_PATH,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_POLICY_ID,
  MAINTENANCE_MODE_PANEL_PERF_PATHS,
  MAINTENANCE_MODE_PANEL_PERFORMANCE_MIN_SCORE,
  MAINTENANCE_MODE_PANEL_TBT_MAX_MS,
  MAINTENANCE_MODE_PANEL_TEST_ID,
} from "@/lib/performance/maintenance-mode-panel-perf-budget-policy";

export const MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_POLICY_ID =
  "maintenance-mode-panel-perf-budget-p2-53-v1" as const;

export const MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_DOC =
  "docs/maintenance-mode-panel-perf-budget-p2-53.md" as const;

export const MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_ARTIFACT =
  "artifacts/maintenance-mode-panel-perf-budget-p2-53.json" as const;

export const MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_AUDIT_MODULE =
  "lib/qa/maintenance-mode-panel-perf-budget-p2-53-audit.ts" as const;

export const MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_MEASUREMENT_MODULE =
  "lib/qa/maintenance-mode-panel-perf-budget-measurement.ts" as const;

export const MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_CHECK_NPM_SCRIPT =
  "check:maintenance-mode-panel-perf-budget-p2-53" as const;

export const MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_CI_NPM_SCRIPT =
  "test:ci:maintenance-mode-panel-perf-budget-p2-53" as const;

export const MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_LHCI_NPM_SCRIPT =
  "lighthouse:maintenance-mode-panel" as const;

export const MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_UNIT_TEST =
  "tests/unit/maintenance-mode-panel-perf-budget-p2-53.test.ts" as const;

export const MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_E2E_SPEC =
  "e2e/maintenance-mode-panel-perf-budget.spec.ts" as const;

export const MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_E2E_FLOW_HELPER =
  "e2e/helpers/maintenance-mode-panel-perf-budget-flow.ts" as const;

export const MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_CI_WORKFLOW =
  ".github/workflows/ci.yml" as const;

export const MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_UPSTREAM_POLICY_ID =
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_POLICY_ID;

export const MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_CONFIG =
  MAINTENANCE_MODE_PANEL_LHCI_CONFIG_PATH;

export const MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_PATHS =
  MAINTENANCE_MODE_PANEL_PERF_PATHS;

export const MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_FCP_MAX_MS =
  MAINTENANCE_MODE_PANEL_FCP_MAX_MS;

export const MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_LCP_MAX_MS =
  MAINTENANCE_MODE_PANEL_LCP_MAX_MS;

export const MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_CLS_MAX =
  MAINTENANCE_MODE_PANEL_CLS_MAX;

export const MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_TBT_MAX_MS =
  MAINTENANCE_MODE_PANEL_TBT_MAX_MS;

export const MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_PERFORMANCE_MIN_SCORE =
  MAINTENANCE_MODE_PANEL_PERFORMANCE_MIN_SCORE;

export const MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_TEST_ID =
  MAINTENANCE_MODE_PANEL_TEST_ID;

export const MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_FLOW_STEPS = [
  "validate_lhci_config",
  "assert_panel_component_wiring",
  "assert_fcp_lcp_cls_tbt_thresholds",
  "verify_ci_gate",
] as const;

export const MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_WIRING_PATHS = [
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_DOC,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_ARTIFACT,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_AUDIT_MODULE,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_MEASUREMENT_MODULE,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_UNIT_TEST,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_E2E_SPEC,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_E2E_FLOW_HELPER,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_CI_WORKFLOW,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_CONFIG,
  "lib/performance/maintenance-mode-panel-perf-budget-policy.ts",
  MAINTENANCE_MODE_PANEL_COMPONENT_PATH,
  "components/dashboard/maintenance/platform/maintenance-platform-sections.tsx",
] as const;

export function isMaintenanceModePanelPerfBudgetE2EEnabled(): boolean {
  return process.env.E2E_MAINTENANCE_MODE_PANEL_PERF?.trim() === "true";
}
