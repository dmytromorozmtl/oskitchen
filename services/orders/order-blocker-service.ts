import type { FulfillmentType, OrderStatus } from "@prisma/client";

import { isPlaceholderKitchenOsEmail } from "@/lib/customers/customer-display";
import { requiresScheduledServiceDate } from "@/lib/fulfillment/fulfillment-requirements";
import { toOrderBlocker } from "@/lib/orders/order-blockers";
import type { OrderBlocker, OrderLifecycleDeriveInput } from "@/lib/orders/order-lifecycle-types";
import { prisma } from "@/lib/prisma";
import { channelConflictWhereForOwner } from "@/lib/scope/channel-import-scope";
import { orderByIdWhereForOwner } from "@/lib/scope/workspace-order-scope";
import { whereOrdersForOwnerAnd } from "@/lib/analytics/revenue-metrics";

const DONE_PRODUCTION = new Set(["DONE", "CANCELLED"]);
const DONE_PACKING = new Set(["PACKED", "VERIFIED", "HANDED_OFF", "CANCELLED"]);

/** Minimal order shape for blocker derivation (matches common Prisma selects). */
export type OrderBlockerSource = {
  status: OrderStatus;
  statusDetail: string | null;
  orderType: string | null;
  creationSource: string | null;
  fulfillmentType: FulfillmentType;
  fulfillmentDetail: string | null;
  sourceMetadataJson: unknown;
  paymentStatus: string | null;
  paymentMode: string | null;
  pickupDate: Date | null;
  deliveryAddressJson: unknown | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  orderItems: { id: string }[];
  productionWorkItems: { status: string }[];
  packingTasks: { status: string }[];
  deliveryStops: { id: string }[];
  posTransactions?: { id: string; receipt: { id: string } | null }[];
  importedFromExternal: { syncStatus: string } | null;
  channelImportBatch: { status: string } | null;
};

export function blockersFromPreloaded(
  orderId: string,
  order: OrderBlockerSource,
  mappingConflictCount: number,
): OrderBlocker[] {
  const fix = `/dashboard/orders/${orderId}`;
  const out: OrderBlocker[] = [];

  if (order.orderItems.length === 0) {
    out.push(toOrderBlocker("MISSING_ITEMS", fix));
  }

  if (mappingConflictCount > 0) {
    out.push(toOrderBlocker("UNMAPPED_PRODUCTS", "/dashboard/product-mapping/unmapped"));
  }

  if (!order.customerName?.trim()) {
    out.push(toOrderBlocker("MISSING_CUSTOMER", fix));
  }
  const emailTrim = order.customerEmail?.trim() ?? "";
  const phoneTrim = order.customerPhone?.trim() ?? "";
  const guestPlaceholderEmail = isPlaceholderKitchenOsEmail(emailTrim);
  if (!guestPlaceholderEmail && !emailTrim && !phoneTrim) {
    out.push(toOrderBlocker("MISSING_EMAIL_OR_PHONE", fix));
  }

  if (order.fulfillmentType === "DELIVERY" && order.deliveryAddressJson == null) {
    out.push(toOrderBlocker("MISSING_DELIVERY_ADDRESS", fix));
  }

  if (order.creationSource === "POS" && order.orderType === "POS_SALE") {
    const txns = order.posTransactions;
    if (!txns || txns.length === 0) {
      out.push(toOrderBlocker("POS_TRANSACTION_MISSING", fix));
    } else if (txns[0]?.receipt == null) {
      out.push(toOrderBlocker("RECEIPT_MISSING", fix));
    }
  }

  if (
    order.status === "CONFIRMED" &&
    order.pickupDate == null &&
    requiresScheduledServiceDate({
      status: order.status,
      orderType: order.orderType,
      creationSource: order.creationSource,
      fulfillmentType: order.fulfillmentType,
      fulfillmentDetail: order.fulfillmentDetail,
      pickupDate: order.pickupDate,
      deliveryAddressJson: order.deliveryAddressJson,
      sourceMetadataJson: order.sourceMetadataJson,
    })
  ) {
    out.push(toOrderBlocker("MISSING_FULFILLMENT_DATE", fix));
  }

  const productionIncomplete = order.productionWorkItems.some((w) => !DONE_PRODUCTION.has(w.status));
  if (order.productionWorkItems.length > 0 && productionIncomplete && ["PREPARING", "READY"].includes(order.status)) {
    out.push(toOrderBlocker("PRODUCTION_NOT_COMPLETE", "/dashboard/production"));
  }

  const packingIncomplete =
    order.packingTasks.length > 0 &&
    order.packingTasks.some((t) => !DONE_PACKING.has(t.status));
  if (packingIncomplete && ["PREPARING", "READY"].includes(order.status)) {
    out.push(toOrderBlocker("PACKING_NOT_COMPLETE", "/dashboard/packing"));
  }

  if (
    order.fulfillmentType === "DELIVERY" &&
    order.status === "READY" &&
    order.deliveryStops.length === 0
  ) {
    out.push(toOrderBlocker("ROUTE_NOT_ASSIGNED", "/dashboard/routes"));
  }

  const ps = (order.paymentStatus ?? "").toLowerCase();
  if (
    order.status !== "COMPLETED" &&
    ps &&
    !["paid", "not_required", "external", "partial", "pending"].includes(ps) &&
    ["READY", "PREPARING"].includes(order.status)
  ) {
    out.push(toOrderBlocker("PAYMENT_REVIEW_REQUIRED", fix));
  }

  if (order.importedFromExternal?.syncStatus === "FAILED") {
    out.push(toOrderBlocker("INTEGRATION_ERROR", "/dashboard/order-hub"));
  }
  if (order.channelImportBatch?.status === "FAILED") {
    out.push(toOrderBlocker("IMPORT_ERROR", "/dashboard/settings/imports"));
  }

  return out;
}

export async function listOrderBlockersForOrder(userId: string, orderId: string): Promise<OrderBlocker[]> {
  const order = await prisma.order.findFirst({
    where: await orderByIdWhereForOwner(userId, orderId),
    include: {
      orderItems: { select: { id: true, productId: true, title: true } },
      productionWorkItems: { select: { id: true, status: true, requiresPacking: true } },
      packingTasks: { select: { id: true, status: true } },
      deliveryStops: { select: { id: true } },
      posTransactions: { select: { id: true, receipt: { select: { id: true } } } },
      importedFromExternal: { select: { syncStatus: true } },
      channelImportBatch: { select: { id: true, status: true } },
    },
  });
  if (!order) return [];

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
  return blockersFromPreloaded(orderId, order, mappingConflicts);
}

export function buildLifecycleDeriveInput(input: {
  status: OrderStatus;
  fulfillmentType: FulfillmentType;
  fulfillmentDetail: string | null;
  orderType: string | null;
  creationSource: string | null;
  sourceMetadataJson: unknown;
  paymentStatus: string | null;
  paymentMode: string | null;
  pickupDate: Date | null;
  deliveryAddressJson: unknown | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  orderItemsCount: number;
  hasUnmappedChannelLines: boolean;
  productionWorkItems: { status: string }[];
  packingTasks: { status: string }[];
  deliveryStopsCount: number;
  externalSyncFailed: boolean;
  importBatchFailed: boolean;
  statusDetail: string | null;
}): OrderLifecycleDeriveInput {
  const productionWorkIncomplete = input.productionWorkItems.some((w) => !DONE_PRODUCTION.has(w.status));
  const packingIncomplete =
    input.packingTasks.length > 0 && input.packingTasks.some((t) => !DONE_PACKING.has(t.status));
  return {
    dbStatus: input.status,
    fulfillmentType: input.fulfillmentType,
    fulfillmentDetail: input.fulfillmentDetail,
    orderType: input.orderType,
    creationSource: input.creationSource,
    sourceMetadataJson: input.sourceMetadataJson,
    paymentStatus: input.paymentStatus,
    paymentMode: input.paymentMode,
    pickupDate: input.pickupDate,
    deliveryAddressJson: input.deliveryAddressJson,
    customerName: input.customerName,
    customerEmail: input.customerEmail,
    customerPhone: input.customerPhone,
    orderItemsCount: input.orderItemsCount,
    hasUnmappedChannelLines: input.hasUnmappedChannelLines,
    productionWorkIncomplete,
    packingIncomplete,
    hasDeliveryStops: input.deliveryStopsCount > 0,
    externalSyncFailed: input.externalSyncFailed,
    importBatchFailed: input.importBatchFailed,
    onHoldDetail: (input.statusDetail ?? "").toUpperCase() === "HOLD",
  };
}

export async function countBlockedOrdersApprox(userId: string): Promise<number> {
  const [noItems, mappingOrders] = await Promise.all([
    prisma.order.count({
      where: await whereOrdersForOwnerAnd(userId, {
        status: { notIn: ["COMPLETED", "CANCELLED"] },
        orderItems: { none: {} },
      }),
    }),
    prisma.channelConflict.count({
      where: {
        AND: [
          await channelConflictWhereForOwner(userId),
          { status: "OPEN", conflictType: "missing_product_mapping", record: { recordType: "ORDER" } },
        ],
      },
    }),
  ]);
  return noItems + Math.min(mappingOrders, 50);
}
