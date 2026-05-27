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
const getStripe = vi.hoisted(() => vi.fn());
const requireMutationPermission = vi.hoisted(() => vi.fn());
const logPosPermissionDenied = vi.hoisted(() => vi.fn());
const logPosTerminalControlEvent = vi.hoisted(() => vi.fn());
const stripePaymentIntents = vi.hoisted(() => ({
  create: vi.fn(),
  cancel: vi.fn(),
  retrieve: vi.fn(),
}));

const state = vi.hoisted(() => ({
  register: {
    id: "22222222-2222-4222-8222-222222222222",
    userId: "owner-1",
    locationId: "33333333-3333-4333-8333-333333333333",
    workspaceId: null as string | null,
    location: { id: "33333333-3333-4333-8333-333333333333" },
  },
  shift: {
    id: "44444444-4444-4444-8444-444444444444",
    userId: "owner-1",
    registerId: "22222222-2222-4222-8222-222222222222",
    status: "OPEN",
  },
  order: null as null | Record<string, unknown>,
  transaction: null as null | Record<string, unknown>,
  payment: null as null | Record<string, unknown>,
  receipt: null as null | Record<string, unknown>,
  posAuditEvents: [] as Array<Record<string, unknown>>,
}));

vi.mock("@/lib/plans/feature-registry", () => ({ canUseFeature }));
vi.mock("@/services/orders/order-creation-service", () => ({ createOrderViaCenter }));
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
vi.mock("@/lib/stripe", () => ({ getStripe }));
vi.mock("@/lib/permissions/mutation-access", () => ({ requireMutationPermission }));
vi.mock("@/services/pos/pos-permission-audit", () => ({
  logPosPermissionDenied,
  logPosTerminalControlEvent,
}));

vi.mock("@/lib/prisma", () => ({
  prisma: {
    pOSRegister: {
      findFirst: vi.fn(async ({ where }: { where: { id: string; userId: string } }) => {
        if (where.id !== state.register.id || where.userId !== state.register.userId) {
          return null;
        }
        return state.register;
      }),
    },
    pOSShift: {
      findFirst: vi.fn(async ({ where }: { where: { id: string; userId: string; registerId: string; status: string } }) => {
        if (
          where.id !== state.shift.id ||
          where.userId !== state.shift.userId ||
          where.registerId !== state.shift.registerId ||
          where.status !== state.shift.status
        ) {
          return null;
        }
        return state.shift;
      }),
    },
    order: {
      findFirst: vi.fn(async ({ where }: { where: { id: string; userId: string } }) => {
        if (!state.order) return null;
        if (state.order.id !== where.id || state.order.userId !== where.userId) {
          return null;
        }
        return state.order;
      }),
    },
    pOSTransaction: {
      findFirst: vi.fn(async ({ where }: { where: { orderId: string; userId: string } }) => {
        if (!state.transaction) return null;
        if (state.transaction.orderId !== where.orderId || state.transaction.userId !== where.userId) {
          return null;
        }
        return {
          ...state.transaction,
          payments: state.payment ? [{ ...state.payment }] : [],
        };
      }),
      findFirstOrThrow: vi.fn(async ({ where }: { where: { id: string } }) => {
        if (!state.transaction || state.transaction.id !== where.id) {
          throw new Error("Missing transaction");
        }
        return {
          ...state.transaction,
          payments: state.payment ? [{ ...state.payment }] : [],
        };
      }),
    },
    $transaction: vi.fn(async (callback: (tx: {
      pOSTransaction: { create: Function; update: Function };
      pOSPayment: { create: Function; update: Function };
      pOSReceipt: { create: Function };
      pOSAuditEvent: { create: Function };
      order: { update: Function };
    }) => unknown) =>
      callback({
        pOSTransaction: {
          create: async ({ data }: { data: Record<string, unknown> }) => {
            state.transaction = {
              id: "tx-1",
              ...data,
              externalPaymentReference: null,
            };
            return state.transaction;
          },
          update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
            if (!state.transaction || state.transaction.id !== where.id) {
              throw new Error("Missing transaction");
            }
            state.transaction = { ...state.transaction, ...data };
            return state.transaction;
          },
        },
        pOSPayment: {
          create: async ({ data }: { data: Record<string, unknown> }) => {
            state.payment = { id: "pay-1", ...data };
            return state.payment;
          },
          update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
            if (!state.payment || state.payment.id !== where.id) {
              throw new Error("Missing payment");
            }
            state.payment = { ...state.payment, ...data };
            return state.payment;
          },
        },
        pOSReceipt: {
          create: async ({ data }: { data: Record<string, unknown> }) => {
            state.receipt = { id: "receipt-1", ...data };
            return state.receipt;
          },
        },
        pOSAuditEvent: {
          create: async ({ data }: { data: Record<string, unknown> }) => {
            state.posAuditEvents.push(data);
            return { id: `audit-${state.posAuditEvents.length}`, ...data };
          },
        },
        order: {
          update: async ({ where, data }: { where: { id: string }; data: Record<string, unknown> }) => {
            if (!state.order || state.order.id !== where.id) {
              throw new Error("Missing order");
            }
            state.order = { ...state.order, ...data };
            return state.order;
          },
        },
      })),
  },
}));

import { prisma } from "@/lib/prisma";
import { DELETE, POST, PUT } from "@/app/api/pos/terminal/route";
import { checkoutPosSale } from "@/services/pos/pos-checkout-service";
import {
  cancelTerminalPayment,
  createTerminalPaymentIntent,
  processTerminalPayment,
} from "@/services/payments/stripe-terminal-service";

const actor = {
  sessionUser: { id: "staff-user-1" },
  sessionUserId: "staff-user-1",
  userId: "owner-1",
  dataUserId: "owner-1",
  workspaceId: "ws-fallback-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "MANAGER" as const,
  email: "manager@example.com",
  granted: new Set(["pos.checkout"]),
};

describe("POS terminal checkout lifecycle", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    state.register.workspaceId = null;
    state.order = null;
    state.transaction = null;
    state.payment = null;
    state.receipt = null;
    state.posAuditEvents = [];

    canUseFeature.mockResolvedValue({ allowed: true });
    ensureOwnerWorkspaceId.mockResolvedValue("ws-fallback-1");
    buildPosReceiptText.mockReturnValue("RECEIPT_TEXT");
    auditLog.mockResolvedValue(undefined);
    logPosCheckoutAnalytics.mockResolvedValue(undefined);
    syncPosOrderToCrm.mockResolvedValue(undefined);
    recordPendingInventoryImpactsForPosOrder.mockResolvedValue(undefined);
    enqueueKitchenRoutingForPosOrder.mockResolvedValue(undefined);
    redeemGiftCard.mockResolvedValue({ applied: 0 });
    redeemLoyaltyPoints.mockResolvedValue({ discount: 0 });
    earnLoyaltyPointsForOrder.mockResolvedValue(undefined);
    decryptOrderPiiFields.mockReturnValue({
      customerName: "Counter Guest",
      customerEmail: "guest@example.com",
      customerPhone: null,
    });
    requireMutationPermission.mockResolvedValue({ ok: true, actor });
    logPosPermissionDenied.mockResolvedValue(undefined);
    logPosTerminalControlEvent.mockResolvedValue(undefined);

    createOrderViaCenter.mockImplementation(
      async (
        context: { userId: string; performedById: string },
        orderInput: {
          paymentMode: string;
          locationId: string;
          sourceMetadataJson: string;
          customerId?: string;
          lines: Array<{ title?: string; quantity: number; unitPrice: number }>;
        },
      ) => {
        const firstLine = orderInput.lines[0];
        state.order = {
          id: "ord-1",
          userId: context.userId,
          locationId: orderInput.locationId,
          customerId: orderInput.customerId ?? null,
          customerName: "Counter Guest",
          customerEmail: "guest@example.com",
          customerPhone: null,
          subtotal: firstLine.unitPrice * firstLine.quantity,
          taxAmount: 0,
          discountAmount: 0,
          total: firstLine.unitPrice * firstLine.quantity,
          paymentStatus: orderInput.paymentMode === "CARD_TERMINAL_PLACEHOLDER" ? "PENDING" : "PAID",
          paymentMode: orderInput.paymentMode,
          orderItems: [
            {
              title: firstLine.title ?? "Item",
              quantity: firstLine.quantity,
              unitPrice: firstLine.unitPrice,
              lineTotal: firstLine.unitPrice * firstLine.quantity,
              product: null,
            },
          ],
          kitchenCustomer: null,
        };
        return { ok: true as const, orderId: "ord-1" };
      },
    );

    stripePaymentIntents.create.mockResolvedValue({
      client_secret: "pi_retry_secret",
      id: "pi_retry",
    });
    stripePaymentIntents.cancel.mockResolvedValue({});
    stripePaymentIntents.retrieve.mockResolvedValue({
      status: "succeeded",
      latest_charge: {
        payment_method_details: {
          card_present: { brand: "visa", last4: "4242" },
        },
      },
    });
    getStripe.mockReturnValue({
      paymentIntents: stripePaymentIntents,
    } as never);
  });

  it("moves a checkout-created terminal transaction from pending to paid on capture", async () => {
    const checkout = await checkoutPosSale("owner-1", "staff-1", {
      registerId: state.register.id,
      shiftId: state.shift.id,
      staffMemberId: "staff-member-1",
      locationId: null,
      brandId: null,
      customerId: null,
      fulfillmentDetail: "PICKUP",
      paymentMode: "CARD_TERMINAL_PLACEHOLDER",
      lines: [{ title: "Latte", quantity: 1, unitPrice: 12.5 }],
    });

    expect(checkout).toEqual({
      ok: true,
      orderId: "ord-1",
      transactionId: "tx-1",
      receiptNumber: expect.stringMatching(/^POS-/),
    });
    expect(state.order?.paymentStatus).toBe("PENDING");
    expect(state.order?.paymentMode).toBe("CARD_TERMINAL_PLACEHOLDER");
    expect(state.transaction).toEqual(
      expect.objectContaining({
        id: "tx-1",
        orderId: "ord-1",
        registerId: state.register.id,
        shiftId: state.shift.id,
        staffId: "staff-member-1",
        paymentMode: "CARD_TERMINAL_PLACEHOLDER",
        paymentStatus: "PENDING",
        total: 12.5,
        status: "COMPLETED",
      }),
    );
    expect(state.payment).toEqual(
      expect.objectContaining({
        id: "pay-1",
        transactionId: "tx-1",
        paymentMode: "CARD_TERMINAL_PLACEHOLDER",
        amount: 12.5,
        status: "PENDING",
        provider: "INTERNAL",
      }),
    );
    expect(state.posAuditEvents).toHaveLength(1);
    expect(state.posAuditEvents[0]).toEqual(
      expect.objectContaining({
        action: "pos.checkout.completed",
        shiftId: state.shift.id,
        transactionId: "tx-1",
      }),
    );

    const captured = await processTerminalPayment("pi_123", "ord-1", "owner-1");

    expect(captured).toEqual({
      id: "tx-1",
      userId: "owner-1",
      workspaceId: "ws-fallback-1",
      locationId: state.register.locationId,
      registerId: state.register.id,
      shiftId: state.shift.id,
      orderId: "ord-1",
      customerId: null,
      staffId: "staff-member-1",
      paymentMode: "CARD_TERMINAL_PLACEHOLDER",
      paymentStatus: "PAID",
      subtotal: 12.5,
      tax: 0,
      discount: 0,
      tip: 0,
      total: 12.5,
      receiptNumber: expect.stringMatching(/^POS-/),
      status: "COMPLETED",
      externalPaymentReference: "pi_123",
      payments: [
        {
          id: "pay-1",
          transactionId: "tx-1",
          paymentMode: "CARD_TERMINAL_PLACEHOLDER",
          amount: 12.5,
          status: "PAID",
          provider: "STRIPE",
          providerReference: "pi_123",
        },
      ],
    });
    expect(state.order).toEqual(
      expect.objectContaining({
        id: "ord-1",
        paymentStatus: "PAID",
        paymentMode: "CARD_TERMINAL_PLACEHOLDER",
      }),
    );
    expect(state.transaction).toEqual(
      expect.objectContaining({
        id: "tx-1",
        paymentStatus: "PAID",
        paymentMode: "CARD_TERMINAL_PLACEHOLDER",
        externalPaymentReference: "pi_123",
      }),
    );
    expect(state.payment).toEqual(
      expect.objectContaining({
        id: "pay-1",
        status: "PAID",
        provider: "STRIPE",
        providerReference: "pi_123",
      }),
    );
    expect(state.posAuditEvents).toHaveLength(2);
    expect(state.posAuditEvents[1]).toEqual({
      userId: "owner-1",
      registerId: state.register.id,
      shiftId: state.shift.id,
      transactionId: "tx-1",
      staffId: "staff-member-1",
      action: "pos.terminal.payment_captured",
      metadataJson: {
        paymentIntentId: "pi_123",
        cardBrand: "visa",
        last4: "4242",
      },
    });
    expect(vi.mocked(prisma.pOSTransaction.findFirst)).toHaveBeenCalledWith({
      where: { orderId: "ord-1", userId: "owner-1" },
      include: { payments: true },
    });
  });

  it("leaves the local checkout pending after terminal cancellation and allows a later recovery capture", async () => {
    const checkout = await checkoutPosSale("owner-1", "staff-1", {
      registerId: state.register.id,
      shiftId: state.shift.id,
      staffMemberId: "staff-member-1",
      locationId: null,
      brandId: null,
      customerId: null,
      fulfillmentDetail: "PICKUP",
      paymentMode: "CARD_TERMINAL_PLACEHOLDER",
      lines: [{ title: "Mocha", quantity: 1, unitPrice: 9.75 }],
    });

    expect(checkout).toEqual({
      ok: true,
      orderId: "ord-1",
      transactionId: "tx-1",
      receiptNumber: expect.stringMatching(/^POS-/),
    });
    expect(state.order).toEqual(
      expect.objectContaining({
        paymentStatus: "PENDING",
        paymentMode: "CARD_TERMINAL_PLACEHOLDER",
      }),
    );
    expect(state.transaction).toEqual(
      expect.objectContaining({
        paymentStatus: "PENDING",
        paymentMode: "CARD_TERMINAL_PLACEHOLDER",
        externalPaymentReference: null,
      }),
    );
    expect(state.payment).toEqual(
      expect.objectContaining({
        status: "PENDING",
        provider: "INTERNAL",
      }),
    );

    await cancelTerminalPayment("pi_original");

    expect(stripePaymentIntents.cancel).toHaveBeenCalledWith("pi_original");
    expect(state.order).toEqual(
      expect.objectContaining({
        paymentStatus: "PENDING",
        paymentMode: "CARD_TERMINAL_PLACEHOLDER",
      }),
    );
    expect(state.transaction).toEqual(
      expect.objectContaining({
        paymentStatus: "PENDING",
        paymentMode: "CARD_TERMINAL_PLACEHOLDER",
        externalPaymentReference: null,
      }),
    );
    expect(state.payment).toEqual(
      expect.objectContaining({
        status: "PENDING",
        provider: "INTERNAL",
      }),
    );
    expect(state.posAuditEvents).toHaveLength(1);
    expect(state.posAuditEvents[0]).toEqual(
      expect.objectContaining({
        action: "pos.checkout.completed",
        transactionId: "tx-1",
      }),
    );

    const retryIntent = await createTerminalPaymentIntent(9.75, "usd", {
      orderId: "ord-1",
      userId: "owner-1",
    });
    expect(retryIntent).toEqual({
      clientSecret: "pi_retry_secret",
      paymentIntentId: "pi_retry",
    });
    expect(stripePaymentIntents.create).toHaveBeenCalledWith({
      amount: 975,
      currency: "usd",
      payment_method_types: ["card_present"],
      capture_method: "automatic",
      metadata: { orderId: "ord-1", userId: "owner-1" },
    });

    const recovered = await processTerminalPayment("pi_retry", "ord-1", "owner-1");

    expect(recovered).toEqual(
      expect.objectContaining({
        id: "tx-1",
        registerId: state.register.id,
        shiftId: state.shift.id,
        paymentStatus: "PAID",
        externalPaymentReference: "pi_retry",
        payments: [
          expect.objectContaining({
            id: "pay-1",
            status: "PAID",
            provider: "STRIPE",
            providerReference: "pi_retry",
          }),
        ],
      }),
    );
    expect(state.order).toEqual(
      expect.objectContaining({
        paymentStatus: "PAID",
        paymentMode: "CARD_TERMINAL_PLACEHOLDER",
      }),
    );
    expect(state.transaction).toEqual(
      expect.objectContaining({
        paymentStatus: "PAID",
        externalPaymentReference: "pi_retry",
      }),
    );
    expect(state.payment).toEqual(
      expect.objectContaining({
        status: "PAID",
        provider: "STRIPE",
        providerReference: "pi_retry",
      }),
    );
    expect(state.posAuditEvents).toHaveLength(2);
    expect(state.posAuditEvents[1]).toEqual({
      userId: "owner-1",
      registerId: state.register.id,
      shiftId: state.shift.id,
      transactionId: "tx-1",
      staffId: "staff-member-1",
      action: "pos.terminal.payment_captured",
      metadataJson: {
        paymentIntentId: "pi_retry",
        cardBrand: "visa",
        last4: "4242",
      },
    });
  });

  it("drives the terminal route handlers through cancel, retry, and capture on the same pending checkout", async () => {
    const checkout = await checkoutPosSale("owner-1", "staff-1", {
      registerId: state.register.id,
      shiftId: state.shift.id,
      staffMemberId: "staff-member-1",
      locationId: null,
      brandId: null,
      customerId: null,
      fulfillmentDetail: "PICKUP",
      paymentMode: "CARD_TERMINAL_PLACEHOLDER",
      lines: [{ title: "Flat white", quantity: 1, unitPrice: 11.25 }],
    });

    expect(checkout).toEqual({
      ok: true,
      orderId: "ord-1",
      transactionId: "tx-1",
      receiptNumber: expect.stringMatching(/^POS-/),
    });
    expect(state.order).toEqual(
      expect.objectContaining({
        paymentStatus: "PENDING",
        paymentMode: "CARD_TERMINAL_PLACEHOLDER",
      }),
    );

    const cancelResponse = await DELETE(
      new Request("http://localhost/api/pos/terminal", {
        method: "DELETE",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ paymentIntentId: "pi_original" }),
      }),
    );
    const cancelJson = await cancelResponse.json();

    expect(cancelResponse.status).toBe(200);
    expect(cancelJson).toEqual({ success: true });
    expect(stripePaymentIntents.cancel).toHaveBeenCalledWith("pi_original");
    expect(state.order).toEqual(
      expect.objectContaining({
        paymentStatus: "PENDING",
        paymentMode: "CARD_TERMINAL_PLACEHOLDER",
      }),
    );
    expect(state.transaction).toEqual(
      expect.objectContaining({
        paymentStatus: "PENDING",
        externalPaymentReference: null,
      }),
    );
    expect(logPosTerminalControlEvent).toHaveBeenCalledWith(
      actor,
      expect.objectContaining({
        action: "POS_TERMINAL_PAYMENT_CANCELLED",
        entityId: "pi_original",
        label: "pi_original",
      }),
    );

    const intentResponse = await POST(
      new Request("http://localhost/api/pos/terminal", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ amount: 11.25, orderId: "ord-1" }),
      }),
    );
    const intentJson = await intentResponse.json();

    expect(intentResponse.status).toBe(200);
    expect(intentJson).toEqual({
      clientSecret: "pi_retry_secret",
      paymentIntentId: "pi_retry",
    });
    expect(stripePaymentIntents.create).toHaveBeenCalledWith({
      amount: 1125,
      currency: "usd",
      payment_method_types: ["card_present"],
      capture_method: "automatic",
      metadata: { orderId: "ord-1", userId: "owner-1" },
    });
    expect(logPosTerminalControlEvent).toHaveBeenCalledWith(
      actor,
      expect.objectContaining({
        action: "POS_TERMINAL_PAYMENT_INTENT_CREATED",
        entityId: "ord-1",
        label: "ord-1",
        metadata: {
          amount: 11.25,
          currency: "usd",
          paymentIntentId: "pi_retry",
        },
      }),
    );

    const captureResponse = await PUT(
      new Request("http://localhost/api/pos/terminal", {
        method: "PUT",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ paymentIntentId: "pi_retry", orderId: "ord-1" }),
      }),
    );
    const captureJson = await captureResponse.json();

    expect(captureResponse.status).toBe(200);
    expect(captureJson).toEqual({
      success: true,
      transaction: expect.objectContaining({
        id: "tx-1",
        orderId: "ord-1",
        paymentStatus: "PAID",
        shiftId: state.shift.id,
        registerId: state.register.id,
        externalPaymentReference: "pi_retry",
      }),
    });
    expect(state.order).toEqual(
      expect.objectContaining({
        paymentStatus: "PAID",
        paymentMode: "CARD_TERMINAL_PLACEHOLDER",
      }),
    );
    expect(state.transaction).toEqual(
      expect.objectContaining({
        paymentStatus: "PAID",
        externalPaymentReference: "pi_retry",
      }),
    );
    expect(state.payment).toEqual(
      expect.objectContaining({
        status: "PAID",
        provider: "STRIPE",
        providerReference: "pi_retry",
      }),
    );
    expect(logPosTerminalControlEvent).toHaveBeenCalledWith(
      actor,
      expect.objectContaining({
        action: "POS_TERMINAL_PAYMENT_CAPTURED",
        entityId: "ord-1",
        label: "ord-1",
        metadata: {
          paymentIntentId: "pi_retry",
          transactionId: "tx-1",
        },
      }),
    );
    expect(state.posAuditEvents).toHaveLength(2);
    expect(state.posAuditEvents[1]).toEqual({
      userId: "owner-1",
      registerId: state.register.id,
      shiftId: state.shift.id,
      transactionId: "tx-1",
      staffId: "staff-member-1",
      action: "pos.terminal.payment_captured",
      metadataJson: {
        paymentIntentId: "pi_retry",
        cardBrand: "visa",
        last4: "4242",
      },
    });
  });
});
