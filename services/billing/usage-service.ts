import { prisma } from "@/lib/prisma";
import type { PlanKey } from "@/lib/billing/plan-registry";
import { buildUsageBar, type UsageBar, type UsageMetric, USAGE_METRICS } from "@/lib/billing/usage-limits";
import { ensureOwnerWorkspaceId } from "@/lib/scope/ensure-owner-workspace";
import { orderListWhereForOwnerAnd } from "@/lib/scope/workspace-order-scope";
import {
  integrationConnectionListWhereForOwner,
  locationListWhereForOwner,
  menuListWhereForOwner,
  staffMemberListWhereForOwner,
  storefrontDomainListWhereForOwner,
} from "@/lib/scope/workspace-resource-scope";

function monthRange(now: Date = new Date()): { start: Date; end: Date } {
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1, 0, 0, 0));
  return { start, end };
}

export async function recomputeUsage(userId: string): Promise<Record<UsageMetric, number>> {
  const { start, end } = monthRange();
  const workspaceId = await ensureOwnerWorkspaceId(userId);
  const [orders, menus, integrations, staff, brands, locations, storefronts] = await Promise.all([
    prisma.order.count({
      where: await orderListWhereForOwnerAnd(userId, { createdAt: { gte: start, lt: end } }),
    }),
    prisma.menu.count({
      where: { AND: [await menuListWhereForOwner(userId), { catalogOnly: false }] },
    }),
    prisma.integrationConnection.count({
      where: { AND: [await integrationConnectionListWhereForOwner(userId), { status: "CONNECTED" }] },
    }),
    prisma.staffMember.count({
      where: {
        AND: [await staffMemberListWhereForOwner(userId), { status: { in: ["ACTIVE", "TRAINING"] } }],
      },
    }),
    workspaceId
      ? prisma.brand.count({ where: { workspaceId } }).catch(() => 0)
      : Promise.resolve(0),
    prisma.location.count({ where: await locationListWhereForOwner(userId) }).catch(() => 0),
    prisma.storefrontDomain.count({ where: await storefrontDomainListWhereForOwner(userId) }).catch(() => 0),
  ]);

  const counts: Record<UsageMetric, number> = {
    orders_per_month: orders,
    active_menus: menus,
    integrations,
    staff,
    brands,
    locations,
    storefronts,
  };

  // Best-effort cache. Failures here must not break the page.
  await Promise.all(
    USAGE_METRICS.map((metric) =>
      prisma.usageCounter
        .upsert({
          where: { userId_metricKey_periodStart: { userId, metricKey: metric, periodStart: start } },
          create: {
            userId,
            workspaceId,
            metricKey: metric,
            periodStart: start,
            periodEnd: end,
            used: counts[metric],
          },
          update: { workspaceId, used: counts[metric], periodEnd: end },
        })
        .catch(() => undefined),
    ),
  );

  return counts;
}

export async function usageBarsForUser(userId: string, plan: PlanKey): Promise<UsageBar[]> {
  const counts = await recomputeUsage(userId);
  return USAGE_METRICS.map((m) => buildUsageBar(plan, m, counts[m]));
}
