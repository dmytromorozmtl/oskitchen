import type { Prisma } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import {
  DEFAULT_RESTAURANT_LOYALTY_CONFIG,
  LOYALTY_2_TIER_LADDER,
  mergeRestaurantLoyaltyIntoSettingsCenter,
  parseRestaurantLoyaltyConfig,
  restaurantLoyaltyFromSettingsCenter,
  type ItemBonusRule,
  type RestaurantLoyaltyConfig,
} from "@/lib/loyalty/restaurant-loyalty-settings";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  buildRestaurantLoyaltyEarnBreakdown,
  type OrderLineForLoyalty,
  type RestaurantLoyaltyEarnBreakdown,
} from "@/services/loyalty/restaurant-loyalty-service";
import {
  earnLoyaltyPointsForOrder,
  getOrCreateLoyaltyAccount,
  getOrCreateLoyaltyProgram,
} from "@/services/loyalty/loyalty-service";

export type Loyalty2Program = RestaurantLoyaltyConfig & {
  pointsPerDollar: number;
  redeemPointsThreshold: number;
  redeemValueCents: number;
  programActive: boolean;
};

export type Loyalty2PreviewInput = {
  orderTotal: number;
  lines: OrderLineForLoyalty[];
  lifetimePointsBefore?: number;
  visitCount?: number;
};

export type Loyalty2PreviewResult = {
  breakdown: RestaurantLoyaltyEarnBreakdown;
  humanSummary: string;
  tierBenefits: string;
};

export function parseCustomerBirthdayMmDd(tagsJson: unknown): string | null {
  if (!tagsJson || typeof tagsJson !== "object") return null;
  const raw = (tagsJson as Record<string, unknown>).birthday;
  if (typeof raw !== "string") return null;
  const trimmed = raw.trim();
  const mmdd = trimmed.match(/^(\d{1,2})[-/](\d{1,2})$/);
  if (mmdd) {
    const m = mmdd[1]!.padStart(2, "0");
    const d = mmdd[2]!.padStart(2, "0");
    return `${m}-${d}`;
  }
  const iso = trimmed.match(/^\d{4}-(\d{2})-(\d{2})/);
  if (iso) return `${iso[1]}-${iso[2]}`;
  return null;
}

export function todayMmDd(timeZone = "UTC"): string {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const month = parts.find((p) => p.type === "month")?.value ?? "01";
  const day = parts.find((p) => p.type === "day")?.value ?? "01";
  return `${month}-${day}`;
}

export async function loadLoyalty2Program(ownerUserId: string): Promise<Loyalty2Program> {
  const [program, kitchen] = await Promise.all([
    getOrCreateLoyaltyProgram(ownerUserId),
    prisma.kitchenSettings.findUnique({
      where: { userId: ownerUserId },
      select: { settingsCenterJson: true },
    }),
  ]);
  const rules = restaurantLoyaltyFromSettingsCenter(kitchen?.settingsCenterJson);
  return {
    ...rules,
    pointsPerDollar: Number(program.pointsPerDollar),
    redeemPointsThreshold: program.redeemPointsThreshold,
    redeemValueCents: program.redeemValueCents,
    programActive: program.active,
  };
}

export async function saveLoyalty2Program(
  ownerUserId: string,
  input: {
    config: RestaurantLoyaltyConfig;
    pointsPerDollar?: number;
    redeemPointsThreshold?: number;
    redeemValueCents?: number;
    programActive?: boolean;
  },
): Promise<Loyalty2Program> {
  const workspaceId = await resolveOwnerWorkspaceId(ownerUserId);
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });
  const merged = mergeRestaurantLoyaltyIntoSettingsCenter(
    kitchen?.settingsCenterJson,
    input.config,
  ) as Prisma.InputJsonValue;

  await prisma.$transaction([
    prisma.kitchenSettings.upsert({
      where: { userId: ownerUserId },
      create: { userId: ownerUserId, workspaceId, settingsCenterJson: merged },
      update: { settingsCenterJson: merged },
    }),
    prisma.loyaltyProgram.upsert({
      where: { userId: ownerUserId },
      create: {
        userId: ownerUserId,
        workspaceId,
        pointsPerDollar: input.pointsPerDollar ?? 1,
        redeemPointsThreshold: input.redeemPointsThreshold ?? 100,
        redeemValueCents: input.redeemValueCents ?? 500,
        active: input.programActive ?? true,
      },
      update: {
        ...(input.pointsPerDollar != null ? { pointsPerDollar: input.pointsPerDollar } : {}),
        ...(input.redeemPointsThreshold != null
          ? { redeemPointsThreshold: input.redeemPointsThreshold }
          : {}),
        ...(input.redeemValueCents != null ? { redeemValueCents: input.redeemValueCents } : {}),
        ...(input.programActive != null ? { active: input.programActive } : {}),
      },
    }),
  ]);

  return loadLoyalty2Program(ownerUserId);
}

export function previewLoyalty2Earn(
  program: Loyalty2Program,
  input: Loyalty2PreviewInput,
): Loyalty2PreviewResult {
  const breakdown = buildRestaurantLoyaltyEarnBreakdown({
    orderTotal: input.orderTotal,
    pointsPerDollar: program.pointsPerDollar,
    lines: input.lines,
    config: program,
    lifetimePointsBefore: input.lifetimePointsBefore ?? 0,
    visitCount: input.visitCount ?? 1,
  });

  const parts: string[] = [];
  if (breakdown.basePoints > 0) parts.push(`${breakdown.basePoints} base pts`);
  if (breakdown.itemBonusPoints > 0) {
    parts.push(`${breakdown.itemBonusPoints} item bonus pts`);
  }
  if (breakdown.visitBonusPoints > 0) {
    parts.push(`${breakdown.visitBonusPoints} visit milestone pts`);
  }
  if (breakdown.freeItemReward) parts.push(breakdown.freeItemReward);
  parts.push(`${breakdown.tierName} tier (×${breakdown.tierMultiplier})`);

  const humanSummary =
    parts.length > 0
      ? `Customer earns ${breakdown.totalPoints} pts — ${parts.join(", ")}`
      : "No points earned for this preview.";

  const tierBenefits = LOYALTY_2_TIER_LADDER.map(
    (t) => `${t.name}: ${t.minLifetimePoints}+ lifetime pts (×${t.multiplier})`,
  ).join(" · ");

  return { breakdown, humanSummary, tierBenefits };
}

export async function processLoyalty2OrderEarn(input: {
  ownerUserId: string;
  customerId: string;
  orderId: string;
  orderTotal: number;
  lines?: OrderLineForLoyalty[];
}): Promise<{ earned: number; breakdown?: RestaurantLoyaltyEarnBreakdown }> {
  return earnLoyaltyPointsForOrder(
    input.ownerUserId,
    input.customerId,
    input.orderId,
    input.orderTotal,
    { lines: input.lines },
  );
}

export async function grantLoyalty2ReferralBonus(input: {
  ownerUserId: string;
  referrerCustomerId: string;
  friendCustomerId: string;
}): Promise<{ referrerPoints: number; friendPoints: number }> {
  const program = await loadLoyalty2Program(input.ownerUserId);
  if (!program.referralBonusEnabled || program.referralBonusPoints <= 0) {
    return { referrerPoints: 0, friendPoints: 0 };
  }

  const pts = program.referralBonusPoints;
  const note = "Loyalty 2.0 — referral bonus (both earn)";

  await Promise.all([
    awardBonusPoints(input.ownerUserId, input.referrerCustomerId, pts, note),
    awardBonusPoints(input.ownerUserId, input.friendCustomerId, pts, note),
  ]);

  return { referrerPoints: pts, friendPoints: pts };
}

async function awardBonusPoints(
  ownerUserId: string,
  customerId: string,
  points: number,
  notes: string,
): Promise<void> {
  const account = await getOrCreateLoyaltyAccount(ownerUserId, customerId);
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
        notes,
      },
    }),
  ]);
}

export async function processBirthdayRewardsForOwner(
  ownerUserId: string,
  opts?: { timeZone?: string; year?: number },
): Promise<{ awarded: number; customers: string[] }> {
  const program = await loadLoyalty2Program(ownerUserId);
  if (!program.birthdayRewardEnabled || program.birthdayRewardPoints <= 0) {
    return { awarded: 0, customers: [] };
  }

  const mmdd = todayMmDd(opts?.timeZone ?? "UTC");
  const year = opts?.year ?? new Date().getFullYear();
  const noteMarker = `birthday:${year}`;

  const customers = await prisma.kitchenCustomer.findMany({
    where: { userId: ownerUserId },
    select: { id: true, tagsJson: true, displayName: true, email: true },
    take: 5000,
  });

  const awardedCustomers: string[] = [];

  for (const customer of customers) {
    if (parseCustomerBirthdayMmDd(customer.tagsJson) !== mmdd) continue;

    const account = await prisma.loyaltyAccount.findUnique({
      where: { customerId: customer.id },
      select: { id: true },
    });
    if (!account) {
      await getOrCreateLoyaltyAccount(ownerUserId, customer.id);
    }

    const accountId =
      account?.id ??
      (await prisma.loyaltyAccount.findUnique({
        where: { customerId: customer.id },
        select: { id: true },
      }))?.id;
    if (!accountId) continue;

    const already = await prisma.loyaltyTransaction.findFirst({
      where: {
        accountId,
        type: "EARN",
        notes: { contains: noteMarker },
      },
      select: { id: true },
    });
    if (already) continue;

    await awardBonusPoints(
      ownerUserId,
      customer.id,
      program.birthdayRewardPoints,
      `Happy Birthday! ${noteMarker} — free dessert on us`,
    );
    awardedCustomers.push(
      customer.displayName ?? customer.email ?? customer.id.slice(0, 8),
    );
  }

  return { awarded: awardedCustomers.length, customers: awardedCustomers };
}

export function defaultLoyalty2ItemBonuses(): ItemBonusRule[] {
  return [...DEFAULT_RESTAURANT_LOYALTY_CONFIG.itemBonuses];
}

export function parseLoyalty2Config(raw: unknown): RestaurantLoyaltyConfig {
  return parseRestaurantLoyaltyConfig(raw);
}
