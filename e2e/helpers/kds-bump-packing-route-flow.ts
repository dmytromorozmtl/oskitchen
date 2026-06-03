import { expect, test, type Page } from "@playwright/test";

import {
  KDS_BUMP_PACKING_ROUTE_TICKET_VISIBLE_MS,
  KDS_KITCHEN_PATH,
  PACKING_VERIFY_PATH,
  ROUTES_OVERVIEW_PATH,
  ROUTES_PLANNER_PATH,
  kdsBumpPackingRouteTicketTestId,
} from "@/lib/kitchen/kds-bump-packing-route-e2e-policy";
import { STOREFRONT_INTERNAL_ORDER_ID_TEST_ID } from "@/lib/storefront/storefront-checkout-kds-e2e-policy";

export type DeliveryCheckoutResult = {
  orderId: string;
  deliveryDate: string;
  customerName: string;
};

export async function completeStorefrontDeliveryCheckout(
  page: Page,
  slug: string,
): Promise<DeliveryCheckoutResult> {
  await page.goto(`/s/${slug}/checkout`);
  await expect(page.getByRole("heading", { name: /checkout/i })).toBeVisible({ timeout: 20_000 });

  const deliveryButton = page.getByRole("button", { name: /^delivery$/i });
  if (!(await deliveryButton.isEnabled().catch(() => false))) {
    test.skip(true, "Storefront delivery checkout disabled — enable delivery on storefront settings.");
  }
  await deliveryButton.click();

  const customerName = `E2E Bump Pack Route ${Date.now()}`;
  const email = `e2e-kds-pack-route-${Date.now()}@example.com`;
  await page.getByLabel(/^name$/i).fill(customerName);
  await page.getByLabel(/^email$/i).fill(email);
  const phone = page.getByLabel(/^phone$/i);
  if (await phone.isVisible()) await phone.fill("5550100416");

  const d = new Date();
  d.setDate(d.getDate() + 2);
  const deliveryDate = d.toISOString().slice(0, 10);
  await page.locator("#deliveryDate").fill(deliveryDate);
  await page.locator("#deliveryAddress").fill("123 E2E Test Lane, Kitchen City");

  const terms = page.getByRole("checkbox").first();
  if (await terms.isVisible()) await terms.check();

  const payLater = page.getByText(/pay later/i).first();
  if (await payLater.isVisible()) await payLater.click();

  await page.getByRole("button", { name: /place|submit|order/i }).click();
  await expect(page).toHaveURL(new RegExp(`/s/${slug}/order/`), { timeout: 45_000 });

  const internalOrder = page.getByTestId(STOREFRONT_INTERNAL_ORDER_ID_TEST_ID);
  await expect(internalOrder).toBeVisible({ timeout: 15_000 });
  const orderId = await internalOrder.getAttribute("data-order-id");
  if (!orderId) {
    throw new Error("Storefront confirmation missing internal order id");
  }

  return { orderId, deliveryDate, customerName };
}

export async function assertKdsKitchenReadyOrSkip(page: Page): Promise<void> {
  await page.goto(KDS_KITCHEN_PATH);

  const kitchenDisplay = page.getByRole("heading", { name: /^Kitchen Display$/i });
  const kdsPilotGate = page.getByText(/KDS v1 pilot/i);
  const permissionDenied = page.getByText(/do not have permission to view kitchen display/i);

  await expect(kitchenDisplay.or(kdsPilotGate).or(permissionDenied)).toBeVisible({
    timeout: 15_000,
  });

  if (await kdsPilotGate.isVisible()) {
    test.skip(true, "KDS v1 not enabled — set ENABLE_KDS_V1_CERTIFIED=true.");
  }
  if (await permissionDenied.isVisible()) {
    test.skip(true, "E2E user lacks kitchen.view permission.");
  }
}

export async function bumpOrderOnKds(page: Page, orderId: string): Promise<void> {
  await assertKdsKitchenReadyOrSkip(page);

  const ticket = page.getByTestId(kdsBumpPackingRouteTicketTestId(orderId));
  await expect(ticket).toBeVisible({ timeout: KDS_BUMP_PACKING_ROUTE_TICKET_VISIBLE_MS });

  const bumpNext = page.getByTestId("kds-bump-next-button");
  const ticketBump = page.getByTestId(`kds-ticket-next-action-${orderId}`);
  if (await bumpNext.isVisible().catch(() => false)) {
    await bumpNext.click();
  } else {
    await expect(ticketBump).toBeVisible({ timeout: 5_000 });
    await ticketBump.click();
  }

  await expect(
    page.getByTestId("kds-section-ready").getByTestId(kdsBumpPackingRouteTicketTestId(orderId)),
  ).toBeVisible({ timeout: 15_000 });
}

export async function verifyOrderInPackingConsole(
  page: Page,
  orderId: string,
  customerName: string,
): Promise<void> {
  await page.goto(PACKING_VERIFY_PATH);

  const permissionDenied = page.getByText(/do not have permission|access restricted/i);
  if (await permissionDenied.isVisible().catch(() => false)) {
    test.skip(true, "E2E user lacks packing.manage permission.");
  }

  await expect(page.getByRole("heading", { name: /packing verify|verification/i })).toBeVisible({
    timeout: 15_000,
  });

  await page.getByRole("tab", { name: /manual lookup/i }).click();
  await page.locator("#token").fill(orderId);
  await page.getByRole("button", { name: /^load order$/i }).click();

  await expect(page.getByText(customerName)).toBeVisible({ timeout: 30_000 });

  const startSession = page.getByRole("button", { name: /start verification session/i });
  if (await startSession.isVisible().catch(() => false)) {
    await startSession.click();
    await page.waitForTimeout(500);
  }

  const verifyAllButtons = page.getByRole("button", { name: /^verify all$/i });
  const count = await verifyAllButtons.count();
  for (let i = 0; i < count; i += 1) {
    await verifyAllButtons.nth(i).click();
    await page.waitForTimeout(300);
  }

  const allergenOk = page.getByRole("button", { name: /^allergen ok$/i });
  for (let i = 0; i < (await allergenOk.count()); i += 1) {
    const btn = allergenOk.nth(i);
    if (await btn.isEnabled().catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(200);
    }
  }

  const labelOk = page.getByRole("button", { name: /^label ok$/i });
  for (let i = 0; i < (await labelOk.count()); i += 1) {
    const btn = labelOk.nth(i);
    if (await btn.isEnabled().catch(() => false)) {
      await btn.click();
      await page.waitForTimeout(200);
    }
  }

  await page.getByRole("button", { name: /^pass$/i }).first().click();
  await page.waitForURL(/\/dashboard\/packing\/verify/, { timeout: 30_000 }).catch(() => undefined);
  await page.reload();
  await expect(page.getByText(customerName).or(page.getByText(/COMPLETED|PASS/i))).toBeVisible({
    timeout: 30_000,
  });
}

export async function buildRouteForDeliveryDate(
  page: Page,
  deliveryDate: string,
  customerName: string,
  orderId: string,
): Promise<void> {
  await page.goto(ROUTES_PLANNER_PATH);

  if (await page.getByText(/not available on your current plan/i).isVisible().catch(() => false)) {
    test.skip(true, "Delivery routes not entitled on this workspace plan.");
  }

  await expect(page.getByRole("heading", { name: /route planner/i })).toBeVisible({
    timeout: 15_000,
  });

  if (await page.getByText(/do not have permission/i).isVisible().catch(() => false)) {
    test.skip(true, "E2E user lacks routes.manage permission.");
  }

  await page.locator("#routeDate").fill(deliveryDate);
  await page.getByRole("button", { name: /^build route$/i }).first().click();
  await page.waitForTimeout(1_000);

  await page.goto(ROUTES_OVERVIEW_PATH);
  await expect(page.getByRole("link", { name: /^open$/i }).first()).toBeVisible({ timeout: 30_000 });
  await page.getByRole("link", { name: /^open$/i }).first().click();

  await expect(page.getByText(customerName)).toBeVisible({ timeout: 15_000 });
  await expect(page.getByText(new RegExp(orderId.slice(0, 8), "i"))).toBeVisible({
    timeout: 15_000,
  });
}
