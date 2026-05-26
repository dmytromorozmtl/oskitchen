import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { orderHubWhere } from "@/lib/order-hub/order-hub-query-scope";
import {
  ORDER_HUB_TABS,
  type OrderHubTabId,
  internalOrderMissingCustomerInfo,
  internalOrderMissingFulfillmentInfo,
} from "@/services/order-hub/order-triage-service";
import { externalOrderListWhereForOwner } from "@/lib/scope/workspace-channel-scope";
import type { OrderHubPageData } from "@/services/order-hub/order-hub-service";

type InternalScanRow = OrderHubPageData["internalOrders"][number];

export const INTERNAL_TRIAGE_SCAN_CAP = 4000;

async function scanInternalTriageRows(userId: string): Promise<InternalScanRow[]> {
  return prisma.order.findMany({
    where: await orderHubWhere(userId, { status: { notIn: ["COMPLETED", "CANCELLED"] } }),
    select: {
      id: true,
      userId: true,
      brandId: true,
      locationId: true,
      customerId: true,
      customerName: true,
      customerEmail: true,
      customerPhone: true,
      total: true,
      status: true,
      statusDetail: true,
      orderType: true,
      paymentMode: true,
      paymentStatus: true,
      creationSource: true,
      fulfillmentType: true,
      fulfillmentDetail: true,
      pickupDate: true,
      fulfillmentWindowStart: true,
      fulfillmentWindowEnd: true,
      pickupLocationId: true,
      deliveryAddressJson: true,
      notes: true,
      kitchenNotes: true,
      packingNotes: true,
      deliveryNotesExt: true,
      allergyNotes: true,
      dietaryNotes: true,
      subtotal: true,
      taxAmount: true,
      feesAmount: true,
      discountAmount: true,
      channelProvider: true,
      externalOrderIdExt: true,
      sourceMetadataJson: true,
      publicLookupToken: true,
      createdAt: true,
      updatedAt: true,
      channelImportBatchId: true,
      channelTraceJson: true,
      isChannelTestOrder: true,
      channelImportBatch: { select: { id: true, sourceType: true, status: true } },
      importedFromExternal: { select: { syncStatus: true } },
    },
    orderBy: { updatedAt: "desc" },
    take: INTERNAL_TRIAGE_SCAN_CAP,
  }) as unknown as InternalScanRow[];
}

async function countInternal(
  userId: string,
  tab: OrderHubTabId,
  triageCache: { rows: InternalScanRow[]; capped: boolean } | null,
): Promise<{ n: number; capped?: boolean }> {
  switch (tab) {
    case "all":
      return { n: await prisma.order.count({ where: await orderHubWhere(userId) }) };
    case "pos":
      return {
        n: await prisma.order.count({
          where: await orderHubWhere(userId, {
            OR: [{ creationSource: "POS" }, { orderType: "POS_SALE" }],
          }),
        }),
      };
    case "needs_review":
      return {
        n: await prisma.order.count({
          where: await orderHubWhere(userId, { status: "PENDING" }),
        }),
      };
    case "needs_mapping":
      return {
        n: await prisma.order.count({
          where: await orderHubWhere(userId, {
            status: "PENDING",
            channelImportBatchId: { not: null },
          }),
        }),
      };
    case "ready_for_production":
      return {
        n: await prisma.order.count({
          where: await orderHubWhere(userId, { status: "CONFIRMED" }),
        }),
      };
    case "in_production":
      return {
        n: await prisma.order.count({
          where: await orderHubWhere(userId, { status: "PREPARING" }),
        }),
      };
    case "packing":
      return {
        n: await prisma.order.count({
          where: await orderHubWhere(userId, { status: "READY" }),
        }),
      };
    case "fulfillment":
      return {
        n: await prisma.order.count({
          where: await orderHubWhere(userId, {
            fulfillmentType: "DELIVERY",
            status: { in: ["READY", "PREPARING"] },
          }),
        }),
      };
    case "completed":
      return {
        n: await prisma.order.count({
          where: await orderHubWhere(userId, { status: "COMPLETED" }),
        }),
      };
    case "failed":
      return {
        n: await prisma.order.count({
          where: await orderHubWhere(userId, {
            OR: [
              { channelImportBatch: { is: { status: "FAILED" } } },
              { importedFromExternal: { is: { syncStatus: "FAILED" } } },
            ],
          }),
        }),
      };
    case "missing_customer_info":
      if (!triageCache) throw new Error("triageCache required");
      return {
        n: triageCache.rows.filter((o) => internalOrderMissingCustomerInfo(o)).length,
        capped: triageCache.capped,
      };
    case "missing_fulfillment_info":
      if (!triageCache) throw new Error("triageCache required");
      return {
        n: triageCache.rows.filter((o) => internalOrderMissingFulfillmentInfo(o)).length,
        capped: triageCache.capped,
      };
    default:
      return { n: 0 };
  }
}

async function countExternal(userId: string, tab: OrderHubTabId): Promise<number> {
  const scope = await externalOrderListWhereForOwner(userId);
  switch (tab) {
    case "all":
      return prisma.externalOrder.count({ where: scope });
    case "failed":
      return prisma.externalOrder.count({ where: { AND: [scope, { syncStatus: "FAILED" }] } });
    case "needs_review":
      return prisma.externalOrder.count({ where: { AND: [scope, { syncStatus: "PENDING" }] } });
    case "missing_customer_info":
      return prisma.externalOrder.count({
        where: {
          AND: [
            scope,
            {
              syncStatus: "PENDING",
              OR: [
                { customerName: null },
                { customerName: "" },
                {
                  AND: [
                    { OR: [{ customerEmail: null }, { customerEmail: "" }] },
                    { OR: [{ customerPhone: null }, { customerPhone: "" }] },
                  ],
                },
              ],
            },
          ],
        },
      });
    case "missing_fulfillment_info":
      return prisma.externalOrder.count({
        where: {
          AND: [
            scope,
            {
              syncStatus: "PENDING",
              OR: [
                { AND: [{ fulfillmentType: "DELIVERY" }, { deliveryAddressJson: { equals: Prisma.DbNull } }] },
                { AND: [{ fulfillmentType: "PICKUP" }, { pickupTime: null }] },
              ],
            },
          ],
        },
      });
    case "pos":
    case "needs_mapping":
    case "ready_for_production":
    case "in_production":
    case "packing":
    case "fulfillment":
    case "completed":
      return 0;
    default:
      return 0;
  }
}

export type OrderHubExactTabCount = {
  id: OrderHubTabId;
  label: string;
  internal: number;
  external: number;
  total: number;
  /** When true, internal triage for this tab scanned at most INTERNAL_TRIAGE_SCAN_CAP recent non-terminal rows. */
  internalCapped?: boolean;
};

/**
 * Full-workspace triage counts (not limited to the 150-row hub preview fetch).
 * `missing_*` internal tabs use a capped scan so very large backlogs stay bounded — totals may be a lower bound.
 */
export async function loadOrderHubExactTabCounts(userId: string): Promise<OrderHubExactTabCount[]> {
  const triageRows = await scanInternalTriageRows(userId);
  const triageCache = {
    rows: triageRows,
    capped: triageRows.length === INTERNAL_TRIAGE_SCAN_CAP,
  };

  return Promise.all(
    ORDER_HUB_TABS.map(async (tab) => {
      const [intR, ext] = await Promise.all([
        countInternal(userId, tab.id, triageCache),
        countExternal(userId, tab.id),
      ]);
      return {
        id: tab.id,
        label: tab.label,
        internal: intR.n,
        external: ext,
        total: intR.n + ext,
        internalCapped: intR.capped,
      } satisfies OrderHubExactTabCount;
    }),
  );
}
