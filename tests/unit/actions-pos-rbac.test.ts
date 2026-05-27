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
const logPosShiftEvent = vi.hoisted(() => vi.fn());

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
  logPosShiftEvent,
}));

import {
  posCheckoutAction,
  posCloseShiftAction,
  posCreateRegisterAction,
  posOpenShiftAction,
  posRefundTransactionAction,
  posVoidTransactionAction,
} from "@/actions/pos";
import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";

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

function formDataFrom(values: Record<string, string>) {
  const formData = new FormData();
  for (const [key, value] of Object.entries(values)) {
    formData.set(key, value);
  }
  return formData;
}

const baseForbiddenAccess = { ok: false as const, error: "Forbidden", actor };

describe("POS action RBAC", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    canUseFeature.mockResolvedValue({ allowed: true });
    checkoutPosSale.mockResolvedValue({ ok: true, orderId: "ord-1" });
    createPosRegister.mockResolvedValue({ id: "reg-1", name: "Front counter", locationId: null });
    openPosShift.mockResolvedValue({
      ok: true,
      shift: {
        id: "shift-1",
        registerId: "reg-1",
        openedByStaffId: "staff-1",
        openingCashAmount: 50,
      },
    });
    closePosShift.mockResolvedValue({
      ok: true,
      shift: {
        id: "shift-1",
        registerId: "reg-1",
        closedByStaffId: "staff-1",
        closingCashAmount: 55,
        expectedCashAmount: 80,
        varianceAmount: -25,
      },
    });
    refundPosTransaction.mockResolvedValue({ ok: true });
    voidPosTransaction.mockResolvedValue({ ok: true });
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

  it("blocks register creation without register management permission", async () => {
    requireMutationPermission.mockResolvedValueOnce(baseForbiddenAccess);

    const result = await posCreateRegisterAction(formDataFrom({ name: "Front counter" }));

    expect(result).toEqual({ error: "Forbidden" });
    expect(createPosRegister).not.toHaveBeenCalled();
    expect(logPosPermissionDenied).toHaveBeenCalledWith(
      actor,
      expect.objectContaining({
        requiredPermission: "pos.register.manage",
        operation: "pos.register.create",
      }),
    );
  });

  it("blocks shift open without shift-open permission", async () => {
    requireMutationPermission.mockResolvedValueOnce(baseForbiddenAccess);

    const result = await posOpenShiftAction(
      formDataFrom({
        registerId: "reg-1",
        staffId: "staff-1",
        openingCash: "50",
      }),
    );

    expect(result).toEqual({ error: "Forbidden" });
    expect(openPosShift).not.toHaveBeenCalled();
    expect(logPosPermissionDenied).toHaveBeenCalledWith(
      actor,
      expect.objectContaining({
        requiredPermission: "pos.shift.open",
        operation: "pos.shift.open",
      }),
    );
  });

  it("uses owner-scoped tenant data and audits shift open events", async () => {
    requireMutationPermission.mockResolvedValueOnce({ ok: true, actor });

    const result = await posOpenShiftAction(
      formDataFrom({
        registerId: "reg-1",
        staffId: "staff-1",
        openingCash: "50",
      }),
    );

    expect(result).toEqual({ ok: true });
    expect(openPosShift).toHaveBeenCalledWith({
      userId: "owner-user-1",
      registerId: "reg-1",
      openedByStaffId: "staff-1",
      openingCashAmount: 50,
      notes: undefined,
    });
    expect(logPosShiftEvent).toHaveBeenCalledWith(actor, {
      action: AUDIT_ACTIONS.POS_SHIFT_OPENED,
      entityId: "shift-1",
      label: "shift-1",
      metadata: {
        registerId: "reg-1",
        openedByStaffId: "staff-1",
        openingCashAmount: 50,
      },
    });
  });

  it("blocks shift close without shift-close permission", async () => {
    requireMutationPermission.mockResolvedValueOnce(baseForbiddenAccess);

    const result = await posCloseShiftAction(
      formDataFrom({
        shiftId: "shift-1",
        staffId: "staff-1",
        closingCash: "55",
      }),
    );

    expect(result).toEqual({ error: "Forbidden" });
    expect(closePosShift).not.toHaveBeenCalled();
    expect(logPosPermissionDenied).toHaveBeenCalledWith(
      actor,
      expect.objectContaining({
        requiredPermission: "pos.shift.close",
        operation: "pos.shift.close",
      }),
    );
  });

  it("uses owner-scoped tenant data and audits shift close events", async () => {
    requireMutationPermission.mockResolvedValueOnce({ ok: true, actor });

    const result = await posCloseShiftAction(
      formDataFrom({
        shiftId: "shift-1",
        staffId: "staff-1",
        closingCash: "55",
      }),
    );

    expect(result).toEqual({ ok: true });
    expect(closePosShift).toHaveBeenCalledWith({
      userId: "owner-user-1",
      shiftId: "shift-1",
      closedByStaffId: "staff-1",
      closingCashAmount: 55,
      notes: undefined,
    });
    expect(logPosShiftEvent).toHaveBeenCalledWith(actor, {
      action: AUDIT_ACTIONS.POS_SHIFT_CLOSED,
      entityId: "shift-1",
      label: "shift-1",
      metadata: {
        registerId: "reg-1",
        closedByStaffId: "staff-1",
        closingCashAmount: 55,
        expectedCashAmount: 80,
        varianceAmount: -25,
      },
    });
  });

  it("blocks refunds without refund permission", async () => {
    requireMutationPermission.mockResolvedValueOnce(baseForbiddenAccess);

    const result = await posRefundTransactionAction({
      transactionId: "33333333-3333-4333-8333-333333333333",
      reason: "Customer changed their mind",
      partialAmount: 3,
    });

    expect(result).toEqual({ error: "Forbidden" });
    expect(refundPosTransaction).not.toHaveBeenCalled();
    expect(logPosPermissionDenied).toHaveBeenCalledWith(
      actor,
      expect.objectContaining({
        requiredPermission: "pos.refund",
        operation: "pos.refund",
      }),
    );
  });

  it("blocks voids without void permission", async () => {
    requireMutationPermission.mockResolvedValueOnce(baseForbiddenAccess);

    const result = await posVoidTransactionAction({
      transactionId: "44444444-4444-4444-8444-444444444444",
      reason: "Entered on the wrong register",
    });

    expect(result).toEqual({ error: "Forbidden" });
    expect(voidPosTransaction).not.toHaveBeenCalled();
    expect(logPosPermissionDenied).toHaveBeenCalledWith(
      actor,
      expect.objectContaining({
        requiredPermission: "pos.void",
        operation: "pos.void",
      }),
    );
  });
});
