import { test } from "@playwright/test";

import { runOfflineCashSaleQueueAndSyncFlow } from "./helpers/offline-mode-queue-sync-flow";

/**
 * Staging POS offline queue E2E (chromium-authed): offline cash sale → IndexedDB queue
 * → online → server sync via `posCheckoutAction`.
 *
 * @see e2e/offline-mode-queue-sync.spec.ts — QA-31 policy + helpers
 * @see lib/pos/offline-pos-queue.ts
 * @see docs/POS_OFFLINE_MODE.md
 */

test.describe("POS offline queue staging", () => {
  test("offline cash sale queues then syncs when back online", async ({ page, context }) => {
    await runOfflineCashSaleQueueAndSyncFlow(page, context);
  });
});
