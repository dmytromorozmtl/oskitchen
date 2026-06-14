import { prisma } from "@/lib/prisma";
import { orderHubWhere } from "@/lib/order-hub/order-hub-query-scope";
import { channelConflictWhereForOwner } from "@/lib/scope/channel-import-scope";
import { externalOrderListWhereForOwner } from "@/lib/scope/workspace-channel-scope";

export async function loadOrderHubPageData(ownerUserId: string) {
  const [orderScope, externalScope, conflictScope] = await Promise.all([
    orderHubWhere(ownerUserId),
    externalOrderListWhereForOwner(ownerUserId),
    channelConflictWhereForOwner(ownerUserId),
  ]);

  const [internalOrders, externalOrders, mappingBlockedCount] = await Promise.all([
    prisma.order.findMany({
      where: orderScope,
      orderBy: { createdAt: "desc" },
      take: 150,
      include: {
        channelImportBatch: { select: { id: true, sourceType: true, status: true } },
        importedFromExternal: { select: { syncStatus: true } },
      },
    }),
    prisma.externalOrder.findMany({
      where: externalScope,
      orderBy: { createdAt: "desc" },
      take: 150,
      include: {
        channelImportBatch: { select: { id: true, sourceType: true, status: true } },
      },
    }),
    prisma.channelConflict.count({
      where: {
        AND: [conflictScope, { conflictType: "missing_product_mapping", status: "OPEN" }],
      },
    }),
  ]);

  return { internalOrders, externalOrders, mappingBlockedCount };
}

export type OrderHubPageData = Awaited<ReturnType<typeof loadOrderHubPageData>>;
