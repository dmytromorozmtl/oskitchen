import { expect, test } from "@playwright/test";

import {
  applyCrossChannelConflictPlan,
  planCrossChannelRealtimeSync,
  resolveCrossChannelConflict,
} from "@/services/inventory/cross-channel-inventory-sync";

import {
  buildMockCrossChannelSnapshot,
  CROSS_CHANNEL_INVENTORY_MOCK_INIT_SCRIPT,
  MOCK_CROSS_CHANNEL_PRODUCTS,
} from "./helpers/cross-channel-inventory-mock";
import { skipCrossChannelInventoryLiveIfNotReady } from "./helpers/cross-channel-inventory-live-ready";
import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";

/**
 * Cross-channel inventory **live sync** E2E — POS → Shopify/Woo/DoorDash propagation.
 *
 * - Engine path: realtime push plan after POS quantity change (always runs).
 * - Mock UI path: authed dashboard with channel health + pull control.
 * - Staging path: vault-gated pull on real workspace (SKIPPED without credentials).
 *
 * @see docs/cross-channel-inventory-sales-one-pager.md
 * @see e2e/cross-channel-inventory.spec.ts — mock channel baseline
 */

test.describe("cross-channel inventory live sync engine", () => {
  test("POS depletion plans live push to external channels when in sync", () => {
    const snapshot = buildMockCrossChannelSnapshot();
    const burger = snapshot.levels.find(
      (l) => l.productId === MOCK_CROSS_CHANNEL_PRODUCTS.burger.id,
    );
    expect(burger).toBeTruthy();

    const nextMaster = 18;
    const updatedLevel = {
      ...burger!,
      masterQuantity: nextMaster,
      availableQuantity: nextMaster,
      channels: burger!.channels.map((c) =>
        c.provider === "POS" ? { ...c, quantity: nextMaster } : c,
      ),
    };

    const plan = planCrossChannelRealtimeSync({
      level: updatedLevel,
      settings: { autoPushOnChange: true, conflictResolution: "kitchen_wins" },
      reason: "inventory_change",
    });

    expect(plan).not.toBeNull();
    expect(plan?.productId).toBe(MOCK_CROSS_CHANNEL_PRODUCTS.burger.id);
    expect(plan?.pushTargets.map((t) => t.provider).sort()).toEqual(["DOORDASH", "SHOPIFY"]);
    expect(plan?.pushTargets.every((t) => t.quantity === nextMaster)).toBe(true);
  });

  test("manual_review blocks auto push while channel conflicts remain", () => {
    const snapshot = buildMockCrossChannelSnapshot();
    const burger = snapshot.levels.find(
      (l) => l.productId === MOCK_CROSS_CHANNEL_PRODUCTS.burger.id,
    );
    expect(burger).toBeTruthy();

    const plan = planCrossChannelRealtimeSync({
      level: burger!,
      settings: { autoPushOnChange: true, conflictResolution: "manual_review" },
      reason: "inventory_change",
    });

    expect(plan).toBeNull();
  });

  test("kitchen_wins resolution enables subsequent live push plan", () => {
    const snapshot = buildMockCrossChannelSnapshot();
    const shopifyConflict = snapshot.conflicts.find((c) => c.channel.provider === "SHOPIFY");
    expect(shopifyConflict).toBeTruthy();

    const outcome = resolveCrossChannelConflict(shopifyConflict!, "kitchen_wins");
    expect(outcome.resolved).toBe(true);

    const plan = applyCrossChannelConflictPlan({
      conflicts: snapshot.conflicts,
      strategy: "kitchen_wins",
    });
    expect(plan.resolved).toBe(snapshot.conflicts.length);

    const burger = snapshot.levels.find(
      (l) => l.productId === MOCK_CROSS_CHANNEL_PRODUCTS.burger.id,
    )!;
    const syncedLevel = {
      ...burger,
      channels: burger.channels.map((c) =>
        c.provider === "POS" ? c : { ...c, quantity: burger.masterQuantity },
      ),
    };

    const pushPlan = planCrossChannelRealtimeSync({
      level: syncedLevel,
      settings: { autoPushOnChange: true, conflictResolution: "kitchen_wins" },
      reason: "pos_sale",
    });
    expect(pushPlan?.pushTargets.length).toBeGreaterThan(0);
  });
});

test.describe("cross-channel inventory live sync page (chromium)", () => {
  test("loads cross-channel dashboard or redirects to login", async ({ page }) => {
    await page.goto("/dashboard/inventory/cross-channel");
    await skipIfLoginRedirect(page);
    await expect(page.getByRole("heading", { name: /Cross-channel inventory/i })).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByTestId("cross-channel-inventory-panel")).toBeVisible();
    await expect(page.getByRole("button", { name: /Pull all channels/i })).toBeVisible();
  });
});

test.describe("cross-channel inventory live sync UI (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Authed live sync UI runs in chromium-authed project only",
    );
    test.skip(
      !process.env.E2E_LOGIN_EMAIL?.trim() || !process.env.E2E_LOGIN_PASSWORD?.trim(),
      "Requires E2E_LOGIN_EMAIL and E2E_LOGIN_PASSWORD",
    );
  });

  test("channel health rows show POS Shopify WooCommerce DoorDash providers", async ({ page }) => {
    await page.addInitScript(CROSS_CHANNEL_INVENTORY_MOCK_INIT_SCRIPT);
    await page.goto("/dashboard/inventory/cross-channel");

    await expect(page.getByTestId("cross-channel-inventory-panel")).toBeVisible({
      timeout: 15_000,
    });
    await expect(page.getByText("Channel sync health")).toBeVisible();
    await expect(page.getByTestId("cross-channel-health-POS")).toBeVisible();
    await expect(page.getByTestId("cross-channel-health-SHOPIFY")).toBeVisible();
    await expect(page.getByTestId("cross-channel-health-WOOCOMMERCE")).toBeVisible();
    await expect(page.getByTestId("cross-channel-health-DOORDASH")).toBeVisible();
  });

  test("POS tab shows master quantity for mock burger SKU", async ({ page }) => {
    await page.addInitScript(CROSS_CHANNEL_INVENTORY_MOCK_INIT_SCRIPT);
    await page.goto("/dashboard/inventory/cross-channel");

    await expect(page.getByTestId("cross-channel-tab-POS")).toBeVisible({ timeout: 15_000 });
    await page.getByTestId("cross-channel-tab-POS").click();
    await expect(page.getByTestId("cross-channel-levels-table")).toBeVisible();
    await expect(page.getByTestId(`cross-channel-level-${MOCK_CROSS_CHANNEL_PRODUCTS.burger.id}`)).toBeVisible();
  });
});

test.describe("cross-channel inventory live sync (staging — vault gated)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Staging live sync runs in chromium-authed project only",
    );
    skipCrossChannelInventoryLiveIfNotReady();
  });

  test("Pull all channels updates last pull timestamp on staging workspace", async ({ page }) => {
    await page.goto("/dashboard/inventory/cross-channel");
    await expect(page.getByTestId("cross-channel-inventory-panel")).toBeVisible({
      timeout: 60_000,
    });

    const lastPull = page.locator("text=Last pull:");
    await expect(lastPull).toBeVisible();
    const beforeText = (await lastPull.textContent()) ?? "";

    const pullButton = page.getByRole("button", { name: /Pull all channels/i });
    const canPull = await pullButton.isVisible().catch(() => false);
    test.skip(!canPull, "Integrations.manage required for pull — read-only workspace");

    await pullButton.click();
    await expect(page.getByTestId("cross-channel-inventory-panel")).toBeVisible({
      timeout: 60_000,
    });

    await expect
      .poll(async () => (await lastPull.textContent()) ?? "", { timeout: 60_000 })
      .not.toBe(beforeText);
  });

  test("staging health dashboard lists at least POS channel row", async ({ page }) => {
    await page.goto("/dashboard/inventory/cross-channel");
    await expect(page.getByTestId("cross-channel-health-POS")).toBeVisible({
      timeout: 60_000,
    });
  });
});
