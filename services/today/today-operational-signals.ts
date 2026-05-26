import type { FulfillmentType, OrderStatus } from "@prisma/client";

import { orderMissingRequiredServiceDate } from "@/lib/fulfillment/fulfillment-requirements";
import { prisma } from "@/lib/prisma";
import { whereOrdersForOwnerAnd } from "@/lib/analytics/revenue-metrics";
import { webhookEventListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

const ACTIVE_STATUSES: OrderStatus[] = ["PENDING", "CONFIRMED", "PREPARING", "READY"];

export type OrderDueTodayListCandidate = {
  status: OrderStatus;
  pickupDate: Date | null;
  createdAt: Date;
  orderType: string | null;
  creationSource: string | null;
  fulfillmentType: FulfillmentType;
  fulfillmentDetail: string | null;
  deliveryAddressJson: unknown | null;
  sourceMetadataJson: unknown;
};

/** Pure predicate for Today “orders due” (matches `orderMissingRequiredServiceDate` for the null-pickup branch). */
export function orderQualifiesForDueTodayList(
  o: OrderDueTodayListCandidate,
  todayStart: Date,
  tomorrow: Date,
): boolean {
  const pickupInWindow = o.pickupDate != null && o.pickupDate >= todayStart && o.pickupDate < tomorrow;
  if (pickupInWindow) return true;
  const createdToday = o.createdAt >= todayStart;
  if (!createdToday || o.pickupDate != null) return false;
  return orderMissingRequiredServiceDate({
    status: o.status,
    orderType: o.orderType,
    creationSource: o.creationSource,
    fulfillmentType: o.fulfillmentType,
    fulfillmentDetail: o.fulfillmentDetail,
    pickupDate: o.pickupDate,
    deliveryAddressJson: o.deliveryAddressJson,
    sourceMetadataJson: o.sourceMetadataJson,
  });
}

/**
 * Counts active orders that still need a service/prep date per fulfillment rules
 * (excludes POS counter / ready-now where scheduling is not required).
 */
export async function countOrdersMissingRequiredServiceDate(userId: string): Promise<number> {
  let total = 0;
  let cursor: string | undefined;
  const take = 500;
  for (;;) {
    const batch = await prisma.order.findMany({
      where: await whereOrdersForOwnerAnd(userId, {
        pickupDate: null,
        status: { in: ACTIVE_STATUSES },
      }),
      orderBy: { id: "asc" },
      take,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      select: {
        id: true,
        status: true,
        orderType: true,
        creationSource: true,
        fulfillmentType: true,
        fulfillmentDetail: true,
        pickupDate: true,
        deliveryAddressJson: true,
        sourceMetadataJson: true,
      },
    });
    if (batch.length === 0) break;
    for (const o of batch) {
      if (
        orderMissingRequiredServiceDate({
          status: o.status,
          orderType: o.orderType,
          creationSource: o.creationSource,
          fulfillmentType: o.fulfillmentType,
          fulfillmentDetail: o.fulfillmentDetail,
          pickupDate: o.pickupDate,
          deliveryAddressJson: o.deliveryAddressJson,
          sourceMetadataJson: o.sourceMetadataJson,
        })
      ) {
        total += 1;
      }
    }
    if (batch.length < take) break;
    cursor = batch[batch.length - 1]!.id;
  }
  return total;
}

/** Delivery orders in-flight that have no route stops yet (dispatch gap). */
export async function countDeliveryOrdersWithoutRouteStops(userId: string): Promise<number> {
  return prisma.order.count({
    where: await whereOrdersForOwnerAnd(userId, {
      fulfillmentType: "DELIVERY",
      status: { in: ["CONFIRMED", "PREPARING", "READY"] },
      deliveryStops: { none: {} },
    }),
  });
}

export async function countWebhookQueueSignals(userId: string): Promise<{
  unprocessedTotal: number;
  needingAttention: number;
}> {
  const webhookWhere = await webhookEventListWhereForOwner(userId);
  const [unprocessedTotal, needingAttention] = await Promise.all([
    prisma.webhookEvent.count({ where: { AND: [webhookWhere, { processed: false }] } }),
    prisma.webhookEvent.count({
      where: {
        AND: [
          webhookWhere,
          {
            processed: false,
            OR: [{ processingError: { not: null } }, { signatureValid: false }],
          },
        ],
      },
    }),
  ]);
  return { unprocessedTotal, needingAttention };
}

export type OrdersDueTodayRow = {
  id: string;
  customerName: string;
  status: string;
  pickupDate: Date | null;
};

/**
 * Orders to surface on Today: dated for today, or created today with a missing **required** service date
 * (excludes POS counter sales that legitimately have no pickup date).
 */
export async function loadOrdersDueTodayList(
  userId: string,
  todayStart: Date,
  tomorrow: Date,
): Promise<OrdersDueTodayRow[]> {
  const raw = await prisma.order.findMany({
    where: await whereOrdersForOwnerAnd(userId, {
      status: { notIn: ["COMPLETED", "CANCELLED"] },
      OR: [
        { pickupDate: { gte: todayStart, lt: tomorrow } },
        { createdAt: { gte: todayStart }, pickupDate: null },
      ],
    }),
    orderBy: [{ pickupDate: "asc" }, { createdAt: "asc" }],
    take: 48,
    select: {
      id: true,
      customerName: true,
      status: true,
      pickupDate: true,
      createdAt: true,
      orderType: true,
      creationSource: true,
      fulfillmentType: true,
      fulfillmentDetail: true,
      deliveryAddressJson: true,
      sourceMetadataJson: true,
    },
  });

  const filtered = raw.filter((o) => orderQualifiesForDueTodayList(o, todayStart, tomorrow));

  filtered.sort((a, b) => {
    const ap = a.pickupDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const bp = b.pickupDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
    if (ap !== bp) return ap - bp;
    return a.createdAt.getTime() - b.createdAt.getTime();
  });

  return filtered.slice(0, 12).map((o) => ({
    id: o.id,
    customerName: o.customerName,
    status: o.status,
    pickupDate: o.pickupDate,
  }));
}
