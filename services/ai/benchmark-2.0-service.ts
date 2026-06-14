import type { Prisma } from "@prisma/client";

import {
  BENCHMARK_PREMIUM_PRICE_USD,
  buildIndustryReportCatalog,
} from "@/lib/ai/benchmark-2.0-builders";
import type {
  BenchmarkPremiumDashboard,
  BenchmarkPremiumSettings,
  BenchmarkPremiumSubscription,
} from "@/lib/ai/benchmark-2.0-types";
import {
  mergeBenchmarkPremiumSettings,
  readBenchmarkPremiumSettings,
} from "@/lib/ai/benchmark-2.0-storage";
import { isStripeCheckoutReady } from "@/lib/billing/stripe-config";
import { prisma } from "@/lib/prisma";
import { resolveWorkspaceOwnerUserId } from "@/lib/scope/resolve-owner-workspace-id";
import { loadBenchmarkDashboard } from "@/services/ai/benchmark-dashboard";
import { loadSubscription, type SubscriptionSnapshot } from "@/services/billing/subscription-service";

export type { BenchmarkPremiumDashboard } from "@/lib/ai/benchmark-2.0-types";

const TRIAL_DAYS = 14;

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setUTCDate(next.getUTCDate() + days);
  return next;
}

export function resolveBenchmarkPremiumAccess(input: {
  settings: BenchmarkPremiumSettings;
  subscription: SubscriptionSnapshot;
  now?: Date;
}): { isPremium: boolean; subscription: BenchmarkPremiumSubscription } {
  const now = input.now ?? new Date();
  const settings = input.settings;
  const sub = input.subscription;

  const includedWithPlan =
    (sub.plan === "PRO" || sub.plan === "TEAM") &&
    (sub.status === "ACTIVE" || sub.status === "TRIALING");

  let status = settings.status ?? "none";
  if (includedWithPlan && status === "none") {
    status = "active";
  }

  if (settings.currentPeriodEnd) {
    const end = new Date(settings.currentPeriodEnd);
    if (end < now && status === "active") {
      status = "cancelled";
    }
  }

  const addonActive = status === "active" || status === "trialing";
  const isPremium = includedWithPlan || addonActive;

  let displayStatus: BenchmarkPremiumSubscription["status"] = status;
  if (isPremium && displayStatus === "none") {
    displayStatus = "active";
  }
  if (!isPremium && displayStatus === "active") {
    displayStatus = "cancelled";
  }

  const subscription: BenchmarkPremiumSubscription = {
    status: displayStatus,
    planId: isPremium ? "benchmark_premium_monthly" : settings.planId ?? null,
    priceUsdMonthly: BENCHMARK_PREMIUM_PRICE_USD,
    subscribedAt: settings.subscribedAt ?? (includedWithPlan ? sub.currentPeriodStart?.toISOString() ?? null : null),
    currentPeriodEnd:
      settings.currentPeriodEnd ?? sub.currentPeriodEnd?.toISOString() ?? null,
    includedWithPlan,
    source: includedWithPlan ? "pro_bundle" : addonActive ? "addon" : "none",
  };

  return { isPremium, subscription };
}

export async function loadBenchmarkPremiumDashboard(
  workspaceId: string,
  cohortId?: string,
): Promise<BenchmarkPremiumDashboard> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const [benchmark, subscription, kitchen] = await Promise.all([
    loadBenchmarkDashboard(workspaceId, cohortId),
    loadSubscription(ownerUserId),
    prisma.kitchenSettings.findUnique({
      where: { userId: ownerUserId },
      select: { settingsCenterJson: true },
    }),
  ]);

  const premiumSettings = readBenchmarkPremiumSettings(kitchen?.settingsCenterJson ?? null);
  const { isPremium, subscription: premiumSub } = resolveBenchmarkPremiumAccess({
    settings: premiumSettings,
    subscription,
  });

  const reports = buildIndustryReportCatalog(benchmark.data, isPremium);

  return {
    workspaceId,
    isPremium,
    subscription: premiumSub,
    reports,
    benchmark,
    stripeCheckoutAvailable: isStripeCheckoutReady(),
  };
}

export async function activateBenchmarkPremiumTrial(workspaceId: string): Promise<BenchmarkPremiumDashboard> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });

  const center =
    kitchen?.settingsCenterJson && typeof kitchen.settingsCenterJson === "object" && !Array.isArray(kitchen.settingsCenterJson)
      ? { ...(kitchen.settingsCenterJson as Record<string, unknown>) }
      : {};

  const existing = readBenchmarkPremiumSettings(center);
  const now = new Date();
  const trialEnd = addDays(now, TRIAL_DAYS);

  const nextSettings: BenchmarkPremiumSettings = {
    ...existing,
    status: "trialing",
    planId: "benchmark_premium_monthly",
    subscribedAt: existing.subscribedAt ?? now.toISOString(),
    currentPeriodEnd: trialEnd.toISOString(),
  };

  await prisma.kitchenSettings.update({
    where: { userId: ownerUserId },
    data: {
      settingsCenterJson: mergeBenchmarkPremiumSettings(center, nextSettings) as Prisma.InputJsonValue,
    },
  });

  return loadBenchmarkPremiumDashboard(workspaceId);
}

export async function activateBenchmarkPremiumSubscription(
  workspaceId: string,
): Promise<BenchmarkPremiumDashboard> {
  const ownerUserId = await resolveWorkspaceOwnerUserId(workspaceId);
  if (!ownerUserId) {
    throw new Error(`Workspace not found: ${workspaceId}`);
  }

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId: ownerUserId },
    select: { settingsCenterJson: true },
  });

  const center =
    kitchen?.settingsCenterJson && typeof kitchen.settingsCenterJson === "object" && !Array.isArray(kitchen.settingsCenterJson)
      ? { ...(kitchen.settingsCenterJson as Record<string, unknown>) }
      : {};

  const existing = readBenchmarkPremiumSettings(center);
  const now = new Date();
  const periodEnd = addDays(now, 30);

  const nextSettings: BenchmarkPremiumSettings = {
    ...existing,
    status: "active",
    planId: "benchmark_premium_monthly",
    subscribedAt: now.toISOString(),
    currentPeriodEnd: periodEnd.toISOString(),
  };

  await prisma.kitchenSettings.update({
    where: { userId: ownerUserId },
    data: {
      settingsCenterJson: mergeBenchmarkPremiumSettings(center, nextSettings) as Prisma.InputJsonValue,
    },
  });

  return loadBenchmarkPremiumDashboard(workspaceId);
}
