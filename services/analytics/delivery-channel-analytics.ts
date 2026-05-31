import type { ExternalSyncStatus, FulfillmentType, IntegrationProvider, OrderStatus } from "@prisma/client";

import type { AnalyticsFilters } from "@/lib/analytics/filters";
import { orderContributesToRevenue } from "@/lib/analytics/revenue-metrics";
import { decimalToNumber } from "@/lib/catering/quote-calculations";
import { prisma } from "@/lib/prisma";
import { externalOrderListWhereForOwner } from "@/lib/scope/workspace-channel-scope";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-order-scope";

export const DELIVERY_MARKETPLACE_PROVIDERS = [
  "DOORDASH",
  "UBER_EATS",
  "GRUBHUB",
  "UBER_DIRECT",
] as const satisfies readonly IntegrationProvider[];

export type DeliveryMarketplaceProvider = (typeof DELIVERY_MARKETPLACE_PROVIDERS)[number];

export const DELIVERY_CHANNEL_LABEL: Record<DeliveryMarketplaceProvider, string> = {
  DOORDASH: "DoorDash",
  UBER_EATS: "Uber Eats",
  GRUBHUB: "Grubhub",
  UBER_DIRECT: "Uber Direct",
};

export type DeliveryChannelRow = {
  provider: DeliveryMarketplaceProvider;
  label: string;
  orders: number;
  revenue: number;
  deliveryFees: number;
  avgOrderValue: number | null;
  pickupOrders: number;
  deliveryOrders: number;
  externalStagingCount: number;
  importedCount: number;
  failedImports: number;
  pendingImports: number;
  importSuccessRate: number | null;
  connected: boolean;
};

export type DeliveryChannelAnalyticsSnapshot = {
  rangeLabel: string;
  totalOrders: number;
  totalRevenue: number;
  totalDeliveryFees: number;
  totalFailedImports: number;
  overallImportSuccessRate: number | null;
  channels: DeliveryChannelRow[];
  dailyTrend: { date: string; orders: number }[];
  topChannel: DeliveryChannelRow | null;
};

type InternalOrderRow = {
  status: OrderStatus;
  total: unknown;
  fulfillmentType: FulfillmentType | null;
  createdAt: Date;
  importedFromExternal: { provider: IntegrationProvider; deliveryFee: unknown } | null;
};

type ExternalOrderRow = {
  provider: IntegrationProvider;
  syncStatus: ExternalSyncStatus;
  total: unknown;
  deliveryFee: unknown;
  fulfillmentType: FulfillmentType | null;
  importedOrderId: string | null;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function formatRangeLabel(from: Date, to: Date): string {
  return `${from.toISOString().slice(0, 10)} → ${to.toISOString().slice(0, 10)}`;
}

function isDeliveryProvider(provider: IntegrationProvider): provider is DeliveryMarketplaceProvider {
  return (DELIVERY_MARKETPLACE_PROVIDERS as readonly IntegrationProvider[]).includes(provider);
}

function importSuccessRate(imported: number, failed: number, pending: number): number | null {
  const attempted = imported + failed + pending;
  if (attempted === 0) return null;
  return round2((imported / attempted) * 100);
}

export function buildDeliveryChannelAnalyticsSnapshot(input: {
  internalOrders: InternalOrderRow[];
  externalOrders: ExternalOrderRow[];
  connectedProviders: DeliveryMarketplaceProvider[];
  from: Date;
  to: Date;
}): DeliveryChannelAnalyticsSnapshot {
  const buckets = new Map<
    DeliveryMarketplaceProvider,
    {
      orders: number;
      revenue: number;
      deliveryFees: number;
      pickupOrders: number;
      deliveryOrders: number;
      externalStagingCount: number;
      importedCount: number;
      failedImports: number;
      pendingImports: number;
    }
  >();

  for (const provider of DELIVERY_MARKETPLACE_PROVIDERS) {
    buckets.set(provider, {
      orders: 0,
      revenue: 0,
      deliveryFees: 0,
      pickupOrders: 0,
      deliveryOrders: 0,
      externalStagingCount: 0,
      importedCount: 0,
      failedImports: 0,
      pendingImports: 0,
    });
  }

  const dailyMap = new Map<string, number>();

  for (const row of input.internalOrders) {
    const provider = row.importedFromExternal?.provider;
    if (!provider || !isDeliveryProvider(provider)) continue;
    if (!orderContributesToRevenue(row.status)) continue;

    const bucket = buckets.get(provider)!;
    const total = decimalToNumber(row.total);
    bucket.orders += 1;
    bucket.revenue = round2(bucket.revenue + total);
    bucket.deliveryFees = round2(
      bucket.deliveryFees + decimalToNumber(row.importedFromExternal?.deliveryFee ?? 0),
    );
    if (row.fulfillmentType === "PICKUP") bucket.pickupOrders += 1;
    if (row.fulfillmentType === "DELIVERY") bucket.deliveryOrders += 1;

    const day = row.createdAt.toISOString().slice(0, 10);
    dailyMap.set(day, (dailyMap.get(day) ?? 0) + 1);
  }

  for (const row of input.externalOrders) {
    if (!isDeliveryProvider(row.provider)) continue;
    const bucket = buckets.get(row.provider)!;
    bucket.externalStagingCount += 1;
    if (row.importedOrderId) bucket.importedCount += 1;
    if (row.syncStatus === "FAILED") bucket.failedImports += 1;
    if (row.syncStatus === "PENDING") bucket.pendingImports += 1;
  }

  const connectedSet = new Set(input.connectedProviders);
  const channels: DeliveryChannelRow[] = DELIVERY_MARKETPLACE_PROVIDERS.map((provider) => {
    const bucket = buckets.get(provider)!;
    return {
      provider,
      label: DELIVERY_CHANNEL_LABEL[provider],
      orders: bucket.orders,
      revenue: bucket.revenue,
      deliveryFees: bucket.deliveryFees,
      avgOrderValue: bucket.orders > 0 ? round2(bucket.revenue / bucket.orders) : null,
      pickupOrders: bucket.pickupOrders,
      deliveryOrders: bucket.deliveryOrders,
      externalStagingCount: bucket.externalStagingCount,
      importedCount: bucket.importedCount,
      failedImports: bucket.failedImports,
      pendingImports: bucket.pendingImports,
      importSuccessRate: importSuccessRate(
        bucket.importedCount,
        bucket.failedImports,
        bucket.pendingImports,
      ),
      connected: connectedSet.has(provider),
    };
  });

  const activeChannels = channels.filter(
    (c) =>
      c.orders > 0 ||
      c.externalStagingCount > 0 ||
      c.connected,
  );
  const topChannel =
    activeChannels.length === 0
      ? null
      : [...activeChannels].sort((a, b) => b.revenue - a.revenue || b.orders - a.orders)[0];

  const totalOrders = channels.reduce((a, c) => a + c.orders, 0);
  const totalRevenue = round2(channels.reduce((a, c) => a + c.revenue, 0));
  const totalDeliveryFees = round2(channels.reduce((a, c) => a + c.deliveryFees, 0));
  const totalImported = channels.reduce((a, c) => a + c.importedCount, 0);
  const totalFailedImports = channels.reduce((a, c) => a + c.failedImports, 0);
  const totalPending = channels.reduce((a, c) => a + c.pendingImports, 0);

  const dailyTrend = [...dailyMap.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, orders]) => ({ date, orders }));

  return {
    rangeLabel: formatRangeLabel(input.from, input.to),
    totalOrders,
    totalRevenue,
    totalDeliveryFees,
    totalFailedImports,
    overallImportSuccessRate: importSuccessRate(totalImported, totalFailedImports, totalPending),
    channels,
    dailyTrend,
    topChannel,
  };
}

export async function loadDeliveryChannelAnalytics(
  scope: { userId: string },
  filters: AnalyticsFilters,
): Promise<DeliveryChannelAnalyticsSnapshot> {
  const [externalWhere, orderWhere, connections] = await Promise.all([
    externalOrderListWhereForOwner(scope.userId),
    orderListWhereForOwnerAnd(scope.userId, {
      createdAt: { gte: filters.from, lte: filters.to },
      ...(filters.brandId ? { brandId: filters.brandId } : {}),
      ...(filters.locationId ? { locationId: filters.locationId } : {}),
      importedFromExternal: {
        provider: { in: [...DELIVERY_MARKETPLACE_PROVIDERS] },
      },
    }),
    prisma.integrationConnection.findMany({
      where: { userId: scope.userId, provider: { in: [...DELIVERY_MARKETPLACE_PROVIDERS] } },
      select: { provider: true, status: true },
    }),
  ]);

  const [internalOrders, externalOrders] = await Promise.all([
    prisma.order.findMany({
      where: orderWhere,
      select: {
        status: true,
        total: true,
        fulfillmentType: true,
        createdAt: true,
        importedFromExternal: { select: { provider: true, deliveryFee: true } },
      },
    }),
    prisma.externalOrder.findMany({
      where: {
        AND: [
          externalWhere,
          { provider: { in: [...DELIVERY_MARKETPLACE_PROVIDERS] } },
          { createdAt: { gte: filters.from, lte: filters.to } },
        ],
      },
      select: {
        provider: true,
        syncStatus: true,
        total: true,
        deliveryFee: true,
        fulfillmentType: true,
        importedOrderId: true,
      },
    }),
  ]);

  const connectedProviders = connections
    .filter((c) => c.status === "CONNECTED")
    .map((c) => c.provider)
    .filter(isDeliveryProvider);

  return buildDeliveryChannelAnalyticsSnapshot({
    internalOrders,
    externalOrders,
    connectedProviders,
    from: filters.from,
    to: filters.to,
  });
}
