import type { Order, OrderStatus, Prisma } from "@prisma/client";

import { decimalToNumber } from "@/lib/catering/quote-calculations";
import { rewriteOrderEmailFilters } from "@/lib/orders/order-pii";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { buildOwnerScopedWhere } from "@/lib/scope/workspace-resource-scope";
import { orderListWhereForOwner } from "@/lib/scope/workspace-order-scope";

/**
 * Statuses that count toward gross revenue. We deliberately exclude
 * CANCELLED. Other statuses (PENDING / CONFIRMED / PREPARING / READY /
 * COMPLETED) are counted at face-value because they represent agreed
 * revenue with the customer.
 */
export const REVENUE_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PREPARING",
  "READY",
  "COMPLETED",
];

export function orderContributesToRevenue(status: OrderStatus): boolean {
  return REVENUE_STATUSES.includes(status);
}

export type RevenueOrderRow = Pick<Order, "id" | "status" | "total" | "createdAt" | "brandId" | "locationId" | "fulfillmentType"> & {
  customerEmail?: string;
};

export function sumRevenue(rows: RevenueOrderRow[]): number {
  let total = 0;
  for (const r of rows) {
    if (orderContributesToRevenue(r.status)) total += decimalToNumber(r.total);
  }
  return Math.round(total * 100) / 100;
}

export function sumCancelled(rows: RevenueOrderRow[]): number {
  let total = 0;
  for (const r of rows) {
    if (r.status === "CANCELLED") total += decimalToNumber(r.total);
  }
  return Math.round(total * 100) / 100;
}

/**
 * Prisma `where` for orders in a date window (workspace-aware when `workspaceId` is set).
 * Prefer `whereOrdersInWindowForOwner` in server code so workspace is resolved from DB.
 */
export function whereOrdersInWindow(args: {
  userId: string;
  workspaceId?: string | null;
  from: Date;
  to: Date;
  brandId?: string | null;
  locationId?: string | null;
  extra?: Prisma.OrderWhereInput;
}): Prisma.OrderWhereInput {
  const ownerScope = buildOwnerScopedWhere(args.userId, args.workspaceId ?? null);
  const window: Prisma.OrderWhereInput = {
    createdAt: { gte: args.from, lte: args.to },
    ...(args.brandId ? { brandId: args.brandId } : {}),
    ...(args.locationId ? { locationId: args.locationId } : {}),
  };
  const parts: Prisma.OrderWhereInput[] = [ownerScope, window];
  if (args.extra && Object.keys(args.extra).length > 0) {
    parts.push(rewriteOrderEmailFilters(args.extra));
  }
  return { AND: parts };
}

/** Resolves workspace + date window for reports, analytics, and executive KPIs. */
export async function whereOrdersInWindowForOwner(args: {
  userId: string;
  from: Date;
  to: Date;
  brandId?: string | null;
  locationId?: string | null;
  extra?: Prisma.OrderWhereInput;
}): Promise<Prisma.OrderWhereInput> {
  const workspaceId = await resolveOwnerWorkspaceId(args.userId);
  return whereOrdersInWindow({ ...args, workspaceId });
}

/** Owner scope + arbitrary filters (CRM, Today, operational signals). */
export async function whereOrdersForOwnerAnd(
  ownerUserId: string,
  extra: Prisma.OrderWhereInput,
): Promise<Prisma.OrderWhereInput> {
  const base = await orderListWhereForOwner(ownerUserId);
  return { AND: [base, rewriteOrderEmailFilters(extra)] };
}
