import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import { logger } from "@/lib/logger";
import { purgeStorefrontThemeExperimentArmTags } from "@/lib/storefront/cdn-purge";
import {
  isEbpfTelemetryEnabled,
  markEbpfPurged,
  mergeEbpfTelemetryIntoJson,
  readEbpfTelemetry,
} from "@/lib/storefront/theme-experiment-ebpf-telemetry";
import { readExperimentArms } from "@/lib/storefront/theme-experiment-multi-arm";

export async function runEbpfAdaptiveCdnPurgeCycle(): Promise<{
  checked: number;
  purged: number;
}> {
  if (!isEbpfTelemetryEnabled()) return { checked: 0, purged: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, themeExperimentJson: true },
    take: 100,
  });

  let checked = 0;
  let purged = 0;

  for (const sf of storefronts) {
    const tel = readEbpfTelemetry(sf.themeExperimentJson);
    if (!tel?.driftDetected) continue;

    checked++;
    const arms = readExperimentArms(sf.themeExperimentJson).map((a) => a.id);
    const armIds = arms.length > 0 ? arms : ["published", "draft"];

    await purgeStorefrontThemeExperimentArmTags(sf.storeSlug);

    const next = markEbpfPurged(tel);
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: mergeEbpfTelemetryIntoJson(sf.themeExperimentJson, next) as object },
    });

    purged++;
    logger.info("ebpf_adaptive_cdn_purge", {
      storeSlug: sf.storeSlug,
      arms: armIds.join(","),
      latencyP99: tel.assignmentLatencyUsP99,
    });
  }

  return { checked, purged };
}
