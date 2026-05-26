import { prisma } from "@/lib/prisma";
import {
  commissaryTransferByIdWhereForOwner,
  commissaryTransferListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";

export async function createTransferOrder(
  userId: string,
  fromLocationId: string,
  toLocationId: string,
  items: Array<{ ingredientId: string; quantity: number; unit: string }>,
  notes?: string,
) {
  return prisma.commissaryTransfer.create({
    data: {
      userId,
      fromLocationId,
      toLocationId,
      notes: notes ?? null,
      status: "PENDING",
      lines: {
        create: items.map((i) => ({
          ingredientId: i.ingredientId,
          quantity: i.quantity,
          unit: i.unit,
        })),
      },
    },
    include: {
      lines: { include: { ingredient: { select: { name: true } } } },
    },
  });
}

export async function listTransfers(userId: string) {
  const scope = await commissaryTransferListWhereForOwner(userId);
  return prisma.commissaryTransfer.findMany({
    where: scope,
    orderBy: { createdAt: "desc" },
    include: {
      lines: { include: { ingredient: { select: { name: true } } } },
    },
    take: 50,
  });
}

export async function markTransferReceived(transferId: string, userId: string) {
  const where = await commissaryTransferByIdWhereForOwner(userId, transferId);
  const row = await prisma.commissaryTransfer.findFirst({ where, select: { id: true } });
  if (!row) throw new Error("Transfer not found");
  return prisma.commissaryTransfer.update({
    where: { id: row.id },
    data: { status: "RECEIVED", receivedAt: new Date() },
  });
}
