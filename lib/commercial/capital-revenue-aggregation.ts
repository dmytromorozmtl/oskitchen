import {
  orderContributesToRevenue,
  sumRevenue,
  whereOrdersInWindowForOwner,
  type RevenueOrderRow,
} from "@/lib/analytics/revenue-metrics";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";

export type CapitalRevenueAggregate = {
  periodStart: string;
  periodEnd: string;
  grossOrderRevenue: number;
  orderCount: number;
  cancelledOrderCount: number;
  currency: string;
  locationCount: number;
  locationsIncluded: string[];
  tenureDays: number | null;
  workspaceId: string | null;
  businessName: string | null;
  hasOrderData: boolean;
};

export const CAPITAL_REVENUE_DEFINITION_NOTE =
  "Gross order volume from KitchenOS orders in revenue-eligible statuses (pending through completed). Excludes cancelled orders. Not collected cash, not bank deposits, and not a credit score or lending decision.";

export function capitalRevenueWindowMonthsAgo(months: number, now = new Date()): { from: Date; to: Date } {
  const to = new Date(now);
  const from = new Date(now);
  from.setUTCMonth(from.getUTCMonth() - months);
  from.setUTCHours(0, 0, 0, 0);
  return { from, to };
}

export function defaultTrailingYearWindow(now = new Date()): { from: Date; to: Date } {
  return capitalRevenueWindowMonthsAgo(12, now);
}

async function resolveCurrency(userId: string, workspaceId: string | null): Promise<string> {
  if (workspaceId) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { currency: true },
    });
    if (workspace?.currency?.trim()) return workspace.currency.trim().toUpperCase();
  }

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { locale: true },
  });
  if (kitchen?.locale?.toLowerCase().startsWith("en-ca")) return "CAD";
  if (kitchen?.locale?.toLowerCase().startsWith("en-gb")) return "GBP";
  return "USD";
}

export async function aggregateCapitalRevenueForWindow(input: {
  userId: string;
  from: Date;
  to: Date;
}): Promise<CapitalRevenueAggregate> {
  const workspaceId = await resolveOwnerWorkspaceId(input.userId);
  const where = await whereOrdersInWindowForOwner({
    userId: input.userId,
    from: input.from,
    to: input.to,
  });

  const orders = await prisma.order.findMany({
    where,
    select: {
      id: true,
      status: true,
      total: true,
      createdAt: true,
      brandId: true,
      locationId: true,
      fulfillmentType: true,
    },
  });

  const revenueRows: RevenueOrderRow[] = orders;
  const grossOrderRevenue = sumRevenue(revenueRows);
  const orderCount = revenueRows.filter((row) => orderContributesToRevenue(row.status)).length;
  const cancelledOrderCount = revenueRows.filter((row) => row.status === "CANCELLED").length;
  const locationsIncluded = [
    ...new Set(
      revenueRows.map((row) => row.locationId).filter((id): id is string => Boolean(id)),
    ),
  ].sort();

  let tenureDays: number | null = null;
  if (workspaceId) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId },
      select: { createdAt: true },
    });
    if (workspace) {
      tenureDays = Math.floor((Date.now() - workspace.createdAt.getTime()) / 86_400_000);
    }
  }

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: input.userId },
    select: { businessName: true },
  });

  const currency = await resolveCurrency(input.userId, workspaceId);

  return {
    periodStart: input.from.toISOString().slice(0, 10),
    periodEnd: input.to.toISOString().slice(0, 10),
    grossOrderRevenue,
    orderCount,
    cancelledOrderCount,
    currency,
    locationCount: locationsIncluded.length,
    locationsIncluded,
    tenureDays,
    workspaceId,
    businessName: kitchen?.businessName ?? null,
    hasOrderData: orderCount > 0,
  };
}
