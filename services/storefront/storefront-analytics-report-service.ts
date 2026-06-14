import { eachDayOfInterval, format, subDays } from "date-fns";

import { prisma } from "@/lib/prisma";

export type StorefrontAnalyticsRangeDays = 7 | 30 | 90;

export async function getStorefrontAnalyticsReport(storefrontId: string, days: StorefrontAnalyticsRangeDays) {
  const until = new Date();
  const since = subDays(until, days);

  const visits = await prisma.storefrontVisit.count({
    where: { storefrontId, createdAt: { gte: since, lte: until } },
  });

  const conv = await prisma.storefrontConversionEvent.findMany({
    where: { storefrontId, createdAt: { gte: since, lte: until } },
    select: { eventName: true, metadataJson: true, createdAt: true },
    take: 12000,
  });

  const conversionCounts: Record<string, number> = {};
  for (const c of conv) {
    conversionCounts[c.eventName] = (conversionCounts[c.eventName] ?? 0) + 1;
  }

  const ordersCount = await prisma.storefrontOrder.count({
    where: { storefrontId, isTestOrder: false, createdAt: { gte: since, lte: until } },
  });

  const revenueAgg = await prisma.storefrontOrder.aggregate({
    where: { storefrontId, isTestOrder: false, createdAt: { gte: since, lte: until } },
    _sum: { total: true },
  });
  const revenue = Number(revenueAgg._sum.total ?? 0);

  const visitRows = await prisma.storefrontVisit.findMany({
    where: { storefrontId, createdAt: { gte: since, lte: until } },
    select: { createdAt: true },
    take: 25000,
  });

  const dayKeys = eachDayOfInterval({ start: since, end: until }).map((d) => format(d, "yyyy-MM-dd"));
  const visitsByDay: Record<string, number> = Object.fromEntries(dayKeys.map((d) => [d, 0]));
  const eventsByDay: Record<string, number> = Object.fromEntries(dayKeys.map((d) => [d, 0]));
  const ordersByDay: Record<string, number> = Object.fromEntries(dayKeys.map((d) => [d, 0]));

  for (const v of visitRows) {
    const k = format(v.createdAt, "yyyy-MM-dd");
    visitsByDay[k] = (visitsByDay[k] ?? 0) + 1;
  }
  for (const c of conv) {
    const k = format(c.createdAt, "yyyy-MM-dd");
    eventsByDay[k] = (eventsByDay[k] ?? 0) + 1;
  }
  const orderRows = await prisma.storefrontOrder.findMany({
    where: { storefrontId, isTestOrder: false, createdAt: { gte: since, lte: until } },
    select: { createdAt: true },
  });
  for (const o of orderRows) {
    const k = format(o.createdAt, "yyyy-MM-dd");
    ordersByDay[k] = (ordersByDay[k] ?? 0) + 1;
  }

  const timeSeries = dayKeys.map((day) => ({
    day,
    visits: visitsByDay[day] ?? 0,
    events: eventsByDay[day] ?? 0,
    orders: ordersByDay[day] ?? 0,
  }));

  const productCounts: Record<string, number> = {};
  for (const c of conv) {
    if (c.eventName !== "view_item" && c.eventName !== "add_to_cart") continue;
    const meta = c.metadataJson as { productId?: string } | null;
    const pid = meta?.productId;
    if (pid && typeof pid === "string") {
      productCounts[pid] = (productCounts[pid] ?? 0) + 1;
    }
  }
  const topProductIds = Object.entries(productCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([productId, count]) => ({ productId, count }));

  const titles =
    topProductIds.length > 0
      ? await prisma.product.findMany({
          where: { id: { in: topProductIds.map((p) => p.productId) } },
          select: { id: true, title: true },
        })
      : [];
  const titleById = Object.fromEntries(titles.map((t) => [t.id, t.title]));

  const pick = (n: string) => conversionCounts[n] ?? 0;
  const orderStatusViews = pick("order_status_view");
  const viewMenu = pick("view_menu");
  const funnel = [
    { step: "Visits", count: visits },
    { step: "Menu views", count: viewMenu || pick("view_item") },
    { step: "Add to cart", count: pick("add_to_cart") },
    { step: "Cart views", count: pick("cart_view") },
    { step: "Begin checkout", count: pick("begin_checkout") || pick("checkout_start") },
    { step: "Checkout start", count: pick("checkout_start") },
    { step: "Checkout submit", count: pick("checkout_submit") },
    ...(orderStatusViews > 0 ? [{ step: "Order status views", count: orderStatusViews }] : []),
    { step: "Orders (paid/submitted)", count: ordersCount },
  ];

  const refRows = await prisma.storefrontVisit.findMany({
    where: { storefrontId, createdAt: { gte: since, lte: until }, referrer: { not: null } },
    select: { referrer: true },
    take: 8000,
  });
  const refCounts: Record<string, number> = {};
  for (const r of refRows) {
    const ref = (r.referrer ?? "").slice(0, 200) || "(direct)";
    refCounts[ref] = (refCounts[ref] ?? 0) + 1;
  }
  const referrers = Object.entries(refCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([ref, count]) => ({ ref, count }));

  const conversionRate = visits > 0 ? ordersCount / visits : 0;

  return {
    since,
    until,
    days,
    visits,
    conversionCounts,
    ordersCount,
    revenue,
    timeSeries,
    topProducts: topProductIds.map((p) => ({ ...p, title: titleById[p.productId] ?? p.productId })),
    funnel,
    referrers,
    conversionRate,
  };
}
