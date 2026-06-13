import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  OFFLINE_POS_PCI_FLOW_E2E_AUDIT_SCRIPT,
  OFFLINE_POS_PCI_FLOW_E2E_FLOW_HELPER,
  OFFLINE_POS_PCI_FLOW_E2E_FLOW_STEPS,
  OFFLINE_POS_PCI_FLOW_E2E_NPM_SCRIPT,
  OFFLINE_POS_PCI_FLOW_E2E_POLICY_ID,
  OFFLINE_POS_PCI_FLOW_E2E_READY_HELPER,
  OFFLINE_POS_PCI_FLOW_E2E_SPEC,
  OFFLINE_POS_PCI_FLOW_E2E_UNIT_TEST,
  POS_TERMINAL_PATH,
} from "@/lib/qa/offline-pos-pci-flow-e2e-policy";

export type OfflinePosPciFlowE2EAuditSummary = {
  policyId: typeof OFFLINE_POS_PCI_FLOW_E2E_POLICY_ID;
  specPresent: boolean;
  flowHelperPresent: boolean;
  readyHelperPresent: boolean;
  reconnectSyncWired: boolean;
  noopV1ScoringWired: boolean;
  posTerminalPagePresent: boolean;
  flowStepCount: number;
  passed: boolean;
};

export function auditOfflinePosPciFlowE2E(
  root = process.cwd(),
): OfflinePosPciFlowE2EAuditSummary {
  const specPath = join(root, OFFLINE_POS_PCI_FLOW_E2E_SPEC);
  const flowPath = join(root, OFFLINE_POS_PCI_FLOW_E2E_FLOW_HELPER);
  const readyPath = join(root, OFFLINE_POS_PCI_FLOW_E2E_READY_HELPER);
  const reconnectFlowPath = join(root, "e2e/helpers/offline-pos-reconnect-sync-flow.ts");
  const scoringPath = join(root, "lib/qa/offline-pos-pci-flow-e2e-scoring.ts");
  const posTerminalPagePath = join(root, "app/dashboard/pos/terminal/page.tsx");

  const specPresent = existsSync(specPath);
  const flowHelperPresent = existsSync(flowPath);
  const readyHelperPresent = existsSync(readyPath);
  const posTerminalPagePresent = existsSync(posTerminalPagePath);

  let reconnectSyncWired = false;
  if (existsSync(reconnectFlowPath) && flowHelperPresent) {
    const flowSource = readFileSync(flowPath, "utf8");
    reconnectSyncWired =
      flowSource.includes("runOfflinePosReconnectSyncFlow") ||
      (flowSource.includes("setOffline(true)") &&
        flowSource.includes("setOffline(false)") &&
        flowSource.includes("getOfflineIndexedDbQueueSize"));
  }

  let noopV1ScoringWired = false;
  if (existsSync(scoringPath) && flowHelperPresent) {
    const flowSource = readFileSync(flowPath, "utf8");
    const scoringSource = readFileSync(scoringPath, "utf8");
    noopV1ScoringWired =
      flowSource.includes("runOfflinePosPciNoopV1ContractChecks") &&
      flowSource.includes("verify_noop_v1_pci") &&
      scoringSource.includes("auditOfflinePosPciEncryptionHardening");
  }

  const specReferencesPolicy =
    specPresent &&
    (readFileSync(specPath, "utf8").includes(OFFLINE_POS_PCI_FLOW_E2E_POLICY_ID) ||
      readFileSync(specPath, "utf8").includes("OFFLINE_POS_PCI_FLOW_E2E_POLICY_ID"));

  const passed =
    specPresent &&
    flowHelperPresent &&
    readyHelperPresent &&
    posTerminalPagePresent &&
    reconnectSyncWired &&
    noopV1ScoringWired &&
    specReferencesPolicy &&
    OFFLINE_POS_PCI_FLOW_E2E_FLOW_STEPS.length === 5;

  return {
    policyId: OFFLINE_POS_PCI_FLOW_E2E_POLICY_ID,
    specPresent,
    flowHelperPresent,
    readyHelperPresent,
    reconnectSyncWired,
    noopV1ScoringWired,
    posTerminalPagePresent,
    flowStepCount: OFFLINE_POS_PCI_FLOW_E2E_FLOW_STEPS.length,
    passed,
  };
}

export function formatOfflinePosPciFlowAuditLines(
  summary: OfflinePosPciFlowE2EAuditSummary,
): string[] {
  return [
    `Offline POS PCI flow E2E audit (${summary.policyId})`,
    `Spec: ${summary.specPresent ? "present" : "missing"} (${OFFLINE_POS_PCI_FLOW_E2E_SPEC})`,
    `Flow helper: ${summary.flowHelperPresent ? "present" : "missing"}`,
    `Ready helper: ${summary.readyHelperPresent ? "present" : "missing"}`,
    `Reconnect sync wired: ${summary.reconnectSyncWired ? "yes" : "no"}`,
    `noop-v1 PCI scoring wired: ${summary.noopV1ScoringWired ? "yes" : "no"}`,
    `POS terminal page: ${summary.posTerminalPagePresent ? "present" : "missing"}`,
    `Terminal path: ${POS_TERMINAL_PATH}`,
    `Flow steps: ${summary.flowStepCount}`,
    `Unit test: ${OFFLINE_POS_PCI_FLOW_E2E_UNIT_TEST}`,
    `Audit script: ${OFFLINE_POS_PCI_FLOW_E2E_AUDIT_SCRIPT}`,
    `NPM script: ${OFFLINE_POS_PCI_FLOW_E2E_NPM_SCRIPT}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
