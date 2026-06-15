"use server";


import { revalidatePath } from "next/cache";
import { z } from "zod";

import { recordAuditLog } from "@/lib/audit-log";
import { canSupervisorOverride } from "@/lib/packing-verification/verification-validation";
import { QC_EVENT } from "@/lib/packing-verification/verification-actions";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import type { WorkspacePermissionActor } from "@/lib/permissions/require-workspace-permission";
import { prisma } from "@/lib/prisma";
import { safeError } from "@/lib/security";
import {
  completeVerificationSession,
  getVerificationSessionDetail,
  listOpenSessions,
  listRecentScans,
  searchOrdersByCustomer,
  sendSessionBackToPacking,
  startOrderVerificationSession,
  supervisorOverrideSession,
  updateVerificationItem,
} from "@/services/packing-verification/verification-service";
import { PackingVerificationItemStatus } from "@prisma/client";

async function requirePackingVerificationPermission(
  operation: string,
): Promise<{ ok: true; actor: WorkspacePermissionActor } | { ok: false; error: string }> {
  const access = await requireMutationPermission("packing.manage");
  if (!access.ok) {
    await recordAuditLog({
      userId: access.actor?.sessionUserId ?? null,
      workspaceId: access.actor?.workspaceId ?? null,
      action: "packing.verification.permission_denied",
      entityType: "PackingVerificationSession",
      metadata: { operation, requiredPermission: "packing.manage" },
    });
    return { ok: false, error: access.error };
  }
  return { ok: true, actor: access.actor };
}

export async function getVerificationSessionDetailAction(sessionId: string) {
  try {
    const gate = await requirePackingVerificationPermission("packing.verification.session.read");
    if (!gate.ok) return { error: gate.error };

    const detail = await getVerificationSessionDetail(sessionId, gate.actor.dataUserId);
    if (!detail) return { error: "Session not found." };
    return { ok: true as const, detail };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function startVerificationSessionAction(formData: FormData) {
  try {
    const gate = await requirePackingVerificationPermission("packing.verification.session.start");
    if (!gate.ok) return { error: gate.error };

    const orderId = z.string().uuid().safeParse(formData.get("orderId"));
    if (!orderId.success) return { error: "Invalid order." };

    const { sessionId, reused } = await startOrderVerificationSession({
      tenantUserId: gate.actor.dataUserId,
      actorUserId: gate.actor.sessionUserId,
      orderId: orderId.data,
    });

    revalidatePath("/dashboard/packing/verify");
    return { ok: true as const, sessionId, reused };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function searchOrdersByCustomerAction(formData: FormData) {
  try {
    const gate = await requirePackingVerificationPermission("packing.verification.orders.search");
    if (!gate.ok) return { error: gate.error };

    const q = z.string().min(2).max(120).safeParse(String(formData.get("query") ?? "").trim());
    if (!q.success) return { error: "Enter at least two characters." };
    const rows = await searchOrdersByCustomer({
      tenantUserId: gate.actor.dataUserId,
      query: q.data,
    });
    return { ok: true as const, orders: rows };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function loadVerificationShellAction() {
  try {
    const gate = await requirePackingVerificationPermission("packing.verification.shell.read");
    if (!gate.ok) return { error: gate.error };

    const [recentScans, openSessions] = await Promise.all([
      listRecentScans(gate.actor.dataUserId, 20),
      listOpenSessions(gate.actor.dataUserId, 12),
    ]);
    return {
      ok: true as const,
      recentScans: recentScans.map((s) => ({
        ...s,
        scannedAt: s.scannedAt.toISOString(),
      })),
      openSessions: openSessions.map((s) => ({
        id: s.id,
        status: s.status,
        startedAt: s.startedAt.toISOString(),
        itemCount: s._count.items,
        order: s.order,
      })),
    };
  } catch (e) {
    return { error: safeError(e) };
  }
}

const itemStatusSchema = z.nativeEnum(PackingVerificationItemStatus);

export async function verifyItemFullQuantityAction(formData: FormData) {
  try {
    const gate = await requirePackingVerificationPermission("packing.verification.item.verify_full");
    if (!gate.ok) return { error: gate.error };

    const itemId = z.string().uuid().safeParse(formData.get("itemId"));
    if (!itemId.success) return { error: "Invalid item." };

    const item = await prisma.packingVerificationItem.findFirst({
      where: { id: itemId.data, session: { userId: gate.actor.dataUserId } },
    });
    if (!item) return { error: "Item not found." };

    await updateVerificationItem({
      tenantUserId: gate.actor.dataUserId,
      actorUserId: gate.actor.sessionUserId,
      itemId: item.id,
      patch: {
        verifiedQuantity: item.expectedQuantity,
        status: "VERIFIED",
        allergenCheckStatus: item.allergenCheckStatus === "PENDING" ? "PASSED" : item.allergenCheckStatus,
        labelCheckStatus:
          item.labelCheckStatus === "PENDING" ? "PASSED" : (item.labelCheckStatus ?? undefined),
      },
      qcEventType: QC_EVENT.ITEM_VERIFIED,
      metadata: { qty: item.expectedQuantity },
    });
    revalidatePath("/dashboard/packing/verify");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function incrementVerifiedQuantityAction(formData: FormData) {
  try {
    const gate = await requirePackingVerificationPermission("packing.verification.item.increment");
    if (!gate.ok) return { error: gate.error };

    const itemId = z.string().uuid().safeParse(formData.get("itemId"));
    if (!itemId.success) return { error: "Invalid item." };

    const item = await prisma.packingVerificationItem.findFirst({
      where: { id: itemId.data, session: { userId: gate.actor.dataUserId } },
    });
    if (!item) return { error: "Item not found." };
    const next = Math.min(item.expectedQuantity, item.verifiedQuantity + 1);
    await updateVerificationItem({
      tenantUserId: gate.actor.dataUserId,
      actorUserId: gate.actor.sessionUserId,
      itemId: item.id,
      patch: { verifiedQuantity: next, status: next >= item.expectedQuantity ? "VERIFIED" : "PENDING" },
      qcEventType: QC_EVENT.ITEM_INCREMENT,
      metadata: { qty: next },
    });
    revalidatePath("/dashboard/packing/verify");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function setVerificationItemStatusAction(formData: FormData) {
  try {
    const gate = await requirePackingVerificationPermission("packing.verification.item.set_status");
    if (!gate.ok) return { error: gate.error };

    const itemId = z.string().uuid().safeParse(formData.get("itemId"));
    const status = itemStatusSchema.safeParse(formData.get("status"));
    if (!itemId.success || !status.success) return { error: "Invalid request." };

    const item = await prisma.packingVerificationItem.findFirst({
      where: { id: itemId.data, session: { userId: gate.actor.dataUserId } },
    });
    if (!item) return { error: "Item not found." };

    const map: Record<string, string> = {
      MISSING: QC_EVENT.ITEM_MISSING,
      WRONG_ITEM: QC_EVENT.ITEM_WRONG,
      DAMAGED: QC_EVENT.ITEM_DAMAGED,
      EXTRA: QC_EVENT.ITEM_EXTRA,
      SUBSTITUTED: QC_EVENT.ITEM_SUBSTITUTED,
    };
    const qc = map[status.data] ?? QC_EVENT.ISSUE_OPENED;

    await updateVerificationItem({
      tenantUserId: gate.actor.dataUserId,
      actorUserId: gate.actor.sessionUserId,
      itemId: item.id,
      patch: { status: status.data, verifiedQuantity: status.data === "MISSING" ? 0 : item.verifiedQuantity },
      qcEventType: qc,
    });
    revalidatePath("/dashboard/packing/verify");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function markAllergenCheckedAction(formData: FormData) {
  try {
    const gate = await requirePackingVerificationPermission("packing.verification.item.allergen_check");
    if (!gate.ok) return { error: gate.error };

    const itemId = z.string().uuid().safeParse(formData.get("itemId"));
    if (!itemId.success) return { error: "Invalid item." };
    await updateVerificationItem({
      tenantUserId: gate.actor.dataUserId,
      actorUserId: gate.actor.sessionUserId,
      itemId: itemId.data,
      patch: { allergenCheckStatus: "PASSED" },
      qcEventType: QC_EVENT.ALLERGEN_CHECKED,
    });
    revalidatePath("/dashboard/packing/verify");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function markLabelCheckedAction(formData: FormData) {
  try {
    const gate = await requirePackingVerificationPermission("packing.verification.item.label_check");
    if (!gate.ok) return { error: gate.error };

    const itemId = z.string().uuid().safeParse(formData.get("itemId"));
    if (!itemId.success) return { error: "Invalid item." };
    await updateVerificationItem({
      tenantUserId: gate.actor.dataUserId,
      actorUserId: gate.actor.sessionUserId,
      itemId: itemId.data,
      patch: { labelCheckStatus: "PASSED" },
      qcEventType: QC_EVENT.LABEL_CHECKED,
    });
    revalidatePath("/dashboard/packing/verify");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function completeVerificationSessionAction(formData: FormData) {
  try {
    const gate = await requirePackingVerificationPermission("packing.verification.session.complete");
    if (!gate.ok) return { error: gate.error };

    const sessionId = z.string().uuid().safeParse(formData.get("sessionId"));
    const outcome = z.enum(["pass", "fail", "partial"]).safeParse(formData.get("outcome"));
    if (!sessionId.success || !outcome.success) return { error: "Invalid session." };

    await completeVerificationSession({
      tenantUserId: gate.actor.dataUserId,
      actorUserId: gate.actor.sessionUserId,
      sessionId: sessionId.data,
      outcome: outcome.data,
    });
    revalidatePath("/dashboard/packing/verify");
    revalidatePath("/dashboard/packing");
    return { ok: true as const };
  } catch (e) {
    const msg = e instanceof Error && e.message === "NOT_READY_TO_PASS" ? "Resolve all lines before passing." : safeError(e);
    return { error: msg };
  }
}

export async function supervisorOverrideVerificationAction(formData: FormData) {
  try {
    const gate = await requirePackingVerificationPermission("packing.verification.session.supervisor_override");
    if (!gate.ok) return { error: gate.error };

    if (
      !canSupervisorOverride({
        role: gate.actor.workspaceRole,
        platformBypass: gate.actor.platformBypass,
      })
    ) {
      return { error: "Supervisor or owner access required for override." };
    }

    const sessionId = z.string().uuid().safeParse(formData.get("sessionId"));
    const reason = z.string().min(4).max(2000).safeParse(String(formData.get("reason") ?? "").trim());
    if (!sessionId.success || !reason.success) return { error: "Provide session and reason (min 4 chars)." };

    await supervisorOverrideSession({
      tenantUserId: gate.actor.dataUserId,
      actorUserId: gate.actor.sessionUserId,
      sessionId: sessionId.data,
      reason: reason.data,
    });
    revalidatePath("/dashboard/packing/verify");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}

export async function sendVerificationBackToPackingAction(formData: FormData) {
  try {
    const gate = await requirePackingVerificationPermission("packing.verification.session.send_back");
    if (!gate.ok) return { error: gate.error };

    const sessionId = z.string().uuid().safeParse(formData.get("sessionId"));
    if (!sessionId.success) return { error: "Invalid session." };

    await sendSessionBackToPacking({
      tenantUserId: gate.actor.dataUserId,
      actorUserId: gate.actor.sessionUserId,
      sessionId: sessionId.data,
    });
    revalidatePath("/dashboard/packing/verify");
    revalidatePath("/dashboard/packing");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}
