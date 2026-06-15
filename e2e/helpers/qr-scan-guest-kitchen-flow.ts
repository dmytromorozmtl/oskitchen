import { expect, test, type Page } from "@playwright/test";

import {
  QR_OPEN_CART_TEST_ID,
  QR_ORDERING_PAGE_TEST_ID,
  QR_ORDER_CONFIRMATION_TEST_ID,
  QR_PLACE_ORDER_TEST_ID,
  QR_SCAN_GUEST_KITCHEN_TICKET_VISIBLE_MS,
  QR_GUEST_KDS_TABLE_BADGE_TEST_ID,
  qrScanGuestKitchenTicketTestId,
} from "@/lib/qr/qr-scan-guest-kitchen-e2e-policy";

import { qrScanGuestUrl } from "./qr-scan-guest-kitchen-ready";

export async function placeQrScanGuestOrder(guestPage: Page): Promise<string> {
  let orderId = "";

  await guestPage.route("**/api/public/qr-order", async (route) => {
    const response = await route.fetch();
    const payload = (await response.json()) as { orderId?: string };
    if (payload.orderId) orderId = payload.orderId;
    await route.fulfill({ response });
  });

  await guestPage.goto(qrScanGuestUrl());
  if (!guestPage.url().includes("/q/")) {
    test.skip(true, "No published storefront at scanned QR URL /q/demo-store/12");
  }

  const menu = guestPage.getByTestId(QR_ORDERING_PAGE_TEST_ID);
  if (!(await menu.isVisible({ timeout: 15_000 }).catch(() => false))) {
    test.skip(true, "Scanned QR menu shell unavailable — publish demo-store with table 12.");
  }

  const firstItem = menu.locator("li").first();
  if ((await firstItem.count()) === 0) {
    test.skip(true, "No menu items on scanned QR page.");
  }

  await firstItem.getByRole("button", { name: /add item/i }).click();
  await guestPage.getByTestId(QR_OPEN_CART_TEST_ID).click();
  await guestPage.getByTestId(QR_PLACE_ORDER_TEST_ID).click();

  await expect(guestPage.getByTestId(QR_ORDER_CONFIRMATION_TEST_ID)).toBeVisible({
    timeout: 30_000,
  });
  await expect(guestPage.getByText(/order sent to the kitchen/i)).toBeVisible();

  if (!orderId) {
    throw new Error("QR scan order API did not return orderId");
  }

  return orderId;
}

export async function assertKdsKitchenReadyOrSkip(page: Page): Promise<void> {
  await page.goto("/dashboard/kitchen");

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

export async function assertQrScanOrderOnKds(page: Page, orderId: string): Promise<void> {
  await assertKdsKitchenReadyOrSkip(page);

  const ticket = page.getByTestId(qrScanGuestKitchenTicketTestId(orderId));
  await expect(ticket).toBeVisible({ timeout: QR_SCAN_GUEST_KITCHEN_TICKET_VISIBLE_MS });
  await expect(ticket.getByTestId(QR_GUEST_KDS_TABLE_BADGE_TEST_ID)).toBeVisible();
}
