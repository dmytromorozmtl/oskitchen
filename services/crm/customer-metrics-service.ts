import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { whereOrdersForOwnerAnd } from "@/lib/analytics/revenue-metrics";
import {
  kitchenCustomerByIdWhereForOwner,
  kitchenCustomerListWhereForOwner,
} from "@/lib/scope/workspace-customer-scope";

import { aggregateFromOrders, deriveStatusFromMetrics } from "@/lib/crm/customer-metrics";
import { normalizeEmail } from "@/lib/crm/customer-dedupe";

/**
 * Recompute metrics for a single customer based on Orders matched by email.
 * Never throws — failures are surfaced to logs only.
 */
export async function recomputeCustomerMetrics(userId: string, customerId: string): Promise<void> {
  try {
    const c = await prisma.kitchenCustomer.findFirst({
      where: await kitchenCustomerByIdWhereForOwner(userId, customerId),
      select: { id: true, email: true, status: true, totalOrders: true },
    });
    if (!c) return;
    const orders = await prisma.order.findMany({
      where: await whereOrdersForOwnerAnd(userId, {
        customerEmail: { equals: c.email, mode: "insensitive" },
        status: { notIn: ["CANCELLED"] },
        isChannelTestOrder: false,
      }),
      select: { total: true, createdAt: true },
    });
    const aggregate = aggregateFromOrders(orders.map((o) => ({ total: Number(o.total), createdAt: o.createdAt })));
    const nextStatus = deriveStatusFromMetrics(c.status, aggregate.totalOrders, aggregate.atRiskScore);
    await prisma.kitchenCustomer.update({
      where: { id: c.id },
      data: {
        totalOrders: aggregate.totalOrders,
        lifetimeValueCents: aggregate.lifetimeValueCents,
        averageOrderValueCents: aggregate.averageOrderValueCents,
        firstOrderAt: aggregate.firstOrderAt,
        lastOrderAt: aggregate.lastOrderAt,
        repeatPurchaseRate: aggregate.repeatPurchaseRate,
        atRiskScore: aggregate.atRiskScore,
        status: nextStatus,
      },
    });
  } catch (error) {
    logger.warn("[crm] recomputeCustomerMetrics failed", error);
  }
}

/**
 * Recompute every customer's metrics for the workspace. Used by the admin
 * "Recalculate metrics" button and by import / channel completion hooks.
 */
export async function recomputeAllCustomerMetrics(userId: string): Promise<{ updated: number }> {
  const customers = await prisma.kitchenCustomer.findMany({
    where: await kitchenCustomerListWhereForOwner(userId),
    select: { id: true },
  });
  for (const c of customers) {
    await recomputeCustomerMetrics(userId, c.id);
  }
  return { updated: customers.length };
}

/**
 * Recompute metrics for the customer whose email matches the order. Used as
 * a fire-and-forget hook from order create / status update.
 */
export async function recomputeMetricsForOrderEmail(userId: string, email: string | null | undefined) {
  const normalized = normalizeEmail(email);
  if (!normalized) return;
  const customer = await prisma.kitchenCustomer.findUnique({
    where: { userId_email: { userId, email: normalized } },
    select: { id: true },
  });
  if (!customer) return;
  await recomputeCustomerMetrics(userId, customer.id);
}

/** Workspace-level KPIs for the CRM command center. */
export async function loadCrmOverviewKpis(userId: string): Promise<{
  totalCustomers: number;
  newCustomers30d: number;
  repeatCustomers: number;
  vips: number;
  atRisk: number;
  withAllergies: number;
  cateringClients: number;
  averageOrderValueCents: number;
  lifetimeValueCentsTotal: number;
  repeatRevenue30dCents: number;
}> {
  const since30d = new Date();
  since30d.setDate(since30d.getDate() - 30);
  const customerWhere = await kitchenCustomerListWhereForOwner(userId);

  const [
    totalCustomers,
    newCustomers30d,
    repeatCustomers,
    vips,
    atRisk,
    withAllergies,
    cateringClients,
    aov,
    ltv,
    repeatOrders,
  ] = await Promise.all([
    prisma.kitchenCustomer.count({ where: customerWhere }),
    prisma.kitchenCustomer.count({ where: { AND: [customerWhere, { createdAt: { gte: since30d } }] } }),
    prisma.kitchenCustomer.count({ where: { AND: [customerWhere, { totalOrders: { gte: 2 } }] } }),
    prisma.kitchenCustomer.count({ where: { AND: [customerWhere, { status: "VIP" }] } }),
    prisma.kitchenCustomer.count({ where: { AND: [customerWhere, { status: "AT_RISK" }] } }),
    prisma.kitchenCustomer.count({
      where: { AND: [customerWhere, { allergiesJson: { not: { equals: undefined } } }] },
    }),
    prisma.kitchenCustomer.count({
      where: {
        AND: [
          customerWhere,
          { type: { in: ["CATERING_CLIENT", "EVENT_CLIENT", "OFFICE_CLIENT", "WHOLESALE_CLIENT"] } },
        ],
      },
    }),
    prisma.kitchenCustomer.aggregate({ where: customerWhere, _avg: { averageOrderValueCents: true } }),
    prisma.kitchenCustomer.aggregate({ where: customerWhere, _sum: { lifetimeValueCents: true } }),
    prisma.order.aggregate({
      where: await whereOrdersForOwnerAnd(userId, {
        createdAt: { gte: since30d },
        customerEmail: {
          in: (
            await prisma.kitchenCustomer.findMany({
              where: { AND: [customerWhere, { totalOrders: { gte: 2 } }] },
              select: { email: true },
              take: 5000,
            })
          ).map((r) => r.email),
        },
      }),
      _sum: { total: true },
    }),
  ]);

  return {
    totalCustomers,
    newCustomers30d,
    repeatCustomers,
    vips,
    atRisk,
    withAllergies,
    cateringClients,
    averageOrderValueCents: Math.round(aov._avg.averageOrderValueCents ?? 0),
    lifetimeValueCentsTotal: ltv._sum.lifetimeValueCents ?? 0,
    repeatRevenue30dCents: Math.round(Number(repeatOrders._sum.total ?? 0) * 100),
  };
}
