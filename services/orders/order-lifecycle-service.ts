import type { OrderStatus } from "@prisma/client";

import type { OrderLifecycleStage } from "@/lib/orders/order-lifecycle-types";
import { deriveOrderLifecycleStage } from "@/lib/orders/order-lifecycle-status";
import {
  buildLifecycleDeriveInput,
  blockersFromPreloaded,
  type OrderBlockerSource,
} from "@/services/orders/order-blocker-service";
import { prisma } from "@/lib/prisma";
import { channelConflictWhereForOwner } from "@/lib/scope/channel-import-scope";
import { orderByIdWhereForOwner } from "@/lib/scope/workspace-order-scope";

export type OrderLifecycleView = {
  stage: OrderLifecycleStage;
  blockers: import("@/lib/orders/order-lifecycle-types").OrderBlocker[];
  dbStatus: OrderStatus;
};

export function buildOrderLifecycleView(
  order: OrderBlockerSource,
  blockers: OrderLifecycleView["blockers"],
): OrderLifecycleView {
  const hasUnmapped = blockers.some((b) => b.code === "UNMAPPED_PRODUCTS");
  const deriveInput = buildLifecycleDeriveInput({
    status: order.status,
    fulfillmentType: order.fulfillmentType,
    fulfillmentDetail: order.fulfillmentDetail,
    orderType: order.orderType,
    creationSource: order.creationSource,
    sourceMetadataJson: order.sourceMetadataJson,
    paymentStatus: order.paymentStatus,
    paymentMode: order.paymentMode,
    pickupDate: order.pickupDate,
    deliveryAddressJson: order.deliveryAddressJson,
    customerName: order.customerName,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    orderItemsCount: order.orderItems.length,
    hasUnmappedChannelLines: hasUnmapped,
    productionWorkItems: order.productionWorkItems,
    packingTasks: order.packingTasks,
    deliveryStopsCount: order.deliveryStops.length,
    externalSyncFailed: order.importedFromExternal?.syncStatus === "FAILED",
    importBatchFailed: order.channelImportBatch?.status === "FAILED",
    statusDetail: order.statusDetail,
  });

  return {
    stage: deriveOrderLifecycleStage(deriveInput),
    blockers,
    dbStatus: order.status,
  };
}

export async function getOrderLifecycleView(userId: string, orderId: string): Promise<OrderLifecycleView | null> {
  const order = await prisma.order.findFirst({
    where: await orderByIdWhereForOwner(userId, orderId),
    include: {
      orderItems: { select: { id: true } },
      productionWorkItems: { select: { status: true } },
      packingTasks: { select: { status: true } },
      deliveryStops: { select: { id: true } },
      posTransactions: { select: { id: true, receipt: { select: { id: true } } } },
      importedFromExternal: { select: { syncStatus: true } },
      channelImportBatch: { select: { status: true } },
    },
  });
  if (!order) return null;

  const mappingConflicts = await prisma.channelConflict.count({
    where: {
      AND: [
        await channelConflictWhereForOwner(userId),
        {
          status: "OPEN",
          conflictType: "missing_product_mapping",
          record: { importedEntityId: orderId, recordType: "ORDER" },
        },
      ],
    },
  });
  const blockers = blockersFromPreloaded(orderId, order, mappingConflicts);
  return buildOrderLifecycleView(order, blockers);
}
