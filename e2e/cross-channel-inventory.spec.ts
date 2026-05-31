import { expect, test } from "@playwright/test";

import {
  applyCrossChannelConflictPlan,
  resolveCrossChannelConflict,
} from "@/services/inventory/cross-channel-inventory-sync";

import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";
import {
  buildMockCrossChannelSnapshot,
  CROSS_CHANNEL_INVENTORY_MOCK_INIT_SCRIPT,
  MOCK_CROSS_CHANNEL_EXTERNAL_ROWS,
} from "./helpers/cross-channel-inventory-mock";

/**
 * Cross-channel inventory E2E — mock POS + Shopify + WooCommerce + DoorDash channels.
 *
 * @see docs/cross-channel-inventory-sales-one-pager.md
 * @see e2e/helpers/cross-channel-inventory-mock.ts
 */

test.describe("cross-channel inventory engine (mock channels)", () => {
  test("mock snapshot spans POS Shopify WooCommerce DoorDash", () => {
    const snapshot = buildMockCrossChannelSnapshot();
    expect(snapshot.levels).toHaveLength(2);

    const burger = snapshot.levels.find((l) => l.productTitle === "Classic Burger");
    expect(burger?.channels.map((c) => c.provider)).toEqual(["POS", "SHOPIFY", "DOORDASH"]);
    expect(burger?.masterQuantity).toBe(24);

    const fries = snapshot.levels.find((l) => l.productTitle === "Seasoned Fries");
    expect(fries?.channels.map((c) => c.provider)).toEqual(["POS", "WOOCOMMERCE"]);
  });

  test("mock channels produce conflicts and low-stock alerts", () => {
    const snapshot = buildMockCrossChannelSnapshot();
    expect(snapshot.conflicts.length).toBeGreaterThanOrEqual(2);
    expect(snapshot.conflicts.some((c) => c.channel.provider === "SHOPIFY")).toBe(true);
    expect(snapshot.conflicts.some((c) => c.channel.provider === "WOOCOMMERCE")).toBe(true);
    expect(snapshot.conflicts.some((c) => c.channel.provider === "DOORDASH")).toBe(true);
    expect(snapshot.lowStockAlerts.some((a) => a.productId.includes("fries"))).toBe(true);
  });

  test("resolves mock conflict with kitchen_wins", () => {
    const snapshot = buildMockCrossChannelSnapshot();
    const conflict = snapshot.conflicts.find((c) => c.channel.provider === "SHOPIFY");
    expect(conflict).toBeTruthy();

    const outcome = resolveCrossChannelConflict(conflict!, "kitchen_wins");
    expect(outcome.resolved).toBe(true);
    expect(outcome.channelQuantity).toBe(conflict!.masterQuantity);

    const plan = applyCrossChannelConflictPlan({
      conflicts: snapshot.conflicts,
      strategy: "kitchen_wins",
    });
    expect(plan.resolved).toBe(snapshot.conflicts.length);
  });

  test("mock external row fixtures cover three marketplace providers", () => {
    const providers = new Set(MOCK_CROSS_CHANNEL_EXTERNAL_ROWS.map((r) => r.provider));
    expect(providers).toEqual(new Set(["SHOPIFY", "WOOCOMMERCE", "DOORDASH"]));
  });
});

test.describe("cross-channel inventory page (chromium)", () => {
  test("loads cross-channel inventory dashboard or redirects to login", async ({ page }) => {
    await page.goto("/dashboard/inventory/cross-channel");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /Cross-channel inventory/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("cross-channel-inventory-panel")).toBeVisible();
  });
});

test.describe("cross-channel inventory UI (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Authed UI tests run in chromium-authed project only",
    );
    test.skip(
      !process.env.E2E_LOGIN_EMAIL?.trim() || !process.env.E2E_LOGIN_PASSWORD?.trim(),
      "Requires E2E_LOGIN_EMAIL and E2E_LOGIN_PASSWORD",
    );
  });

  test("channel tabs filter levels table", async ({ page }) => {
    await page.addInitScript(CROSS_CHANNEL_INVENTORY_MOCK_INIT_SCRIPT);
    await page.goto("/dashboard/inventory/cross-channel");

    await expect(page.getByTestId("cross-channel-inventory-panel")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("cross-channel-tab-POS")).toBeVisible();
    await expect(page.getByTestId("cross-channel-tab-SHOPIFY")).toBeVisible();
    await expect(page.getByTestId("cross-channel-tab-WOOCOMMERCE")).toBeVisible();
    await expect(page.getByTestId("cross-channel-tab-DOORDASH")).toBeVisible();

    await page.getByTestId("cross-channel-tab-SHOPIFY").click();
    await expect(page.getByTestId("cross-channel-levels-table")).toBeVisible();

    const noConflicts = page.getByTestId("cross-channel-no-conflicts");
    const conflictsTable = page.getByTestId("cross-channel-conflicts-table");
    await expect(noConflicts.or(conflictsTable)).toBeVisible();
  });

  test("shows sync snapshot summary cards", async ({ page }) => {
    await page.goto("/dashboard/inventory/cross-channel");
    await expect(page.getByText("Products tracked")).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText("In sync")).toBeVisible();
    await expect(page.getByText("Conflicts")).toBeVisible();
    await expect(page.getByText("Low stock")).toBeVisible();
  });
});
