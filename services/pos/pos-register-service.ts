import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { ensureOwnerWorkspaceId } from "@/lib/scope/ensure-owner-workspace";
import {
  ownerScopedAnd,
  posRegisterByIdWhereForOwner,
  posRegisterListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";

export async function listPosRegisters(userId: string) {
  const where = (await ownerScopedAnd(userId, {
    status: "ACTIVE",
  })) as Prisma.POSRegisterWhereInput;
  return prisma.pOSRegister.findMany({
    where,
    orderBy: { createdAt: "asc" },
    include: { location: { select: { id: true, name: true } } },
  });
}

export async function createPosRegister(
  userId: string,
  input: { name: string; locationId?: string | null; cashTrackingEnabled?: boolean },
) {
  const workspaceId = await ensureOwnerWorkspaceId(userId);
  return prisma.pOSRegister.create({
    data: {
      userId,
      workspaceId,
      name: input.name.trim(),
      locationId: input.locationId ?? undefined,
      cashTrackingEnabled: input.cashTrackingEnabled ?? true,
    },
  });
}

export async function getPosRegisterOrThrow(userId: string, registerId: string) {
  const where = await posRegisterByIdWhereForOwner(userId, registerId);
  const reg = await prisma.pOSRegister.findFirst({ where });
  if (!reg) throw new Error("NOT_FOUND");
  return reg;
}

export async function countPosRegisters(userId: string) {
  const where = await posRegisterListWhereForOwner(userId);
  return prisma.pOSRegister.count({ where });
}
