import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { computeShiftCloseout } from "@/lib/pos/pos-shift-closeout-math";
import { ensureOwnerWorkspaceId } from "@/lib/scope/ensure-owner-workspace";
import {
  ownerScopedAnd,
  posRegisterByIdWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";

export async function getOpenPosShift(userId: string, registerId: string) {
  const where = (await ownerScopedAnd(userId, {
    registerId,
    status: "OPEN",
  })) as Prisma.POSShiftWhereInput;
  return prisma.pOSShift.findFirst({
    where,
    orderBy: { openedAt: "desc" },
  });
}

export async function openPosShift(input: {
  userId: string;
  registerId: string;
  openedByStaffId: string;
  openingCashAmount: number;
  notes?: string | null;
}) {
  const existing = await getOpenPosShift(input.userId, input.registerId);
  if (existing) {
    return { ok: false as const, error: "A shift is already open for this register." };
  }
  const registerWhere = await posRegisterByIdWhereForOwner(input.userId, input.registerId);
  const register = await prisma.pOSRegister.findFirst({
    where: registerWhere,
    select: { id: true, workspaceId: true, locationId: true },
  });
  if (!register) return { ok: false as const, error: "Register not found." };

  const workspaceId = register.workspaceId ?? (await ensureOwnerWorkspaceId(input.userId));

  const shift = await prisma.pOSShift.create({
    data: {
      userId: input.userId,
      workspaceId,
      locationId: register.locationId,
      registerId: register.id,
      openedByStaffId: input.openedByStaffId,
      openingCashAmount: new Prisma.Decimal(input.openingCashAmount),
      notes: input.notes ?? undefined,
    },
  });
  await prisma.pOSAuditEvent.create({
    data: {
      userId: input.userId,
      workspaceId,
      registerId: register.id,
      shiftId: shift.id,
      staffId: input.openedByStaffId,
      action: "pos.shift.opened",
      metadataJson: { openingCashAmount: input.openingCashAmount } as Prisma.InputJsonValue,
    },
  });
  return { ok: true as const, shift };
}

export async function closePosShift(input: {
  userId: string;
  shiftId: string;
  closedByStaffId: string;
  closingCashAmount: number;
  notes?: string | null;
}) {
  const shiftWhere = (await ownerScopedAnd(input.userId, {
    id: input.shiftId,
    status: "OPEN",
  })) as Prisma.POSShiftWhereInput;
  const shift = await prisma.pOSShift.findFirst({
    where: shiftWhere,
    include: { register: { select: { id: true } } },
  });
  if (!shift) return { ok: false as const, error: "Open shift not found." };

  const { cashSalesTotals } = await loadShiftCashSales(input.userId, {
    id: shift.id,
    registerId: shift.registerId,
  });
  const closeout = computeShiftCloseout({
    openingCash: Number(shift.openingCashAmount),
    cashSalesTotals,
    closingCash: input.closingCashAmount,
  });

  const opening = new Prisma.Decimal(shift.openingCashAmount);
  const closing = new Prisma.Decimal(input.closingCashAmount);
  const expected = new Prisma.Decimal(closeout.expectedCash);
  const variance = new Prisma.Decimal(closeout.variance);

  const updated = await prisma.pOSShift.update({
    where: { id: shift.id },
    data: {
      status: "CLOSED",
      closedAt: new Date(),
      closedByStaffId: input.closedByStaffId,
      closingCashAmount: closing,
      expectedCashAmount: expected,
      varianceAmount: variance,
      notes: input.notes ?? shift.notes,
    },
  });

  const closeWorkspaceId =
    shift.workspaceId ?? (await ensureOwnerWorkspaceId(input.userId));
  await prisma.pOSAuditEvent.create({
    data: {
      userId: input.userId,
      workspaceId: closeWorkspaceId,
      registerId: shift.register.id,
      shiftId: shift.id,
      staffId: input.closedByStaffId,
      action: "pos.shift.closed",
      metadataJson: {
        closingCashAmount: input.closingCashAmount,
        expectedCashAmount: expected.toString(),
        varianceAmount: variance.toString(),
      } as Prisma.InputJsonValue,
    },
  });

  return { ok: true as const, shift: updated };
}

export type OpenShiftCloseoutPreview = {
  shiftId: string;
  registerName: string;
  openedAtIso: string;
  openingCash: number;
  cashSalesTotal: number;
  expectedCash: number;
  cashTransactionCount: number;
};

async function loadShiftCashSales(
  userId: string,
  shift: { id: string; registerId: string },
): Promise<{ cashSalesTotals: number[]; cashTransactionCount: number }> {
  const txnWhere = (await ownerScopedAnd(userId, {
    registerId: shift.registerId,
    shiftId: shift.id,
    paymentMode: "CASH",
    status: "COMPLETED",
  })) as Prisma.POSTransactionWhereInput;
  const cashRows = await prisma.pOSTransaction.findMany({
    where: txnWhere,
    select: { total: true },
  });
  return {
    cashSalesTotals: cashRows.map((row) => Number(row.total)),
    cashTransactionCount: cashRows.length,
  };
}

/** Closeout snapshot for open shifts — same cash math as closePosShift, no close mutation. */
export async function listOpenShiftCloseoutPreviews(
  userId: string,
): Promise<OpenShiftCloseoutPreview[]> {
  const shiftWhere = (await ownerScopedAnd(userId, {
    status: "OPEN",
  })) as Prisma.POSShiftWhereInput;
  const openShifts = await prisma.pOSShift.findMany({
    where: shiftWhere,
    orderBy: { openedAt: "desc" },
    include: { register: { select: { name: true } } },
  });

  return Promise.all(
    openShifts.map(async (shift) => {
      const { cashSalesTotals, cashTransactionCount } = await loadShiftCashSales(userId, {
        id: shift.id,
        registerId: shift.registerId,
      });
      const closeout = computeShiftCloseout({
        openingCash: Number(shift.openingCashAmount),
        cashSalesTotals,
        closingCash: 0,
      });
      return {
        shiftId: shift.id,
        registerName: shift.register.name,
        openedAtIso: shift.openedAt.toISOString(),
        openingCash: Number(shift.openingCashAmount),
        cashSalesTotal: closeout.cashSalesTotal,
        expectedCash: closeout.expectedCash,
        cashTransactionCount,
      };
    }),
  );
}
