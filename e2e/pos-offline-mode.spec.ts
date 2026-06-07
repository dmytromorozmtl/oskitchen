import { expect, test } from "@playwright/test";

import {
  POS_OFFLINE_MODE_E2E_CONTRACT,
  POS_OFFLINE_MODE_E2E_PHASES,
} from "@/lib/pos/pos-offline-mode-e2e-policy";

import { skipOfflineModeQueueSyncIfNotAuthed } from "./helpers/offline-mode-queue-sync-ready";
import {
  getOfflineIndexedDbQueueSize,
  preparePosTerminalForOfflineMode,
  runOfflineCashSaleQueueAndSyncFlow,
} from "./helpers/pos-offline-mode";

/**
 * Absolute Final Task 52 — POS offline mode E2E.
 * Requires `chromium-authed` (see `playwright.config.ts`).
 */
test.describe("POS offline mode", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "POS offline mode E2E runs in chromium-authed project only",
    );
    skipOfflineModeQueueSyncIfNotAuthed();
  });

  test(`${POS_OFFLINE_MODE_E2E_PHASES[0]!.id} — shows offline connectivity label`, async ({
    page,
    context,
  }) => {
    await preparePosTerminalForOfflineMode(page);
    await page.getByTestId(POS_OFFLINE_MODE_E2E_CONTRACT.testIds.productTile).first().click();

    await context.setOffline(true);
    await expect(page.getByText(POS_OFFLINE_MODE_E2E_CONTRACT.connectivity.offline)).toBeVisible({
      timeout: 10_000,
    });
  });

  test(`${POS_OFFLINE_MODE_E2E_PHASES[1]!.id} — queues cash sale in IndexedDB`, async ({
    page,
    context,
  }) => {
    await preparePosTerminalForOfflineMode(page);
    await page.getByTestId(POS_OFFLINE_MODE_E2E_CONTRACT.testIds.productTile).first().click();

    await context.setOffline(true);
    await expect(page.getByText(POS_OFFLINE_MODE_E2E_CONTRACT.connectivity.offline)).toBeVisible({
      timeout: 10_000,
    });

    await page.getByTestId(POS_OFFLINE_MODE_E2E_CONTRACT.testIds.completeSale).click();
    const status = page.getByTestId(POS_OFFLINE_MODE_E2E_CONTRACT.testIds.checkoutStatus);
    await expect(status).toBeVisible({ timeout: 15_000 });
    await expect(status).toContainText(POS_OFFLINE_MODE_E2E_CONTRACT.statusPatterns.queued, {
      timeout: 15_000,
    });
    await expect(page.getByText(/\d+ queued sale\(s\)/)).toBeVisible();

    const queuedPeak = await getOfflineIndexedDbQueueSize(page);
    expect(queuedPeak).toBeGreaterThanOrEqual(1);
  });

  test(`${POS_OFFLINE_MODE_E2E_PHASES[2]!.id} — drains queue when back online`, async ({
    page,
    context,
  }) => {
    const { queuedPeak } = await runOfflineCashSaleQueueAndSyncFlow(page, context);
    expect(queuedPeak).toBeGreaterThanOrEqual(1);

    await expect
      .poll(async () => getOfflineIndexedDbQueueSize(page), { timeout: 30_000 })
      .toBe(0);
  });
});
