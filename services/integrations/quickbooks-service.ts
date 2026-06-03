import { prisma } from "@/lib/prisma";
import {
  quickBooksInvoicesToCsv,
  pnlLinesToQuickBooksIif,
  salesSummaryToCsv,
  salesSummaryToQuickBooksIif,
  type QuickBooksSalesSummary,
} from "@/lib/accounting/quickbooks-export-format";
import { supplierInvoiceListWhereForOwner } from "@/lib/scope/workspace-accounting-scope";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-resource-scope";
import {
  getRestaurantPnLStatement,
  pnlToCsv,
  type PnlPeriod,
} from "@/services/accounting/restaurant-pnl-service";
import { REVENUE_STATUSES } from "@/lib/analytics/revenue-metrics";

export type QuickBooksExportPeriod = "month" | "quarter";

export type QuickBooksExportPayload = {
  period: QuickBooksExportPeriod;
  periodStart: Date;
  periodEnd: Date;
  lines: Awaited<ReturnType<typeof getRestaurantPnLStatement>>["lines"];
  invoices: Awaited<ReturnType<typeof prisma.supplierInvoice.findMany>>;
  sales: QuickBooksSalesSummary;
};

function exportPeriodRange(period: QuickBooksExportPeriod): { start: Date; end: Date; pnlPeriod: PnlPeriod } {
  const now = new Date();
  const end = now;
  if (period === "quarter") {
    const q = Math.floor(now.getMonth() / 3);
    return { start: new Date(now.getFullYear(), q * 3, 1), end, pnlPeriod: "quarter" };
  }
  return { start: new Date(now.getFullYear(), now.getMonth(), 1), end, pnlPeriod: "month" };
}

export function isQuickBooksConfigured(): boolean {
  return Boolean(process.env.QUICKBOOKS_CLIENT_ID?.trim());
}

export async function exportQuickBooksData(
  userId: string,
  period: QuickBooksExportPeriod = "month",
): Promise<QuickBooksExportPayload> {
  const { start, end, pnlPeriod } = exportPeriodRange(period);
  const { lines } = await getRestaurantPnLStatement(userId, pnlPeriod);

  const invoiceScope = await supplierInvoiceListWhereForOwner(userId);
  const invoices = await prisma.supplierInvoice.findMany({
    where: {
      AND: [
        invoiceScope,
        { invoiceDate: { gte: start, lte: end } },
      ],
    },
    include: { supplier: { select: { name: true } } },
    take: 500,
    orderBy: { invoiceDate: "desc" },
  });

  const orderWhere = await orderListWhereForOwnerAnd(userId, {
    createdAt: { gte: start, lte: end },
    status: { in: REVENUE_STATUSES },
  });
  const [orderAgg, orderCount] = await Promise.all([
    prisma.order.aggregate({
      where: orderWhere,
      _sum: { total: true },
    }),
    prisma.order.count({ where: orderWhere }),
  ]);

  const sales: QuickBooksSalesSummary = {
    orderCount,
    grossSales: Math.round(Number(orderAgg._sum.total ?? 0) * 100) / 100,
    periodStart: start.toISOString().slice(0, 10),
    periodEnd: end.toISOString().slice(0, 10),
  };

  return { period, periodStart: start, periodEnd: end, lines, invoices, sales };
}

export function quickBooksPnlToIif(
  pnlLines: Awaited<ReturnType<typeof getRestaurantPnLStatement>>["lines"],
  opts?: { periodEnd?: Date },
): string {
  return pnlLinesToQuickBooksIif(pnlLines, {
    date: opts?.periodEnd ?? new Date(),
    memo: "OS Kitchen P&L export",
  });
}

export function quickBooksPnlToCsv(
  pnlLines: Awaited<ReturnType<typeof getRestaurantPnLStatement>>["lines"],
): string {
  return pnlToCsv(pnlLines);
}

export { quickBooksInvoicesToCsv, salesSummaryToCsv, salesSummaryToQuickBooksIif };
