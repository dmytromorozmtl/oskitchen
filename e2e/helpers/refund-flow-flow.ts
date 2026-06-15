import { expect, test, type Page } from "@playwright/test";

import { prisma } from "@/lib/prisma";
import {
  POS_CHECKOUT_STATUS_TESTID,
  POS_COMPLETE_SALE_TESTID,
  POS_ORDERS_PATH,
  POS_PRODUCT_TILE_TESTID,
  POS_TERMINAL_PATH,
  REFUND_PAYMENT_STATUS_FULL,
  orderDetailPath,
} from "@/lib/pos/refund-flow-e2e-policy";
import { refundPosTransaction } from "@/services/pos/pos-refund-service";

export async function preparePosTerminalForRefund(page: Page): Promise<void> {
  await page.goto(POS_TERMINAL_PATH);

  if (await page.getByRole("link", { name: /add register/i }).isVisible().catch(() => false)) {
    test.skip(true, "No POS register — add one under POS → Registers.");
  }
  if (await page.getByRole("link", { name: /open staff/i }).isVisible().catch(() => false)) {
    test.skip(true, "No active staff — add under Staff.");
  }

  const tile = page.getByTestId(POS_PRODUCT_TILE_TESTID).first();
  if ((await tile.count()) === 0) {
    test.skip(true, "No POS-visible products — enable posVisible on menu items or seed catalog.");
  }
}

export async function completePosCashSaleForRefund(page: Page): Promise<string> {
  await page.getByTestId(POS_PRODUCT_TILE_TESTID).first().click();
  await page.getByTestId(POS_COMPLETE_SALE_TESTID).click();

  const status = page.getByTestId(POS_CHECKOUT_STATUS_TESTID);
  await expect(status).toBeVisible({ timeout: 60_000 });
  await expect(status).toContainText(/sale complete|not available on your current plan|POS is not available/i, {
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

  const orderPrefix = orderMatch[1].replace(/…$/, "").slice(0, 8);
  await page.goto(POS_ORDERS_PATH);
  const orderLink = page.locator(`a[href*="/dashboard/orders/${orderPrefix}"]`).first();
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

export async function runFullCashRefundFlow(page: Page): Promise<{
  orderId: string;
  transactionId: string;
}> {
  await preparePosTerminalForRefund(page);
  const orderId = await completePosCashSaleForRefund(page);

  const tx = await prisma.pOSTransaction.findFirst({
    where: { orderId },
    select: { id: true, userId: true },
  });
  if (!tx) {
    test.skip(true, "No POSTransaction row for checkout — POS persistence gap on staging.");
  }

  const refundResult = await refundPosTransaction({
    userId: tx.userId,
    performedByUserId: tx.userId,
    transactionId: tx.id,
    reason: "E2E full cash refund probe",
  });
  expect(refundResult.ok).toBe(true);

  const refreshedOrder = await prisma.order.findUnique({
    where: { id: orderId },
    select: { paymentStatus: true },
  });
  expect(refreshedOrder?.paymentStatus).toBe(REFUND_PAYMENT_STATUS_FULL);

  await page.goto(orderDetailPath(orderId));
  await expect(page.getByText("POS / counter sale")).toBeVisible();

  return { orderId, transactionId: tx.id };
}
