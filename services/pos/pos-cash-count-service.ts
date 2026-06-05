import { Prisma } from "@prisma/client";

import { AUDIT_ACTIONS } from "@/lib/audit/audit-actions";
import { prisma } from "@/lib/prisma";
import { ensureOwnerWorkspaceId } from "@/lib/scope/ensure-owner-workspace";
import { ownerScopedAnd } from "@/lib/scope/workspace-resource-scope";
import { auditLog } from "@/services/audit/audit-service";
import { getShiftCloseoutVariance } from "@/services/pos/pos-shift-service";

export type RecordCashDrawerCountInput = {
  userId: string;
  performedByUserId: string;
  shiftId: string;
  staffMemberId: string;
  countedCashAmount: number;
  notes?: string | null;
};

export type RecordCashDrawerCountResult =
  | {
      ok: true;
      variance: number;
      expectedCash: number;
      countedCash: number;
    }
  | { ok: false; error: string };

export async function recordCashDrawerCount(
  input: RecordCashDrawerCountInput,
): Promise<RecordCashDrawerCountResult> {
  const preview = await getShiftCloseoutVariance(
    input.userId,
    input.shiftId,
    input.countedCashAmount,
  );
  if (!preview.ok) {
    return { ok: false, error: preview.error };
  }

  const shiftWhere = (await ownerScopedAnd(input.userId, {
    id: input.shiftId,
    status: "OPEN",
  })) as Prisma.POSShiftWhereInput;
  const shift = await prisma.pOSShift.findFirst({
    where: shiftWhere,
    include: { register: { select: { id: true, name: true, workspaceId: true } } },
  });
  if (!shift) {
    return { ok: false, error: "Open shift not found." };
  }

  const workspaceId = shift.workspaceId ?? (await ensureOwnerWorkspaceId(input.userId));

  await prisma.pOSAuditEvent.create({
    data: {
      userId: input.userId,
      workspaceId,
      registerId: shift.register.id,
      shiftId: shift.id,
      staffId: input.staffMemberId,
      action: "pos.cash.counted",
      metadataJson: {
        countedCashAmount: input.countedCashAmount,
        expectedCashAmount: preview.expectedCash,
        varianceAmount: preview.variance,
        notes: input.notes ?? undefined,
      } as Prisma.InputJsonValue,
    },
  });

  await auditLog({
    actor: { userId: input.performedByUserId },
    action: AUDIT_ACTIONS.POS_CASH_COUNTED,
    category: "ORDERS",
    source: "USER",
    severity: "INFO",
    entity: { type: "POSShift", id: shift.id, label: shift.register.name },
    metadata: {
      registerId: shift.register.id,
      countedCashAmount: input.countedCashAmount,
      expectedCashAmount: preview.expectedCash,
      varianceAmount: preview.variance,
    },
    maskPiiInMetadata: true,
  });

  return {
    ok: true,
    variance: preview.variance,
    expectedCash: preview.expectedCash,
    countedCash: input.countedCashAmount,
  };
}

export async function listRecentCashDrawerCounts(
  userId: string,
  limit = 10,
): Promise<
  Array<{
    id: string;
    shiftId: string;
    registerName: string;
    countedAtIso: string;
    countedCash: number;
    expectedCash: number;
    variance: number;
    staffName: string | null;
    notes: string | null;
  }>
> {
  const eventWhere = (await ownerScopedAnd(userId, {
    action: "pos.cash.counted",
  })) as Prisma.POSAuditEventWhereInput;

  const rows = await prisma.pOSAuditEvent.findMany({
    where: eventWhere,
    orderBy: { createdAt: "desc" },
    take: limit,
    include: {
      shift: { include: { register: { select: { name: true } } } },
      staff: { select: { name: true } },
    },
  });

  return rows.map((row) => {
    const meta = (row.metadataJson ?? {}) as Record<string, unknown>;
    return {
      id: row.id,
      shiftId: row.shiftId ?? "",
      registerName: row.shift?.register.name ?? "Register",
      countedAtIso: row.createdAt.toISOString(),
      countedCash: Number(meta.countedCashAmount ?? 0),
      expectedCash: Number(meta.expectedCashAmount ?? 0),
      variance: Number(meta.varianceAmount ?? 0),
      staffName: row.staff?.name ?? null,
      notes: typeof meta.notes === "string" ? meta.notes : null,
    };
  });
}
