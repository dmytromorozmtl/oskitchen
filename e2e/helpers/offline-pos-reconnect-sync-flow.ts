import { expect, test, type BrowserContext, type Page } from "@playwright/test";

import {
  OFFLINE_CONNECTIVITY_LABEL,
  OFFLINE_PLAN_BLOCKED_PATTERN,
  OFFLINE_POS_RECONNECT_SYNC_FLOW_STEPS,
  OFFLINE_POS_RECONNECT_SYNC_VISIBLE_MS,
  OFFLINE_QUEUED_STATUS_PATTERN,
  OFFLINE_SYNC_SUCCESS_PATTERN,
  ONLINE_CONNECTIVITY_LABEL,
  POS_CHECKOUT_STATUS_TESTID,
  POS_COMPLETE_SALE_TESTID,
  POS_PRODUCT_TILE_TESTID,
  type OfflinePosReconnectSyncFlowStep,
} from "@/lib/qa/offline-pos-reconnect-sync-e2e-policy";

import {
  getOfflineIndexedDbQueueSize,
  preparePosTerminalForOfflineSync,
} from "./offline-mode-queue-sync-flow";

export type OfflinePosReconnectSyncFlowResult = {
  queuedPeak: number;
  steps: OfflinePosReconnectSyncFlowStep[];
};

export async function runOfflinePosReconnectSyncFlow(
  page: Page,
  context: BrowserContext,
): Promise<OfflinePosReconnectSyncFlowResult> {
  const steps: OfflinePosReconnectSyncFlowStep[] = [];

  await preparePosTerminalForOfflineSync(page);
  await page.getByTestId(POS_PRODUCT_TILE_TESTID).first().click();

  await context.setOffline(true);
  await expect(page.getByText(OFFLINE_CONNECTIVITY_LABEL)).toBeVisible({
    timeout: 10_000,
  });
  steps.push("go_offline");

  await page.getByTestId(POS_COMPLETE_SALE_TESTID).click();
  const status = page.getByTestId(POS_CHECKOUT_STATUS_TESTID);
  await expect(status).toBeVisible({ timeout: 15_000 });
  await expect(status).toContainText(OFFLINE_QUEUED_STATUS_PATTERN, {
    timeout: 15_000,
  });
  await expect(page.getByText(/\d+ queued sale\(s\)/)).toBeVisible();
  const queuedPeak = await getOfflineIndexedDbQueueSize(page);
  expect(queuedPeak).toBeGreaterThanOrEqual(1);
  steps.push("queue_sale");

  await context.setOffline(false);
  await expect(page.getByText(ONLINE_CONNECTIVITY_LABEL, { exact: true })).toBeVisible({
    timeout: 10_000,
  });
  steps.push("reconnect_online");

  await expect(status).toContainText(OFFLINE_SYNC_SUCCESS_PATTERN, {
    timeout: OFFLINE_POS_RECONNECT_SYNC_VISIBLE_MS,
  });

  const statusText = (await status.textContent()) ?? "";
  if (OFFLINE_PLAN_BLOCKED_PATTERN.test(statusText)) {
    test.skip(true, "POS terminal not entitled — offline queue persisted but sync blocked by plan.");
  }

  await expect
    .poll(async () => getOfflineIndexedDbQueueSize(page), { timeout: 30_000 })
    .toBe(0);
  steps.push("sync_drain");

  if (steps.length !== OFFLINE_POS_RECONNECT_SYNC_FLOW_STEPS.length) {
    throw new Error(`Flow step mismatch: ${steps.join(" → ")}`);
  }

  return { queuedPeak, steps };
}
