import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_ARTIFACT,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_CLS_MAX,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_CONFIG,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_DOC,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_E2E_FLOW_HELPER,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_E2E_SPEC,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_FCP_MAX_MS,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_FLOW_STEPS,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_LCP_MAX_MS,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_MEASUREMENT_MODULE,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_PATHS,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_POLICY_ID,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_TBT_MAX_MS,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_TEST_ID,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_UNIT_TEST,
  MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_WIRING_PATHS,
} from "@/lib/qa/maintenance-mode-panel-perf-budget-p2-53-policy";
import { validateMaintenanceModePanelPerfBudgetContract } from "@/lib/qa/maintenance-mode-panel-perf-budget-measurement";

export type MaintenanceModePanelPerfBudgetP253AuditSummary = {
  policyId: typeof MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  specWired: boolean;
  flowWired: boolean;
  contractValid: boolean;
  panelTestIdWired: boolean;
  platformSectionsLazyLoaded: boolean;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditMaintenanceModePanelPerfBudgetP253(
  root = process.cwd(),
): MaintenanceModePanelPerfBudgetP253AuditSummary {
  const wiringComplete = MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_DOC))) {
    const source = readFileSync(join(root, MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_DOC), "utf8");
    docWired =
      source.includes(MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_POLICY_ID) &&
      source.includes("FCP") &&
      source.includes("LCP") &&
      source.includes("TBT");
  }

  let specWired = false;
  if (existsSync(join(root, MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_E2E_SPEC))) {
    const source = readFileSync(join(root, MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_E2E_SPEC), "utf8");
    specWired =
      source.includes(MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_POLICY_ID) &&
      source.includes("runMaintenanceModePanelPerfBudgetContractStep");
  }

  let flowWired = false;
  if (existsSync(join(root, MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_E2E_FLOW_HELPER))) {
    const source = readFileSync(
      join(root, MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_E2E_FLOW_HELPER),
      "utf8",
    );
    flowWired =
      source.includes("runMaintenanceModePanelPerfBudgetContractStep") &&
      source.includes(MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_TEST_ID);
  }

  const contract = validateMaintenanceModePanelPerfBudgetContract(root);

  let artifactPresent = false;
  const artifactPath = join(root, MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_ARTIFACT);
  if (existsSync(artifactPath)) {
    const artifact = JSON.parse(readFileSync(artifactPath, "utf8")) as {
      policyId?: string;
      paths?: string[];
      flowSteps?: string[];
    };
    artifactPresent =
      artifact.policyId === MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_POLICY_ID &&
      JSON.stringify(artifact.paths) ===
        JSON.stringify([...MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_PATHS]) &&
      JSON.stringify(artifact.flowSteps) ===
        JSON.stringify([...MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_FLOW_STEPS]);
  }

  const passed =
    wiringComplete &&
    docWired &&
    specWired &&
    flowWired &&
    contract.passed &&
    artifactPresent &&
    existsSync(join(root, MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_MEASUREMENT_MODULE)) &&
    existsSync(join(root, MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_UNIT_TEST)) &&
    existsSync(join(root, MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_CONFIG)) &&
    MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_FCP_MAX_MS === 2500 &&
    MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_LCP_MAX_MS === 4000 &&
    MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_CLS_MAX === 0.1 &&
    MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_TBT_MAX_MS === 350;

  return {
    policyId: MAINTENANCE_MODE_PANEL_PERF_BUDGET_P2_53_POLICY_ID,
    wiringComplete,
    docWired,
    specWired,
    flowWired,
    contractValid: contract.passed,
    panelTestIdWired: contract.panelTestIdWired,
    platformSectionsLazyLoaded: contract.platformSectionsLazyLoaded,
    artifactPresent,
    passed,
  };
}

export function formatMaintenanceModePanelPerfBudgetP253AuditLines(
  summary: MaintenanceModePanelPerfBudgetP253AuditSummary,
): string[] {
  return [
    `Maintenance mode panel perf budget (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc wired: ${summary.docWired ? "yes" : "no"}`,
    `E2E spec: ${summary.specWired ? "yes" : "no"}`,
    `Flow helper: ${summary.flowWired ? "yes" : "no"}`,
    `Contract valid: ${summary.contractValid ? "yes" : "no"}`,
    `Panel test id: ${summary.panelTestIdWired ? "yes" : "no"}`,
    `Platform sections lazy: ${summary.platformSectionsLazyLoaded ? "yes" : "no"}`,
    `Artifact present: ${summary.artifactPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
