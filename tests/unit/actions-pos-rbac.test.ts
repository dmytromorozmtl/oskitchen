import { beforeEach, describe, expect, it, vi } from "vitest";

const requireMutationPermission = vi.hoisted(() => vi.fn());
const canUseFeature = vi.hoisted(() => vi.fn());
const checkoutPosSale = vi.hoisted(() => vi.fn());
const createPosRegister = vi.hoisted(() => vi.fn());
const openPosShift = vi.hoisted(() => vi.fn());
const closePosShift = vi.hoisted(() => vi.fn());
const refundPosTransaction = vi.hoisted(() => vi.fn());
const voidPosTransaction = vi.hoisted(() => vi.fn());
const revalidatePath = vi.hoisted(() => vi.fn());
const logPosPermissionDenied = vi.hoisted(() => vi.fn());
const logPosRegisterCreated = vi.hoisted(() => vi.fn());

vi.mock("next/cache", () => ({ revalidatePath }));
vi.mock("@/lib/permissions/mutation-access", () => ({ requireMutationPermission }));
vi.mock("@/lib/plans/feature-registry", () => ({ canUseFeature }));
vi.mock("@/services/pos/pos-checkout-service", () => ({ checkoutPosSale }));
vi.mock("@/services/pos/pos-register-service", () => ({ createPosRegister }));
vi.mock("@/services/pos/pos-shift-service", () => ({ openPosShift, closePosShift }));
vi.mock("@/services/pos/pos-refund-service", () => ({ refundPosTransaction }));
vi.mock("@/services/pos/pos-void-service", () => ({ voidPosTransaction }));
vi.mock("@/services/pos/pos-permission-audit", () => ({
  logPosPermissionDenied,
  logPosRegisterCreated,
}));

import { posCheckoutAction } from "@/actions/pos";

const actor = {
  sessionUser: { id: "staff-user-1" },
  sessionUserId: "staff-user-1",
  userId: "owner-user-1",
  dataUserId: "owner-user-1",
  workspaceId: "ws-1",
  workspaceRole: "STAFF" as const,
  staffRoleType: "MANAGER" as const,
  email: "manager@example.com",
  granted: new Set(["pos.checkout", "pos.discount.apply"]),
};

const baseCheckoutInput = {
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

describe("POS action RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canUseFeature.mockResolvedValue({ allowed: true });
    checkoutPosSale.mockResolvedValue({ ok: true, orderId: "ord-1" });
  });

  it("uses owner-scoped tenant data for checkout mutations", async () => {
    requireMutationPermission.mockResolvedValueOnce({ ok: true, actor });

    const result = await posCheckoutAction(baseCheckoutInput);

    expect(result).toEqual({ ok: true, orderId: "ord-1" });
    expect(canUseFeature).toHaveBeenCalledWith("owner-user-1", "pos_terminal");
    expect(checkoutPosSale).toHaveBeenCalledWith(
      "owner-user-1",
      "staff-user-1",
      expect.objectContaining({
        registerId: baseCheckoutInput.registerId,
        paymentMode: "CASH",
      }),
    );
  });

  it("blocks discounted checkout without manager-grade POS permission", async () => {
    requireMutationPermission
      .mockResolvedValueOnce({ ok: true, actor })
      .mockResolvedValueOnce({ ok: false, error: "Discount approval required.", actor });

    const result = await posCheckoutAction({
      ...baseCheckoutInput,
      discountAmount: 2,
    });

    expect(result).toEqual({ ok: false, error: "Discount approval required." });
    expect(checkoutPosSale).not.toHaveBeenCalled();
    expect(logPosPermissionDenied).toHaveBeenCalledWith(actor, {
      requiredPermission: "pos.discount.apply",
      operation: "pos.checkout.discount",
      metadata: {
        paymentMode: "CASH",
        explicitDiscountAmount: 2,
      },
    });
  });
});
