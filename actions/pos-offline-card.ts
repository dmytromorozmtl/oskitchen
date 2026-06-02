"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok } from "@/lib/action-result";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import {
  enqueueOfflineCardCapture,
  getOfflineCardDashboard,
  linkOfflineCardCaptureToOrder,
  syncOfflineCardCaptures,
} from "@/services/pos/offline-card-service";

const captureSchema = z.object({
  offlineSaleId: z.string().uuid(),
  registerId: z.string().uuid(),
  amountCents: z.coerce.number().int().positive().max(100_000_000),
  cardBrand: z.string().min(2).max(32),
  last4: z.string().regex(/^\d{4}$/),
  paymentIntentId: z.string().regex(/^pi_[a-zA-Z0-9]+$/).optional(),
  stripeOfflineReference: z.string().max(255).optional(),
  tableId: z.string().max(64).optional(),
  deviceId: z.string().max(64).optional(),
});

export async function enqueueOfflineCardCaptureAction(formData: FormData) {
  try {
    const access = await requireMutationPermission("orders.manage");
    if (!access.ok) return fail(access.error);

    const { dataUserId } = await requireTenantActor();
    const parsed = captureSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid offline card payload.");
    }

    const result = await enqueueOfflineCardCapture({
      userId: dataUserId,
      capture: parsed.data,
    });

    revalidatePath("/dashboard/pos/terminal");
    return ok({ id: result.id, record: result.record });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function syncOfflineCardCapturesAction() {
  try {
    const access = await requireMutationPermission("orders.manage");
    if (!access.ok) return fail(access.error);

    const { dataUserId } = await requireTenantActor();
    const result = await syncOfflineCardCaptures({
      userId: dataUserId,
      online: true,
    });

    revalidatePath("/dashboard/pos/terminal");
    return ok(result);
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function loadOfflineCardDashboardAction() {
  try {
    const { dataUserId } = await requireTenantActor();
    const dashboard = await getOfflineCardDashboard({ userId: dataUserId });
    return ok(dashboard);
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function linkOfflineCardCaptureAction(formData: FormData) {
  try {
    const access = await requireMutationPermission("orders.manage");
    if (!access.ok) return fail(access.error);

    const { dataUserId } = await requireTenantActor();
    const offlineSaleId = String(formData.get("offlineSaleId") ?? "");
    const orderId = String(formData.get("orderId") ?? "");
    if (!offlineSaleId || !orderId) return fail("offlineSaleId and orderId are required.");

    const linked = await linkOfflineCardCaptureToOrder({
      userId: dataUserId,
      offlineSaleId,
      orderId,
    });
    if (!linked) return fail("No queued offline card capture for this sale.");
    return ok({ linked: true });
  } catch (e) {
    return fail(safeError(e));
  }
}
