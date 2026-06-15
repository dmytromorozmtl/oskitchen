/**
 * Offline queue sync metrics for QA-31 E2E contract proof.
 */

import {
  type OfflineQueueSyncContract,
  isOfflineQueueDrained,
  offlineQueueSyncSucceeded,
} from "@/lib/pos/offline-mode-queue-sync-e2e-policy";

export type OfflineQueueSyncSummary = OfflineQueueSyncContract & {
  drained: boolean;
  succeeded: boolean;
  conflictDetected: boolean;
};

export function summarizeOfflineQueueSync(contract: OfflineQueueSyncContract): OfflineQueueSyncSummary {
  return {
    ...contract,
    drained: isOfflineQueueDrained(contract),
    succeeded: offlineQueueSyncSucceeded(contract),
    conflictDetected: contract.tableConflictCount > 0,
  };
}

export function offlineQueueSyncWithinContract(contract: OfflineQueueSyncContract): boolean {
  return summarizeOfflineQueueSync(contract).succeeded;
}
