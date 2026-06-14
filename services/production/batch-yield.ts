import { prisma } from "@/lib/prisma";

export type BatchYieldSummary = {
  batchId: string;
  scaleFactor: number;
  totalQuantity: number;
  expectedYield: number;
  actualYield: number | null;
  yieldPercent: number | null;
};

/** Sum work-item quantities for a batch and compute yield % when actual is recorded. */
export async function summarizeBatchYield(
  userId: string,
  batchId: string,
  actualYield?: number | null,
): Promise<BatchYieldSummary | null> {
  const batch = await prisma.productionBatch.findFirst({
    where: { id: batchId, userId },
    select: {
      id: true,
      scaleFactor: true,
      workItems: { select: { quantity: true } },
    },
  });
  if (!batch) return null;

  const scale = Number(batch.scaleFactor) || 1;
  const totalQuantity = batch.workItems.reduce((s, w) => s + w.quantity, 0);
  const expectedYield = totalQuantity * scale;
  const actual = actualYield ?? null;
  const yieldPercent =
    actual != null && expectedYield > 0 ? Math.round((actual / expectedYield) * 10000) / 100 : null;

  return {
    batchId: batch.id,
    scaleFactor: scale,
    totalQuantity,
    expectedYield,
    actualYield: actual,
    yieldPercent,
  };
}
