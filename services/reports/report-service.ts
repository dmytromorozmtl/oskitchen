import { Prisma } from "@prisma/client";
import type { IntegrationProvider } from "@prisma/client";

import { ANALYTICS_CHANNEL_LABEL, channelForOrder } from "@/lib/analytics/channel-attribution";
import {
  orderContributesToRevenue,
  whereOrdersInWindowForOwner,
} from "@/lib/analytics/revenue-metrics";
import { computeRepeatRate } from "@/lib/analytics/customer-metrics";

type ChannelInputs = { importedFromExternal: { provider: IntegrationProvider } | null; storefrontOrder: { id: string } | null };
function channelOf(o: ChannelInputs) {
  return channelForOrder({
    importedFromProvider: o.importedFromExternal?.provider ?? null,
    storefrontOrderId: o.storefrontOrder?.id ?? null,
  });
}
import { prisma } from "@/lib/prisma";
import { SERVICE_AGGREGATION_TAKE } from "@/lib/scope/tenant-scope";
import { kitchenCustomerListWhereForOwner } from "@/lib/scope/workspace-customer-scope";
import { exportJobListWhereForOwner } from "@/lib/scope/workspace-import-export-scope";
import {
  cateringQuoteListWhereForOwner,
  resolveOwnerScopedWhere,
} from "@/lib/scope/workspace-resource-scope";
import { csvEscapeCell } from "@/lib/import-export/csv-format";
import {
  getReportDefinition,
  listReportDefinitions,
} from "@/lib/reports/report-registry";
import { formatRangeLabel } from "@/lib/reports/report-filters";
import { canViewReport, type ReportActorScope } from "@/lib/reports/report-permissions";
import type {
  ReportColumn,
  ReportDefinition,
  ReportFilters,
  ReportKey,
  ReportSummaryKpi,
} from "@/lib/reports/report-types";

/** Soft preview cap. Owners can still export larger CSV (bounded by `MAX_EXPORT_ROWS`). */
export const PREVIEW_ROW_LIMIT = 25;
/** Hard ceiling on rows persisted into one CSV. */
export const MAX_EXPORT_ROWS = 5000;

export type ReportContext = {
  userId: string;
  scope: ReportActorScope;
  filters: ReportFilters;
};

export type ReportResult = {
  definition: ReportDefinition;
  summary: ReportSummaryKpi[];
  columns: ReportColumn[];
  rows: Record<string, unknown>[];
  totalRows: number;
  truncated: boolean;
  rangeLabel: string;
  warnings: string[];
  /** Distinguishes "no data" from "permission denied". */
  status: "ok" | "permission_denied";
};

function maskEmail(email: string | null | undefined): string {
  if (!email) return "";
  const [local, domain] = email.split("@");
  if (!domain) return email;
  const safeLocal = local.length <= 2 ? local : `${local.slice(0, 2)}***`;
  return `${safeLocal}@${domain}`;
}

function maskPhone(phone: string | null | undefined): string {
  if (!phone) return "";
  return phone.replace(/.(?=.{2})/g, "*");
}

function fmtMoney(n: number): string {
  if (!Number.isFinite(n)) return "$0.00";
  return `$${n.toFixed(2)}`;
}

function isoDate(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toISOString().slice(0, 10);
}

function localDateTime(d: Date | null | undefined): string {
  if (!d) return "";
  return d.toISOString().replace("T", " ").slice(0, 19);
}

/* ============================================================
 * REPORT RUNNERS — one per ReportKey.
 * All numbers come from real workspace rows.
 * ============================================================ */

type Runner = (ctx: ReportContext) => Promise<Omit<ReportResult, "definition" | "rangeLabel" | "status">>;

const runners: Record<ReportKey, Runner> = {
  /* ---------- Executive ---------- */
  executive_weekly_summary: async (ctx) => buildExecutiveSummary(ctx, "weekly"),
  executive_monthly_summary: async (ctx) => buildExecutiveSummary(ctx, "monthly"),

  /* ---------- Sales ---------- */
  revenue_report: async ({ userId, filters }) => {
    const orders = await whereOrdersInWindowForOwner({
      userId,
      from: filters.from,
      to: filters.to,
      brandId: filters.brandId,
      locationId: filters.locationId,
      extra: filters.fulfillmentType ? { fulfillmentType: filters.fulfillmentType } : undefined,
    }).then((where) =>
      prisma.order.findMany({
        where,
        select: { createdAt: true, total: true, status: true },
        take: MAX_EXPORT_ROWS,
      }),
    );
    const buckets = new Map<string, { gross: number; net: number; cancelled: number; count: number }>();
    for (const o of orders) {
      const key = isoDate(o.createdAt);
      const total = Number(o.total ?? 0);
      const cancelled = o.status === "CANCELLED" ? total : 0;
      const b = buckets.get(key) ?? { gross: 0, net: 0, cancelled: 0, count: 0 };
      b.gross += total;
      b.count += 1;
      b.cancelled += cancelled;
      if (orderContributesToRevenue(o.status)) b.net += total;
      buckets.set(key, b);
    }
    const rows = Array.from(buckets.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, b]) => ({
        date,
        orderCount: b.count,
        grossRevenue: Number(b.gross.toFixed(2)),
        netRevenue: Number(b.net.toFixed(2)),
        cancelledRevenue: Number(b.cancelled.toFixed(2)),
      }));
    const gross = rows.reduce((s, r) => s + r.grossRevenue, 0);
    const net = rows.reduce((s, r) => s + r.netRevenue, 0);
    return {
      summary: [
        { label: "Net revenue", value: fmtMoney(net) },
        { label: "Gross revenue", value: fmtMoney(gross) },
        { label: "Orders", value: String(orders.length) },
      ],
      columns: getReportDefinition("revenue_report").columns,
      rows,
      totalRows: rows.length,
      truncated: orders.length >= MAX_EXPORT_ROWS,
      warnings: [],
    };
  },

  orders_report: async ({ userId, filters }) => {
    const orders = await whereOrdersInWindowForOwner({
      userId,
      from: filters.from,
      to: filters.to,
      brandId: filters.brandId,
      locationId: filters.locationId,
      extra: {
        ...(filters.fulfillmentType ? { fulfillmentType: filters.fulfillmentType } : {}),
        ...(filters.status ? { status: filters.status as Prisma.OrderWhereInput["status"] } : {}),
      },
    }).then((where) =>
      prisma.order.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: MAX_EXPORT_ROWS,
        select: {
          id: true,
          createdAt: true,
          status: true,
          fulfillmentType: true,
          customerName: true,
          customerEmail: true,
          total: true,
          importedFromExternal: { select: { provider: true } },
          storefrontOrder: { select: { id: true } },
        },
      }),
    );
    const filtered = filters.channel
      ? orders.filter((o) => channelOf(o) === filters.channel)
      : orders;
    const rows = filtered.map((o) => ({
      orderId: o.id,
      createdAt: localDateTime(o.createdAt),
      status: o.status,
      fulfillmentType: o.fulfillmentType,
      channel: ANALYTICS_CHANNEL_LABEL[channelOf(o)],
      customerName: o.customerName,
      total: Number(o.total ?? 0).toFixed(2),
    }));
    const totalRevenue = filtered.reduce(
      (s, o) => s + (orderContributesToRevenue(o.status) ? Number(o.total ?? 0) : 0),
      0,
    );
    return {
      summary: [
        { label: "Orders", value: String(filtered.length) },
        { label: "Net revenue", value: fmtMoney(totalRevenue) },
      ],
      columns: getReportDefinition("orders_report").columns,
      rows,
      totalRows: rows.length,
      truncated: orders.length >= MAX_EXPORT_ROWS,
      warnings: [],
    };
  },

  sales_by_channel: async ({ userId, filters }) => {
    const orders = await whereOrdersInWindowForOwner({
      userId,
      from: filters.from,
      to: filters.to,
      brandId: filters.brandId,
      locationId: filters.locationId,
    }).then((where) =>
      prisma.order.findMany({
        where,
        select: {
          status: true,
          total: true,
          importedFromExternal: { select: { provider: true } },
          storefrontOrder: { select: { id: true } },
        },
        take: MAX_EXPORT_ROWS,
      }),
    );
    const buckets = new Map<string, { orderCount: number; revenue: number; label: string }>();
    for (const o of orders) {
      const channel = channelOf(o);
      const label = ANALYTICS_CHANNEL_LABEL[channel];
      const b = buckets.get(channel) ?? { orderCount: 0, revenue: 0, label };
      b.orderCount += 1;
      if (orderContributesToRevenue(o.status)) b.revenue += Number(o.total ?? 0);
      buckets.set(channel, b);
    }
    const totalRevenue = Array.from(buckets.values()).reduce((s, b) => s + b.revenue, 0);
    const rows = Array.from(buckets.entries())
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .map(([, b]) => ({
        channel: b.label,
        orderCount: b.orderCount,
        revenue: Number(b.revenue.toFixed(2)),
        share: totalRevenue > 0 ? `${((b.revenue / totalRevenue) * 100).toFixed(1)}%` : "—",
      }));
    return {
      summary: [
        { label: "Channels", value: String(rows.length) },
        { label: "Net revenue", value: fmtMoney(totalRevenue) },
      ],
      columns: getReportDefinition("sales_by_channel").columns,
      rows,
      totalRows: rows.length,
      truncated: orders.length >= MAX_EXPORT_ROWS,
      warnings: [],
    };
  },

  sales_by_product: async ({ userId, filters }) => {
    const items = await whereOrdersInWindowForOwner({
      userId,
      from: filters.from,
      to: filters.to,
      brandId: filters.brandId,
      locationId: filters.locationId,
    }).then((orderWhere) =>
      prisma.orderItem.findMany({
        where: {
          order: orderWhere,
          ...(filters.productId ? { productId: filters.productId } : {}),
        },
        select: {
          quantity: true,
          orderId: true,
          product: { select: { title: true, price: true } },
        },
        take: MAX_EXPORT_ROWS,
      }),
    );
    const buckets = new Map<string, { qty: number; revenue: number; orders: Set<string> }>();
    for (const it of items) {
      const title = it.product?.title ?? "(unknown)";
      const b = buckets.get(title) ?? { qty: 0, revenue: 0, orders: new Set() };
      b.qty += it.quantity;
      b.revenue += Number(it.product?.price ?? 0) * it.quantity;
      b.orders.add(it.orderId);
      buckets.set(title, b);
    }
    const rows = Array.from(buckets.entries())
      .sort(([, a], [, b]) => b.revenue - a.revenue)
      .map(([title, b]) => ({
        productTitle: title,
        quantity: b.qty,
        revenue: Number(b.revenue.toFixed(2)),
        orderCount: b.orders.size,
      }));
    return {
      summary: [
        { label: "Products", value: String(rows.length) },
        { label: "Units sold", value: String(rows.reduce((s, r) => s + r.quantity, 0)) },
      ],
      columns: getReportDefinition("sales_by_product").columns,
      rows,
      totalRows: rows.length,
      truncated: items.length >= MAX_EXPORT_ROWS,
      warnings: [],
    };
  },

  /* ---------- Production ---------- */
  weekly_production: async ({ userId, filters }) => {
    const batches = await prisma.productionBatch.findMany({
      where: {
        userId,
        productionDate: { gte: filters.from, lte: filters.to },
        ...(filters.brandId ? { brandId: filters.brandId } : {}),
        ...(filters.locationId ? { locationId: filters.locationId } : {}),
      },
      orderBy: { productionDate: "asc" },
      take: MAX_EXPORT_ROWS,
      select: {
        title: true,
        status: true,
        productionDate: true,
        totalItems: true,
        completedItems: true,
      },
    });
    const completed = batches.filter((b) => b.status === "COMPLETED").length;
    const completionRate =
      batches.length > 0 ? `${((completed / batches.length) * 100).toFixed(1)}%` : "—";
    return {
      summary: [
        { label: "Batches", value: String(batches.length) },
        { label: "Completed", value: String(completed) },
        { label: "Completion rate", value: completionRate },
      ],
      columns: getReportDefinition("weekly_production").columns,
      rows: batches.map((b) => ({
        title: b.title,
        status: b.status,
        scheduledFor: isoDate(b.productionDate),
        targetQuantity: b.totalItems,
        completedQuantity: b.completedItems,
      })),
      totalRows: batches.length,
      truncated: batches.length >= MAX_EXPORT_ROWS,
      warnings: [],
    };
  },

  /* ---------- Inventory / Purchasing ---------- */
  ingredient_demand: async ({ userId, filters }) => {
    const lines = await prisma.ingredientDemandRunLine.findMany({
      where: {
        demandRun: {
          userId,
          ...(filters.locationId ? { filterLocationId: filters.locationId } : {}),
        },
        demandDate: { gte: filters.from, lte: filters.to },
      },
      orderBy: { demandDate: "asc" },
      take: MAX_EXPORT_ROWS,
      select: {
        requiredQuantity: true,
        availableQuantity: true,
        shortageQuantity: true,
        unit: true,
        ingredient: { select: { name: true } },
      },
    });
    return {
      summary: [
        { label: "Demand lines", value: String(lines.length) },
        {
          label: "Lines with shortage",
          value: String(lines.filter((l) => Number(l.shortageQuantity ?? 0) > 0).length),
        },
      ],
      columns: getReportDefinition("ingredient_demand").columns,
      rows: lines.map((l) => ({
        ingredientName: l.ingredient?.name ?? "(unknown)",
        requiredQuantity: Number(l.requiredQuantity ?? 0).toFixed(4),
        onHandQuantity: Number(l.availableQuantity ?? 0).toFixed(4),
        shortageQuantity: Number(l.shortageQuantity ?? 0).toFixed(4),
        unit: l.unit,
      })),
      totalRows: lines.length,
      truncated: lines.length >= MAX_EXPORT_ROWS,
      warnings: [],
    };
  },

  inventory_shortage_report: async ({ userId, filters }) => {
    const lines = await prisma.ingredientDemandRunLine.findMany({
      where: {
        demandRun: {
          userId,
          ...(filters.locationId ? { filterLocationId: filters.locationId } : {}),
        },
        demandDate: { gte: filters.from, lte: filters.to },
        status: "OPEN",
        shortageQuantity: { gt: 0 },
      },
      orderBy: { shortageQuantity: "desc" },
      take: MAX_EXPORT_ROWS,
      select: {
        shortageQuantity: true,
        unit: true,
        ingredient: { select: { name: true } },
        demandRun: { select: { status: true } },
      },
    });
    return {
      summary: [
        { label: "Shortage lines", value: String(lines.length) },
        {
          label: "Total shortage units",
          value: lines.reduce((s, l) => s + Number(l.shortageQuantity ?? 0), 0).toFixed(2),
        },
      ],
      columns: getReportDefinition("inventory_shortage_report").columns,
      rows: lines.map((l) => ({
        ingredientName: l.ingredient?.name ?? "(unknown)",
        shortageQuantity: Number(l.shortageQuantity ?? 0).toFixed(4),
        unit: l.unit,
        runStatus: l.demandRun?.status ?? "—",
      })),
      totalRows: lines.length,
      truncated: lines.length >= MAX_EXPORT_ROWS,
      warnings: [],
    };
  },

  purchasing_report: async ({ userId, filters }) => {
    const pos = await prisma.purchaseOrder.findMany({
      where: {
        userId,
        createdAt: { gte: filters.from, lte: filters.to },
        ...(filters.locationId ? { locationId: filters.locationId } : {}),
      },
      orderBy: { createdAt: "desc" },
      take: MAX_EXPORT_ROWS,
      select: {
        createdAt: true,
        status: true,
        total: true,
        supplier: { select: { name: true } },
      },
    });
    const totalSpend = pos.reduce((s, p) => s + Number(p.total ?? 0), 0);
    return {
      summary: [
        { label: "Purchase orders", value: String(pos.length) },
        { label: "Total spend", value: fmtMoney(totalSpend) },
      ],
      columns: getReportDefinition("purchasing_report").columns,
      rows: pos.map((p) => ({
        createdAt: isoDate(p.createdAt),
        supplierName: p.supplier?.name ?? "(unknown)",
        status: p.status,
        totalAmount: Number(p.total ?? 0).toFixed(2),
      })),
      totalRows: pos.length,
      truncated: pos.length >= MAX_EXPORT_ROWS,
      warnings: [],
    };
  },

  /* ---------- Packing / Delivery ---------- */
  packing_accuracy: async ({ userId, filters }) => {
    const batches = await prisma.packingBatch.findMany({
      where: {
        userId,
        packingDate: { gte: filters.from, lte: filters.to },
        ...(filters.locationId ? { locationId: filters.locationId } : {}),
      },
      orderBy: { packingDate: "asc" },
      take: MAX_EXPORT_ROWS,
      select: {
        title: true,
        status: true,
        packingDate: true,
        totalItems: true,
        packedItems: true,
      },
    });
    const packed = batches.reduce((s, b) => s + b.packedItems, 0);
    const total = batches.reduce((s, b) => s + b.totalItems, 0);
    const rate = total > 0 ? `${((packed / total) * 100).toFixed(1)}%` : "—";
    return {
      summary: [
        { label: "Packing batches", value: String(batches.length) },
        { label: "Packed / total items", value: `${packed} / ${total}` },
        { label: "Pack-through rate", value: rate },
      ],
      columns: getReportDefinition("packing_accuracy").columns,
      rows: batches.map((b) => ({
        title: b.title,
        status: b.status,
        scheduledFor: isoDate(b.packingDate),
        itemCount: b.totalItems,
        exceptionCount: Math.max(0, b.totalItems - b.packedItems),
      })),
      totalRows: batches.length,
      truncated: batches.length >= MAX_EXPORT_ROWS,
      warnings: [],
    };
  },

  delivery_report: async ({ scope, userId, filters }) => {
    const stops = await prisma.deliveryStop.findMany({
      where: {
        route: {
          userId,
          ...(filters.locationId ? { locationId: filters.locationId } : {}),
          ...(filters.routeId ? { id: filters.routeId } : {}),
        },
        createdAt: { gte: filters.from, lte: filters.to },
      },
      orderBy: { createdAt: "desc" },
      take: MAX_EXPORT_ROWS,
      select: {
        customerName: true,
        addressJson: true,
        status: true,
        deliveredAt: true,
        deliveryWindowStart: true,
      },
    });
    const pii = scope.isOwner || (scope.role ?? "").toLowerCase() === "admin" ||
      (scope.role ?? "").toLowerCase() === "manager";
    return {
      summary: [
        { label: "Stops", value: String(stops.length) },
        { label: "Delivered", value: String(stops.filter((s) => s.status === "DELIVERED").length) },
        { label: "Failed", value: String(stops.filter((s) => s.status === "FAILED").length) },
      ],
      columns: getReportDefinition("delivery_report").columns,
      rows: stops.map((s) => {
        const address = (() => {
          try {
            const j = s.addressJson as Record<string, unknown> | null;
            if (!j) return "";
            const parts = [j["street"], j["city"], j["postalCode"]].filter(Boolean);
            return parts.join(", ");
          } catch {
            return "";
          }
        })();
        return {
          scheduledFor: localDateTime(s.deliveryWindowStart),
          status: s.status,
          customerName: pii ? s.customerName : maskEmail(s.customerName),
          address: pii ? address : address.replace(/.(?=.{4})/g, "*"),
          completedAt: localDateTime(s.deliveredAt),
        };
      }),
      totalRows: stops.length,
      truncated: stops.length >= MAX_EXPORT_ROWS,
      warnings: [],
    };
  },

  margin_report: async ({ userId, filters }) => {
    const lines = await prisma.profitabilityLine.findMany({
      where: {
        run: { userId, createdAt: { gte: filters.from, lte: filters.to } },
      },
      orderBy: { foodCostPercent: "desc" },
      take: MAX_EXPORT_ROWS,
      select: {
        itemTitle: true,
        salePrice: true,
        totalCost: true,
        foodCostPercent: true,
        grossMarginPercent: true,
      },
    });
    return {
      summary: [
        { label: "Items costed", value: String(lines.length) },
        {
          label: "Highest food cost %",
          value: lines[0] ? `${Number(lines[0].foodCostPercent ?? 0).toFixed(1)}%` : "—",
        },
      ],
      columns: getReportDefinition("margin_report").columns,
      rows: lines.map((l) => ({
        recipeName: l.itemTitle,
        foodCost: Number(l.totalCost ?? 0).toFixed(2),
        sellingPrice: Number(l.salePrice ?? 0).toFixed(2),
        foodCostPct: `${Number(l.foodCostPercent ?? 0).toFixed(1)}%`,
        marginPct: `${Number(l.grossMarginPercent ?? 0).toFixed(1)}%`,
      })),
      totalRows: lines.length,
      truncated: lines.length >= MAX_EXPORT_ROWS,
      warnings: [],
    };
  },

  /* ---------- Customers ---------- */
  customer_report: async ({ scope, userId, filters }) => {
    const customers = await kitchenCustomerListWhereForOwner(userId).then((customerScope) => {
      const and: Prisma.KitchenCustomerWhereInput[] = [customerScope];
      if (filters.from) {
        and.push({
          OR: [{ lastOrderAt: { gte: filters.from } }, { firstOrderAt: { gte: filters.from } }],
        });
      }
      return prisma.kitchenCustomer.findMany({
        where: { AND: and },
        orderBy: { lifetimeValueCents: "desc" },
        take: MAX_EXPORT_ROWS,
        select: {
          name: true,
          email: true,
          phone: true,
          totalOrders: true,
          lifetimeValueCents: true,
          lastOrderAt: true,
        },
      });
    });
    const pii =
      scope.isOwner ||
      ["admin", "manager"].includes((scope.role ?? "").toLowerCase());
    return {
      summary: [
        { label: "Customers", value: String(customers.length) },
        {
          label: "Lifetime value",
          value: fmtMoney(customers.reduce((s, c) => s + c.lifetimeValueCents, 0) / 100),
        },
      ],
      columns: getReportDefinition("customer_report").columns,
      rows: customers.map((c) => ({
        name: pii ? c.name ?? "" : (c.name ?? "").split(" ").map((p, i) => (i === 0 ? p : `${p[0] ?? ""}.`)).join(" "),
        email: pii ? c.email : maskEmail(c.email),
        phone: pii ? c.phone ?? "" : maskPhone(c.phone),
        orderCount: c.totalOrders,
        lifetimeValue: (c.lifetimeValueCents / 100).toFixed(2),
        lastOrderAt: isoDate(c.lastOrderAt),
      })),
      totalRows: customers.length,
      truncated: customers.length >= MAX_EXPORT_ROWS,
      warnings: pii ? [] : ["Customer PII is masked because the viewer lacks reports.read.customer_pii."],
    };
  },

  customer_retention: async ({ userId, filters }) => {
    const orders = await whereOrdersInWindowForOwner({ userId, from: filters.from, to: filters.to }).then(
      (where) =>
        prisma.order.findMany({
          where,
          select: { customerEmail: true, createdAt: true },
          take: MAX_EXPORT_ROWS,
        }),
    );
    const repeat = computeRepeatRate(
      orders.map((o) => ({ email: o.customerEmail ?? "", orderId: "" })),
    );
    return {
      summary: [
        { label: "Distinct customers", value: String(repeat.uniqueCustomers) },
        {
          label: "Repeat rate",
          value: repeat.repeatRate == null ? "—" : `${(repeat.repeatRate * 100).toFixed(1)}%`,
        },
      ],
      columns: getReportDefinition("customer_retention").columns,
      rows: [
        { metric: "Orders", value: orders.length, context: formatRangeLabel(filters) },
        { metric: "Distinct customers", value: repeat.uniqueCustomers, context: "Unique email" },
        {
          metric: "Repeat customers",
          value: repeat.repeatCustomers,
          context: "Customers with ≥ 2 orders in window",
        },
        {
          metric: "Repeat rate",
          value: repeat.repeatRate == null ? "—" : `${(repeat.repeatRate * 100).toFixed(1)}%`,
          context: "Repeaters ÷ distinct customers",
        },
      ],
      totalRows: 4,
      truncated: false,
      warnings: [],
    };
  },

  /* ---------- Catering / Meal Plans ---------- */
  catering_pipeline: async ({ userId, filters }) => {
    const quotes = await prisma.cateringQuote.findMany({
      where: {
        userId,
        createdAt: { gte: filters.from, lte: filters.to },
        ...(filters.status ? { status: filters.status as Prisma.CateringQuoteWhereInput["status"] } : {}),
        ...(filters.eventType
          ? { eventType: filters.eventType as Prisma.CateringQuoteWhereInput["eventType"] }
          : {}),
      },
      orderBy: { eventDate: "asc" },
      take: MAX_EXPORT_ROWS,
      select: {
        eventName: true,
        customerName: true,
        eventDate: true,
        guestCount: true,
        total: true,
        status: true,
      },
    });
    const accepted = quotes.filter((q) => q.status === "ACCEPTED");
    return {
      summary: [
        { label: "Open quotes", value: String(quotes.length) },
        { label: "Accepted", value: String(accepted.length) },
        {
          label: "Accepted revenue",
          value: fmtMoney(accepted.reduce((s, q) => s + Number(q.total ?? 0), 0)),
        },
      ],
      columns: getReportDefinition("catering_pipeline").columns,
      rows: quotes.map((q) => ({
        title: q.eventName ?? q.customerName,
        status: q.status,
        eventDate: isoDate(q.eventDate),
        headcount: q.guestCount ?? 0,
        totalAmount: Number(q.total ?? 0).toFixed(2),
      })),
      totalRows: quotes.length,
      truncated: quotes.length >= MAX_EXPORT_ROWS,
      warnings: [],
    };
  },

  meal_plan_subscriptions: async ({ scope, userId, filters }) => {
    const plans = await prisma.mealPlan.findMany({
      where: {
        userId,
        startDate: { gte: filters.from, lte: filters.to },
        ...(filters.status ? { status: filters.status as Prisma.MealPlanWhereInput["status"] } : {}),
      },
      orderBy: { startDate: "asc" },
      take: MAX_EXPORT_ROWS,
      select: {
        name: true,
        status: true,
        nextOrderDate: true,
        pricePerCycle: true,
        customer: { select: { name: true, email: true } },
      },
    });
    const pii =
      scope.isOwner ||
      ["admin", "manager"].includes((scope.role ?? "").toLowerCase());
    return {
      summary: [
        { label: "Plans", value: String(plans.length) },
        {
          label: "Active",
          value: String(plans.filter((p) => p.status === "ACTIVE").length),
        },
      ],
      columns: getReportDefinition("meal_plan_subscriptions").columns,
      rows: plans.map((p) => ({
        customerName: pii ? p.customer?.name ?? "" : maskEmail(p.customer?.email ?? ""),
        planName: p.name,
        status: p.status,
        nextCycleStart: isoDate(p.nextOrderDate),
        weeklyPrice: Number(p.pricePerCycle ?? 0).toFixed(2),
      })),
      totalRows: plans.length,
      truncated: plans.length >= MAX_EXPORT_ROWS,
      warnings: [],
    };
  },

  /* ---------- Staff / Audit ---------- */
  staff_task_completion: async ({ userId, filters }) => {
    const tasks = await prisma.kitchenTask.findMany({
      where: {
        userId,
        createdAt: { gte: filters.from, lte: filters.to },
        ...(filters.staffMemberId ? { assignedToId: filters.staffMemberId } : {}),
      },
      take: MAX_EXPORT_ROWS,
      select: {
        status: true,
        dueAt: true,
        assignedTo: { select: { id: true, name: true } },
      },
    });
    const map = new Map<string, { name: string; completed: number; open: number; overdue: number }>();
    const now = new Date();
    for (const t of tasks) {
      const id = t.assignedTo?.id ?? "(unassigned)";
      const name = t.assignedTo?.name ?? "(Unassigned)";
      const b = map.get(id) ?? { name, completed: 0, open: 0, overdue: 0 };
      if (t.status === "DONE") b.completed += 1;
      else b.open += 1;
      if (t.status !== "DONE" && t.dueAt && t.dueAt < now) b.overdue += 1;
      map.set(id, b);
    }
    const rows = Array.from(map.values())
      .sort((a, b) => b.completed - a.completed)
      .map((b) => ({
        staffName: b.name,
        completedCount: b.completed,
        openCount: b.open,
        overdueCount: b.overdue,
      }));
    return {
      summary: [
        { label: "Staff members", value: String(rows.length) },
        { label: "Total tasks", value: String(tasks.length) },
        {
          label: "Completion rate",
          value:
            tasks.length > 0
              ? `${((tasks.filter((t) => t.status === "DONE").length / tasks.length) * 100).toFixed(1)}%`
              : "—",
        },
      ],
      columns: getReportDefinition("staff_task_completion").columns,
      rows,
      totalRows: rows.length,
      truncated: tasks.length >= MAX_EXPORT_ROWS,
      warnings: [],
    };
  },

  audit_log_report: async ({ userId, filters }) => {
    const jobs = await exportJobListWhereForOwner(userId).then((exportScope) =>
      prisma.exportJob.findMany({
        where: {
          AND: [exportScope, { createdAt: { gte: filters.from, lte: filters.to } }],
        },
        orderBy: { createdAt: "desc" },
        take: MAX_EXPORT_ROWS,
        select: {
          createdAt: true,
          type: true,
          rowCount: true,
          fileName: true,
          createdBy: { select: { email: true, fullName: true } },
        },
      }),
    );
    return {
      summary: [
        { label: "Exports", value: String(jobs.length) },
        {
          label: "Rows exported",
          value: String(jobs.reduce((s, j) => s + j.rowCount, 0)),
        },
      ],
      columns: getReportDefinition("audit_log_report").columns,
      rows: jobs.map((j) => ({
        createdAt: localDateTime(j.createdAt),
        type: j.type,
        actor: j.createdBy?.email ?? j.createdBy?.fullName ?? "—",
        rowCount: j.rowCount,
        fileName: j.fileName,
      })),
      totalRows: jobs.length,
      truncated: jobs.length >= MAX_EXPORT_ROWS,
      warnings: [],
    };
  },
};

/* ============================================================
 * Executive summary builder (shared by weekly / monthly).
 * ============================================================ */
async function buildExecutiveSummary(
  ctx: ReportContext,
  cadence: "weekly" | "monthly",
): Promise<Omit<ReportResult, "definition" | "rangeLabel" | "status">> {
  const { userId, filters } = ctx;

  const [orders, productionBatches, packingBatches, deliveryStops, cateringQuotes] =
    await Promise.all([
      whereOrdersInWindowForOwner({
        userId,
        from: filters.from,
        to: filters.to,
        brandId: filters.brandId,
        locationId: filters.locationId,
      }).then((where) =>
        prisma.order.findMany({
          where,
          take: SERVICE_AGGREGATION_TAKE,
          select: {
            id: true,
            status: true,
            total: true,
            customerEmail: true,
            createdAt: true,
            brandId: true,
            locationId: true,
            fulfillmentType: true,
            importedFromExternal: { select: { provider: true } },
            storefrontOrder: { select: { id: true } },
            orderItems: { select: { quantity: true, product: { select: { title: true } } } },
          },
        }),
      ),
      prisma.productionBatch.findMany({
        where: {
          userId,
          productionDate: { gte: filters.from, lte: filters.to },
        },
        take: SERVICE_AGGREGATION_TAKE,
        select: { status: true, totalItems: true, completedItems: true },
      }),
      prisma.packingBatch.findMany({
        where: {
          userId,
          packingDate: { gte: filters.from, lte: filters.to },
        },
        take: SERVICE_AGGREGATION_TAKE,
        select: { totalItems: true, packedItems: true },
      }),
      prisma.deliveryStop.findMany({
        where: { route: { userId }, createdAt: { gte: filters.from, lte: filters.to } },
        take: SERVICE_AGGREGATION_TAKE,
        select: { status: true },
      }),
      cateringQuoteListWhereForOwner(userId).then((cateringQuoteWhere) =>
        prisma.cateringQuote.findMany({
          where: {
            AND: [cateringQuoteWhere, { createdAt: { gte: filters.from, lte: filters.to } }],
          },
          take: SERVICE_AGGREGATION_TAKE,
          select: { status: true, total: true },
        }),
      ),
    ]);

  let netRevenue = 0;
  for (const o of orders) {
    if (orderContributesToRevenue(o.status)) netRevenue += Number(o.total ?? 0);
  }
  netRevenue = Math.round(netRevenue * 100) / 100;
  const cancelled = orders.filter((o) => o.status === "CANCELLED").length;
  const aov = orders.length > 0 ? netRevenue / orders.length : 0;
  const repeat = computeRepeatRate(
    orders.map((o) => ({ email: o.customerEmail ?? "", orderId: o.id })),
  );
  const repeatRate = repeat.repeatRate;

  const channelMap = new Map<string, number>();
  for (const o of orders) {
    if (!orderContributesToRevenue(o.status)) continue;
    const ch = ANALYTICS_CHANNEL_LABEL[channelOf(o)];
    channelMap.set(ch, (channelMap.get(ch) ?? 0) + Number(o.total ?? 0));
  }
  const topChannel = Array.from(channelMap.entries()).sort(([, a], [, b]) => b - a)[0] ?? null;

  const productMap = new Map<string, number>();
  for (const o of orders) {
    for (const it of o.orderItems) {
      const t = it.product?.title ?? "(unknown)";
      productMap.set(t, (productMap.get(t) ?? 0) + it.quantity);
    }
  }
  const topProducts = Array.from(productMap.entries())
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  const prodTotal = productionBatches.reduce((s, b) => s + b.totalItems, 0);
  const prodCompleted = productionBatches.reduce((s, b) => s + b.completedItems, 0);
  const productionCompletion = prodTotal > 0 ? prodCompleted / prodTotal : null;

  const packTotal = packingBatches.reduce((s, b) => s + b.totalItems, 0);
  const packed = packingBatches.reduce((s, b) => s + b.packedItems, 0);
  const packingRate = packTotal > 0 ? packed / packTotal : null;

  const delivered = deliveryStops.filter((s) => s.status === "DELIVERED").length;
  const deliveryRate = deliveryStops.length > 0 ? delivered / deliveryStops.length : null;

  const acceptedCatering = cateringQuotes.filter((q) => q.status === "ACCEPTED");
  const cateringRevenue = acceptedCatering.reduce((s, q) => s + Number(q.total ?? 0), 0);

  const rows = [
    { metric: "Window", value: formatRangeLabel(filters), context: cadence === "weekly" ? "Weekly digest" : "Monthly digest" },
    { metric: "Net revenue", value: fmtMoney(netRevenue), context: "Excludes cancelled orders" },
    { metric: "Orders", value: orders.length, context: `${cancelled} cancelled` },
    { metric: "AOV", value: fmtMoney(aov), context: "Net revenue ÷ orders" },
    {
      metric: "Repeat rate",
      value: repeatRate == null ? "—" : `${(repeatRate * 100).toFixed(1)}%`,
      context: "Customers with ≥ 2 orders in window",
    },
    {
      metric: "Top channel",
      value: topChannel ? `${topChannel[0]} (${fmtMoney(topChannel[1])})` : "—",
      context: "By net revenue",
    },
    {
      metric: "Production completion",
      value: productionCompletion == null ? "—" : `${(productionCompletion * 100).toFixed(1)}%`,
      context: `${prodCompleted}/${prodTotal} items`,
    },
    {
      metric: "Packing accuracy (pack-through)",
      value: packingRate == null ? "—" : `${(packingRate * 100).toFixed(1)}%`,
      context: `${packed}/${packTotal} items`,
    },
    {
      metric: "Delivery on-time",
      value: deliveryRate == null ? "—" : `${(deliveryRate * 100).toFixed(1)}%`,
      context: `${delivered}/${deliveryStops.length} stops delivered`,
    },
    {
      metric: "Catering accepted",
      value: `${acceptedCatering.length} (${fmtMoney(cateringRevenue)})`,
      context: "Catering quotes accepted in window",
    },
    {
      metric: "Top products",
      value: topProducts.map(([t, q]) => `${t} ×${q}`).join(", ") || "—",
      context: "By units sold",
    },
    {
      metric: "Next recommendations",
      value: deriveRecommendations({
        productionCompletion,
        packingRate,
        deliveryRate,
        repeatRate,
        netRevenue,
        cancelled,
        orders: orders.length,
      }),
      context: "Heuristic — review with operator",
    },
  ];

  return {
    summary: [
      { label: "Net revenue", value: fmtMoney(netRevenue) },
      { label: "Orders", value: String(orders.length) },
      {
        label: "Repeat rate",
        value: repeatRate == null ? "—" : `${(repeatRate * 100).toFixed(1)}%`,
      },
    ],
    columns: [
      { key: "metric", label: "Metric" },
      { key: "value", label: "Value" },
      { key: "context", label: "Context" },
    ],
    rows,
    totalRows: rows.length,
    truncated: false,
    warnings: [],
  };
}

function deriveRecommendations(args: {
  productionCompletion: number | null;
  packingRate: number | null;
  deliveryRate: number | null;
  repeatRate: number | null;
  netRevenue: number;
  cancelled: number;
  orders: number;
}): string {
  const recs: string[] = [];
  if (args.cancelled > 0 && args.orders > 0 && args.cancelled / args.orders > 0.1) {
    recs.push("Investigate cancellation drivers");
  }
  if (args.productionCompletion != null && args.productionCompletion < 0.9) {
    recs.push("Review production completion gaps");
  }
  if (args.packingRate != null && args.packingRate < 0.95) {
    recs.push("Audit packing exceptions");
  }
  if (args.deliveryRate != null && args.deliveryRate < 0.9) {
    recs.push("Improve delivery on-time rate");
  }
  if (args.repeatRate != null && args.repeatRate < 0.2) {
    recs.push("Run retention campaign for one-time customers");
  }
  return recs.length === 0 ? "All key metrics healthy — keep current cadence." : recs.join(" · ");
}

/* ============================================================
 * Public API: runReport + buildCsv + listing + saved + history.
 * ============================================================ */

export async function runReport(key: ReportKey, ctx: ReportContext): Promise<ReportResult> {
  const definition = getReportDefinition(key);
  const rangeLabel = formatRangeLabel(ctx.filters);
  if (!canViewReport(ctx.scope, definition)) {
    return {
      definition,
      rangeLabel,
      summary: [],
      columns: definition.columns,
      rows: [],
      totalRows: 0,
      truncated: false,
      warnings: ["You do not have permission to view this report."],
      status: "permission_denied",
    };
  }
  const result = await runners[key](ctx);
  return { definition, rangeLabel, ...result, status: "ok" };
}

export function buildReportCsv(result: ReportResult): { body: string; filename: string; rowCount: number } {
  const headers = result.columns.map((c) => c.label);
  const lines = [headers.map(csvEscapeCell).join(",")];
  for (const row of result.rows) {
    lines.push(
      result.columns
        .map((c) => csvEscapeCell((row as Record<string, unknown>)[c.key] as string | number | null | undefined))
        .join(","),
    );
  }
  const stamp = new Date().toISOString().slice(0, 10);
  const safeKey = result.definition.key.replace(/[^a-z0-9_]/gi, "_");
  return {
    body: lines.join("\n"),
    filename: `${safeKey}_${stamp}.csv`,
    rowCount: result.rows.length,
  };
}

export async function recordReportExport(args: {
  userId: string;
  reportKey: ReportKey;
  filename: string;
  rowCount: number;
  filtersJson: Prisma.InputJsonValue;
}): Promise<void> {
  await prisma.exportJob.create({
    data: {
      userId: args.userId,
      type: `report:${args.reportKey}`,
      status: "COMPLETED",
      filtersJson: args.filtersJson,
      rowCount: args.rowCount,
      fileName: args.filename,
      createdById: args.userId,
      completedAt: new Date(),
    },
  });
}

export async function listReportExportHistory(userId: string, limit = 50): Promise<
  Array<{
    id: string;
    type: string;
    rowCount: number;
    fileName: string;
    createdAt: Date;
    actorEmail: string | null;
    filtersJson: unknown;
  }>
> {
  const exportScope = await exportJobListWhereForOwner(userId);
  const rows = await prisma.exportJob.findMany({
    where: exportScope,
    orderBy: { createdAt: "desc" },
    take: limit,
    select: {
      id: true,
      type: true,
      rowCount: true,
      fileName: true,
      createdAt: true,
      filtersJson: true,
      createdBy: { select: { email: true } },
    },
  });
  return rows.map((r) => ({
    id: r.id,
    type: r.type,
    rowCount: r.rowCount,
    fileName: r.fileName,
    createdAt: r.createdAt,
    actorEmail: r.createdBy?.email ?? null,
    filtersJson: r.filtersJson,
  }));
}

export async function listSavedReports(userId: string, take = 100) {
  return resolveOwnerScopedWhere(userId).then((reportScope) =>
    prisma.savedReport.findMany({
      where: reportScope,
      orderBy: [{ pinned: "desc" }, { updatedAt: "desc" }],
      take,
    }),
  );
}

export function previewSlice<T>(rows: T[], limit = PREVIEW_ROW_LIMIT): T[] {
  return rows.slice(0, limit);
}

export function getReportRegistryForScope(scope: ReportActorScope): ReportDefinition[] {
  return listReportDefinitions().filter((d) => canViewReport(scope, d));
}
