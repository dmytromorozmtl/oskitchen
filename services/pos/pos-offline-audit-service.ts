import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import type { OfflineSyncConflictReason } from "@/lib/pos/offline-sync";
import { auditLog } from "@/services/audit/audit-service";

type PosOfflineAuditActor = {
  userId: string;
  workspaceId: string;
  email?: string | null;
  role?: string | null;
};

export async function logPosOfflineSaleQueued(
  actor: PosOfflineAuditActor,
  input: {
    offlineSaleId: string;
    registerId: string;
    paymentMode: string;
    lineCount: number;
    total: number;
  },
): Promise<void> {
  await auditLog({
    workspaceId: actor.workspaceId,
    actor: {
      userId: actor.userId,
      email: actor.email ?? undefined,
      role: actor.role ?? undefined,
    },
    action: AUDIT_ACTIONS.POS_OFFLINE_SALE_QUEUED,
    category: "ORDERS",
    source: "USER",
    severity: "INFO",
    entity: { type: "OfflinePosSale", id: input.offlineSaleId, label: "QUEUED" },
    metadata: {
      registerId: input.registerId,
      paymentMode: input.paymentMode,
      lineCount: input.lineCount,
      total: input.total,
    },
    maskPiiInMetadata: true,
  });
}

export async function logPosOfflineSyncCompleted(
  actor: PosOfflineAuditActor,
  input: {
    offlineSaleId: string;
    orderId: string;
    registerId: string;
    receiptNumber?: string | null;
  },
): Promise<void> {
  await auditLog({
    workspaceId: actor.workspaceId,
    actor: {
      userId: actor.userId,
      email: actor.email ?? undefined,
      role: actor.role ?? undefined,
    },
    action: AUDIT_ACTIONS.POS_OFFLINE_SYNC_COMPLETED,
    category: "ORDERS",
    source: "USER",
    severity: "INFO",
    entity: { type: "Order", id: input.orderId, label: input.receiptNumber ?? "OFFLINE_SYNC" },
    metadata: {
      offlineSaleId: input.offlineSaleId,
      registerId: input.registerId,
      receiptNumber: input.receiptNumber ?? null,
    },
    maskPiiInMetadata: true,
  });
}

export async function logPosOfflineSyncConflict(
  actor: PosOfflineAuditActor,
  input: {
    offlineSaleId: string;
    registerId: string;
    reason: OfflineSyncConflictReason;
    message: string;
  },
): Promise<void> {
  await auditLog({
    workspaceId: actor.workspaceId,
    actor: {
      userId: actor.userId,
      email: actor.email ?? undefined,
      role: actor.role ?? undefined,
    },
    action: AUDIT_ACTIONS.POS_OFFLINE_SYNC_CONFLICT,
    category: "ORDERS",
    source: "USER",
    severity: "WARNING",
    entity: { type: "OfflinePosSale", id: input.offlineSaleId, label: "CONFLICT" },
    metadata: {
      registerId: input.registerId,
      reason: input.reason,
      message: input.message,
    },
    maskPiiInMetadata: true,
  });
}
