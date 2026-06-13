import { addDays, startOfDay, startOfWeek, subDays } from "date-fns";

import {
  buildDailyPlComparison,
  resolveDailyRevenueTarget,
  type DailyPlComparison,
} from "@/lib/finance/daily-pl-widget-p2-47-measurement";
import { DAILY_PL_WIDGET_P2_47_POLICY_ID } from "@/lib/finance/daily-pl-widget-p2-47-policy";
import { loadDailyPlWidgetSettings } from "@/lib/finance/daily-pl-widget-p2-47-storage";
import { prisma } from "@/lib/prisma";
import { orderListWhereForOwner } from "@/lib/scope/workspace-resource-scope";

export type DailyPlWidgetPayload = {
  policyId: typeof DAILY_PL_WIDGET_P2_47_POLICY_ID;
  currency: string;
  comparison: DailyPlComparison;
  pnlHref: string;
  analyticsHref: string;
};

const REVENUE_STATUSES = ["CONFIRMED", "PREPARING", "READY", "COMPLETED"] as const;

export async function loadDailyPlWidgetModel(
  userId: string,
  now = new Date(),
): Promise<DailyPlWidgetPayload> {
  const todayStart = startOfDay(now);
  const tomorrow = addDays(todayStart, 1);
  const yesterdayStart = startOfDay(subDays(now, 1));
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });

  const orderWhere = await orderListWhereForOwner(userId);

  const [settings, widgetSettings, revenueTodayAgg, revenueYesterdayAgg, revenueWeekAgg] =
    await Promise.all([
      prisma.kitchenSettings.findUnique({
        where: { userId },
        select: { currency: true },
      }),
      loadDailyPlWidgetSettings(userId),
      prisma.order.aggregate({
        where: {
          AND: [
            orderWhere,
            {
              createdAt: { gte: todayStart, lt: tomorrow },
              status: { in: [...REVENUE_STATUSES] },
            },
          ],
        },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          AND: [
            orderWhere,
            {
              createdAt: { gte: yesterdayStart, lt: todayStart },
              status: { in: [...REVENUE_STATUSES] },
            },
          ],
        },
        _sum: { total: true },
      }),
      prisma.order.aggregate({
        where: {
          AND: [
            orderWhere,
            {
              createdAt: { gte: weekStart },
              status: { in: [...REVENUE_STATUSES] },
            },
          ],
        },
        _sum: { total: true },
      }),
    ]);

  const revenueToday = Number(revenueTodayAgg._sum.total ?? 0);
  const revenueYesterday = Number(revenueYesterdayAgg._sum.total ?? 0);
  const revenueWeek = Number(revenueWeekAgg._sum.total ?? 0);

  const { target, source } = resolveDailyRevenueTarget({
    configuredTarget: widgetSettings.dailyRevenueTarget,
    revenueWeek,
  });

  const comparison = buildDailyPlComparison({
    revenueToday,
    revenueYesterday,
    revenueTarget: target,
    targetSource: source,
  });

  return {
    policyId: DAILY_PL_WIDGET_P2_47_POLICY_ID,
    currency: settings?.currency ?? "USD",
    comparison,
    pnlHref: "/dashboard/reports/financial/pnl",
    analyticsHref: "/dashboard/analytics",
  };
}
