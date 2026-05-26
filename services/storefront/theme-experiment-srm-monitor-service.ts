import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import { parseThemeExperimentConfig } from "@/lib/storefront/theme-experiment";
import { isThemeExperimentPipelineActive } from "@/lib/storefront/theme-experiment-pipeline";
import { evaluateExperimentSrm } from "@/lib/storefront/theme-experiment-srm";
import { notifyExperimentSrmWarn } from "@/lib/storefront/theme-experiment-srm-alerts";
import { getThemeExperimentArmMetrics } from "@/services/storefront/theme-experiment-analytics-service";

const SRM_LOOKBACK_DAYS = 7;
const DEDUPE_HOURS = 24;

/** Skip webhook if we already logged an SRM warn audit for this store within 24h. */
async function recentlyAlertedSrm(storeSlug: string): Promise<boolean> {
  const since = new Date(Date.now() - DEDUPE_HOURS * 60 * 60 * 1000);
  const hit = await prisma.auditLog.findFirst({
    where: {
      action: "storefront.experiment.srm_warn",
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

async function recordSrmWarnAudit(input: {
  storefrontId: string;
  storeSlug: string;
  srm: ReturnType<typeof evaluateExperimentSrm>;
}) {
  const { auditLog } = await import("@/services/audit/audit-service");
  await auditLog({
    actor: { userId: null, email: null },
    action: "storefront.experiment.srm_warn",
    category: "SETTINGS",
    source: "SYSTEM",
    severity: "WARNING",
    entity: { type: "storefront_settings", id: input.storefrontId, label: input.storeSlug },
    metadata: {
      storeSlug: input.storeSlug,
      deltaPp: input.srm.deltaPp,
      observedDraftPercent: input.srm.observedDraftPercent,
      configuredDraftPercent: input.srm.configuredDraftPercent,
      totalExposures: input.srm.totalExposures,
    },
  });
}

export async function monitorActiveExperimentSrm(): Promise<{
  checked: number;
  warned: number;
  skippedDedupe: number;
}> {
  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: {
      id: true,
      storeSlug: true,
      workspaceId: true,
      themeExperimentJson: true,
    },
  });

  let checked = 0;
  let warned = 0;
  let skippedDedupe = 0;

  for (const sf of storefronts) {
    const exp = parseThemeExperimentConfig(sf.themeExperimentJson);
    if (!exp?.enabled) continue;
    const pipelineActive = await isThemeExperimentPipelineActive({
      workspaceId: sf.workspaceId,
      themeExperimentJson: sf.themeExperimentJson,
    });
    if (!pipelineActive) continue;

    checked++;
    const armMetrics = await getThemeExperimentArmMetrics(sf.id, SRM_LOOKBACK_DAYS);
    const srm = evaluateExperimentSrm(armMetrics, exp.trafficPercent ?? 50);
    if (!srm.warn) continue;

    if (await recentlyAlertedSrm(sf.storeSlug)) {
      skippedDedupe++;
      continue;
    }

    await notifyExperimentSrmWarn({
      storefrontId: sf.id,
      storeSlug: sf.storeSlug,
      workspaceId: sf.workspaceId,
      days: SRM_LOOKBACK_DAYS,
      srm,
    });
    await recordSrmWarnAudit({ storefrontId: sf.id, storeSlug: sf.storeSlug, srm });
    warned++;
  }

  return { checked, warned, skippedDedupe };
}
