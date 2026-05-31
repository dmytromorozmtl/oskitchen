import { prisma } from "@/lib/prisma";
import { orderContributesToRevenue } from "@/lib/analytics/revenue-metrics";
import { restaurantLoyaltyFromSettingsCenter } from "@/lib/loyalty/restaurant-loyalty-settings";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { loyaltyAccountListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import {
  buildRestaurantLoyaltyEarnBreakdown,
  formatEarnNotes,
  type OrderLineForLoyalty,
} from "@/services/loyalty/restaurant-loyalty-service";

export async function getOrCreateLoyaltyProgram(userId: string) {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  return prisma.loyaltyProgram.upsert({
    where: {
      userId,
    },
    create: { userId, workspaceId },
    update: {},
  });
}

export async function updateLoyaltyProgram(
  userId: string,
  data: {
    pointsPerDollar?: number;
    redeemPointsThreshold?: number;
    redeemValueCents?: number;
    active?: boolean;
  },
) {
  await getOrCreateLoyaltyProgram(userId);
  return prisma.loyaltyProgram.update({
    where: {
      userId,
    },
    data: {
      pointsPerDollar: data.pointsPerDollar,
      redeemPointsThreshold: data.redeemPointsThreshold,
      redeemValueCents: data.redeemValueCents,
      active: data.active,
    },
  });
}

export async function getLoyaltyBalance(userId: string, customerId: string) {
  const account = await prisma.loyaltyAccount.findFirst({
    where: { AND: [await loyaltyAccountListWhereForOwner(userId), { customerId }] },
    select: { pointsBalance: true, tier: true },
  });
  return account?.pointsBalance ?? 0;
}

export async function getLoyaltyTransactions(userId: string, limit = 50) {
  return prisma.loyaltyTransaction.findMany({
    where: { account: await loyaltyAccountListWhereForOwner(userId) },
    include: {
      account: {
        include: {
          customer: { select: { email: true, name: true, displayName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}

export async function getOrCreateLoyaltyAccount(userId: string, customerId: string) {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  return prisma.loyaltyAccount.upsert({
    where: { customerId },
    create: { userId, workspaceId, customerId },
    update: {},
    include: { customer: { select: { email: true, name: true, displayName: true } } },
  });
}

export function redeemDiscountFromPoints(
  points: number,
  program: { redeemPointsThreshold: number; redeemValueCents: number },
): number {
  const blocks = Math.floor(points / program.redeemPointsThreshold);
  return (blocks * program.redeemValueCents) / 100;
}

export async function redeemLoyaltyPoints(
  userId: string,
  customerId: string,
  points: number,
  orderId?: string,
) {
  const program = await getOrCreateLoyaltyProgram(userId);
  const account = await getOrCreateLoyaltyAccount(userId, customerId);
  if (account.pointsBalance < points) {
    throw new Error("Insufficient loyalty points");
  }
  const discount = redeemDiscountFromPoints(points, program);

  await prisma.$transaction([
    prisma.loyaltyAccount.update({
      where: { id: account.id },
      data: { pointsBalance: { decrement: points } },
    }),
    prisma.loyaltyTransaction.create({
      data: {
        accountId: account.id,
        type: "REDEEM",
        points: -points,
        orderId: orderId ?? null,
        notes: `Redeemed for $${discount.toFixed(2)} discount`,
      },
    }),
  ]);

  return { discount, pointsRedeemed: points };
}

export async function earnLoyaltyPointsForOrder(
  userId: string,
  customerId: string,
  orderId: string,
  orderTotal: number,
  opts?: { lines?: OrderLineForLoyalty[] },
) {
  const program = await getOrCreateLoyaltyProgram(userId);
  if (!program.active) return { earned: 0 };

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { settingsCenterJson: true },
  });
  const restaurantConfig = restaurantLoyaltyFromSettingsCenter(kitchen?.settingsCenterJson);

  const account = await getOrCreateLoyaltyAccount(userId, customerId);
  const lifetimeBefore = await sumLifetimeEarnedPoints(account.id);
  const visitCount = await countCustomerVisits(userId, customerId);

  const breakdown = buildRestaurantLoyaltyEarnBreakdown({
    orderTotal,
    pointsPerDollar: Number(program.pointsPerDollar),
    lines: opts?.lines ?? [],
    config: restaurantConfig,
    lifetimePointsBefore: lifetimeBefore,
    visitCount,
  });

  const points = breakdown.totalPoints;
  if (points <= 0) return { earned: 0, breakdown };

  await prisma.$transaction([
    prisma.loyaltyAccount.update({
      where: { id: account.id },
      data: {
        pointsBalance: { increment: points },
        tier: breakdown.tierName,
      },
    }),
    prisma.loyaltyTransaction.create({
      data: {
        accountId: account.id,
        type: "EARN",
        points,
        orderId,
        notes: formatEarnNotes(breakdown, orderTotal),
      },
    }),
  ]);

  return { earned: points, breakdown };
}

async function sumLifetimeEarnedPoints(accountId: string): Promise<number> {
  const agg = await prisma.loyaltyTransaction.aggregate({
    where: { accountId, type: "EARN", points: { gt: 0 } },
    _sum: { points: true },
  });
  return agg._sum.points ?? 0;
}

async function countCustomerVisits(userId: string, customerId: string): Promise<number> {
  const orders = await prisma.order.findMany({
    where: { userId, customerId },
    select: { status: true },
    take: 500,
  });
  return orders.filter((order) => orderContributesToRevenue(order.status)).length;
}

export async function listLoyaltyAccounts(userId: string) {
  return prisma.loyaltyAccount.findMany({
    where: await loyaltyAccountListWhereForOwner(userId),
    include: {
      customer: { select: { email: true, name: true, displayName: true } },
      transactions: { orderBy: { createdAt: "desc" }, take: 3 },
    },
    orderBy: { pointsBalance: "desc" },
    take: 100,
  });
}
