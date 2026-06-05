"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { fireHandheldOrderToKds } from "@/services/pos/handheld-kds-fire-service";
import { logPosPermissionDenied } from "@/services/pos/pos-permission-audit";

const fireKdsSchema = z.object({
  registerId: z.string().uuid(),
  shiftId: z.string().uuid().nullable(),
  staffMemberId: z.string().uuid().nullable(),
  locationId: z.string().uuid().nullable(),
  tableId: z.string().uuid().nullable(),
  tableName: z.string().max(80).nullable(),
  tabId: z.string().uuid().nullable(),
  lines: z
    .array(
      z.object({
        productId: z.string().uuid(),
        title: z.string().min(1).max(255),
        quantity: z.number().int().positive(),
        unitPrice: z.number().nonnegative(),
      }),
    )
    .min(1),
});

async function requireHandheldPermission(required: PermissionKey, operation: string) {
  const access = await requireMutationPermission(required);
  if (!access.ok) {
    await logPosPermissionDenied(access.actor, {
      requiredPermission: required,
      operation,
    });
  }
  return access;
}

export async function fireHandheldToKdsAction(raw: z.infer<typeof fireKdsSchema>) {
  const access = await requireHandheldPermission("pos.access", "pos.handheld.fire_kds");
  if (!access.ok) {
    return { ok: false as const, error: access.error };
  }

  const { actor } = access;
  const input = fireKdsSchema.parse(raw);
  const result = await fireHandheldOrderToKds(actor.userId, actor.sessionUser.id, input);
  if (!result.ok) {
    return { ok: false as const, error: result.error };
  }

  revalidatePath("/dashboard/pos/handheld");
  revalidatePath("/dashboard/pos/tabs");
  revalidatePath("/dashboard/kitchen");

  return {
    ok: true as const,
    orderId: result.orderId,
    workItemsCreated: result.workItemsCreated,
    tabId: result.tabId,
    lineCount: result.lineCount,
  };
}
