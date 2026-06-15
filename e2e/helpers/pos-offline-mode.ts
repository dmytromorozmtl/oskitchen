/**
 * Absolute Final Task 52 — POS offline mode E2E helpers.
 *
 * @see e2e/helpers/offline-mode-queue-sync-flow.ts
 */

export {
  getOfflineIndexedDbQueueSize,
  preparePosTerminalForOfflineSync as preparePosTerminalForOfflineMode,
  runOfflineCashSaleQueueAndSyncFlow,
} from "./offline-mode-queue-sync-flow";
