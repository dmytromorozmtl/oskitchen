import { expect, test } from "@playwright/test";

/**
 * Mutating E2E: POS checkout → order row on `/dashboard/orders`, order detail source, optional Order hub row.
 * Runs in `chromium-authed` only (see `playwright.config.ts`).
 *
 * Skips when the workspace has no register, staff, or POS-visible products, or when plan gates POS.
 */
test.describe("POS checkout → orders list", () => {
  test("cash sale creates order link on orders page", async ({ page }) => {
    await page.goto("/dashboard/pos/terminal");

    const needRegister = page.getByRole("link", { name: /add register/i });
    const needStaff = page.getByRole("link", { name: /open staff/i });
    if (await needRegister.isVisible().catch(() => false)) {
      test.skip(true, "No POS register — add one under POS → Registers.");
    }
    if (await needStaff.isVisible().catch(() => false)) {
      test.skip(true, "No active staff — add under Staff.");
    }

    const tile = page.getByTestId("pos-product-tile").first();
    if ((await tile.count()) === 0) {
      test.skip(true, "No POS-visible products — enable posVisible on menu items or seed catalog.");
    }

    await tile.click();
    await page.getByTestId("pos-complete-sale").click();

    const status = page.getByTestId("pos-checkout-status");
    await expect(status).toBeVisible({ timeout: 60_000 });
    await expect(status).toContainText(/sale complete|not available on your current plan|POS is not available/i, {
      timeout: 60_000,
    });

    const text = (await status.textContent()) ?? "";
    if (/not available on your current plan|POS is not available/i.test(text)) {
      test.skip(true, "POS terminal not entitled on this workspace plan.");
    }

    const m = text.match(/order\s+([a-f0-9]{8})/i);
    if (!m) {
      throw new Error(`Expected “order …” prefix in checkout status, got: ${text.slice(0, 200)}`);
    }
    const orderPrefix = m[1];

    await page.goto("/dashboard/orders");
    const orderLink = page.locator(`a[href*="/dashboard/orders/${orderPrefix}"]`).first();
    await expect(orderLink).toBeVisible({ timeout: 30_000 });
    const href = await orderLink.getAttribute("href");
    const fullId = href?.match(
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
    )?.[0];
    if (!fullId) {
      throw new Error(`Could not parse order id from href: ${href ?? "(null)"}`);
    }

    await page.goto(`/dashboard/orders/${fullId}`);
    await expect(page.getByText("POS / counter sale")).toBeVisible();

    await page.goto("/dashboard/order-hub?tab=all");
    const hubRow = page.locator(`tr[data-order-id="${fullId}"]`);
    if ((await hubRow.count()) > 0) {
      await expect(hubRow.first().getByRole("cell", { name: "POS", exact: true })).toBeVisible();
    } else {
      test.info().annotations.push({
        type: "order-hub-snapshot",
        description:
          "Order not in current Order hub preview (tab snapshot is capped). Order detail already asserted POS source.",
      });
    }
  });
});
