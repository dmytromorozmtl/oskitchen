import {
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_CLS_MAX,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_FCP_MAX_MS,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_FLOW_STEPS,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_LCP_MAX_MS,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_PATHS,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_TBT_MAX_MS,
} from "@/lib/qa/maintenance-mode-panel-perf-budget-p2-53-policy";
import { validateMaintenanceModePanelPerfBudgetContract } from "@/lib/qa/maintenance-mode-panel-perf-budget-measurement";

export function listMaintenanceModePanelPerfBudgetPaths(): readonly string[] {
  return MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_PATHS;
}

export function runMaintenanceModePanelPerfBudgetContractStep(root = process.cwd()) {
  const contract = validateMaintenanceModePanelPerfBudgetContract(root);
  return {
    passed: contract.passed,
    contract,
    paths: [...MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_PATHS],
    thresholds: {
      fcpMaxMs: MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_FCP_MAX_MS,
      lcpMaxMs: MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_LCP_MAX_MS,
      clsMax: MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_CLS_MAX,
      tbtMaxMs: MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_TBT_MAX_MS,
    },
  };
}

export function runMaintenanceModePanelPerfBudgetPolicyFlow(root = process.cwd()) {
  const contract = runMaintenanceModePanelPerfBudgetContractStep(root);
  return {
    steps: [...MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_FLOW_STEPS],
    contract,
    passed: contract.passed,
  };
}
