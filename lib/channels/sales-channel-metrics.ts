import { startOfDay } from "date-fns";

import { workspaceChannelHealthScore } from "@/lib/channels/channel-health-score";
import { resolveAllChannels } from "@/lib/channels/channel-runtime";
import { prisma } from "@/lib/prisma";
import {
  externalOrderListWhereForOwner,
  externalProductListWhereForOwner,
} from "@/lib/scope/workspace-channel-scope";
import { integrationConnectionListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export type ChannelOrderSlice = {
  key: string;
  label: string;
  orders: number;
  revenue: number;
};

export type SalesChannelMetrics = {
  connectedCount: number;
  liveChannelsCount: number;
  needsCredentialsCount: number;
  partnerRequiredCount: number;
  placeholderAttentionCount: number;
  ordersToday: number;
  failedExternalImports: number;
  unmatchedProducts: number;
  webhookFailures: number;
  lastSuccessfulSyncLabel: string | null;
  healthScore: number;
  storefrontOrdersToday: number;
  nextBestAction: string;
  ordersTodayByChannel: ChannelOrderSlice[];
  revenueTodayByChannel: ChannelOrderSlice[];
};

function num(d: { _sum: { total: unknown } } | null): number {
  const v = d?._sum?.total;
  if (v == null) return 0;
  return Number(v);
}

function nextBestActionFromSignals(input: {
  needsCredentials: number;
  webhookFailures: number;
  failedImports: number;
  unmatched: number;
  errorConnections: number;
}): string {
  if (input.errorConnections > 0) return "Fix failing integration connections and re-run test connection.";
  if (input.needsCredentials > 0) return "Complete credential setup for WooCommerce or Shopify to unlock ecommerce sync.";
  if (input.webhookFailures > 0) return "Review the webhook center for signature or processing failures.";
  if (input.failedImports > 0) return "Clear failed external imports from the attention tab.";
  if (input.unmatched > 0) return "Map unmatched external catalog items before scaling order volume.";
  return "Keep monitoring sync jobs and webhook health — no urgent channel issues detected.";
}

export async function loadSalesChannelMetrics(userId: string): Promise<SalesChannelMetrics> {
  const dayStart = startOfDay(new Date());
  const [connectionWhere, externalOrderWhere, externalProductWhere] = await Promise.all([
    integrationConnectionListWhereForOwner(userId),
    externalOrderListWhereForOwner(userId),
    externalProductListWhereForOwner(userId),
  ]);

  const [
    connections,
    kitchen,
    ordersToday,
    failedExternal,
    unmatchedProducts,
    webhookFailures,
    storefrontOrdersToday,
    sfOrders,
    sfRev,
    wooOrders,
    wooRev,
    shopifyOrders,
    shopifyRev,
    manualOrders,
    manualRev,
    uberOrders,
    uberRev,
  ] = await Promise.all([
    prisma.integrationConnection.findMany({ where: connectionWhere }),
    prisma.kitchenSettings.findUnique({ where: { userId } }),
    prisma.order.count({ where: { userId, createdAt: { gte: dayStart } } }),
    prisma.externalOrder.count({
      where: { AND: [externalOrderWhere, { syncStatus: "FAILED" }] },
    }),
    prisma.externalProduct.count({
      where: { AND: [externalProductWhere, { mappedProductId: null }] },
    }),
    prisma.webhookEvent.count({
      where: { userId, processed: false },
    }),
    prisma.storefrontOrder.count({
      where: { userId, createdAt: { gte: dayStart } },
    }),
    prisma.order.count({
      where: {
        userId,
        createdAt: { gte: dayStart },
        storefrontOrder: { isNot: null },
      },
    }),
    prisma.order.aggregate({
      where: {
        userId,
        createdAt: { gte: dayStart },
        storefrontOrder: { isNot: null },
      },
      _sum: { total: true },
    }),
    prisma.order.count({
      where: {
        userId,
        createdAt: { gte: dayStart },
        importedFromExternal: { provider: "WOOCOMMERCE" },
      },
    }),
    prisma.order.aggregate({
      where: {
        userId,
        createdAt: { gte: dayStart },
        importedFromExternal: { provider: "WOOCOMMERCE" },
      },
      _sum: { total: true },
    }),
    prisma.order.count({
      where: {
        userId,
        createdAt: { gte: dayStart },
        importedFromExternal: { provider: "SHOPIFY" },
      },
    }),
    prisma.order.aggregate({
      where: {
        userId,
        createdAt: { gte: dayStart },
        importedFromExternal: { provider: "SHOPIFY" },
      },
      _sum: { total: true },
    }),
    prisma.order.count({
      where: {
        userId,
        createdAt: { gte: dayStart },
        storefrontOrder: { is: null },
        importedFromExternal: { is: null },
      },
    }),
    prisma.order.aggregate({
      where: {
        userId,
        createdAt: { gte: dayStart },
        storefrontOrder: { is: null },
        importedFromExternal: { is: null },
      },
      _sum: { total: true },
    }),
    prisma.order.count({
      where: {
        userId,
        createdAt: { gte: dayStart },
        importedFromExternal: { provider: "UBER_EATS" },
      },
    }),
    prisma.order.aggregate({
      where: {
        userId,
        createdAt: { gte: dayStart },
        importedFromExternal: { provider: "UBER_EATS" },
      },
      _sum: { total: true },
    }),
  ]);

  const workspaceDemo = kitchen?.demoMode ?? false;
  const resolved = resolveAllChannels(connections, workspaceDemo);

  const connectedCount = connections.filter((c) => c.status === "CONNECTED").length;
  const liveChannelsCount = resolved.filter(
    (r) => r.effectiveStatus === "LIVE" || r.effectiveStatus === "CONNECTED",
  ).length;
  const needsCredentialsCount = resolved.filter((r) => r.effectiveStatus === "NEEDS_CREDENTIALS").length;
  const partnerRequiredCount = resolved.filter(
    (r) => r.effectiveStatus === "PARTNER_ACCESS_REQUIRED",
  ).length;
  const placeholderAttentionCount = resolved.filter(
    (r) => r.isPlaceholder && (r.effectiveStatus === "ERROR" || r.effectiveStatus === "SIMULATED_DEMO"),
  ).length;

  const lastSync = connections
    .map((c) => c.lastSyncAt)
    .filter(Boolean)
    .sort((a, b) => (b as Date).getTime() - (a as Date).getTime())[0] as Date | undefined;

  const errorConnections = connections.filter((c) => c.status === "ERROR").length;

  const healthScore = workspaceChannelHealthScore({
    connections,
    resolved,
    webhookFailures,
    failedExternalImports: failedExternal,
    unmatchedProducts,
  });

  const ordersTodayByChannel: ChannelOrderSlice[] = [
    {
      key: "storefront",
      label: "KitchenOS storefront",
      orders: sfOrders,
      revenue: num(sfRev),
    },
    {
      key: "woocommerce",
      label: "WooCommerce",
      orders: wooOrders,
      revenue: num(wooRev),
    },
    {
      key: "shopify",
      label: "Shopify",
      orders: shopifyOrders,
      revenue: num(shopifyRev),
    },
    {
      key: "uber-eats",
      label: "Uber Eats (imported)",
      orders: uberOrders,
      revenue: num(uberRev),
    },
    {
      key: "manual",
      label: "Manual / other",
      orders: manualOrders,
      revenue: num(manualRev),
    },
  ];

  const revenueTodayByChannel = ordersTodayByChannel.filter((r) => r.revenue > 0 || r.orders > 0);

  const nextBestAction = nextBestActionFromSignals({
    needsCredentials: needsCredentialsCount,
    webhookFailures,
    failedImports: failedExternal,
    unmatched: unmatchedProducts,
    errorConnections,
  });

  return {
    connectedCount,
    liveChannelsCount,
    needsCredentialsCount,
    partnerRequiredCount,
    placeholderAttentionCount,
    ordersToday,
    failedExternalImports: failedExternal,
    unmatchedProducts,
    webhookFailures,
    lastSuccessfulSyncLabel: lastSync ? lastSync.toISOString() : null,
    healthScore,
    storefrontOrdersToday,
    nextBestAction,
    ordersTodayByChannel,
    revenueTodayByChannel,
  };
}
