import { createHash } from "node:crypto";
import { toJsonValue } from "@/lib/prisma/json";

import { prisma } from "@/lib/prisma";
import { sendPagerDutyEvent } from "@/lib/storefront/pagerduty-events";
import { pagerDutyCustomDetailsWithRunbooks } from "@/lib/storefront/experiment-runbook-links";
import {
  evaluatePostPublishRegression,
  isPostPublishGuardEnabled,
  readPostPublishGuard,
  seedPostPublishGuard,
} from "@/lib/storefront/theme-experiment-post-publish-guard";
import { getThemeExperimentArmMetrics } from "@/services/storefront/theme-experiment-analytics-service";
import { logger } from "@/lib/logger";

function writeGuardToJson(raw: unknown, guard: NonNullable<ReturnType<typeof readPostPublishGuard>>) {
  const base =
    raw && typeof raw === "object" && !Array.isArray(raw)
      ? { ...(raw as Record<string, unknown>) }
      : {};
  base.postPublishGuard = guard;
  return base;
}

export function hashRollbackToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/** Call after publish — capture pre-publish baseline metrics. */
export async function seedPostPublishGuardForStorefront(input: {
  storefrontId: string;
  themeExperimentJson: unknown;
}): Promise<void> {
  if (!isPostPublishGuardEnabled()) return;

  const metrics = await getThemeExperimentArmMetrics(input.storefrontId, 7, input.themeExperimentJson);
  const published = metrics.find((m) => m.arm === "published");
  const draft = metrics.find((m) => m.arm === "draft");
  const rate = published?.conversionRatePercent ?? draft?.conversionRatePercent ?? 0;
  const checkouts = published?.checkouts ?? draft?.checkouts ?? 0;
  const token = createHash("sha256")
    .update(`${input.storefrontId}:${Date.now()}`)
    .digest("hex")
    .slice(0, 32);

  const merged = seedPostPublishGuard({
    previousRaw: input.themeExperimentJson,
    conversionRate: rate / 100,
    revenueProxyPp: 0,
    checkouts,
    rollbackTokenHash: hashRollbackToken(token),
  });

  await prisma.storefrontSettings.update({
    where: { id: input.storefrontId },
    data: { themeExperimentJson: merged as object },
  });
}

/** O5 — hourly regression check in 24h post-publish window. */
export async function runPostPublishGuardCycle(): Promise<{
  checked: number;
  regressions: number;
}> {
  if (!isPostPublishGuardEnabled()) return { checked: 0, regressions: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, themeExperimentJson: true },
  });

  let checked = 0;
  let regressions = 0;

  for (const sf of storefronts) {
    const guard = readPostPublishGuard(sf.themeExperimentJson);
    if (!guard) continue;

    const hoursSince =
      (Date.now() - new Date(guard.baseline.at).getTime()) / (60 * 60 * 1000);
    if (hoursSince > guard.windowHours) continue;

    const metrics = await getThemeExperimentArmMetrics(sf.id, 1, sf.themeExperimentJson);
    const published = metrics.find((m) => m.arm === "published");
    const rate = (published?.conversionRatePercent ?? 0) / 100;

    const next = evaluatePostPublishRegression({
      guard,
      currentConversionRate: rate,
      currentCheckouts: published?.checkouts ?? 0,
    });

    checked++;
    if (next.rollbackPending) {
      regressions++;
      await sendPagerDutyEvent({
        severity: "warning",
        dedupKey: `post-publish-regression-${sf.storeSlug}`,
        summary: `Post-publish regression z=${next.zScore} (${sf.storeSlug})`,
        source: "kitchenos-post-publish-guard",
        customDetails: pagerDutyCustomDetailsWithRunbooks(sf.storeSlug, {
          z_score: next.zScore,
          baseline_rate: guard.baseline.conversionRate,
          current_rate: rate,
        }),
      });
      logger.warn("post_publish_regression_detected", {
        storeSlug: sf.storeSlug,
        zScore: next.zScore,
      });

      const rollbackToken = createHash("sha256")
        .update(`${sf.id}:rollback:${Date.now()}`)
        .digest("hex")
        .slice(0, 32);
      next.rollbackTokenHash = hashRollbackToken(rollbackToken);

      const { sendExperimentRollbackSlackMessage } = await import(
        "@/lib/storefront/experiment-slack-approval"
      );
      void sendExperimentRollbackSlackMessage({
        storeSlug: sf.storeSlug,
        zScore: next.zScore,
        partialToken: rollbackToken,
        fullToken: rollbackToken,
        keepToken: rollbackToken,
      });
    }

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: writeGuardToJson(sf.themeExperimentJson, next) as object },
    });
  }

  return { checked, regressions };
}
