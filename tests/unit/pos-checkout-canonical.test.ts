import { beforeEach, describe, expect, it, vi } from "vitest";

const canUseFeature = vi.hoisted(() => vi.fn());
const createOrderViaCenter = vi.hoisted(() => vi.fn());
const prismaMock = vi.hoisted(() => ({
  userProfile: { findUnique: vi.fn() },
  pOSRegister: { findFirst: vi.fn() },
  pOSShift: { findFirst: vi.fn() },
}));

vi.mock("@/lib/plans/feature-registry", () => ({ canUseFeature }));
vi.mock("@/services/orders/order-creation-service", () => ({
  createOrderViaCenter,
}));
vi.mock("@/lib/prisma", () => ({ prisma: prismaMock }));
vi.mock("@/lib/scope/ensure-owner-workspace", () => ({
  ensureOwnerWorkspaceId: vi.fn(),
}));
vi.mock("@/services/pos/pos-analytics-service", () => ({
  logPosCheckoutAnalytics: vi.fn(),
}));
vi.mock("@/services/pos/pos-crm-service", () => ({
  syncPosOrderToCrm: vi.fn(),
}));
vi.mock("@/services/pos/pos-inventory-impact-service", () => ({
  recordPendingInventoryImpactsForPosOrder: vi.fn(),
}));
vi.mock("@/services/pos/pos-kitchen-routing-service", () => ({
  enqueueKitchenRoutingForPosOrder: vi.fn(),
}));
vi.mock("@/services/pos/pos-receipt-service", () => ({
  buildPosReceiptText: vi.fn(),
}));
vi.mock("@/services/audit/audit-service", () => ({ auditLog: vi.fn() }));
vi.mock("@/services/gift-cards/gift-card-service", () => ({
  redeemGiftCard: vi.fn(),
}));
vi.mock("@/services/loyalty/loyalty-service", () => ({
  earnLoyaltyPointsForOrder: vi.fn(),
  redeemLoyaltyPoints: vi.fn(),
}));

import { checkoutPosSale } from "@/services/pos/pos-checkout-service";

describe("checkoutPosSale", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canUseFeature.mockResolvedValue({ allowed: true });
    prismaMock.pOSRegister.findFirst.mockResolvedValue({
      id: "22222222-2222-4222-8222-222222222222",
      userId: "owner-1",
      locationId: "33333333-3333-4333-8333-333333333333",
      workspaceId: "ws-1",
      location: { id: "33333333-3333-4333-8333-333333333333" },
    });
  });

  it("routes POS checkout through the canonical order service", async () => {
    createOrderViaCenter.mockResolvedValue({
      ok: false,
      error: "canonical stop",
    });

    const result = await checkoutPosSale("owner-1", "staff-1", {
      registerId: "22222222-2222-4222-8222-222222222222",
      shiftId: null,
      staffMemberId: null,
      locationId: null,
      brandId: null,
      customerId: null,
      fulfillmentDetail: "PICKUP",
      paymentMode: "CASH",
      lines: [{ title: "Counter coffee", quantity: 1, unitPrice: 5 }],
    });

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
});
