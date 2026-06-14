import { ANALYTICS_CHANNEL_LABEL } from "@/lib/analytics/channel-attribution";
import type { AnalyticsFilters } from "@/lib/analytics/filters";
import { loadExecutiveOverview } from "@/services/analytics/analytics-service";
import type { Scope } from "@/services/analytics/analytics-service";

/**
 * CSV builder. We escape every cell to neutralise formula-injection
 * (`=`, `+`, `-`, `@`).
 */
function csvEscape(value: string | number | null | undefined): string {
  if (value == null) return "";
  let s = String(value);
  if (/^[=+\-@]/.test(s)) s = `'${s}`;
  if (s.includes(",") || s.includes("\"") || s.includes("\n")) {
    s = `"${s.replace(/"/g, '""')}"`;
  }
  return s;
}

function toCsv(rows: (string | number | null)[][]): string {
  return rows.map((r) => r.map(csvEscape).join(",")).join("\n");
}

export async function buildRevenueCsv(scope: Scope, filters: AnalyticsFilters): Promise<string> {
  const overview = await loadExecutiveOverview(scope, filters);
  const header = ["Metric", "Value"];
  const rows: (string | number | null)[][] = [header];
  rows.push(["Range", overview.filtersRangeLabel]);
  rows.push(["Gross revenue", overview.grossRevenue]);
  rows.push(["Net revenue", overview.netRevenue]);
  rows.push(["Cancelled revenue", overview.cancelledRevenue]);
  rows.push(["Order count", overview.orderCount]);
  rows.push(["Cancelled order count", overview.cancelledOrderCount]);
  rows.push(["Late orders", overview.lateOrderCount]);
  rows.push(["Active customers", overview.activeCustomerCount]);
  rows.push(["New customers", overview.newCustomerCount]);
  rows.push(["Catering revenue", overview.cateringRevenue]);
  rows.push(["Meal plan revenue", overview.mealPlanRevenue]);
  rows.push(["Top channel", overview.topChannel?.label ?? ""]);
  rows.push(["Top brand", overview.topBrand?.name ?? ""]);
  rows.push(["Top location", overview.topLocation?.name ?? ""]);
  rows.push([]);
  rows.push(["Daily revenue"]);
  rows.push(["Date", "Revenue"]);
  for (const point of overview.dailyRevenue) rows.push([point.date, point.value]);
  rows.push([]);
  rows.push(["Channel mix"]);
  rows.push(["Channel", "Revenue", "Orders"]);
  for (const m of overview.channelMix) rows.push([ANALYTICS_CHANNEL_LABEL[m.channel], m.revenue, m.orders]);
  return toCsv(rows);
}

export async function buildOrdersCsv(scope: Scope, filters: AnalyticsFilters): Promise<string> {
  const { prisma } = await import("@/lib/prisma");
  const { whereOrdersInWindowForOwner } = await import("@/lib/analytics/revenue-metrics");
  const orders = await prisma.order.findMany({
    where: await whereOrdersInWindowForOwner({
      userId: scope.userId,
      from: filters.from,
      to: filters.to,
      brandId: filters.brandId,
      locationId: filters.locationId,
      extra: filters.fulfillmentType ? { fulfillmentType: filters.fulfillmentType } : undefined,
    }),
    orderBy: { createdAt: "desc" },
    take: 5000,
    select: {
      id: true,
      createdAt: true,
      status: true,
      total: true,
      fulfillmentType: true,
      brandId: true,
      locationId: true,
      pickupDate: true,
      customerEmail: true,
    },
  });
  const rows: (string | number | null)[][] = [
    ["Order ID", "Created", "Status", "Fulfillment", "Brand", "Location", "Pickup", "Customer email", "Total"],
  ];
  for (const o of orders) {
    rows.push([
      o.id,
      o.createdAt.toISOString(),
      o.status,
      o.fulfillmentType,
      o.brandId ?? "",
      o.locationId ?? "",
      o.pickupDate?.toISOString().slice(0, 10) ?? "",
      maskEmail(o.customerEmail),
      Number(o.total.toString()),
    ]);
  }
  return toCsv(rows);
}

function maskEmail(email: string | null | undefined): string {
  if (!email) return "";
  const [name, domain] = email.split("@");
  if (!domain) return "***";
  const visible = name.slice(0, Math.min(2, name.length));
  return `${visible}***@${domain}`;
}
