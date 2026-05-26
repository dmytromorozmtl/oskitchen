import { prisma } from "@/lib/prisma";

export async function getPendingReceivingPOs(userId: string) {
  return prisma.purchaseOrder.findMany({
    where: {
      userId,
      status: { in: ["SENT", "PARTIALLY_RECEIVED"] },
    },
    include: {
      supplier: { select: { name: true } },
      lines: {
        include: { ingredient: { select: { name: true } } },
      },
      invoiceLines: {
        select: {
          quantity: true,
          receivedQty: true,
          varianceQty: true,
          invoice: { select: { invoiceNumber: true, status: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
}

export async function recordReceivingWithVariance(
  userId: string,
  input: {
    purchaseOrderId: string;
    lineId: string;
    ingredientId: string;
    receivedQuantity: number;
    unit: string;
    notes?: string;
    performedById: string;
  },
) {
  const po = await prisma.purchaseOrder.findFirst({
    where: { id: input.purchaseOrderId, userId },
    include: { lines: true },
  });
  if (!po) throw new Error("PO not found");

  const line = po.lines.find((l) => l.id === input.lineId);
  if (!line) throw new Error("Line not found");

  const variance = input.receivedQuantity - Number(line.quantity);

  await prisma.$transaction([
    prisma.receivingEvent.create({
      data: {
        purchaseOrderId: input.purchaseOrderId,
        lineId: input.lineId,
        ingredientId: input.ingredientId,
        receivedQuantity: input.receivedQuantity,
        unit: input.unit,
        receivedById: input.performedById,
        notes: input.notes ?? (variance !== 0 ? `Variance: ${variance}` : null),
      },
    }),
    prisma.purchaseOrderLine.update({
      where: { id: input.lineId },
      data: {
        receivedQuantity: { increment: input.receivedQuantity },
        status:
          input.receivedQuantity >= Number(line.quantity) ? "RECEIVED" : "PARTIALLY_RECEIVED",
      },
    }),
  ]);

  return { variance };
}
