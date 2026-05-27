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
  $transaction: vi.fn(),
}));

vi.mock("@/lib/plans/feature-registry", () => ({ canUseFeature }));
vi.mock("@/services/orders/order-creation-service", () => ({
  createOrderViaCenter,
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/scope/ensure-owner-workspace", () => ({
  ensureOwnerWorkspaceId,
}));
vi.mock("@/services/pos/pos-analytics-service", () => ({
  logPosCheckoutAnalytics,
}));
vi.mock("@/services/pos/pos-crm-service", () => ({
  syncPosOrderToCrm,
}));
vi.mock("@/services/pos/pos-inventory-impact-service", () => ({
  recordPendingInventoryImpactsForPosOrder,
}));
vi.mock("@/services/pos/pos-kitchen-routing-service", () => ({
  enqueueKitchenRoutingForPosOrder,
}));
vi.mock("@/services/pos/pos-receipt-service", () => ({
  buildPosReceiptText,
}));
vi.mock("@/services/audit/audit-service", () => ({ auditLog }));
vi.mock("@/services/gift-cards/gift-card-service", () => ({
  redeemGiftCard,
}));
vi.mock("@/services/loyalty/loyalty-service", () => ({
  earnLoyaltyPointsForOrder,
  redeemLoyaltyPoints,
}));
vi.mock("@/lib/orders/order-pii", () => ({
  decryptOrderPiiFields,
}));

import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import { checkoutPosSale } from "@/services/pos/pos-checkout-service";

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

describe("checkoutPosSale", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canUseFeature.mockResolvedValue({ allowed: true });
    ensureOwnerWorkspaceId.mockResolvedValue("ws-fallback-1");
    createOrderViaCenter.mockResolvedValue({
      ok: true,
      orderId: "ord-1",
    });
    prismaMock.pOSRegister.findFirst.mockResolvedValue({
      id: baseInput.registerId,
      userId: "owner-1",
      locationId: "33333333-3333-4333-8333-333333333333",
      workspaceId: "ws-1",
      location: { id: "33333333-3333-4333-8333-333333333333" },
    });
    prismaMock.pOSShift.findFirst.mockResolvedValue({
      id: "shift-1",
      registerId: baseInput.registerId,
      status: "OPEN",
    });
    prismaMock.order.findFirst.mockResolvedValue({
      id: "ord-1",
      locationId: "33333333-3333-4333-8333-333333333333",
      customerId: null,
      customerName: "Counter Guest",
      customerEmail: "guest@example.com",
      customerPhone: null,
      subtotal: 5,
      taxAmount: 0,
      discountAmount: 0,
      total: 5,
      paymentStatus: "PAID",
      orderItems: [
        {
          title: "Counter coffee",
          quantity: 1,
          unitPrice: 5,
          lineTotal: 5,
          product: null,
        },
      ],
      kitchenCustomer: null,
    });
    decryptOrderPiiFields.mockReturnValue({
      customerName: "Counter Guest",
      customerEmail: "guest@example.com",
      customerPhone: null,
    });
    buildPosReceiptText.mockReturnValue("RECEIPT_TEXT");
    txMock.pOSTransaction.create.mockResolvedValue({ id: "txn-1" });
    txMock.pOSPayment.create.mockResolvedValue({ id: "pay-1" });
    txMock.pOSReceipt.create.mockResolvedValue({ id: "receipt-1" });
    txMock.pOSAuditEvent.create.mockResolvedValue({ id: "audit-1" });
    prismaMock.$transaction.mockImplementation(async (callback: (tx: typeof txMock) => unknown) => callback(txMock));
    auditLog.mockResolvedValue(undefined);
    logPosCheckoutAnalytics.mockResolvedValue(undefined);
    syncPosOrderToCrm.mockResolvedValue(undefined);
    recordPendingInventoryImpactsForPosOrder.mockResolvedValue(undefined);
    enqueueKitchenRoutingForPosOrder.mockResolvedValue(undefined);
    earnLoyaltyPointsForOrder.mockResolvedValue(undefined);
    redeemGiftCard.mockResolvedValue({ applied: 0 });
    redeemLoyaltyPoints.mockResolvedValue({ discount: 0 });
  });

  it("routes POS checkout through the canonical order service", async () => {
    createOrderViaCenter.mockResolvedValue({
      ok: false,
      error: "canonical stop",
    });

    const result = await checkoutPosSale("owner-1", "staff-1", baseInput);

    expect(result).toEqual({ ok: false, error: "canonical stop" });
    expect(createOrderViaCenter).toHaveBeenCalledWith(
      { userId: "owner-1", performedById: "staff-1" },
      expect.objectContaining({
        orderType: "POS_SALE",
        customerId: undefined,
        fulfillmentDetail: "PICKUP",
        paymentMode: "CASH",
      }),
    );
  });

  it("rejects checkout when the provided shift is not open for the register", async () => {
    prismaMock.pOSShift.findFirst.mockResolvedValue(null);

    const result = await checkoutPosSale("owner-1", "staff-1", {
      ...baseInput,
      shiftId: "shift-1",
    });

    expect(result).toEqual({ ok: false, error: "Shift is not open for this register." });
    expect(prismaMock.pOSShift.findFirst).toHaveBeenCalledWith({
      where: {
        id: "shift-1",
        userId: "owner-1",
        registerId: baseInput.registerId,
        status: "OPEN",
      },
    });
    expect(createOrderViaCenter).not.toHaveBeenCalled();
  });

  it("persists terminal placeholder checkout state against the open shift and register", async () => {
    prismaMock.pOSRegister.findFirst.mockResolvedValue({
      id: baseInput.registerId,
      userId: "owner-1",
      locationId: "33333333-3333-4333-8333-333333333333",
      workspaceId: null,
      location: { id: "33333333-3333-4333-8333-333333333333" },
    });
    prismaMock.order.findFirst.mockResolvedValue({
      id: "ord-1",
      locationId: "33333333-3333-4333-8333-333333333333",
      customerId: "55555555-5555-4555-8555-555555555555",
      customerName: "Counter Guest",
      customerEmail: "guest@example.com",
      customerPhone: null,
      subtotal: 12,
      taxAmount: 0.8,
      discountAmount: 0,
      total: 12.8,
      paymentStatus: "PENDING",
      orderItems: [
        {
          title: "Latte",
          quantity: 1,
          unitPrice: 12,
          lineTotal: 12,
          product: null,
        },
      ],
      kitchenCustomer: {
        displayName: "Taylor",
        name: "Taylor",
        email: "taylor@example.com",
      },
    });

    const result = await checkoutPosSale("owner-1", "staff-1", {
      ...baseInput,
      shiftId: "shift-1",
      staffMemberId: "staff-member-1",
      customerId: "55555555-5555-4555-8555-555555555555",
      paymentMode: "CARD_TERMINAL_PLACEHOLDER",
    });

    expect(result).toEqual({
      ok: true,
      orderId: "ord-1",
      transactionId: "txn-1",
      receiptNumber: expect.stringMatching(/^POS-/),
    });

    const orderInput = createOrderViaCenter.mock.calls[0]?.[1];
    expect(orderInput).toEqual(
      expect.objectContaining({
        locationId: "33333333-3333-4333-8333-333333333333",
        paymentMode: "CARD_TERMINAL_PLACEHOLDER",
      }),
    );
    expect(JSON.parse(orderInput.sourceMetadataJson)).toEqual({
      pos: {
        registerId: baseInput.registerId,
        shiftId: "shift-1",
        staffMemberId: "staff-member-1",
        fulfillmentIntent: "PICKUP_NOW",
      },
    });

    expect(ensureOwnerWorkspaceId).toHaveBeenCalledWith("owner-1");
    expect(txMock.pOSTransaction.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        userId: "owner-1",
        workspaceId: "ws-fallback-1",
        registerId: baseInput.registerId,
        shiftId: "shift-1",
        staffId: "staff-member-1",
        paymentMode: "CARD_TERMINAL_PLACEHOLDER",
        paymentStatus: "PENDING",
        total: 12.8,
        status: "COMPLETED",
      }),
    });
    expect(txMock.pOSPayment.create).toHaveBeenCalledWith({
      data: {
        transactionId: "txn-1",
        paymentMode: "CARD_TERMINAL_PLACEHOLDER",
        amount: 12.8,
        status: "PENDING",
        provider: "INTERNAL",
      },
    });
    expect(txMock.pOSReceipt.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        transactionId: "txn-1",
        receiptNumber: expect.stringMatching(/^POS-/),
        receiptText: "RECEIPT_TEXT",
      }),
    });
    expect(txMock.pOSAuditEvent.create).toHaveBeenCalledWith({
      data: {
        userId: "owner-1",
        workspaceId: "ws-fallback-1",
        registerId: baseInput.registerId,
        shiftId: "shift-1",
        transactionId: "txn-1",
        staffId: "staff-member-1",
        action: "pos.checkout.completed",
        metadataJson: {
          orderId: "ord-1",
          total: 12.8,
          paymentMode: "CARD_TERMINAL_PLACEHOLDER",
          customerId: "55555555-5555-4555-8555-555555555555",
        },
      },
    });
    expect(buildPosReceiptText).toHaveBeenCalledWith(
      expect.objectContaining({
        customerSummary: "Taylor (taylor@example.com)",
        paymentMode: "CARD_TERMINAL_PLACEHOLDER",
        fulfillment: "PICKUP",
        total: 12.8,
      }),
    );
    expect(auditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        actor: { userId: "staff-1" },
        action: AUDIT_ACTIONS.POS_CHECKOUT_COMPLETED,
        metadata: expect.objectContaining({
          registerId: baseInput.registerId,
          total: 12.8,
        }),
      }),
    );
    expect(auditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AUDIT_ACTIONS.POS_CHECKOUT_CUSTOMER_LINKED,
        entity: {
          type: "KitchenCustomer",
          id: "55555555-5555-4555-8555-555555555555",
          label: "Taylor",
        },
      }),
    );
    expect(auditLog).toHaveBeenCalledWith(
      expect.objectContaining({
        action: AUDIT_ACTIONS.POS_PAYMENT_RECORDED,
        metadata: {
          registerId: baseInput.registerId,
          paymentMode: "CARD_TERMINAL_PLACEHOLDER",
          total: 12.8,
        },
      }),
    );
    expect(logPosCheckoutAnalytics).toHaveBeenCalledWith("owner-1", "ws-fallback-1", "ord-1", 12.8);
    expect(enqueueKitchenRoutingForPosOrder).toHaveBeenCalledWith("owner-1", "ord-1");
    expect(recordPendingInventoryImpactsForPosOrder).toHaveBeenCalledWith(
      "owner-1",
      "ws-fallback-1",
      "ord-1",
    );
    expect(syncPosOrderToCrm).toHaveBeenCalledWith("owner-1", "ord-1");
    expect(earnLoyaltyPointsForOrder).toHaveBeenCalledWith(
      "owner-1",
      "55555555-5555-4555-8555-555555555555",
      "ord-1",
      12.8,
    );
  });

  it("returns a supportable error when POS persistence fails after order creation", async () => {
    prismaMock.order.findFirst.mockResolvedValue({
      id: "ord-1",
      locationId: "33333333-3333-4333-8333-333333333333",
      customerId: null,
      customerName: "Counter Guest",
      customerEmail: "guest@example.com",
      customerPhone: null,
      subtotal: 5,
      taxAmount: 0,
      discountAmount: 0,
      total: 5,
      paymentStatus: "PAID",
      orderItems: [
        {
          title: "Counter coffee",
          quantity: 1,
          unitPrice: 5,
          lineTotal: 5,
          product: null,
        },
      ],
      kitchenCustomer: null,
    });
    prismaMock.$transaction.mockRejectedValueOnce(new Error("write failed"));

    const result = await checkoutPosSale("owner-1", "staff-1", {
      ...baseInput,
      shiftId: "shift-1",
      paymentMode: "CARD_TERMINAL_PLACEHOLDER",
    });

    expect(result).toEqual({
      ok: false,
      error: "Order was created but POS receipt/transaction failed — open the order and contact support.",
    });
    expect(auditLog).not.toHaveBeenCalled();
    expect(logPosCheckoutAnalytics).not.toHaveBeenCalled();
    expect(syncPosOrderToCrm).not.toHaveBeenCalled();
  });
});
