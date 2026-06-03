import { FulfillmentType } from "@prisma/client";

import {
  DEFAULT_FOOD_COST_RATIO,
  loadProductCogsMap,
  orderTotalCost,
  resolveOrderLinesCogs,
} from "@/lib/costing/order-cogs";
import { prisma } from "@/lib/prisma";
import { readQrTableLabel } from "@/lib/qr/qr-order-meta";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";
import { getRealTimeProfit } from "@/services/analytics/real-time-profit-service";

export const PROFIT_ENGINE_REFRESH_SECONDS = 30;

const DELIVERY_COST_PER_ORDER = 4.5;

export type ProfitEngineRow = {
  id: string;
  label: string;
  revenue: number;
  cost: number;
  profit: number;
  marginPercent: number;
  orderCount: number;
};

export type ProfitEngineSnapshot = {
  summary: {
    profit: number;
    revenue: number;
    totalCost: number;
    marginPercent: number;
    orderCount: number;
  };
  byOrder: ProfitEngineRow[];
  byTable: ProfitEngineRow[];
  byServer: ProfitEngineRow[];
  byChannel: ProfitEngineRow[];
  refreshSeconds: number;
  updatedAtIso: string;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function startOfDay(d = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function estimatedOrderCost(revenue: number, isDelivery: boolean): number {
  return orderTotalCost(
    round2(revenue * DEFAULT_FOOD_COST_RATIO),
    isDelivery,
    DELIVERY_COST_PER_ORDER,
  );
}

function toRow(id: string, label: string, revenue: number, cost: number, orderCount: number): ProfitEngineRow {
  const profit = round2(revenue - cost);
  const marginPercent = revenue > 0 ? round2((profit / revenue) * 100) : 0;
  return { id, label, revenue: round2(revenue), cost: round2(cost), profit, marginPercent, orderCount };
}

function aggregateMap(
  map: Map<string, { label: string; revenue: number; cost: number; count: number }>,
  key: string,
  label: string,
  revenue: number,
  cost: number,
) {
  const cur = map.get(key) ?? { label, revenue: 0, cost: 0, count: 0 };
  cur.revenue += revenue;
  cur.cost += cost;
  cur.count += 1;
  map.set(key, cur);
}

function mapToRows(
  map: Map<string, { label: string; revenue: number; cost: number; count: number }>,
  sort: "profit" | "revenue" = "profit",
  limit = 12,
): ProfitEngineRow[] {
  const rows = [...map.entries()].map(([id, v]) =>
    toRow(id, v.label, v.revenue, v.cost, v.count),
  );
  rows.sort((a, b) => (sort === "profit" ? b.profit - a.profit : b.revenue - a.revenue));
  return rows.slice(0, limit);
}

export function channelLabel(order: {
  channelProvider: string | null;
  creationSource: string | null;
}): string {
  const ch = order.channelProvider?.trim();
  if (ch) return ch.toUpperCase();
  const src = order.creationSource?.trim();
  if (src) return src.replace(/_/g, " ");
  return "In-house";
}

export async function getProfitEngineSnapshot(userId: string): Promise<ProfitEngineSnapshot> {
  const now = new Date();
  const today = startOfDay(now);

  const orderWhere = await orderListWhereForOwnerAnd(userId, {
    createdAt: { gte: today },
    status: { not: "CANCELLED" },
  });

  const orders = await prisma.order.findMany({
    where: orderWhere,
    orderBy: { createdAt: "desc" },
    take: 200,
    select: {
      id: true,
      total: true,
      createdAt: true,
      fulfillmentType: true,
      channelProvider: true,
      creationSource: true,
      sourceMetadataJson: true,
      publicLookupToken: true,
      tableId: true,
      restaurantTable: { select: { id: true, name: true } },
      posTransactions: {
        select: {
          staff: { select: { id: true, name: true } },
        },
        take: 1,
      },
      orderItems: {
        select: {
          quantity: true,
          unitPrice: true,
          lineTotal: true,
          productId: true,
          title: true,
        },
      },
    },
  });

  const productIds = orders.flatMap((o) =>
    o.orderItems.map((li) => li.productId).filter(Boolean) as string[],
  );
  const cogsMap = await loadProductCogsMap(userId, productIds);

  const tableMap = new Map<string, { label: string; revenue: number; cost: number; count: number }>();
  const serverMap = new Map<string, { label: string; revenue: number; cost: number; count: number }>();
  const channelMap = new Map<string, { label: string; revenue: number; cost: number; count: number }>();
  const byOrderRows: ProfitEngineRow[] = [];

  let revenue = 0;
  let totalCost = 0;

  for (const order of orders) {
    const orderRevenue = Number(order.total ?? 0);
    const isDelivery = order.fulfillmentType === FulfillmentType.DELIVERY;
    const lineCogs = resolveOrderLinesCogs(order.orderItems, orderRevenue, cogsMap);
    const cost =
      order.orderItems.length > 0
        ? orderTotalCost(lineCogs.primeCost, isDelivery, DELIVERY_COST_PER_ORDER)
        : estimatedOrderCost(orderRevenue, isDelivery);
    revenue += orderRevenue;
    totalCost += cost;

    const token = order.publicLookupToken ?? order.id.slice(0, 8);
    byOrderRows.push(
      toRow(order.id, `#${token}`, orderRevenue, cost, 1),
    );

    const tableLabel =
      order.restaurantTable?.name?.trim() ??
      readQrTableLabel(order.sourceMetadataJson) ??
      (order.tableId ? "Table" : "Walk-in");
    const tableKey = order.tableId ?? `walk-in-${tableLabel}`;
    aggregateMap(tableMap, tableKey, tableLabel, orderRevenue, cost);

    const staff = order.posTransactions[0]?.staff;
    const serverKey = staff?.id ?? "unassigned";
    const serverLabel = staff?.name?.trim() ?? "Unassigned";
    aggregateMap(serverMap, serverKey, serverLabel, orderRevenue, cost);

    const chLabel = channelLabel(order);
    const chKey = (order.channelProvider ?? order.creationSource ?? "in-house").toLowerCase();
    aggregateMap(channelMap, chKey, chLabel, orderRevenue, cost);
  }

  const profit = round2(revenue - totalCost);
  const marginPercent = revenue > 0 ? round2((profit / revenue) * 100) : 0;

  return {
    summary: {
      profit,
      revenue: round2(revenue),
      totalCost: round2(totalCost),
      marginPercent,
      orderCount: orders.length,
    },
    byOrder: byOrderRows.slice(0, 15),
    byTable: mapToRows(tableMap),
    byServer: mapToRows(serverMap),
    byChannel: mapToRows(channelMap, "revenue"),
    refreshSeconds: PROFIT_ENGINE_REFRESH_SECONDS,
    updatedAtIso: now.toISOString(),
  };
}

/** Combined snapshot for dashboards that need both legacy profit UI and engine breakdowns. */
export async function getProfitEngineWithLegacy(userId: string) {
  const [engine, legacy] = await Promise.all([
    getProfitEngineSnapshot(userId),
    getRealTimeProfit(userId),
  ]);
  return { engine, legacy };
}
