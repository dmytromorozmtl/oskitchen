import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import { throttleGa4CronBatch, isGa4ApiCircuitOpen } from "@/lib/storefront/ga4-api-guard";
import { isGa4DataApiConfigured } from "@/lib/storefront/ga4-data-api";
import { notifyGa4ParityDrift } from "@/lib/storefront/theme-experiment-ga4-parity-alerts";
import { parseThemeExperimentConfig } from "@/lib/storefront/theme-experiment";
import { isThemeExperimentPipelineActive } from "@/lib/storefront/theme-experiment-pipeline";
import { refreshGa4ParityForStorefront } from "@/services/storefront/ga4-parity-refresh-service";

const PARITY_LOOKBACK_DAYS = 7;
const DEDUPE_HOURS = 24;

async function recentlyAlertedGa4Drift(storeSlug: string): Promise<boolean> {
  const since = new Date(Date.now() - DEDUPE_HOURS * 60 * 60 * 1000);
  const hit = await prisma.auditLog.findFirst({
    where: {
      action: "storefront.experiment.ga4_parity_drift",
      createdAt: { gte: since },
      metadataJson: {
        path: ["storeSlug"],
        equals: storeSlug,
      },
    },
    select: { id: true },
  });
  return Boolean(hit);
}

async function recordGa4DriftAudit(input: {
  storefrontId: string;
  storeSlug: string;
  parityScorePp: number | null;
  streakCount: number;
}) {
  const { auditLog } = await import("@/services/audit/audit-service");
  await auditLog({
    actor: { userId: null, email: null },
    action: "storefront.experiment.ga4_parity_drift",
    category: "SETTINGS",
    source: "SYSTEM",
    severity: "WARNING",
    entity: { type: "storefront_settings", id: input.storefrontId, label: input.storeSlug },
    metadata: {
      storeSlug: input.storeSlug,
      parityScorePp: input.parityScorePp,
      streakCount: input.streakCount,
    },
  });
}

export async function monitorActiveExperimentGa4Parity(): Promise<{
  checked: number;
  refreshed: number;
  driftAlerts: number;
  skippedDedupe: number;
  skippedNoConfig: number;
  circuitOpen: boolean;
}> {
  if (!isGa4DataApiConfigured()) {
    return {
      checked: 0,
      refreshed: 0,
      driftAlerts: 0,
      skippedDedupe: 0,
      skippedNoConfig: 0,
      circuitOpen: isGa4ApiCircuitOpen(),
    };
  }

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true, googleAnalyticsPropertyId: { not: null } },
    select: {
      id: true,
      storeSlug: true,
      workspaceId: true,
      themeExperimentJson: true,
      googleAnalyticsPropertyId: true,
    },
  });

  let checked = 0;
  let refreshed = 0;
  let driftAlerts = 0;
  let skippedDedupe = 0;
  let skippedNoConfig = 0;
  let index = 0;

  for (const sf of storefronts) {
    const exp = parseThemeExperimentConfig(sf.themeExperimentJson);
    if (!exp?.enabled) continue;
    if (!sf.googleAnalyticsPropertyId?.trim()) {
      skippedNoConfig++;
      continue;
    }

    const pipelineActive = await isThemeExperimentPipelineActive({
      workspaceId: sf.workspaceId,
      themeExperimentJson: sf.themeExperimentJson,
    });
    if (!pipelineActive) continue;

    checked++;
    await throttleGa4CronBatch(index++);

    const latest = await prisma.storefrontSettings.findUnique({
      where: { id: sf.id },
      select: { themeExperimentJson: true, googleAnalyticsPropertyId: true },
    });
    if (!latest) continue;

    const result = await refreshGa4ParityForStorefront({
      storefrontId: sf.id,
      themeExperimentJson: latest.themeExperimentJson,
      googleAnalyticsPropertyId: latest.googleAnalyticsPropertyId,
      days: PARITY_LOOKBACK_DAYS,
      force: true,
      recordHistory: true,
      updateDriftStreak: true,
    });

    if (result.refreshedGa4) refreshed++;

    if (!result.shouldAlertDrift) continue;

    if (await recentlyAlertedGa4Drift(sf.storeSlug)) {
      skippedDedupe++;
      continue;
    }

    await notifyGa4ParityDrift({
      storefrontId: sf.id,
      storeSlug: sf.storeSlug,
      workspaceId: sf.workspaceId,
      days: PARITY_LOOKBACK_DAYS,
      score: result.score,
      streakCount: result.driftStreakCount,
    });
    await recordGa4DriftAudit({
      storefrontId: sf.id,
      storeSlug: sf.storeSlug,
      parityScorePp: result.score.parityScorePp,
      streakCount: result.driftStreakCount,
    });
    driftAlerts++;
  }

  return {
    checked,
    refreshed,
    driftAlerts,
    skippedDedupe,
    skippedNoConfig,
    circuitOpen: isGa4ApiCircuitOpen(),
  };
}
