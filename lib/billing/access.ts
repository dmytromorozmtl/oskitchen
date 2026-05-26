import { SubscriptionStatus, type SubscriptionPlan } from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { isBillingBypassed } from "@/lib/billing/dev-bypass";
import { resolveBillingUserId } from "@/lib/billing/resolve-billing-user";
import { isSuperAdminUser } from "@/lib/platform-super-bypass";
import { ensureOwnerWorkspaceId } from "@/lib/scope/ensure-owner-workspace";

export { billingOnlyPaths, isBillingPath } from "@/lib/billing/billing-paths";

const TRIAL_DAYS = 14;

export type BillingAccess = {
  /** Full app navigation (not forced to billing only). */
  hasAppAccess: boolean;
  /** Stripe-paid or converted trial. */
  hasPaidSubscription: boolean;
  /** Local app trial window (no Stripe sub id yet). */
  inLocalTrial: boolean;
  trialDaysRemaining: number | null;
  trialEndsAt: Date | null;
  /** Owner should subscribe to continue after local trial. */
  trialExpiredNoPayment: boolean;
  plan: SubscriptionPlan;
  devBypass: boolean;
  /** Canonical platform owner / SUPER_ADMIN — unlimited entitlements. */
  platformBypass: boolean;
};

function daysBetween(from: Date, to: Date): number {
  return Math.ceil((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24));
}

export async function ensureTrialStateForUser(
  userId: string,
  plan: SubscriptionPlan = "STARTER",
): Promise<void> {
  const ends = new Date();
  ends.setDate(ends.getDate() + TRIAL_DAYS);
  const workspaceId = await ensureOwnerWorkspaceId(userId);

  await prisma.trialState.upsert({
    where: { userId },
    create: {
      userId,
      workspaceId,
      plan,
      trialStartedAt: new Date(),
      trialEndsAt: ends,
      status: "ACTIVE",
    },
    update: { workspaceId },
  });
}

export async function markTrialConverted(userId: string): Promise<void> {
  await prisma.trialState
    .updateMany({
      where: { userId, status: "ACTIVE" },
      data: {
        status: "CONVERTED",
        convertedAt: new Date(),
      },
    })
    .catch(() => undefined);
}

/**
 * Best-effort: expire local trial when the window passed and there is no Stripe subscription.
 */
async function refreshLocalTrialStatus(
  userId: string,
  hasStripeSubscription: boolean,
): Promise<void> {
  if (hasStripeSubscription) return;
  const row = await prisma.trialState.findUnique({ where: { userId } });
  if (!row || row.status !== "ACTIVE") return;
  if (row.trialEndsAt.getTime() > Date.now()) return;
  await prisma.trialState
    .update({
      where: { userId },
      data: { status: "EXPIRED" },
    })
    .catch(() => undefined);
}

export async function getBillingAccess(
  userId: string,
  options?: { workspaceId?: string | null },
): Promise<BillingAccess> {
  const billingUserId = await resolveBillingUserId(userId, options?.workspaceId);
  const profile = await prisma.userProfile.findUnique({
    where: { id: billingUserId },
    select: { email: true },
  });
  const superBypass = await isSuperAdminUser(billingUserId, profile?.email ?? null);

  if (superBypass) {
    const sub = await prisma.subscription.findUnique({ where: { userId: billingUserId } });
    return {
      hasAppAccess: true,
      hasPaidSubscription: true,
      inLocalTrial: false,
      trialDaysRemaining: null,
      trialEndsAt: null,
      trialExpiredNoPayment: false,
      plan: sub?.plan ?? "ENTERPRISE",
      devBypass: false,
      platformBypass: true,
    };
  }

  if (isBillingBypassed()) {
    const sub = await prisma.subscription.findUnique({ where: { userId: billingUserId } });
    return {
      hasAppAccess: true,
      hasPaidSubscription: true,
      inLocalTrial: false,
      trialDaysRemaining: null,
      trialEndsAt: null,
      trialExpiredNoPayment: false,
      plan: sub?.plan ?? "STARTER",
      devBypass: true,
      platformBypass: false,
    };
  }

  const sub = await prisma.subscription.findUnique({
    where: { userId: billingUserId },
    select: {
      plan: true,
      status: true,
      stripeSubscriptionId: true,
      createdAt: true,
      trialEnd: true,
    },
  });
  const plan = sub?.plan ?? "STARTER";
  const hasStripeSubscription = Boolean(sub?.stripeSubscriptionId);

  await refreshLocalTrialStatus(billingUserId, hasStripeSubscription);

  const trial = await prisma.trialState.findUnique({ where: { userId: billingUserId } });

  const hasPaidSubscription =
    sub?.status === SubscriptionStatus.ACTIVE ||
    (hasStripeSubscription && sub?.status === SubscriptionStatus.TRIALING);

  const localTrialActive =
    Boolean(trial && trial.status === "ACTIVE" && trial.trialEndsAt > new Date()) &&
    !hasStripeSubscription;

  const trialExpiredNoPayment =
    !hasPaidSubscription &&
    !localTrialActive &&
    (trial
      ? trial.status === "EXPIRED" ||
        (trial.status === "ACTIVE" && trial.trialEndsAt <= new Date())
      : false);

  // Legacy users: no trial row yet — keep access if subscription is TRIALING (app default).
  const legacyTrialing =
    !trial && sub?.status === SubscriptionStatus.TRIALING && !hasStripeSubscription;

  let trialDaysRemaining: number | null = null;
  let trialEndsAt: Date | null = null;
  if (localTrialActive && trial) {
    trialEndsAt = trial.trialEndsAt;
    trialDaysRemaining = Math.max(0, daysBetween(new Date(), trial.trialEndsAt));
  } else if (legacyTrialing) {
    const anchor = sub?.trialEnd ?? sub?.createdAt ?? new Date();
    trialEndsAt = new Date(anchor);
    if (!sub?.trialEnd) {
      trialEndsAt.setDate(trialEndsAt.getDate() + TRIAL_DAYS);
    }
    trialDaysRemaining = Math.max(0, daysBetween(new Date(), trialEndsAt));
  }

  return {
    hasAppAccess: trialExpiredNoPayment ? false : true,
    hasPaidSubscription: Boolean(hasPaidSubscription),
    inLocalTrial: localTrialActive || legacyTrialing,
    trialDaysRemaining,
    trialEndsAt,
    trialExpiredNoPayment,
    plan,
    devBypass: false,
    platformBypass: false,
  };
}
