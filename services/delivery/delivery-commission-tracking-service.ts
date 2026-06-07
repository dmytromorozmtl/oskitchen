import type { IntegrationProvider, OrderStatus, Prisma } from "@prisma/client";

import type { AnalyticsFilters } from "@/lib/analytics/filters";
import { orderContributesToRevenue } from "@/lib/analytics/revenue-metrics";
import { decimalToNumber } from "@/lib/catering/quote-calculations";
import {
  buildDeliveryCommissionTrackingSnapshot,
  isDeliveryCommissionProvider,
  resolveDeliveryOrderCommission,
  type DeliveryCommissionTrackingSnapshot,
  type DeliveryOrderCommissionRow,
} from "@/lib/delivery/delivery-commission-metrics";
import {
  DELIVERY_COMMISSION_TRACKING_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/delivery/delivery-commission-tracking-absolute-final-policy";
import { DELIVERY_MARKETPLACE_PROVIDERS } from "@/services/analytics/delivery-channel-analytics";
import { prisma } from "@/lib/prisma";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-order-scope";

export type DeliveryCommissionTrackingModel = DeliveryCommissionTrackingSnapshot & {
  policyId: typeof DELIVERY_COMMISSION_TRACKING_ABSOLUTE_FINAL_POLICY_ID;
};

type OrderRow = {
  id: string;
  status: OrderStatus;
  total: Prisma.Decimal | null;
  createdAt: Date;
  channelProvider: IntegrationProvider | null;
  importedFromExternal: {
    externalOrderId: string;
    provider: IntegrationProvider;
    rawPayloadJson: Prisma.JsonValue;
  } | null;
};

function resolveProvider(row: OrderRow): IntegrationProvider | null {
  if (row.importedFromExternal?.provider) return row.importedFromExternal.provider;
  return row.channelProvider;
}

function toCommissionRows(orders: OrderRow[]): DeliveryOrderCommissionRow[] {
  const rows: DeliveryOrderCommissionRow[] = [];

  for (const order of orders) {
    if (!orderContributesToRevenue(order.status)) continue;

    const provider = resolveProvider(order);
    if (!isDeliveryCommissionProvider(provider)) continue;

    const grossTotal = decimalToNumber(order.total);
    if (grossTotal <= 0) continue;

    rows.push(
      resolveDeliveryOrderCommission({
        orderId: order.id,
        externalOrderId: order.importedFromExternal?.externalOrderId ?? null,
        provider,
        createdAt: order.createdAt,
        grossTotal,
        rawPayload: order.importedFromExternal?.rawPayloadJson,
      }),
    );
  }

  return rows;
}

export async function loadDeliveryCommissionTracking(
  scope: { userId: string },
  filters: AnalyticsFilters,
): Promise<DeliveryCommissionTrackingModel> {
  const orderWhere = await orderListWhereForOwnerAnd(scope.userId, {
    createdAt: { gte: filters.from, lte: filters.to },
    ...(filters.brandId ? { brandId: filters.brandId } : {}),
    ...(filters.locationId ? { locationId: filters.locationId } : {}),
    OR: [
      { channelProvider: { in: [...DELIVERY_MARKETPLACE_PROVIDERS] } },
      {
        importedFromExternal: {
          provider: { in: [...DELIVERY_MARKETPLACE_PROVIDERS] },
        },
      },
    ],
  });

  const orders = await prisma.order.findMany({
    where: orderWhere,
    select: {
      id: true,
      status: true,
      total: true,
      createdAt: true,
      channelProvider: true,
      importedFromExternal: {
        select: {
          externalOrderId: true,
          provider: true,
          rawPayloadJson: true,
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: 500,
  });

  const commissionRows = toCommissionRows(orders);
  const snapshot = buildDeliveryCommissionTrackingSnapshot({
    orders: commissionRows,
    from: filters.from,
    to: filters.to,
  });

  return {
    ...snapshot,
    policyId: DELIVERY_COMMISSION_TRACKING_ABSOLUTE_FINAL_POLICY_ID,
  };
}
