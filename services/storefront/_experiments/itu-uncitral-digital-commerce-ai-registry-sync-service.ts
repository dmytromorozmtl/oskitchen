import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  isItuUncitralDigitalCommerceAiRegistryEnabled,
  mergeItuUncitralDigitalCommerceAiRegistry,
  pollItuUncitralDigitalCommerceRegistry,
  readItuUncitralDigitalCommerceAiRegistry,
} from "@/lib/compliance/itu-uncitral-digital-commerce-ai-registry";
import { pollWtoUpuCrossBorderAiTradeRegistry } from "@/lib/compliance/wto-upu-cross-border-ai-trade-registry";
import { pollIcaoImoAviationRegistry } from "@/lib/compliance/icao-imo-ai-aviation-registry";
import { pollUnAiOfficeGlobalRegistryMesh } from "@/lib/compliance/un-ai-office-global-registry-mesh";
import { pollOecdStateAgTransparencyMesh } from "@/lib/compliance/oecd-state-ag-ai-transparency-mesh";
import { pollEuAiActArt71PmmFeed } from "@/lib/compliance/eu-ai-act-art71-pmm-live";
import { publishItuUncitralDigitalCommerceRelayEvent } from "@/lib/experiment-production/mesh-kafka-relay";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson, toJsonValue } from "@/lib/prisma/json";

export async function runItuUncitralDigitalCommerceAiRegistrySyncCycle(): Promise<{ synced: number }> {
  if (!isItuUncitralDigitalCommerceAiRegistryEnabled()) return { synced: 0 };

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
    json = applyThemeExperimentPoll(json, pollIcaoImoAviationRegistry);
    json = applyThemeExperimentPoll(json, pollWtoUpuCrossBorderAiTradeRegistry);
    const fed = pollItuUncitralDigitalCommerceRegistry(json);
    json = toJsonValue(fed.json);

    const last = fed.snap.events[fed.snap.events.length - 1];
    const relay = await publishItuUncitralDigitalCommerceRelayEvent({
      at: new Date().toISOString(),
      storeSlug: sf.storeSlug,
      eventId: last?.eventId ?? `commerce-${Date.now()}`,
      bodyId: last?.bodyId ?? "itu_t_geneva",
      commerceRecordId: last?.commerceRecordId ?? "commerce-sim",
    });

    const prev = readItuUncitralDigitalCommerceAiRegistry(json);
    if (prev) {
      json = toJsonValue(mergeItuUncitralDigitalCommerceAiRegistry(json, { ...prev, kafkaRelayed: relay.published }));
    }

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(json) },
    });
    synced++;
  }

  logger.info("itu_uncitral_digital_commerce_ai_registry_sync_cycle", { synced });
  return { synced };
}
