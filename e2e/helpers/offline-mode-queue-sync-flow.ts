import { expect, test, type BrowserContext, type Page } from "@playwright/test";

import {
  OFFLINE_CONNECTIVITY_LABEL,
  OFFLINE_PLAN_BLOCKED_PATTERN,
  OFFLINE_POS_INDEXED_DB_NAME,
  OFFLINE_POS_INDEXED_DB_STORE,
  OFFLINE_QUEUED_STATUS_PATTERN,
  OFFLINE_SYNC_SUCCESS_PATTERN,
  ONLINE_CONNECTIVITY_LABEL,
  POS_CHECKOUT_STATUS_TESTID,
  POS_COMPLETE_SALE_TESTID,
  POS_PRODUCT_TILE_TESTID,
  POS_TERMINAL_PATH,
} from "@/lib/pos/offline-mode-queue-sync-e2e-policy";

export async function getOfflineIndexedDbQueueSize(page: Page): Promise<number> {
  return page.evaluate(
    async ({ dbName, storeName }) => {
      return new Promise<number>((resolve, reject) => {
        const request = indexedDB.open(dbName);
        request.onerror = () => reject(request.error);
        request.onsuccess = () => {
          const db = request.result;
          if (!db.objectStoreNames.contains(storeName)) {
            db.close();
            resolve(0);
            return;
          }
          const tx = db.transaction(storeName, "readonly");
          const getAll = tx.objectStore(storeName).getAll();
          getAll.onerror = () => reject(getAll.error);
          getAll.onsuccess = () => {
            db.close();
            resolve((getAll.result as unknown[]).length);
          };
        };
      });
    },
    { dbName: OFFLINE_POS_INDEXED_DB_NAME, storeName: OFFLINE_POS_INDEXED_DB_STORE },
  );
}

export async function preparePosTerminalForOfflineSync(page: Page): Promise<void> {
  await page.goto(POS_TERMINAL_PATH);

  if (await page.getByRole("link", { name: /add register/i }).isVisible().catch(() => false)) {
    test.skip(true, "No POS register — add one under POS → Registers.");
  }
  if (await page.getByRole("link", { name: /open staff/i }).isVisible().catch(() => false)) {
    test.skip(true, "No active staff — add under Staff.");
  }

  const tile = page.getByTestId(POS_PRODUCT_TILE_TESTID).first();
  if ((await tile.count()) === 0) {
    test.skip(true, "No POS-visible products — enable posVisible on menu items or seed catalog.");
  }
}

export async function runOfflineCashSaleQueueAndSyncFlow(
  page: Page,
  context: BrowserContext,
): Promise<{ planBlocked: boolean; queuedPeak: number }> {
  await preparePosTerminalForOfflineSync(page);
  await page.getByTestId(POS_PRODUCT_TILE_TESTID).first().click();

  await context.setOffline(true);
  await expect(page.getByText(OFFLINE_CONNECTIVITY_LABEL)).toBeVisible({ timeout: 10_000 });

  await page.getByTestId(POS_COMPLETE_SALE_TESTID).click();
  const status = page.getByTestId(POS_CHECKOUT_STATUS_TESTID);
  await expect(status).toBeVisible({ timeout: 15_000 });
  await expect(status).toContainText(OFFLINE_QUEUED_STATUS_PATTERN, { timeout: 15_000 });

  await expect(page.getByText(/\d+ queued sale\(s\)/)).toBeVisible();
  const queuedPeak = await getOfflineIndexedDbQueueSize(page);
  expect(queuedPeak).toBeGreaterThanOrEqual(1);

  await context.setOffline(false);
  await expect(page.getByText(ONLINE_CONNECTIVITY_LABEL, { exact: true })).toBeVisible({
    timeout: 10_000,
  });

  await expect(status).toContainText(OFFLINE_SYNC_SUCCESS_PATTERN, { timeout: 60_000 });

  const statusText = (await status.textContent()) ?? "";
  const planBlocked = OFFLINE_PLAN_BLOCKED_PATTERN.test(statusText);
  if (planBlocked) {
    test.skip(true, "POS terminal not entitled — offline queue persisted but sync blocked by plan.");
  }

  await expect
    .poll(async () => getOfflineIndexedDbQueueSize(page), { timeout: 30_000 })
    .toBe(0);

  return { planBlocked, queuedPeak };
}
