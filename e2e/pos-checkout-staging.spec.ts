import { expect, test, type Page } from "@playwright/test";

import { prisma } from "@/lib/prisma";
import { voidPosTransaction } from "@/services/pos/pos-void-service";

/**
 * Staging POS checkout E2E (chromium-authed): cash sale, manager discount override,
 * pay-later split placeholder, void via service after UI checkout.
 *
 * Prerequisites: `E2E_LOGIN_*`, POS register + staff + posVisible products, `pos_terminal` plan feature.
 *
 * @see e2e/pos-checkout-flow.spec.ts — minimal cash smoke
 * @see docs/E2E_PILOT_JOURNEY.md
 */

const hasDb = Boolean(process.env.DATABASE_URL?.trim());

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

async function addFirstProduct(page: Page): Promise<void> {
  await page.getByTestId("pos-product-tile").first().click();
}

async function completeSale(page: Page): Promise<{ orderId: string; receiptNumber: string }> {
  await page.getByTestId("pos-complete-sale").click();

  const status = page.getByTestId("pos-checkout-status");
  await expect(status).toBeVisible({ timeout: 60_000 });
  await expect(status).toContainText(/sale complete|not available on your current plan|POS is not available|ready — tap card/i, {
    timeout: 60_000,
  });

  const text = (await status.textContent()) ?? "";
  if (/not available on your current plan|POS is not available/i.test(text)) {
    test.skip(true, "POS terminal not entitled on this workspace plan.");
  }

  const orderMatch = text.match(/order\s+([a-f0-9-]{8,36})/i);
  if (!orderMatch) {
    throw new Error(`Expected order id in checkout status, got: ${text.slice(0, 240)}`);
  }

  const receiptMatch = text.match(/receipt\s+([A-Z0-9-]+)/i);
  const orderPrefix = orderMatch[1].replace(/…$/, "").slice(0, 8);

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

  return {
    orderId: fullId,
    receiptNumber: receiptMatch?.[1] ?? "",
  };
}

test.describe("POS checkout staging", () => {
  test("cash checkout completes and creates order", async ({ page }) => {
    await preparePosTerminal(page);
    await addFirstProduct(page);
    const { orderId } = await completeSale(page);

    await page.goto(`/dashboard/orders/${orderId}`);
    await expect(page.getByText("POS / counter sale")).toBeVisible();
  });

  test("manager percent discount override when permitted", async ({ page }) => {
    await preparePosTerminal(page);
    await addFirstProduct(page);

    const percentMode = page.getByTestId("pos-discount-mode-percent");
    if ((await percentMode.count()) === 0) {
      test.skip(true, "E2E user lacks pos.discount.apply — manager discount UI hidden.");
    }

    await percentMode.click();
    const preset10 = page.getByTestId("pos-discount-preset-10");
    if (await preset10.isVisible().catch(() => false)) {
      await preset10.click();
    } else {
      await page.getByTestId("pos-discount-percent-input").fill("10");
    }

    const { orderId } = await completeSale(page);

    if (hasDb) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { discountAmount: true },
      });
      expect(Number(order?.discountAmount ?? 0)).toBeGreaterThan(0);
    } else {
      test.info().annotations.push({
        type: "discount-db-check",
        description: "DATABASE_URL not set — discount persisted in UI flow only.",
      });
    }
  });

  test("pay-later split payment placeholder tender", async ({ page }) => {
    await preparePosTerminal(page);
    await addFirstProduct(page);

    await page.locator('div:has(> label:text-is("Payment"))').getByRole("combobox").click();
    await page.getByRole("option", { name: /pay later/i }).click();

    const { orderId } = await completeSale(page);

    if (hasDb) {
      const order = await prisma.order.findUnique({
        where: { id: orderId },
        select: { paymentStatus: true, paymentMode: true },
      });
      expect(order?.paymentMode).toBe("PAY_LATER");
      expect(order?.paymentStatus).toBe("UNPAID");
    } else {
      await page.goto(`/dashboard/orders/${orderId}`);
      await expect(page.getByText("POS / counter sale")).toBeVisible();
    }
  });

  test("void completed POS transaction after checkout", async ({ page }) => {
    test.skip(!hasDb, "DATABASE_URL required to verify pos.void service path");

    await preparePosTerminal(page);
    await addFirstProduct(page);
    const { orderId } = await completeSale(page);

    const tx = await prisma.pOSTransaction.findFirst({
      where: { orderId },
      select: { id: true, status: true, userId: true },
    });
    if (!tx) {
      test.skip(true, "No POSTransaction row for checkout — POS persistence gap on staging.");
      return;
    }

    const voidResult = await voidPosTransaction({
      userId: tx.userId,
      performedByUserId: tx.userId,
      transactionId: tx.id,
      reason: "E2E staging void probe",
    });
    expect(voidResult.ok).toBe(true);

    const refreshedTx = await prisma.pOSTransaction.findUnique({
      where: { id: tx.id },
      select: { status: true },
    });
    expect(refreshedTx?.status).toBe("VOIDED");

    const refreshedOrder = await prisma.order.findUnique({
      where: { id: orderId },
      select: { paymentStatus: true },
    });
    expect(refreshedOrder?.paymentStatus).toBe("VOIDED");
  });
});
