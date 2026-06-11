import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  OFFLINE_POS_RECONNECT_SYNC_AUDIT_SCRIPT,
  OFFLINE_POS_RECONNECT_SYNC_E2E_POLICY_ID,
  OFFLINE_POS_RECONNECT_SYNC_E2E_SPEC,
  OFFLINE_POS_RECONNECT_SYNC_FLOW_HELPER,
  OFFLINE_POS_RECONNECT_SYNC_FLOW_STEPS,
  OFFLINE_POS_RECONNECT_SYNC_NPM_SCRIPT,
  OFFLINE_POS_RECONNECT_SYNC_READY_HELPER,
  OFFLINE_POS_RECONNECT_SYNC_UNIT_TEST,
  POS_TERMINAL_PATH,
} from "@/lib/qa/offline-pos-reconnect-sync-e2e-policy";

export type OfflinePosReconnectSyncE2EAuditSummary = {
  policyId: typeof OFFLINE_POS_RECONNECT_SYNC_E2E_POLICY_ID;
  specPresent: boolean;
  flowHelperPresent: boolean;
  readyHelperPresent: boolean;
  offlineQueueFlowWired: boolean;
  posTerminalPagePresent: boolean;
  flowStepCount: number;
  passed: boolean;
};

export function auditOfflinePosReconnectSyncE2E(
  root = process.cwd(),
): OfflinePosReconnectSyncE2EAuditSummary {
  const specPath = join(root, OFFLINE_POS_RECONNECT_SYNC_E2E_SPEC);
  const flowPath = join(root, OFFLINE_POS_RECONNECT_SYNC_FLOW_HELPER);
  const readyPath = join(root, OFFLINE_POS_RECONNECT_SYNC_READY_HELPER);
  const queueFlowPath = join(root, "e2e/helpers/offline-mode-queue-sync-flow.ts");
  const posTerminalPagePath = join(root, "app/dashboard/pos/terminal/page.tsx");

  const specPresent = existsSync(specPath);
  const flowHelperPresent = existsSync(flowPath);
  const readyHelperPresent = existsSync(readyPath);
  const posTerminalPagePresent = existsSync(posTerminalPagePath);

  let offlineQueueFlowWired = false;
  if (existsSync(queueFlowPath)) {
    const source = readFileSync(queueFlowPath, "utf8");
    offlineQueueFlowWired =
      source.includes("setOffline(true)") &&
      source.includes("setOffline(false)") &&
      source.includes("getOfflineIndexedDbQueueSize") &&
      (source.includes("POS_PRODUCT_TILE_TESTID") || source.includes("pos-product-tile"));
  }

  const specReferencesPolicy =
    specPresent &&
    (readFileSync(specPath, "utf8").includes(OFFLINE_POS_RECONNECT_SYNC_E2E_POLICY_ID) ||
      readFileSync(specPath, "utf8").includes("OFFLINE_POS_RECONNECT_SYNC_E2E_POLICY_ID"));
  const flowReferencesOffline =
    flowHelperPresent &&
    (readFileSync(flowPath, "utf8").includes("go_offline") ||
      readFileSync(flowPath, "utf8").includes("setOffline"));
  const flowReferencesSync =
    flowHelperPresent &&
    (readFileSync(flowPath, "utf8").includes("sync_drain") ||
      readFileSync(flowPath, "utf8").includes("getOfflineIndexedDbQueueSize"));

  const passed =
    specPresent &&
    flowHelperPresent &&
    readyHelperPresent &&
    posTerminalPagePresent &&
    offlineQueueFlowWired &&
    specReferencesPolicy &&
    flowReferencesOffline &&
    flowReferencesSync &&
    OFFLINE_POS_RECONNECT_SYNC_FLOW_STEPS.length >= 4;

  return {
    policyId: OFFLINE_POS_RECONNECT_SYNC_E2E_POLICY_ID,
    specPresent,
    flowHelperPresent,
    readyHelperPresent,
    offlineQueueFlowWired,
    posTerminalPagePresent,
    flowStepCount: OFFLINE_POS_RECONNECT_SYNC_FLOW_STEPS.length,
    passed,
  };
}

export function formatOfflinePosReconnectSyncAuditLines(
  summary: OfflinePosReconnectSyncE2EAuditSummary,
): string[] {
  return [
    `Offline POS → reconnect → sync E2E audit (${summary.policyId})`,
    `Spec: ${summary.specPresent ? "present" : "missing"} (${OFFLINE_POS_RECONNECT_SYNC_E2E_SPEC})`,
    `Flow helper: ${summary.flowHelperPresent ? "present" : "missing"}`,
    `Ready helper: ${summary.readyHelperPresent ? "present" : "missing"}`,
    `Offline queue flow wired: ${summary.offlineQueueFlowWired ? "yes" : "no"}`,
    `POS terminal page: ${summary.posTerminalPagePresent ? "present" : "missing"}`,
    `Terminal path: ${POS_TERMINAL_PATH}`,
    `Flow steps: ${summary.flowStepCount}`,
    `Unit test: ${OFFLINE_POS_RECONNECT_SYNC_UNIT_TEST}`,
    `Audit script: ${OFFLINE_POS_RECONNECT_SYNC_AUDIT_SCRIPT}`,
    `NPM script: ${OFFLINE_POS_RECONNECT_SYNC_NPM_SCRIPT}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
