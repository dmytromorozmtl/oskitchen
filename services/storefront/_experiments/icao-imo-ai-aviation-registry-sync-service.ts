import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  isIcaoImoAiAviationRegistryEnabled,
  mergeIcaoImoAiAviationRegistry,
  pollIcaoImoAviationRegistry,
  readIcaoImoAiAviationRegistry,
} from "@/lib/compliance/icao-imo-ai-aviation-registry";
import { pollUnAiOfficeGlobalRegistryMesh } from "@/lib/compliance/un-ai-office-global-registry-mesh";
import { pollOecdStateAgTransparencyMesh } from "@/lib/compliance/oecd-state-ag-ai-transparency-mesh";
import { pollEuAiActArt71PmmFeed } from "@/lib/compliance/eu-ai-act-art71-pmm-live";
import { publishIcaoImoAviationRegistryRelayEvent } from "@/lib/experiment-production/mesh-kafka-relay";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson, toJsonValue } from "@/lib/prisma/json";

export async function runIcaoImoAiAviationRegistrySyncCycle(): Promise<{ synced: number }> {
  if (!isIcaoImoAiAviationRegistryEnabled()) return { synced: 0 };

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
    const fed = pollIcaoImoAviationRegistry(json);
    json = toJsonValue(fed.json);

    const last = fed.snap.events[fed.snap.events.length - 1];
    const relay = await publishIcaoImoAviationRegistryRelayEvent({
      at: new Date().toISOString(),
      storeSlug: sf.storeSlug,
      eventId: last?.eventId ?? `aviation-${Date.now()}`,
      authorityId: last?.authorityId ?? "icao_montreal",
      aviationRecordId: last?.aviationRecordId ?? "av-sim",
    });

    const prev = readIcaoImoAiAviationRegistry(json);
    if (prev) {
      json = toJsonValue(mergeIcaoImoAiAviationRegistry(json, { ...prev, kafkaRelayed: relay.published }));
    }

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(json) },
    });
    synced++;
  }

  logger.info("icao_imo_ai_aviation_registry_sync_cycle", { synced });
  return { synced };
}
