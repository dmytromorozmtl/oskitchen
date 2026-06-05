import { subDays } from "date-fns";

import { buildForecasting2Snapshot } from "@/lib/ai/forecasting-builders";
import { FORECASTING_2_HISTORY_DAYS } from "@/lib/ai/forecasting-policy";
import type { Forecasting2Snapshot } from "@/lib/ai/forecasting-types";
import { orderContributesToRevenue } from "@/lib/analytics/revenue-metrics";
import { decimalToNumber } from "@/lib/catering/quote-calculations";
import { prisma } from "@/lib/prisma";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";

export type { Forecasting2Snapshot } from "@/lib/ai/forecasting-types";

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

async function loadDailyOrderHistory(userId: string, historyDays: number) {
  const since = subDays(new Date(), historyDays);
  const orderWhere = await orderListWhereForOwnerAnd(userId, {
    createdAt: { gte: since },
  });

  const orders = await prisma.order.findMany({
    where: orderWhere,
    select: { createdAt: true, total: true, status: true },
    orderBy: { createdAt: "asc" },
    take: 10000,
  });

  const byDay = new Map<string, { orders: number; revenueUsd: number }>();
  for (const order of orders) {
    if (!orderContributesToRevenue(order.status)) continue;
    const key = isoDate(order.createdAt);
    const row = byDay.get(key) ?? { orders: 0, revenueUsd: 0 };
    row.orders += 1;
    row.revenueUsd += decimalToNumber(order.total);
    byDay.set(key, row);
  }

  const history: Array<{ dateIso: string; orders: number; revenueUsd: number }> = [];
  for (let i = historyDays; i >= 0; i--) {
    const day = subDays(new Date(), i);
    const key = isoDate(day);
    const row = byDay.get(key) ?? { orders: 0, revenueUsd: 0 };
    history.push({
      dateIso: key,
      orders: row.orders,
      revenueUsd: Math.round(row.revenueUsd * 100) / 100,
    });
  }

  return history;
}

export async function loadForecasting2Snapshot(userId: string): Promise<Forecasting2Snapshot> {
  const history = await loadDailyOrderHistory(userId, FORECASTING_2_HISTORY_DAYS);
  return buildForecasting2Snapshot({
    historyDays: FORECASTING_2_HISTORY_DAYS,
    history,
  });
}
