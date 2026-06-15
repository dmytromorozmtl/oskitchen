import { expect, test, type Page } from "@playwright/test";

import { isQrTableOrder, publicQrOrderPath, readQrTableLabel } from "@/lib/qr/qr-order-meta";
import {
  calculateSplitBillShare,
  publicTableSelfServicePath,
} from "@/lib/qr/table-self-service";

import { qrGuestTableUrl, skipQrGuestKitchenIfNotReady } from "./helpers/qr-guest-order-ready";
import { skipIfLoginRedirect } from "./helpers/dashboard-smoke";
import {
  QR_GUEST_KITCHEN_TICKET_VISIBLE_MS,
  QR_GUEST_KDS_TABLE_BADGE_TEST_ID,
  qrGuestKdsTicketTestId,
} from "@/lib/qr/qr-guest-kitchen-e2e-policy";

/**
 * QR guest order → kitchen ticket E2E — table self-service → KDS within 15s.
 *
 * - Engine path: QR metadata + table self-service URL contract (always runs).
 * - Public path: guest table shell loads or skips when storefront unpublished.
 * - Kitchen path: guest places order (unauthed) → authed KDS shows ticket + QR badge.
 *
 * @see services/qr/qr-ordering-service.ts — processQROrder → IN_PRODUCTION
 * @see e2e/qr-table-self-service.spec.ts — table UI baseline
 * @see e2e/kds-staging.spec.ts — KDS ticket workflow
 */

const kdsGateEnabled =
  process.env.NODE_ENV === "production" ||
  process.env.ENABLE_KDS_V1_CERTIFIED === "true";

async function assertKdsKitchenReady(page: Page): Promise<void> {
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

async function placeQrGuestOrder(guestPage: Page): Promise<string> {
  let orderId = "";

  await guestPage.route("**/api/public/qr-order", async (route) => {
    const response = await route.fetch();
    const payload = (await response.json()) as { orderId?: string };
    if (payload.orderId) orderId = payload.orderId;
    await route.fulfill({ response });
  });

  await guestPage.goto(qrGuestTableUrl());
  const shell = guestPage.getByTestId("qr-table-self-service-page");
  if (!(await shell.isVisible({ timeout: 15_000 }).catch(() => false))) {
    test.skip(true, "No published storefront at /q/table?store=demo-store&table=12");
  }

  const firstProduct = shell.locator("li").first();
  if ((await firstProduct.count()) === 0) {
    test.skip(true, "No cart-eligible products on QR table menu.");
  }

  await firstProduct.getByRole("button").last().click();
  await guestPage.getByTestId("qr-table-open-checkout").click();
  await expect(guestPage.getByTestId("qr-table-checkout")).toBeVisible();
  await guestPage.getByTestId("qr-table-submit-order").click();

  await expect(guestPage.getByTestId("qr-table-confirmation")).toBeVisible({ timeout: 30_000 });
  await expect(guestPage.getByText(/sent to kitchen/i)).toBeVisible();

  if (!orderId) {
    throw new Error("QR guest order API did not return orderId");
  }

  return orderId;
}

test.describe("qr guest order kitchen engine", () => {
  test("table QR metadata identifies kitchen-routable dine-in orders", () => {
    const meta = {
      qr: {
        channel: "table_qr",
        storeSlug: "demo-store",
        tableRouteId: "12",
        tableLabel: "Table 12",
        selfService: true,
        checkoutStyle: "pay_later",
      },
      table: "Table 12",
    };

    expect(isQrTableOrder(meta)).toBe(true);
    expect(readQrTableLabel(meta)).toBe("Table 12");
    expect(publicQrOrderPath("demo-store", "12")).toBe("/q/demo-store/12");
    expect(publicTableSelfServicePath("demo-store", "12")).toBe(
      "/q/table?store=demo-store&table=12",
    );
  });

  test("split bill share rounds per guest fairly", () => {
    expect(calculateSplitBillShare(47.5, 3)).toBe(15.83);
    expect(calculateSplitBillShare(100, 4)).toBe(25);
  });

  test("guest table URL encodes demo-store and table for kitchen E2E", () => {
    expect(qrGuestTableUrl()).toBe("/q/table?store=demo-store&table=12");
  });
});

test.describe("qr guest order public table (chromium)", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("table self-service shell or menu unavailable", async ({ page }) => {
    await page.goto(qrGuestTableUrl());
    await skipIfLoginRedirect(page);
    await expect(
      page
        .getByTestId("qr-table-self-service-page")
        .or(page.getByRole("heading", { name: /menu unavailable/i }))
        .or(page.getByRole("heading", { name: /invalid table link/i })),
    ).toBeVisible({ timeout: 15_000 });
  });
});

test.describe("qr guest order kitchen ticket (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "QR guest→KDS workflow runs in chromium-authed project only",
    );
    test.skip(
      !kdsGateEnabled,
      "Set ENABLE_KDS_V1_CERTIFIED=true for non-production KDS v1 gate",
    );
    skipQrGuestKitchenIfNotReady();
  });

  test("guest QR order appears on kitchen display within 15s with table badge", async ({
    page,
    browser,
  }) => {
    const guestContext = await browser.newContext({
      viewport: { width: 375, height: 812 },
    });
    const guestPage = await guestContext.newPage();

    try {
      const orderId = await placeQrGuestOrder(guestPage);

      await page.goto("/dashboard/kitchen");
      await assertKdsKitchenReady(page);

      const ticket = page.getByTestId(qrGuestKdsTicketTestId(orderId));
      await expect(ticket).toBeVisible({ timeout: QR_GUEST_KITCHEN_TICKET_VISIBLE_MS });
      await expect(ticket.getByTestId(QR_GUEST_KDS_TABLE_BADGE_TEST_ID)).toBeVisible();
    } finally {
      await guestContext.close();
    }
  });

  test("guest confirmation shows KDS queued copy", async ({ browser }) => {
    const guestContext = await browser.newContext({
      viewport: { width: 375, height: 812 },
    });
    const guestPage = await guestContext.newPage();

    try {
      await placeQrGuestOrder(guestPage);
      await expect(guestPage.getByText(/KDS ticket queued/i)).toBeVisible();
    } finally {
      await guestContext.close();
    }
  });
});
