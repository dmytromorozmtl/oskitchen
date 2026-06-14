import { randomBytes } from "node:crypto";

import type { ReferralCode } from "@prisma/client";

import { SITE_URL } from "@/lib/constants";
import { prisma } from "@/lib/prisma";
import { ensureOwnerWorkspaceId } from "@/lib/scope/ensure-owner-workspace";
import { billingEventListWhereForOwner, referralCodeListWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { recordBillingEvent } from "@/services/billing/billing-service";

export const REFERRAL_FREE_MONTH_DAYS = 30;
export const REFERRAL_BILLING_EVENT = "REFERRAL_FREE_MONTH" as const;

const MS_PER_DAY = 24 * 60 * 60 * 1000;

export type ReferralDashboard = {
  code: string;
  link: string;
  referredRestaurants: number;
  earnedFreeMonths: number;
  recentEvents: Array<{
    id: string;
    email: string;
    source: string | null;
    convertedUserId: string | null;
    createdAt: Date;
    rewardsGranted: boolean;
  }>;
};

function normalizeReferralCode(raw: string): string {
  return raw.trim().toUpperCase();
}

export function buildReferralPublicUrl(code: string): string {
  const base = SITE_URL.replace(/\/$/, "");
  const slug = encodeURIComponent(code.trim());
  return `${base}/r/${slug}`;
}

async function generateUniqueReferralCode(): Promise<string> {
  for (let attempt = 0; attempt < 24; attempt++) {
    const code = `R-${randomBytes(4).toString("hex").toUpperCase()}`;
    const taken = await prisma.referralCode.findUnique({ where: { code } });
    if (!taken) return code;
  }
  return `R-${randomBytes(6).toString("hex").toUpperCase()}`;
}

export async function validateReferralCode(raw: string): Promise<boolean> {
  const code = normalizeReferralCode(raw);
  if (!code || code.length > 64) return false;
  const row = await prisma.referralCode.findFirst({
    where: { code, active: true },
    select: { id: true },
  });
  return Boolean(row);
}

export async function getOrCreateReferralCodeForOwner(userId: string): Promise<ReferralCode> {
  const workspaceId = await ensureOwnerWorkspaceId(userId);
  const scope = await referralCodeListWhereForOwner(userId);
  const existing = await prisma.referralCode.findFirst({
    where: { AND: [scope, { active: true }] },
    orderBy: { createdAt: "desc" },
  });
  if (existing) return existing;

  const code = await generateUniqueReferralCode();
  return prisma.referralCode.create({
    data: {
      userId,
      workspaceId: workspaceId ?? undefined,
      code,
      active: true,
      commissionBps: 0,
      affiliateLabel: "Restaurant referral",
    },
  });
}

async function referralRewardAlreadyGranted(
  userId: string,
  referralEventId: string,
  role: "referee" | "referrer",
): Promise<boolean> {
  const billingScope = await billingEventListWhereForOwner(userId);
  const events = await prisma.billingEvent.findMany({
    where: { AND: [billingScope, { eventType: REFERRAL_BILLING_EVENT }] },
    select: { metadataJson: true },
    take: 200,
  });
  return events.some((e) => {
    const meta = e.metadataJson as Record<string, unknown> | null;
    return meta?.referralEventId === referralEventId && meta?.role === role;
  });
}

export async function grantReferralFreeMonth(input: {
  userId: string;
  referralEventId: string;
  role: "referee" | "referrer";
}): Promise<{ granted: boolean; trialEnd: Date | null }> {
  if (await referralRewardAlreadyGranted(input.userId, input.referralEventId, input.role)) {
    const sub = await prisma.subscription.findUnique({
      where: { userId: input.userId },
      select: { trialEnd: true },
    });
    return { granted: false, trialEnd: sub?.trialEnd ?? null };
  }

  const workspaceId = await ensureOwnerWorkspaceId(input.userId);
  const now = new Date();
  const extensionMs = REFERRAL_FREE_MONTH_DAYS * MS_PER_DAY;

  const sub = await prisma.subscription.findUnique({ where: { userId: input.userId } });
  const anchor =
    sub?.trialEnd && sub.trialEnd > now
      ? sub.trialEnd
      : sub?.currentPeriodEnd && sub.currentPeriodEnd > now
        ? sub.currentPeriodEnd
        : now;
  const trialEnd = new Date(anchor.getTime() + extensionMs);

  await prisma.subscription.upsert({
    where: { userId: input.userId },
    create: {
      userId: input.userId,
      workspaceId: workspaceId ?? undefined,
      plan: "STARTER",
      status: "TRIALING",
      statusDetail: "TRIALING",
      trialStart: now,
      trialEnd,
    },
    update: {
      workspaceId: workspaceId ?? undefined,
      trialEnd,
      status: "TRIALING",
      statusDetail: "TRIALING",
    },
  });

  await recordBillingEvent({
    userId: input.userId,
    workspaceId,
    eventType: REFERRAL_BILLING_EVENT,
    source: "internal",
    summary:
      input.role === "referee"
        ? "Referral signup — 1 free month applied to your plan"
        : "Referral reward — 1 free month for bringing a restaurant",
    metadata: {
      referralEventId: input.referralEventId,
      role: input.role,
      daysGranted: REFERRAL_FREE_MONTH_DAYS,
      trialEnd: trialEnd.toISOString(),
    },
  });

  return { granted: true, trialEnd };
}

export async function countEarnedReferralMonths(userId: string): Promise<number> {
  const billingScope = await billingEventListWhereForOwner(userId);
  const events = await prisma.billingEvent.findMany({
    where: { AND: [billingScope, { eventType: REFERRAL_BILLING_EVENT }] },
    select: { metadataJson: true },
    take: 500,
  });
  return events.filter((e) => {
    const meta = e.metadataJson as Record<string, unknown> | null;
    return meta?.role === "referrer";
  }).length;
}

export async function processReferralConversion(input: {
  email: string;
  userId: string;
  referralCode?: string | null;
}): Promise<{ attached: boolean; referralEventId?: string }> {
  const codeRaw = input.referralCode?.trim();
  if (!codeRaw || codeRaw.length > 64) return { attached: false };

  const normalized = normalizeReferralCode(codeRaw);
  const ref = await prisma.referralCode.findFirst({
    where: {
      active: true,
      OR: [{ code: normalized }, { code: codeRaw }],
    },
  });
  if (!ref || ref.userId === input.userId) return { attached: false };

  const email = input.email.toLowerCase().slice(0, 320);
  const existing = await prisma.referralEvent.findFirst({
    where: {
      referralCodeId: ref.id,
      convertedUserId: input.userId,
    },
  });
  if (existing) {
    return { attached: true, referralEventId: existing.id };
  }

  const event = await prisma.referralEvent.create({
    data: {
      referralCodeId: ref.id,
      email,
      source: "signup",
      convertedUserId: input.userId,
    },
  });

  await grantReferralFreeMonth({
    userId: input.userId,
    referralEventId: event.id,
    role: "referee",
  });
  await grantReferralFreeMonth({
    userId: ref.userId,
    referralEventId: event.id,
    role: "referrer",
  });

  return { attached: true, referralEventId: event.id };
}

export async function getReferralDashboard(userId: string): Promise<ReferralDashboard> {
  const codeRow = await getOrCreateReferralCodeForOwner(userId);
  const events = await prisma.referralEvent.findMany({
    where: { referralCodeId: codeRow.id },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  const referredRestaurants = events.filter((e) => e.convertedUserId).length;
  const earnedFreeMonths = await countEarnedReferralMonths(userId);

  const billingScope = await billingEventListWhereForOwner(userId);
  const rewardEvents = await prisma.billingEvent.findMany({
    where: { AND: [billingScope, { eventType: REFERRAL_BILLING_EVENT }] },
    select: { metadataJson: true },
    take: 500,
  });
  const rewardedEventIds = new Set(
    rewardEvents
      .map((e) => (e.metadataJson as Record<string, unknown> | null)?.referralEventId)
      .filter((id): id is string => typeof id === "string"),
  );

  return {
    code: codeRow.code,
    link: buildReferralPublicUrl(codeRow.code),
    referredRestaurants,
    earnedFreeMonths,
    recentEvents: events.map((e) => ({
      id: e.id,
      email: e.email,
      source: e.source,
      convertedUserId: e.convertedUserId,
      createdAt: e.createdAt,
      rewardsGranted: rewardedEventIds.has(e.id),
    })),
  };
}
