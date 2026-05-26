"use server";


import { fail, ok } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { canUseFeature } from "@/lib/plans/feature-registry";
import { safeError } from "@/lib/security";
import { checkoutPosSale } from "@/services/pos/pos-checkout-service";
import { refundPosTransaction } from "@/services/pos/pos-refund-service";
import { voidPosTransaction } from "@/services/pos/pos-void-service";
import { createPosRegister } from "@/services/pos/pos-register-service";
import { closePosShift, openPosShift } from "@/services/pos/pos-shift-service";

const checkoutSchema = z.object({
  registerId: z.string().uuid(),
  shiftId: z.string().uuid().nullable(),
  staffMemberId: z.string().uuid().nullable(),
  locationId: z.string().uuid().nullable(),
  brandId: z.string().uuid().nullable(),
  customerId: z.string().uuid().nullable(),
  fulfillmentDetail: z.enum(["PICKUP", "DINE_IN", "DELIVERY"]),
  paymentMode: z.enum([
    "PAY_LATER",
    "REQUEST_ONLY",
    "PAID_EXTERNALLY",
    "MANUAL_INVOICE",
    "STRIPE_PLACEHOLDER",
    "CASH",
    "CARD_TERMINAL_PLACEHOLDER",
    "COMPED",
  ]),
  notes: z.string().max(2000).optional(),
  discountAmount: z.number().optional(),
  taxAmount: z.number().optional(),
  loyaltyPointsRedeem: z.number().int().nonnegative().optional(),
  giftCardCode: z.string().max(32).optional(),
  lines: z
    .array(
      z.object({
        productId: z.string().uuid().optional(),
        title: z.string().min(1).max(255).optional(),
        quantity: z.number().int().positive(),
        unitPrice: z.number().nonnegative(),
        notes: z.string().max(500).optional(),
        modifiersJson: z.unknown().optional(),
      }),
    )
    .min(1),
});

export async function posCheckoutAction(raw: z.infer<typeof checkoutSchema>) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const gate = await canUseFeature(user.id, "pos_terminal");
    if (!gate.allowed) {
      return { ok: false as const, error: "POS is not available on your current plan." };
    }
    const input = checkoutSchema.parse(raw);
    const res = await checkoutPosSale(user.id, user.id, {
      registerId: input.registerId,
      shiftId: input.shiftId,
      staffMemberId: input.staffMemberId,
      locationId: input.locationId,
      brandId: input.brandId,
      customerId: input.customerId,
      fulfillmentDetail: input.fulfillmentDetail,
      paymentMode: input.paymentMode,
      lines: input.lines,
      discountAmount: input.discountAmount,
      taxAmount: input.taxAmount,
      notes: input.notes,
      loyaltyPointsRedeem: input.loyaltyPointsRedeem,
      giftCardCode: input.giftCardCode,
    });
    if (!res.ok) return res;
    revalidatePath("/dashboard/orders");
    revalidatePath("/dashboard/order-hub");
    revalidatePath("/dashboard/pos/transactions");
    revalidatePath("/dashboard/pos/receipts");
    revalidatePath("/dashboard/pos/reports");
    return res;
  } catch (e) {
    return { ok: false as const, error: safeError(e) };
  }
}

export async function posCreateRegisterAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const gate = await canUseFeature(user.id, "pos_terminal");
    if (!gate.allowed) return { error: "POS is not available on your current plan." };
    const name = String(formData.get("name") ?? "").trim();
    if (!name) return { error: "Name is required." };
    const locationId = String(formData.get("locationId") ?? "").trim();
    await createPosRegister(user.id, {
      name,
      locationId: locationId ? locationId : null,
    });
    revalidatePath("/dashboard/pos");
    revalidatePath("/dashboard/pos/registers");
    revalidatePath("/dashboard/pos/terminal");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function posCreateRegisterFormAction(formData: FormData): Promise<void> {
  const r = await posCreateRegisterAction(formData);
  if ("error" in r && r.error) throw new Error(r.error);
}

export async function posOpenShiftAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const gate = await canUseFeature(user.id, "pos_shifts");
    if (!gate.allowed) return { error: "Shift tracking is available on Team and above." };
    const registerId = String(formData.get("registerId") ?? "");
    const staffId = String(formData.get("staffId") ?? "");
    const opening = Number(formData.get("openingCash") ?? "0");
    if (!registerId || !staffId) return { error: "Register and staff are required." };
    const res = await openPosShift({
      userId: dataUserId,
      registerId,
      openedByStaffId: staffId,
      openingCashAmount: opening,
      notes: String(formData.get("notes") ?? "") || undefined,
    });
    if (!res.ok) return { error: res.error };
    revalidatePath("/dashboard/pos/shifts");
    revalidatePath("/dashboard/pos/terminal");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function posOpenShiftFormAction(formData: FormData): Promise<void> {
  const r = await posOpenShiftAction(formData);
  if ("error" in r && r.error) throw new Error(r.error);
}

export async function posCloseShiftAction(formData: FormData) {
  try {
    const { sessionUser: user, dataUserId } = await requireTenantActor();
    const gate = await canUseFeature(user.id, "pos_shifts");
    if (!gate.allowed) return { error: "Shift tracking is available on Team and above." };
    const shiftId = String(formData.get("shiftId") ?? "");
    const staffId = String(formData.get("staffId") ?? "");
    const closing = Number(formData.get("closingCash") ?? "0");
    if (!shiftId || !staffId) return { error: "Shift and staff are required." };
    const res = await closePosShift({
      userId: dataUserId,
      shiftId,
      closedByStaffId: staffId,
      closingCashAmount: closing,
      notes: String(formData.get("notes") ?? "") || undefined,
    });
    if (!res.ok) return { error: res.error };
    revalidatePath("/dashboard/pos/shifts");
    revalidatePath("/dashboard/pos/terminal");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function posCloseShiftFormAction(formData: FormData): Promise<void> {
  const r = await posCloseShiftAction(formData);
  if ("error" in r && r.error) throw new Error(r.error);
}

const voidSchema = z.object({
  transactionId: z.string().uuid(),
  reason: z.string().trim().min(1).max(500),
});

const refundSchema = z.object({
  transactionId: z.string().uuid(),
  reason: z.string().trim().min(1).max(500),
  partialAmount: z.number().positive().optional(),
});

export async function posRefundTransactionAction(raw: z.infer<typeof refundSchema>) {
  try {
    const access = await requireMutationPermission("orders.manage");
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, dataUserId } = access.actor;
    const gate = await canUseFeature(user.id, "pos_terminal");
    if (!gate.allowed) return { error: "POS is not available on your plan." };
    const parsed = refundSchema.safeParse(raw);
    if (!parsed.success) return { error: "Invalid refund request." };
    const res = await refundPosTransaction({
      userId: dataUserId,
      performedByUserId: user.id,
      transactionId: parsed.data.transactionId,
      reason: parsed.data.reason,
      partialAmount: parsed.data.partialAmount,
    });
    if (!res.ok) return { error: res.error };
    revalidatePath("/dashboard/pos/terminal");
    revalidatePath("/dashboard/orders");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function posVoidTransactionAction(raw: z.infer<typeof voidSchema>) {
  try {
    const access = await requireMutationPermission("orders.manage");
    if (!access.ok) return { error: access.error };
    const { sessionUser: user, dataUserId } = access.actor;
    const gate = await canUseFeature(user.id, "pos_terminal");
    if (!gate.allowed) return { error: "POS is not available on your plan." };
    const parsed = voidSchema.safeParse(raw);
    if (!parsed.success) return { error: "Invalid void request." };
    const res = await voidPosTransaction({
      userId: dataUserId,
      performedByUserId: user.id,
      transactionId: parsed.data.transactionId,
      reason: parsed.data.reason,
    });
    if (!res.ok) return { error: res.error };
    revalidatePath("/dashboard/pos/terminal");
    revalidatePath("/dashboard/orders");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}
