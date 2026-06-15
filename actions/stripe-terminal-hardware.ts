"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { fail, ok } from "@/lib/action-result";
import { STRIPE_TERMINAL_DEVICE_TYPES } from "@/lib/payments/stripe-terminal-hardware-types";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import {
  getStripeTerminalHardwareDashboard,
  registerPhysicalReader,
  setDefaultStripeReader,
  syncReadersFromStripe,
  unregisterStripeReader,
} from "@/services/payments/stripe-terminal-hardware-service";

const registerSchema = z.object({
  registrationCode: z.string().min(6).max(64),
  label: z.string().min(1).max(120),
  deviceType: z.enum(STRIPE_TERMINAL_DEVICE_TYPES),
  registerId: z.string().uuid().optional(),
});

export async function registerStripeTerminalReaderAction(formData: FormData) {
  try {
    const access = await requireMutationPermission("pos.hardware.manage");
    if (!access.ok) return fail(access.error);

    const { dataUserId } = await requireTenantActor();
    const parsed = registerSchema.safeParse({
      registrationCode: String(formData.get("registrationCode") ?? ""),
      label: String(formData.get("label") ?? ""),
      deviceType: String(formData.get("deviceType") ?? ""),
      registerId: String(formData.get("registerId") ?? "") || undefined,
    });
    if (!parsed.success) {
      return fail(parsed.error.issues[0]?.message ?? "Invalid reader registration.");
    }

    const result = await registerPhysicalReader({
      userId: dataUserId,
      ...parsed.data,
    });
    if (!result.ok) return fail(result.error);

    revalidatePath("/dashboard/settings/hardware");
    revalidatePath("/dashboard/pos/settings/hardware");
    revalidatePath("/dashboard/pos/terminal");
    return ok({ reader: result.reader });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function syncStripeTerminalReadersAction() {
  try {
    const access = await requireMutationPermission("pos.hardware.manage");
    if (!access.ok) return fail(access.error);

    const { dataUserId } = await requireTenantActor();
    const readers = await syncReadersFromStripe(dataUserId);
    revalidatePath("/dashboard/settings/hardware");
    return ok({ readers });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function setDefaultStripeTerminalReaderAction(formData: FormData) {
  try {
    const access = await requireMutationPermission("pos.hardware.manage");
    if (!access.ok) return fail(access.error);

    const { dataUserId } = await requireTenantActor();
    const readerId = String(formData.get("readerId") ?? "");
    if (!readerId) return fail("Reader id required.");

    const updated = await setDefaultStripeReader(dataUserId, readerId);
    if (!updated) return fail("Reader not found.");

    revalidatePath("/dashboard/settings/hardware");
    return ok({ updated: true });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function unregisterStripeTerminalReaderAction(formData: FormData) {
  try {
    const access = await requireMutationPermission("pos.hardware.manage");
    if (!access.ok) return fail(access.error);

    const { dataUserId } = await requireTenantActor();
    const readerId = String(formData.get("readerId") ?? "");
    if (!readerId) return fail("Reader id required.");

    const result = await unregisterStripeReader(dataUserId, readerId);
    if (!result.ok) return fail(result.error ?? "Could not remove reader.");

    revalidatePath("/dashboard/settings/hardware");
    return ok({ removed: true });
  } catch (e) {
    return fail(safeError(e));
  }
}

export async function loadStripeTerminalHardwareDashboardAction() {
  try {
    const { dataUserId } = await requireTenantActor();
    const dashboard = await getStripeTerminalHardwareDashboard(dataUserId);
    return ok(dashboard);
  } catch (e) {
    return fail(safeError(e));
  }
}
