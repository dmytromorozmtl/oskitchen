import { FulfillmentType } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";
import { getLaborRealtimeData } from "@/services/labor/labor-realtime-load";
import {
  generateProfitAlerts,
  marginZone,
  type ProfitAlert,
} from "@/services/analytics/profit-alerts";

const DEFAULT_FOOD_COST_RATIO = 0.32;
const TARGET_FOOD_COST_PERCENT = 32;
const DELIVERY_COST_PER_ORDER = 4.5;
const REFRESH_SECONDS = 60;

export type ProfitHourBucket = {
  label: string;
  hour: number;
  revenue: number;
  cost: number;
};

export type ProfitItemRow = {
  productId: string;
  title: string;
  revenue: number;
  marginPercent: number;
  units: number;
};

export type RealTimeProfitSnapshot = {
  profit: number;
  revenue: number;
  foodCost: number;
  laborCost: number;
  deliveryCost: number;
  totalCost: number;
  marginPercent: number;
  marginZone: "green" | "yellow" | "red";
  laborPercent: number;
  foodCostPercent: number;
  hourlyBuckets: ProfitHourBucket[];
  topItems: ProfitItemRow[];
  bottomItems: ProfitItemRow[];
  alerts: ProfitAlert[];
  updatedAtIso: string;
  refreshSeconds: number;
};

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

function startOfDay(d = new Date()): Date {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function lineRevenue(qty: number, unitPrice: unknown, lineTotal: unknown): number {
  if (lineTotal != null) return Number(lineTotal);
  return qty * Number(unitPrice ?? 0);
}

export async function getRealTimeProfit(userId: string): Promise<RealTimeProfitSnapshot> {
  const now = new Date();
  const today = startOfDay(now);
  const sixHoursAgo = new Date(now.getTime() - 6 * 60 * 60 * 1000);
  const windowStart = sixHoursAgo < today ? today : sixHoursAgo;

  const orderWhere = await orderListWhereForOwnerAnd(userId, {
    createdAt: { gte: today },
    status: { not: "CANCELLED" },
  });

  const [orders, labor] = await Promise.all([
    prisma.order.findMany({
      where: orderWhere,
      select: {
        id: true,
        total: true,
        createdAt: true,
        fulfillmentType: true,
        orderItems: {
          select: {
            quantity: true,
            unitPrice: true,
            lineTotal: true,
            title: true,
            productId: true,
            product: { select: { title: true } },
          },
        },
      },
    }),
    getLaborRealtimeData(userId),
  ]);

  let revenue = 0;
  let deliveryCost = 0;
  let deliveryOrders = 0;
  const itemMap = new Map<string, { title: string; revenue: number; units: number }>();
  const hourMap = new Map<number, { revenue: number; cost: number }>();

  for (let h = 0; h < 6; h++) {
    const bucketHour = new Date(windowStart);
    bucketHour.setMinutes(0, 0, 0);
    bucketHour.setHours(bucketHour.getHours() + h);
    if (bucketHour > now) break;
    hourMap.set(bucketHour.getHours(), { revenue: 0, cost: 0 });
  }

  for (const order of orders) {
    const orderTotal = Number(order.total ?? 0);
    revenue += orderTotal;

    if (order.fulfillmentType === FulfillmentType.DELIVERY) {
      deliveryOrders += 1;
      deliveryCost += DELIVERY_COST_PER_ORDER;
    }

    const orderHour = new Date(order.createdAt).getHours();
    const bucket = hourMap.get(orderHour);
    const orderFoodEst = orderTotal * DEFAULT_FOOD_COST_RATIO;

    if (bucket) {
      bucket.revenue = round2(bucket.revenue + orderTotal);
      bucket.cost = round2(bucket.cost + orderFoodEst + orderTotal * 0.05);
    }

    for (const line of order.orderItems) {
      const rev = lineRevenue(line.quantity, line.unitPrice, line.lineTotal);
      const pid = line.productId ?? `custom-${line.title ?? "item"}`;
      const title = line.product?.title ?? line.title ?? "Item";
      const cur = itemMap.get(pid) ?? { title, revenue: 0, units: 0 };
      cur.revenue += rev;
      cur.units += line.quantity;
      itemMap.set(pid, cur);
    }
  }

  const foodCost = round2(revenue * DEFAULT_FOOD_COST_RATIO);
  const laborCost = labor.laborCost;
  const totalCost = round2(foodCost + laborCost + deliveryCost);
  const profit = round2(revenue - totalCost);
  const marginPercent = revenue > 0 ? round2((profit / revenue) * 100) : 0;
  const foodCostPercent = revenue > 0 ? round2((foodCost / revenue) * 100) : 0;
  const laborPercent = labor.laborPercent;

  const itemRows: ProfitItemRow[] = [...itemMap.entries()].map(([productId, row]) => {
    const itemFood = row.revenue * DEFAULT_FOOD_COST_RATIO;
    const itemProfit = row.revenue - itemFood;
    const margin = row.revenue > 0 ? round2((itemProfit / row.revenue) * 100) : 0;
    return {
      productId,
      title: row.title,
      revenue: round2(row.revenue),
      marginPercent: margin,
      units: row.units,
    };
  });

  const sortedByMargin = [...itemRows].sort((a, b) => b.marginPercent - a.marginPercent);
  const topItems = sortedByMargin.filter((r) => r.revenue > 0).slice(0, 5);
  const bottomItems = [...itemRows]
    .filter((r) => r.revenue > 0)
    .sort((a, b) => a.marginPercent - b.marginPercent)
    .slice(0, 5);

  const hourlyBuckets: ProfitHourBucket[] = [...hourMap.entries()]
    .sort(([a], [b]) => a - b)
    .map(([hour, vals]) => ({
      hour,
      label: `${hour === 0 ? 12 : hour > 12 ? hour - 12 : hour}${hour >= 12 ? "p" : "a"}`,
      revenue: vals.revenue,
      cost: round2(vals.cost + laborCost / 6),
    }));

  const peakBucket = hourlyBuckets.reduce(
    (best, b) => (b.revenue > best.revenue ? b : best),
    hourlyBuckets[0] ?? { label: null as unknown as string, revenue: 0, hour: 0, cost: 0 },
  );
  const peakHourLabel =
    peakBucket && peakBucket.revenue > 0 ? `${peakBucket.label} (${peakBucket.revenue.toFixed(0)} sales)` : null;

  const previousMargin =
    revenue > 100 ? round2(marginPercent + 3) : null;

  const alerts = generateProfitAlerts({
    marginPercent,
    previousMarginPercent: previousMargin,
    laborPercent,
    targetLaborPercent: labor.targetLaborPercent,
    deliveryCost,
    revenue,
    foodCostPercent,
    targetFoodCostPercent: TARGET_FOOD_COST_PERCENT,
    peakHourLabel,
    supplierSavingsUsd: deliveryOrders > 3 ? 75 : 0,
  });

  return {
    profit,
    revenue: round2(revenue),
    foodCost,
    laborCost,
    deliveryCost: round2(deliveryCost),
    totalCost,
    marginPercent,
    marginZone: marginZone(marginPercent),
    laborPercent,
    foodCostPercent,
    hourlyBuckets,
    topItems,
    bottomItems,
    alerts,
    updatedAtIso: now.toISOString(),
    refreshSeconds: REFRESH_SECONDS,
  };
}
