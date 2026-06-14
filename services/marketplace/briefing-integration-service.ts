import { addDays, startOfDay, startOfMonth } from "date-fns";

import {
  budgetAlertLevel,
  budgetProgressPercent,
  marketplaceAnalyticsFromSettingsCenter,
} from "@/lib/marketplace/analytics-preferences";
import type { MarketplaceBriefingAlert, MarketplaceBriefingSnapshot } from "@/lib/marketplace/briefing-integration-types";
import { prisma } from "@/lib/prisma";

const DELIVERY_WINDOW_DAYS = 2;
const PRICE_DROP_THRESHOLD_PERCENT = 5;

function decimalToNumber(value: { toString(): string } | number | null | undefined): number {
  if (value == null) return 0;
  return typeof value === "number" ? value : Number(value.toString());
}

function formatMoney(amount: number, currency = "USD"): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

async function loadMonthlySpend(workspaceId: string): Promise<number> {
  const monthStart = startOfMonth(new Date());
  const agg = await prisma.marketplacePurchaseOrder.aggregate({
    where: {
      workspaceId,
      createdAt: { gte: monthStart },
      status: { notIn: ["DRAFT", "CANCELLED"] },
    },
    _sum: { total: true },
  });
  return decimalToNumber(agg._sum.total);
}

async function buildApprovalAlerts(workspaceId: string): Promise<{
  alerts: MarketplaceBriefingAlert[];
  count: number;
}> {
  const orders = await prisma.marketplacePurchaseOrder.findMany({
    where: { workspaceId, status: "PENDING_APPROVAL" },
    orderBy: { createdAt: "asc" },
    take: 10,
    include: { vendor: { select: { companyName: true } } },
  });

  if (orders.length === 0) {
    return { alerts: [], count: 0 };
  }

  if (orders.length >= 3) {
    return {
      count: orders.length,
      alerts: [
        {
          id: "po-approval-batch",
          kind: "po_approval",
          title: `${orders.length} marketplace POs require approval`,
          detail: "Pending purchase orders exceed your approval queue threshold.",
          href: "/dashboard/marketplace/orders?status=PENDING_APPROVAL",
          severity: orders.length >= 5 ? "critical" : "high",
          priority: orders.length >= 5 ? 5 : 12,
          metadata: { count: orders.length },
        },
      ],
    };
  }

  return {
    count: orders.length,
    alerts: orders.map((order, index) => ({
      id: `po-approval-${order.id}`,
      kind: "po_approval" as const,
      title: "Marketplace PO requires approval",
      detail: `${order.vendor.companyName} · ${formatMoney(decimalToNumber(order.total), order.currency)}`,
      href: `/dashboard/marketplace/orders/${order.id}`,
      severity: "high" as const,
      priority: 10 + index,
      metadata: { orderId: order.id, poNumber: order.poNumber },
    })),
  };
}

async function buildDeliveryAlerts(workspaceId: string): Promise<{
  alerts: MarketplaceBriefingAlert[];
  count: number;
}> {
  const now = startOfDay(new Date());
  const windowEnd = addDays(now, DELIVERY_WINDOW_DAYS);

  const orders = await prisma.marketplacePurchaseOrder.findMany({
    where: {
      workspaceId,
      status: { in: ["CONFIRMED", "PROCESSING", "SHIPPED"] },
      OR: [
        { confirmedDeliveryDate: { gte: now, lte: windowEnd } },
        { requestedDeliveryDate: { gte: now, lte: windowEnd } },
      ],
    },
    orderBy: { confirmedDeliveryDate: "asc" },
    take: 8,
    include: { vendor: { select: { companyName: true } } },
  });

  return {
    count: orders.length,
    alerts: orders.map((order, index) => {
      const deliveryDate = order.confirmedDeliveryDate ?? order.requestedDeliveryDate;
      return {
        id: `delivery-${order.id}`,
        kind: "delivery_arriving" as const,
        title: "Marketplace delivery arriving within 2 days",
        detail: `${order.vendor.companyName}${deliveryDate ? ` · ${deliveryDate.toLocaleDateString()}` : ""}`,
        href: `/dashboard/marketplace/orders/${order.id}`,
        severity: "normal" as const,
        priority: 30 + index,
        metadata: {
          orderId: order.id,
          poNumber: order.poNumber,
          deliveryDate: deliveryDate?.toISOString() ?? null,
        },
      };
    }),
  };
}

async function buildBudgetAlerts(
  workspaceId: string,
  userId: string,
): Promise<{ alerts: MarketplaceBriefingAlert[]; budgetUsedPercent: number | null }> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { settingsCenterJson: true },
  });
  const settings = marketplaceAnalyticsFromSettingsCenter(kitchen?.settingsCenterJson);
  if (!settings.monthlyBudgetUsd) {
    return { alerts: [], budgetUsedPercent: null };
  }

  const spend = await loadMonthlySpend(workspaceId);
  const level = budgetAlertLevel(spend, settings.monthlyBudgetUsd);
  const budgetUsedPercent = budgetProgressPercent(spend, settings.monthlyBudgetUsd);

  if (level === "none") {
    return { alerts: [], budgetUsedPercent };
  }

  return {
    budgetUsedPercent,
    alerts: [
      {
        id: "budget-threshold",
        kind: "budget_threshold",
        title:
          level === "critical"
            ? "Marketplace procurement budget exceeded"
            : "Marketplace budget at 85%+ used",
        detail: `${formatMoney(spend)} of ${formatMoney(settings.monthlyBudgetUsd)} monthly budget consumed.`,
        href: "/dashboard/marketplace/analytics",
        severity: level === "critical" ? "critical" : "high",
        priority: level === "critical" ? 8 : 18,
        metadata: {
          spend,
          budget: settings.monthlyBudgetUsd,
          usedPercent: budgetUsedPercent,
        },
      },
    ],
  };
}

async function buildPriceDropAlerts(workspaceId: string): Promise<{
  alerts: MarketplaceBriefingAlert[];
  count: number;
}> {
  const recentLines = await prisma.marketplacePOLineItem.findMany({
    where: {
      purchaseOrder: {
        workspaceId,
        status: { in: ["DELIVERED", "COMPLETED", "SHIPPED"] },
        createdAt: { gte: addDays(new Date(), -90) },
      },
    },
    orderBy: { purchaseOrder: { createdAt: "desc" } },
    take: 200,
    select: {
      productId: true,
      productName: true,
      sku: true,
      unitPrice: true,
      product: { select: { slug: true, basePrice: true, status: true } },
    },
  });

  const lastPaidByProduct = new Map<
    string,
    { name: string; sku: string; slug: string; lastPrice: number; currentPrice: number; dropPercent: number }
  >();

  for (const line of recentLines) {
    if (line.product.status !== "ACTIVE") continue;
    if (lastPaidByProduct.has(line.productId)) continue;
    const lastPrice = decimalToNumber(line.unitPrice);
    const currentPrice = decimalToNumber(line.product.basePrice);
    if (lastPrice <= 0 || currentPrice >= lastPrice) continue;
    const dropPercent = Math.round(((lastPrice - currentPrice) / lastPrice) * 1000) / 10;
    if (dropPercent < PRICE_DROP_THRESHOLD_PERCENT) continue;
    lastPaidByProduct.set(line.productId, {
      name: line.productName,
      sku: line.sku,
      slug: line.product.slug,
      lastPrice,
      currentPrice,
      dropPercent,
    });
  }

  const drops = [...lastPaidByProduct.entries()].slice(0, 5);
  return {
    count: drops.length,
    alerts: drops.map(([productId, row], index) => {
      const dropPercent = row.dropPercent;
      return {
        id: `price-drop-${productId}`,
        kind: "price_drop" as const,
        title: "Marketplace price drop detected",
        detail: `${row.name} (${row.sku}) now ${formatMoney(row.currentPrice)} — was ${formatMoney(row.lastPrice)} (${dropPercent}% lower).`,
        href: `/dashboard/marketplace/products/${row.slug}`,
        severity: dropPercent >= 15 ? "high" : "normal",
        priority: 55 + index,
        metadata: {
          productId,
          sku: row.sku,
          dropPercent,
          currentPrice: row.currentPrice,
          lastPrice: row.lastPrice,
        },
      };
    }),
  };
}

export async function loadMarketplaceBriefingSnapshot(input: {
  workspaceId: string;
  userId: string;
}): Promise<MarketplaceBriefingSnapshot> {
  const [approvals, deliveries, budget, priceDrops] = await Promise.all([
    buildApprovalAlerts(input.workspaceId),
    buildDeliveryAlerts(input.workspaceId),
    buildBudgetAlerts(input.workspaceId, input.userId),
    buildPriceDropAlerts(input.workspaceId),
  ]);

  const alerts = [...approvals.alerts, ...deliveries.alerts, ...budget.alerts, ...priceDrops.alerts].sort(
    (a, b) => a.priority - b.priority,
  );

  return {
    workspaceId: input.workspaceId,
    generatedAt: new Date().toISOString(),
    alerts,
    counts: {
      pendingApprovals: approvals.count,
      deliveriesSoon: deliveries.count,
      budgetUsedPercent: budget.budgetUsedPercent,
      priceDrops: priceDrops.count,
    },
  };
}

export async function buildMarketplaceBriefingRankedActions(input: {
  workspaceId: string;
  userId: string;
}) {
  const snapshot = await loadMarketplaceBriefingSnapshot(input);
  const { marketplaceBriefingAlertToRankedAction } = await import("@/lib/marketplace/briefing-integration-types");
  return snapshot.alerts.map(marketplaceBriefingAlertToRankedAction);
}

/** Procurement alerts for Owner Daily Briefing (PO approval, delivery, budget, price drops). */
export async function getProcurementBriefingItems(input: {
  workspaceId: string;
  userId: string;
}): Promise<MarketplaceBriefingAlert[]> {
  const snapshot = await loadMarketplaceBriefingSnapshot(input);
  return snapshot.alerts;
}

export { mergeMarketplaceBriefingIntoTopActions } from "@/lib/marketplace/briefing-integration-types";
