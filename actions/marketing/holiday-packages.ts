"use server";


import { fail, ok, type ActionResult } from "@/lib/action-result";
import { revalidatePath } from "next/cache";
import { z } from "zod";

import { recordAuditLog } from "@/lib/audit-log";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { prisma } from "@/lib/prisma";

const createHolidayPackageSchema = z.object({
  name: z.string().min(1).max(255),
  price: z.coerce.number().min(0),
  maxOrders: z.coerce.number().int().min(1).max(10_000),
  startDate: z.string().min(1),
  endDate: z.string().min(1),
  description: z
    .union([z.string().max(4000), z.literal("")])
    .optional()
    .transform((v) => (v?.trim() ? v.trim() : undefined)),
});

async function requireHolidayPackageMutation(
  operation: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  const permission: PermissionKey = "growth.manage";
  const access = await requireMutationPermission(permission);
  if (!access.ok) {
    await recordAuditLog({
      userId: access.actor?.sessionUserId ?? null,
      workspaceId: access.actor?.workspaceId ?? null,
      action: "holiday_packages.permission_denied",
      entityType: "HolidayPackage",
      metadata: { operation, requiredPermission: permission },
    });
    return { ok: false, error: access.error };
  }
  return { ok: true };
}

export async function createHolidayPackageAction(
  formData: FormData,
): Promise<ActionResult<void>> {
  const gate = await requireHolidayPackageMutation("holiday_packages.create");
  if (!gate.ok) {
    return fail(gate.error);
  }

  const parsed = createHolidayPackageSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) {
    return fail(parsed.error.issues[0]?.message ?? "Invalid package data");
  }

  const { dataUserId } = await requireTenantActor();
  const start = new Date(parsed.data.startDate);
  const end = new Date(parsed.data.endDate);
  if (end < start) {
    return fail("End date must be on or after start date");
  }

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: dataUserId },
    select: { currency: true },
  });

  await prisma.holidayPackage.create({
    data: {
      userId: dataUserId,
      title: parsed.data.name,
      description: parsed.data.description ?? null,
      price: parsed.data.price,
      currency: kitchen?.currency ?? "USD",
      availableFrom: start,
      availableUntil: end,
      productIdsJson: {
        maxOrders: parsed.data.maxOrders,
        productIds: [] as string[],
      },
      active: true,
    },
  });

  revalidatePath("/dashboard/marketing/holiday-packages");
  return ok(undefined);
}
