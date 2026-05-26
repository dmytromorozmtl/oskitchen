import { expect, test, type Page } from "@playwright/test";

/**
 * Paid pilot critical path — owner operational surfaces.
 *
 * Run: `npm run test:e2e:pilot` (staging + `E2E_PILOT_*`).
 * @see docs/E2E_PILOT_JOURNEY.md
 */

async function expectNoAccessDenied(page: Page) {
  await expect(page.getByText(/access restricted|forbidden|not found/i)).not.toBeVisible();
}

test.describe("Pilot journey — owner operational surfaces", () => {
  test("today overview loads after auth", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.getByRole("heading", { name: /Today in / })).toBeVisible({
      timeout: 30_000,
    });
    await expectNoAccessDenied(page);
  });

  test("orders list is workspace-scoped (no RBAC wall)", async ({ page }) => {
    await page.goto("/dashboard/orders");
    await expect(page).toHaveURL(/\/dashboard\/orders/);
    await expect(page.getByRole("heading", { name: /orders/i })).toBeVisible();
    await expect(page.getByRole("link", { name: /new order/i })).toBeVisible();
    await expectNoAccessDenied(page);
  });

  test("order hub loads", async ({ page }) => {
    await page.goto("/dashboard/order-hub");
    await expect(page.getByRole("heading", { name: /^Order hub$/i })).toBeVisible();
    await expectNoAccessDenied(page);
  });

  test("production command center loads", async ({ page }) => {
    await page.goto("/dashboard/production");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).toHaveText(
      /production|prep list|prep & baking|batch production|meal prep/i,
    );
    await expectNoAccessDenied(page);
  });

  test("packing command center loads", async ({ page }) => {
    await page.goto("/dashboard/packing");
    await expect(page.locator("h1")).toBeVisible();
    await expect(page.locator("h1")).toHaveText(/packing|loadout|labels/i);
    await expectNoAccessDenied(page);
  });

  test("sales channels overview shows workspace metrics", async ({ page }) => {
    await page.goto("/dashboard/sales-channels");
    await expect(page.getByText("Connected integrations")).toBeVisible();
    await expect(page.getByText("Orders today (Order hub)")).toBeVisible();
    await expect(page.getByText("Capabilities (read-only)")).toBeVisible();
    await expectNoAccessDenied(page);
  });

  test("import center loads", async ({ page }) => {
    await page.goto("/dashboard/import-center");
    await expect(page.getByRole("heading", { name: /data import center/i })).toBeVisible();
    await expectNoAccessDenied(page);
  });

  test("quick order entry surface loads", async ({ page }) => {
    await page.goto("/dashboard/orders/quick");
    await expect(page).toHaveURL(/\/dashboard\/orders\/quick/);
    await expectNoAccessDenied(page);
  });

  test("nutrition label command center loads (golden path A1.4)", async ({ page }) => {
    await page.goto("/dashboard/nutrition-labels");
    await expect(page).toHaveURL(/\/dashboard\/nutrition-labels/);
    await expectNoAccessDenied(page);
  });

  test("print queue surface loads (golden path A1.5)", async ({ page }) => {
    await page.goto("/dashboard/nutrition-labels/print-queue");
    await expect(page).toHaveURL(/\/dashboard\/nutrition-labels\/print-queue/);
    await expectNoAccessDenied(page);
  });

  test("menus catalog loads (golden path A1.3)", async ({ page }) => {
    await page.goto("/dashboard/menus");
    await expect(page.locator("h1")).toBeVisible({ timeout: 30_000 });
    await expectNoAccessDenied(page);
  });
});
