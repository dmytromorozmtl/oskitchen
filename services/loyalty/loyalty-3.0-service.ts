import type { Prisma } from "@prisma/client";

import {
  buildLoyalty3CrossBrandLane,
  buildLoyalty3DashboardSnapshot,
  buildLoyalty3EventOpportunity,
  buildLoyalty3ReferralStats,
  buildLoyalty3VipMember,
} from "@/lib/loyalty/loyalty-3-builders";
import {
  DEFAULT_LOYALTY_3_CONFIG,
  loyalty3FromSettingsCenter,
  mergeLoyalty3IntoSettingsCenter,
  parseLoyalty3Config,
} from "@/lib/loyalty/loyalty-3-settings";
import type {
  Loyalty3Config,
  Loyalty3DashboardSnapshot,
  Loyalty3Program,
} from "@/lib/loyalty/loyalty-3-types";
import { prisma } from "@/lib/prisma";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import { loyaltyAccountListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import {
  grantLoyalty2ReferralBonus,
  loadLoyalty2Program,
  type Loyalty2Program,
} from "@/services/loyalty/loyalty-2.0-service";
import { getOrCreateLoyaltyAccount } from "@/services/loyalty/loyalty-service";

export type {
  Loyalty3Config,
  Loyalty3DashboardSnapshot,
  Loyalty3Program,
} from "@/lib/loyalty/loyalty-3-types";

export function resolveLoyalty3VipMultiplier(input: {
  config: Loyalty3Config;
  customerStatus: string;
  lifetimeValueCents: number;
}): number {
  const isVip =
    input.customerStatus === "VIP" ||
    input.lifetimeValueCents >= input.config.vipMinLifetimeValueCents;
  return isVip ? input.config.vipMultiplier : 1;
}

export async function loadLoyalty3Program(ownerUserId: string): Promise<Loyalty3Program> {
  const [base, kitchen] = await Promise.all([
    loadLoyalty2Program(ownerUserId),
    prisma.kitchenSettings.findUnique({
      where: { userId: ownerUserId },
      select: { settingsCenterJson: true },
    }),
  ]);
  return {
    ...base,
    v3: loyalty3FromSettingsCenter(kitchen?.settingsCenterJson),
  };
}

export async function saveLoyalty3Config(
  ownerUserId: string,
  config: Loyalty3Config,
): Promise<Loyalty3Program> {
  const workspaceId = await resolveOwnerWorkspaceId(ownerUserId);
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });
  const merged = mergeLoyalty3IntoSettingsCenter(
    kitchen?.settingsCenterJson,
    config,
  ) as Prisma.InputJsonValue;

  await prisma.kitchenSettings.upsert({
    where: { userId: ownerUserId },
    create: { userId: ownerUserId, workspaceId, settingsCenterJson: merged },
    update: { settingsCenterJson: merged },
  });

  return loadLoyalty3Program(ownerUserId);
}

async function loadCrossBrandLanes(ownerUserId: string): Promise<ReturnType<typeof buildLoyalty3CrossBrandLane>[]> {
  const accountScope = await loyaltyAccountListWhereForOwner(ownerUserId);
  const accounts = await prisma.loyaltyAccount.findMany({
    where: accountScope,
    select: { customerId: true },
    take: 500,
  });
  const customerIds = accounts.map((row) => row.customerId);
  if (customerIds.length === 0) return [];

  const earnTx = await prisma.loyaltyTransaction.findMany({
    where: {
      type: "EARN",
      points: { gt: 0 },
      account: accountScope,
      orderId: { not: null },
    },
    select: {
      points: true,
      orderId: true,
      account: { select: { customerId: true } },
    },
    take: 2000,
  });

  const orderIds = [...new Set(earnTx.map((tx) => tx.orderId).filter(Boolean))] as string[];
  if (orderIds.length === 0) {
    return [
      buildLoyalty3CrossBrandLane({
        brandId: null,
        brandName: "All brands",
        memberCount: customerIds.length,
        pointsEarned: 0,
      }),
    ];
  }

  const orders = await prisma.order.findMany({
    where: { id: { in: orderIds }, userId: ownerUserId },
    select: { id: true, brandId: true, brand: { select: { name: true } } },
  });
  const orderBrand = new Map(
    orders.map((order) => [
      order.id,
      { brandId: order.brandId, brandName: order.brand?.name ?? "Unbranded" },
    ]),
  );

  const laneMap = new Map<
    string,
    { brandId: string | null; brandName: string; memberCount: Set<string>; pointsEarned: number }
  >();

  for (const tx of earnTx) {
    if (!tx.orderId) continue;
    const brand = orderBrand.get(tx.orderId) ?? { brandId: null, brandName: "Unbranded" };
    const key = brand.brandId ?? "unbranded";
    const lane = laneMap.get(key) ?? {
      brandId: brand.brandId,
      brandName: brand.brandName,
      memberCount: new Set<string>(),
      pointsEarned: 0,
    };
    lane.memberCount.add(tx.account.customerId);
    lane.pointsEarned += tx.points;
    laneMap.set(key, lane);
  }

  return [...laneMap.values()]
    .map((lane) =>
      buildLoyalty3CrossBrandLane({
        brandId: lane.brandId,
        brandName: lane.brandName,
        memberCount: lane.memberCount.size,
        pointsEarned: lane.pointsEarned,
      }),
    )
    .sort((a, b) => b.pointsEarned - a.pointsEarned);
}

async function loadVipMembers(ownerUserId: string, config: Loyalty3Config) {
  const accountScope = await loyaltyAccountListWhereForOwner(ownerUserId);
  const rows = await prisma.loyaltyAccount.findMany({
    where: accountScope,
    include: {
      customer: {
        select: {
          id: true,
          displayName: true,
          name: true,
          email: true,
          status: true,
          lifetimeValueCents: true,
        },
      },
    },
    orderBy: { pointsBalance: "desc" },
    take: 50,
  });

  return rows
    .filter(
      (row) =>
        row.customer.status === "VIP" ||
        row.customer.lifetimeValueCents >= config.vipMinLifetimeValueCents,
    )
    .slice(0, 12)
    .map((row) =>
      buildLoyalty3VipMember({
        customerId: row.customer.id,
        displayName: row.customer.displayName ?? row.customer.name ?? row.customer.email,
        pointsBalance: row.pointsBalance,
        tier: row.tier,
        lifetimeValueCents: row.customer.lifetimeValueCents,
      }),
    );
}

async function loadEventOpportunities(ownerUserId: string) {
  const quotes = await prisma.cateringQuote.findMany({
    where: {
      userId: ownerUserId,
      status: { in: ["ACCEPTED", "SENT", "VIEWED", "CONVERTED_TO_ORDER"] },
      eventDate: { gte: new Date() },
    },
    orderBy: { eventDate: "asc" },
    take: 8,
    select: {
      id: true,
      eventName: true,
      customerName: true,
      eventDate: true,
      guestCount: true,
      status: true,
    },
  });

  return quotes.map((quote) =>
    buildLoyalty3EventOpportunity({
      id: quote.id,
      title: quote.eventName ?? quote.customerName,
      eventDate: quote.eventDate,
      guestCount: quote.guestCount,
      status: quote.status,
      customerName: quote.customerName,
    }),
  );
}

async function loadReferralStats(ownerUserId: string) {
  const accountScope = await loyaltyAccountListWhereForOwner(ownerUserId);
  const referralTx = await prisma.loyaltyTransaction.findMany({
    where: {
      type: "EARN",
      account: accountScope,
      notes: { contains: "referral", mode: "insensitive" },
    },
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      account: {
        include: {
          customer: { select: { displayName: true, name: true, email: true } },
        },
      },
    },
  });

  const bonusPointsAwarded = referralTx.reduce((sum, tx) => sum + tx.points, 0);
  const completedReferrals = Math.floor(referralTx.length / 2);

  const pendingEvents = await prisma.referralEvent.count({
    where: {
      referralCode: { userId: ownerUserId },
      convertedUserId: null,
    },
  });

  const recentReferrals = referralTx.slice(0, 6).map((tx) => ({
    id: tx.id,
    referrerLabel:
      tx.account.customer.displayName ??
      tx.account.customer.name ??
      tx.account.customer.email,
    friendLabel: "Referred friend",
    points: tx.points,
    createdAtIso: tx.createdAt.toISOString(),
  }));

  return buildLoyalty3ReferralStats({
    completedReferrals,
    pendingReferrals: pendingEvents,
    bonusPointsAwarded,
    recentReferrals,
  });
}

export async function loadLoyalty3DashboardSnapshot(
  ownerUserId: string,
): Promise<Loyalty3DashboardSnapshot> {
  const program = await loadLoyalty3Program(ownerUserId);
  const [crossBrandLanes, vipMembers, eventOpportunities, referralStats, totalMembers] =
    await Promise.all([
      program.v3.crossBrandEnabled ? loadCrossBrandLanes(ownerUserId) : Promise.resolve([]),
      loadVipMembers(ownerUserId, program.v3),
      program.v3.eventBonusEnabled ? loadEventOpportunities(ownerUserId) : Promise.resolve([]),
      loadReferralStats(ownerUserId),
      prisma.loyaltyAccount.count({ where: await loyaltyAccountListWhereForOwner(ownerUserId) }),
    ]);

  return buildLoyalty3DashboardSnapshot({
    program,
    crossBrandLanes,
    vipMembers,
    eventOpportunities,
    referralStats,
    totalMembers,
  });
}

export async function grantLoyalty3ReferralBonus(input: {
  ownerUserId: string;
  referrerCustomerId: string;
  friendCustomerId: string;
}): Promise<{ referrerPoints: number; friendPoints: number }> {
  return grantLoyalty2ReferralBonus(input);
}

export async function grantLoyalty3EventBonus(input: {
  ownerUserId: string;
  customerId: string;
  eventLabel: string;
}): Promise<{ points: number }> {
  const program = await loadLoyalty3Program(input.ownerUserId);
  if (!program.v3.eventBonusEnabled || program.v3.eventBonusPoints <= 0) {
    return { points: 0 };
  }

  const account = await getOrCreateLoyaltyAccount(input.ownerUserId, input.customerId);
  const note = `Loyalty 3.0 — event bonus: ${input.eventLabel}`;

  const already = await prisma.loyaltyTransaction.findFirst({
    where: {
      accountId: account.id,
      type: "EARN",
      notes: { contains: input.eventLabel },
    },
    select: { id: true },
  });
  if (already) return { points: 0 };

  const points = program.v3.eventBonusPoints;
  await prisma.$transaction([
    prisma.loyaltyAccount.update({
      where: { id: account.id },
      data: { pointsBalance: { increment: points } },
    }),
    prisma.loyaltyTransaction.create({
      data: {
        accountId: account.id,
        type: "EARN",
        points,
        notes: note,
      },
    }),
  ]);

  return { points };
}

export function applyLoyalty3EarnMultiplier(
  basePoints: number,
  program: Loyalty3Program,
  customer: { status: string; lifetimeValueCents: number },
): number {
  const multiplier = resolveLoyalty3VipMultiplier({
    config: program.v3,
    customerStatus: customer.status,
    lifetimeValueCents: customer.lifetimeValueCents,
  });
  return Math.round(basePoints * multiplier);
}

export function defaultLoyalty3Config(): Loyalty3Config {
  return { ...DEFAULT_LOYALTY_3_CONFIG };
}

export function parseLoyalty3ConfigFromRaw(raw: unknown): Loyalty3Config {
  return parseLoyalty3Config(raw);
}

export type { Loyalty2Program };
