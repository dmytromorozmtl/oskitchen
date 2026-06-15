import { expect, test, type Page } from "@playwright/test";

/**
 * Staging KDS workflow E2E (chromium-authed): POS order → kitchen ticket within 15s,
 * bump to expo, recall to prep, priority lane when candidates exist.
 *
 * Prerequisites: `E2E_LOGIN_*`, `ENABLE_KDS_V1_CERTIFIED=true` on staging app,
 * daily-service tenant with POS + kitchen permissions.
 *
 * Policy: extends `era11-kds-realtime-e2e-staging-v1` with mutating ticket workflow.
 *
 * @see docs/kds-staging-smoke-checklist.md
 * @see docs/kds-websocket-rfc.md
 */

const kdsGateEnabled =
  process.env.NODE_ENV === "production" ||
  process.env.ENABLE_KDS_V1_CERTIFIED === "true";

async function createPosOrderOrSkip(page: Page): Promise<string> {
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

  const prefixMatch = text.match(/order\s+([a-f0-9]{8})/i);
  if (!prefixMatch) {
    throw new Error(`Expected “order …” prefix in checkout status, got: ${text.slice(0, 200)}`);
  }

  await page.goto("/dashboard/orders");
  const orderLink = page.locator(`a[href*="/dashboard/orders/${prefixMatch[1]}"]`).first();
  await expect(orderLink).toBeVisible({ timeout: 30_000 });
  const href = await orderLink.getAttribute("href");
  const fullId = href?.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i,
  )?.[0];
  if (!fullId) {
    throw new Error(`Could not parse order id from href: ${href ?? "(null)"}`);
  }
  return fullId;
}

async function assertKdsKitchenReady(page: Page): Promise<void> {
  const kitchenDisplay = page.getByRole("heading", { name: /^Kitchen Display$/i });
  const kdsPilotGate = page.getByText(/KDS v1 pilot/i);
  const permissionDenied = page.getByText(/do not have permission to view kitchen display/i);

  await expect(kitchenDisplay.or(kdsPilotGate).or(permissionDenied)).toBeVisible({
    timeout: 15_000,
  });

  if (await kdsPilotGate.isVisible()) {
    test.skip(true, "KDS v1 not enabled on staging — set ENABLE_KDS_V1_CERTIFIED=true.");
  }
  if (await permissionDenied.isVisible()) {
    test.skip(true, "E2E user lacks kitchen.view permission.");
  }
}

test.describe("KDS staging ticket workflow", () => {
  test.beforeEach(() => {
    test.skip(
      !kdsGateEnabled,
      "Set ENABLE_KDS_V1_CERTIFIED=true for non-production KDS v1 gate",
    );
  });

  test("POS order appears on KDS within 15s, bump, and recall", async ({ page }) => {
    const orderId = await createPosOrderOrSkip(page);

    await page.goto("/dashboard/kitchen");
    await assertKdsKitchenReady(page);

    const ticket = page.getByTestId(`kds-ticket-${orderId}`);
    await expect(ticket).toBeVisible({ timeout: 15_000 });

    const bumpNext = page.getByTestId("kds-bump-next-button");
    const ticketBump = page.getByTestId(`kds-ticket-next-action-${orderId}`);
    if (await bumpNext.isVisible().catch(() => false)) {
      await bumpNext.click();
    } else {
      await expect(ticketBump).toBeVisible({ timeout: 5_000 });
      await ticketBump.click();
    }

    await expect(
      page.getByTestId("kds-section-ready").getByTestId(`kds-ticket-${orderId}`),
    ).toBeVisible({
      timeout: 15_000,
    });

    const recallStrip = page.getByTestId("kds-recall-next-strip");
    const recallButton = page.getByTestId("kds-recall-next-button");
    if ((await recallStrip.count()) === 0) {
      test.skip(true, "E2E user lacks kitchen.recall — cannot verify recall path.");
    }

    await recallButton.click();
    await expect(
      page.getByTestId("kds-section-prep").getByTestId(`kds-ticket-${orderId}`),
    ).toBeVisible({
      timeout: 15_000,
    });
  });

  test("priority lane strip when allergen or overdue tickets exist", async ({ page }) => {
    await page.goto("/dashboard/kitchen");
    await assertKdsKitchenReady(page);

    const strip = page.getByTestId("kds-priority-lane-strip");
    if ((await strip.count()) === 0) {
      test.skip(
        true,
        "No priority lane candidates in tenant queue (requires allergen conflict or 15m+ overdue ticket).",
      );
    }

    await expect(strip.getByText(/Priority lane/i)).toBeVisible();
    await expect(page.getByTestId("kds-priority-lane-1")).toBeVisible();
  });
});
