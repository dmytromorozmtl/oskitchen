import { prisma } from "@/lib/prisma";
import {
  ownerScopedAnd,
  productListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";

export type PosInventoryImpactStatusSummary = {
  total: number;
  applied: number;
  pending: number;
  other: number;
};

export function summarizePosInventoryImpactStatuses(statuses: string[]): PosInventoryImpactStatusSummary {
  let applied = 0;
  let pending = 0;
  let other = 0;
  for (const status of statuses) {
    if (status === "APPLIED") applied += 1;
    else if (status === "PENDING_CONFIGURATION") pending += 1;
    else other += 1;
  }
  return { total: statuses.length, applied, pending, other };
}

export async function getPosInventoryImpactDiagnostics(userId: string, take = 50) {
  const since = new Date();
  since.setDate(since.getDate() - 30);

  const where = await ownerScopedAnd(userId, { createdAt: { gte: since } });

  const [events, statusRows] = await Promise.all([
    prisma.posInventoryImpactEvent.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take,
      select: {
        id: true,
        orderId: true,
        productId: true,
        quantity: true,
        status: true,
        note: true,
        createdAt: true,
      },
    }),
    prisma.posInventoryImpactEvent.findMany({
      where,
      select: { status: true },
    }),
  ]);

  const productIds = [...new Set(events.map((e) => e.productId).filter((id): id is string => Boolean(id)))];
  const productScope = await productListWhereForOwner(userId);
  const products =
    productIds.length > 0
      ? await prisma.product.findMany({
          where: { AND: [productScope, { id: { in: productIds } }] },
          select: { id: true, name: true },
        })
      : [];
  const productNameById = new Map(products.map((p) => [p.id, p.name]));

  const summary = summarizePosInventoryImpactStatuses(statusRows.map((r) => r.status));

  return {
    summary,
    events: events.map((e) => ({
      id: e.id,
      orderId: e.orderId,
      productId: e.productId,
      productName: (e.productId && productNameById.get(e.productId)) || "—",
      quantity: Number(e.quantity),
      status: e.status,
      note: e.note,
      createdAt: e.createdAt,
    })),
  };
}
