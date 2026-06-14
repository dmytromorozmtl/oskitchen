import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  isCenCenelecDigitalProductGovernanceRegistryEnabled,
  mergeCenCenelecDigitalProductGovernanceRegistry,
  pollCenCenelecDigitalProductGovernanceRegistry,
  readCenCenelecDigitalProductGovernanceRegistry,
} from "@/lib/compliance/cen-cenelec-digital-product-governance-registry";
import { pollIsoIecAiStandardsHarmonizationRegistry } from "@/lib/compliance/iso-iec-ai-standards-harmonization-registry";
import { pollItuUncitralDigitalCommerceRegistry } from "@/lib/compliance/itu-uncitral-digital-commerce-ai-registry";
import { pollWtoUpuCrossBorderAiTradeRegistry } from "@/lib/compliance/wto-upu-cross-border-ai-trade-registry";
import { pollUnAiOfficeGlobalRegistryMesh } from "@/lib/compliance/un-ai-office-global-registry-mesh";
import { pollOecdStateAgTransparencyMesh } from "@/lib/compliance/oecd-state-ag-ai-transparency-mesh";
import { pollEuAiActArt71PmmFeed } from "@/lib/compliance/eu-ai-act-art71-pmm-live";
import { publishCenCenelecDigitalGovernanceRelayEvent } from "@/lib/experiment-production/mesh-kafka-relay";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson, toJsonValue } from "@/lib/prisma/json";

export async function runCenCenelecDigitalProductGovernanceRegistrySyncCycle(): Promise<{ synced: number }> {
  if (!isCenCenelecDigitalProductGovernanceRegistryEnabled()) return { synced: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, themeExperimentJson: true },
    take: 100,
  });

  let synced = 0;
  for (const sf of storefronts) {
    let json = coalesceThemeExperimentJson(sf.themeExperimentJson);
    json = applyThemeExperimentPoll(json, pollEuAiActArt71PmmFeed);
    json = applyThemeExperimentPoll(json, pollOecdStateAgTransparencyMesh);
    json = applyThemeExperimentPoll(json, pollUnAiOfficeGlobalRegistryMesh);
    json = applyThemeExperimentPoll(json, pollWtoUpuCrossBorderAiTradeRegistry);
    json = applyThemeExperimentPoll(json, pollItuUncitralDigitalCommerceRegistry);
    json = applyThemeExperimentPoll(json, pollIsoIecAiStandardsHarmonizationRegistry);
    const fed = pollCenCenelecDigitalProductGovernanceRegistry(json);
    json = toJsonValue(fed.json);

    const last = fed.snap.events[fed.snap.events.length - 1];
    const relay = await publishCenCenelecDigitalGovernanceRelayEvent({
      at: new Date().toISOString(),
      storeSlug: sf.storeSlug,
      eventId: last?.eventId ?? `governance-${Date.now()}`,
      bodyId: last?.bodyId ?? "cen_tc21",
      governanceRecordId: last?.governanceRecordId ?? "gov-sim",
    });

    const prev = readCenCenelecDigitalProductGovernanceRegistry(json);
    if (prev) {
      json = toJsonValue(mergeCenCenelecDigitalProductGovernanceRegistry(json, { ...prev, kafkaRelayed: relay.published }));
    }

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(json) },
    });
    synced++;
  }

  logger.info("cen_cenelec_digital_product_governance_registry_sync_cycle", { synced });
  return { synced };
}
