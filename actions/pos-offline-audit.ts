"use server";

import { z } from "zod";

import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { safeError } from "@/lib/security";
import {
  logPosOfflineSaleQueued,
  logPosOfflineSyncConflict,
} from "@/services/pos/pos-offline-audit-service";

const queuedSchema = z.object({
  offlineSaleId: z.string().uuid(),
  registerId: z.string().uuid(),
  paymentMode: z.string().min(1).max(64),
  lineCount: z.number().int().positive(),
  total: z.number().nonnegative(),
});

const conflictSchema = z.object({
  offlineSaleId: z.string().uuid(),
  registerId: z.string().uuid(),
  reason: z.enum([
    "duplicate_sale",
    "inventory_shortage",
    "product_unavailable",
    "shift_closed",
    "plan_blocked",
    "unknown",
  ] as const),
  message: z.string().min(1).max(500),
});

function actorPayload(actor: WorkspacePermissionActor) {
  if (!actor.workspaceId) {
    throw new Error("Workspace required for POS offline audit");
  }
  return {
    userId: actor.sessionUserId,
    workspaceId: actor.workspaceId,
    email: actor.email,
    role: actor.staffRoleType ?? actor.workspaceRole,
  };
}

export async function logPosOfflineSaleQueuedAction(raw: unknown) {
  try {
    const access = await requireMutationPermission("pos.checkout");
    if (!access.ok) return { ok: false as const, error: access.error };
    const input = queuedSchema.parse(raw);
    await logPosOfflineSaleQueued(actorPayload(access.actor), input);
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: safeError(e) };
  }
}

export async function logPosOfflineSyncConflictAction(raw: unknown) {
  try {
    const access = await requireMutationPermission("pos.checkout");
    if (!access.ok) return { ok: false as const, error: access.error };
    const input = conflictSchema.parse(raw);
    await logPosOfflineSyncConflict(actorPayload(access.actor), input);
    return { ok: true as const };
  } catch (e) {
    return { ok: false as const, error: safeError(e) };
  }
}
