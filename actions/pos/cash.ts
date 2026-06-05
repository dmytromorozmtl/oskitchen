"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { PermissionKey } from "@/lib/permissions/permissions";
import { canUseFeature } from "@/lib/plans/feature-registry";
import { recordCashDrawerCount } from "@/services/pos/pos-cash-count-service";
import { logPosPermissionDenied } from "@/services/pos/pos-permission-audit";

const countSchema = z.object({
  shiftId: z.string().uuid(),
  staffMemberId: z.string().uuid(),
  countedCash: z.number().nonnegative(),
  notes: z.string().max(500).optional(),
});

async function requireCashPermission(required: PermissionKey, operation: string) {
  const access = await requireMutationPermission(required);
  if (!access.ok) {
    await logPosPermissionDenied(access.actor, {
      requiredPermission: required,
      operation,
    });
  }
  return access;
}

export async function recordCashCountAction(raw: z.infer<typeof countSchema>) {
  const access = await requireCashPermission("pos.shift.close", "pos.cash.count");
  if (!access.ok) {
    return { ok: false as const, error: access.error };
  }

  const { actor } = access;
  const gate = await canUseFeature(actor.userId, "pos_shifts");
  if (!gate.allowed) {
    return { ok: false as const, error: "Cash management requires Team plan shift tracking." };
  }

  const input = countSchema.parse(raw);
  const result = await recordCashDrawerCount({
    userId: actor.userId,
    performedByUserId: actor.sessionUser.id,
    shiftId: input.shiftId,
    staffMemberId: input.staffMemberId,
    countedCashAmount: input.countedCash,
    notes: input.notes,
  });

  if (!result.ok) {
    return { ok: false as const, error: result.error };
  }

  revalidatePath("/dashboard/pos/cash");
  revalidatePath("/dashboard/pos/shifts");

  return {
    ok: true as const,
    variance: result.variance,
    expectedCash: result.expectedCash,
    countedCash: result.countedCash,
  };
}
