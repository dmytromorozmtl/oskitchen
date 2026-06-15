import { beforeEach, describe, expect, it, vi } from "vitest";

const canUseFeature = vi.hoisted(() => vi.fn());
const createOrderViaCenter = vi.hoisted(() => vi.fn());
const ensureOwnerWorkspaceId = vi.hoisted(() => vi.fn());
const logPosCheckoutAnalytics = vi.hoisted(() => vi.fn());
const syncPosOrderToCrm = vi.hoisted(() => vi.fn());
const recordPendingInventoryImpactsForPosOrder = vi.hoisted(() => vi.fn());
const enqueueKitchenRoutingForPosOrder = vi.hoisted(() => vi.fn());
const buildPosReceiptText = vi.hoisted(() => vi.fn());
const auditLog = vi.hoisted(() => vi.fn());
const redeemGiftCard = vi.hoisted(() => vi.fn());
const earnLoyaltyPointsForOrder = vi.hoisted(() => vi.fn());
const redeemLoyaltyPoints = vi.hoisted(() => vi.fn());
const decryptOrderPiiFields = vi.hoisted(() => vi.fn());
const txMock = vi.hoisted(() => ({
  pOSTransaction: { create: vi.fn() },
  pOSPayment: { create: vi.fn() },
  pOSReceipt: { create: vi.fn() },
  pOSAuditEvent: { create: vi.fn() },
}));
const prismaMock = vi.hoisted(() => ({
  pOSRegister: { findFirst: vi.fn() },
  pOSShift: { findFirst: vi.fn() },
  order: { findFirst: vi.fn() },
  orderItem: { findMany: vi.fn() },
  $transaction: vi.fn(),
}));

vi.mock("@/lib/plans/feature-registry", () => ({ canUseFeature }));
vi.mock("@/services/orders/order-creation-service", () => ({ createOrderViaCenter }));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/scope/ensure-owner-workspace", () => ({ ensureOwnerWorkspaceId }));
vi.mock("@/services/pos/pos-analytics-service", () => ({ logPosCheckoutAnalytics }));
vi.mock("@/services/pos/pos-crm-service", () => ({ syncPosOrderToCrm }));
vi.mock("@/services/pos/pos-inventory-impact-service", () => ({
  recordPendingInventoryImpactsForPosOrder,
}));
vi.mock("@/services/pos/pos-kitchen-routing-service", () => ({
  enqueueKitchenRoutingForPosOrder,
}));
vi.mock("@/services/pos/pos-receipt-service", () => ({ buildPosReceiptText }));
vi.mock("@/services/audit/audit-service", () => ({ auditLog }));
vi.mock("@/services/gift-cards/gift-card-service", () => ({ redeemGiftCard }));
vi.mock("@/services/loyalty/loyalty-service", () => ({
  earnLoyaltyPointsForOrder,
  redeemLoyaltyPoints,
}));
vi.mock("@/lib/orders/order-pii", () => ({ decryptOrderPiiFields }));

import { checkoutPosSale } from "@/services/pos/pos-checkout-service";

const LOC_ID = "33333333-3333-4333-8333-333333333333";
const CUST_ID = "44444444-4444-4444-8444-444444444444";

const baseInput = {
  registerId: "22222222-2222-4222-8222-222222222222",
  shiftId: null,
  staffMemberId: null,
  locationId: null,
  brandId: null,
  customerId: null,
  fulfillmentDetail: "PICKUP" as const,
  paymentMode: "CASH" as const,
  lines: [{ title: "Counter coffee", quantity: 1, unitPrice: 5 }],
};

function seedHappyPath() {
  canUseFeature.mockResolvedValue({ allowed: true });
  ensureOwnerWorkspaceId.mockResolvedValue("ws-1");
  createOrderViaCenter.mockResolvedValue({ ok: true, orderId: "ord-1" });
  prismaMock.pOSRegister.findFirst.mockResolvedValue({
    id: baseInput.registerId,
    userId: "owner-1",
    locationId: LOC_ID,
    workspaceId: "ws-1",
    location: { id: LOC_ID },
  });
  prismaMock.order.findFirst.mockResolvedValue({
    id: "ord-1",
    locationId: LOC_ID,
    customerId: CUST_ID,
    customerName: "Guest",
    customerEmail: "g@example.com",
    customerPhone: null,
    subtotal: 5,
    taxAmount: 0,
    discountAmount: 2,
    total: 3,
    paymentStatus: "PAID",
    orderItems: [{ title: "Coffee", quantity: 1, unitPrice: 5, lineTotal: 5, product: null }],
    kitchenCustomer: null,
  });
  prismaMock.orderItem.findMany.mockResolvedValue([
    { title: "Coffee", productId: null, quantity: 1, lineTotal: 5 },
  ]);
  decryptOrderPiiFields.mockReturnValue({
    customerName: "Guest",
    customerEmail: "g@example.com",
    customerPhone: null,
  });
  buildPosReceiptText.mockReturnValue("RCPT");
  txMock.pOSTransaction.create.mockResolvedValue({ id: "txn-1" });
  txMock.pOSPayment.create.mockResolvedValue({ id: "pay-1" });
  txMock.pOSReceipt.create.mockResolvedValue({ id: "rcp-1" });
  txMock.pOSAuditEvent.create.mockResolvedValue({ id: "aud-1" });
  prismaMock.$transaction.mockImplementation(async (cb: (tx: typeof txMock) => unknown) => cb(txMock));
  auditLog.mockResolvedValue(undefined);
  logPosCheckoutAnalytics.mockResolvedValue(undefined);
  syncPosOrderToCrm.mockResolvedValue(undefined);
  recordPendingInventoryImpactsForPosOrder.mockResolvedValue(undefined);
  enqueueKitchenRoutingForPosOrder.mockResolvedValue(undefined);
  earnLoyaltyPointsForOrder.mockResolvedValue({ earned: 5 });
}

describe("POS rewards checkout wiring (kitchen ledger)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    seedHappyPath();
    redeemGiftCard.mockResolvedValue({ applied: 0 });
    redeemLoyaltyPoints.mockResolvedValue({ discount: 0, pointsRedeemed: 0 });
  });

  it("redeems kitchen gift card before order creation", async () => {
    redeemGiftCard.mockResolvedValue({ applied: 4, remainingBalance: 1 });

    const result = await checkoutPosSale("owner-1", "staff-1", {
      ...baseInput,
      giftCardCode: "GIFT-TEST",
    });

    expect(result.ok).toBe(true);
    expect(redeemGiftCard).toHaveBeenCalledWith("owner-1", "GIFT-TEST", 10_000);
    expect(createOrderViaCenter).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ discountAmount: 4 }),
    );
  });

  it("redeems kitchen loyalty points when customer is set", async () => {
    redeemLoyaltyPoints.mockResolvedValue({ discount: 2.5, pointsRedeemed: 50 });

    const result = await checkoutPosSale("owner-1", "staff-1", {
      ...baseInput,
      customerId: CUST_ID,
      loyaltyPointsRedeem: 50,
    });

    expect(result.ok).toBe(true);
    expect(redeemLoyaltyPoints).toHaveBeenCalledWith("owner-1", CUST_ID, 50);
    expect(createOrderViaCenter).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ discountAmount: 2.5 }),
    );
  });

  it("fails closed on invalid gift card", async () => {
    redeemGiftCard.mockRejectedValue(new Error("inactive"));

    const result = await checkoutPosSale("owner-1", "staff-1", {
      ...baseInput,
      giftCardCode: "BAD",
    });

    expect(result).toEqual({ ok: false, error: "Invalid or empty gift card." });
    expect(createOrderViaCenter).not.toHaveBeenCalled();
  });
});
