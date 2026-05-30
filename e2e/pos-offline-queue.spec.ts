import { expect, test, type Page } from "@playwright/test";

/**
 * Staging POS offline queue E2E (chromium-authed): offline cash sale → IndexedDB queue
 * → online → server sync via `posCheckoutAction`.
 *
 * Prerequisites: `E2E_LOGIN_*`, POS register + staff + posVisible products, cash payment (offline-safe).
 *
 * @see lib/pos/offline-pos-queue.ts
 * @see docs/POS_OFFLINE_MODE.md
 */

async function preparePosTerminal(page: Page): Promise<void> {
  await page.goto("/dashboard/pos/terminal");

  if (await page.getByRole("link", { name: /add register/i }).isVisible().catch(() => false)) {
    test.skip(true, "No POS register — add one under POS → Registers.");
  }
  if (await page.getByRole("link", { name: /open staff/i }).isVisible().catch(() => false)) {
    test.skip(true, "No active staff — add under Staff.");
  }

  const tile = page.getByTestId("pos-product-tile").first();
  if ((await tile.count()) === 0) {
    test.skip(true, "No POS-visible products — enable posVisible on menu items or seed catalog.");
  }
}

async function offlineQueueSize(page: Page): Promise<number> {
  return page.evaluate(async () => {
    return new Promise<number>((resolve, reject) => {
      const request = indexedDB.open("kitchenos-offline-pos");
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const db = request.result;
        if (!db.objectStoreNames.contains("checkout_queue")) {
          db.close();
          resolve(0);
          return;
        }
        const tx = db.transaction("checkout_queue", "readonly");
        const getAll = tx.objectStore("checkout_queue").getAll();
        getAll.onerror = () => reject(getAll.error);
        getAll.onsuccess = () => {
          db.close();
          resolve((getAll.result as unknown[]).length);
        };
      };
    });
  });
}

test.describe("POS offline queue staging", () => {
  test("offline cash sale queues then syncs when back online", async ({ page, context }) => {
    await preparePosTerminal(page);
    await page.getByTestId("pos-product-tile").first().click();

    await context.setOffline(true);
    await expect(page.getByText("Offline / degraded")).toBeVisible({ timeout: 10_000 });

    await page.getByTestId("pos-complete-sale").click();
    const status = page.getByTestId("pos-checkout-status");
    await expect(status).toBeVisible({ timeout: 15_000 });
    await expect(status).toContainText(/offline.*queued|queued.*sync/i, { timeout: 15_000 });

    await expect(page.getByText(/\d+ queued sale\(s\)/)).toBeVisible();
    expect(await offlineQueueSize(page)).toBeGreaterThanOrEqual(1);

    await context.setOffline(false);
    await expect(page.getByText("Online", { exact: true })).toBeVisible({ timeout: 10_000 });

    await expect(status).toContainText(/Synced \d+ offline sale\(s\)|sale complete|not available on your current plan/i, {
      timeout: 60_000,
    });

    const statusText = (await status.textContent()) ?? "";
    if (/not available on your current plan|POS is not available/i.test(statusText)) {
      test.skip(true, "POS terminal not entitled — offline queue persisted but sync blocked by plan.");
    }

    await expect
      .poll(async () => offlineQueueSize(page), { timeout: 30_000 })
      .toBe(0);
  });
});
