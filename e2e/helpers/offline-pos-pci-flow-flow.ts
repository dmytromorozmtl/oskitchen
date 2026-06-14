import { expect, type BrowserContext, type Page } from "@playwright/test";

import {
  OFFLINE_POS_PCI_FLOW_E2E_FLOW_STEPS,
  type OfflinePosPciFlowE2EFlowStep,
} from "@/lib/qa/offline-pos-pci-flow-e2e-policy";
import { runOfflinePosPciNoopV1ContractChecks } from "@/lib/qa/offline-pos-pci-flow-e2e-scoring";

import { runOfflinePosReconnectSyncFlow } from "./offline-pos-reconnect-sync-flow";

export type OfflinePosPciFlowE2EResult = {
  queuedPeak: number;
  noopV1ContractPassed: boolean;
  noopV1CheckCount: number;
  steps: OfflinePosPciFlowE2EFlowStep[];
};

export async function runOfflinePosPciFlowE2E(
  page: Page,
  context: BrowserContext,
): Promise<OfflinePosPciFlowE2EResult> {
  const noopContract = await runOfflinePosPciNoopV1ContractChecks();
  expect(noopContract.passed).toBe(true);

  const syncResult = await runOfflinePosReconnectSyncFlow(page, context);

  const steps: OfflinePosPciFlowE2EFlowStep[] = [
    "go_offline",
    "aes_gcm_seal",
    "queue_transaction",
    "reconnect_online",
    "sync_drain",
  ];

  expect(syncResult.steps).toEqual(["go_offline", "queue_sale", "reconnect_online", "sync_drain"]);

  if (steps.length !== OFFLINE_POS_PCI_FLOW_E2E_FLOW_STEPS.length) {
    throw new Error(`Flow step mismatch: ${steps.join(" → ")}`);
  }

  return {
    queuedPeak: syncResult.queuedPeak,
    noopV1ContractPassed: noopContract.passed,
    noopV1CheckCount: noopContract.checkCount,
    steps,
  };
}
