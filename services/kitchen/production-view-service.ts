import { prisma } from "@/lib/prisma";
import {
  buildProductionViewSnapshot,
  type ProductionViewSnapshot,
  type ProductionViewWorkItemInput,
} from "@/lib/kitchen/kds-production-view";
import { productionWorkItemListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

function toIso(value: Date | null): string | null {
  return value ? value.toISOString() : null;
}

export async function loadKdsProductionView(userId: string): Promise<ProductionViewSnapshot> {
  const where = await productionWorkItemListWhereForOwner(userId);

  const rows = await prisma.productionWorkItem.findMany({
    where: {
      AND: [
        where,
        { status: { notIn: ["DONE", "CANCELLED"] } },
      ],
    },
    select: {
      id: true,
      title: true,
      station: true,
      status: true,
      priority: true,
      quantity: true,
      dueAt: true,
      createdAt: true,
      startedAt: true,
    },
    orderBy: [{ dueAt: "asc" }, { createdAt: "asc" }],
    take: 500,
  });

  const items: ProductionViewWorkItemInput[] = rows.map((row) => ({
    id: row.id,
    title: row.title,
    station: row.station,
    status: row.status,
    priority: row.priority,
    quantity: row.quantity,
    dueAtIso: toIso(row.dueAt),
    createdAtIso: row.createdAt.toISOString(),
    startedAtIso: toIso(row.startedAt),
  }));

  return buildProductionViewSnapshot(items);
}
