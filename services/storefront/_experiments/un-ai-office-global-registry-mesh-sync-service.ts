import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  isUnAiOfficeGlobalRegistryMeshEnabled,
  mergeUnAiOfficeGlobalRegistryMesh,
  pollUnAiOfficeGlobalRegistryMesh,
  readUnAiOfficeGlobalRegistryMesh,
} from "@/lib/compliance/un-ai-office-global-registry-mesh";
import { pollOecdStateAgTransparencyMesh } from "@/lib/compliance/oecd-state-ag-ai-transparency-mesh";
import { pollEuAiActArt71PmmFeed } from "@/lib/compliance/eu-ai-act-art71-pmm-live";
import { publishUnAiOfficeRegistryRelayEvent } from "@/lib/experiment-production/mesh-kafka-relay";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson, toJsonValue } from "@/lib/prisma/json";

export async function runUnAiOfficeGlobalRegistryMeshSyncCycle(): Promise<{ synced: number }> {
  if (!isUnAiOfficeGlobalRegistryMeshEnabled()) return { synced: 0 };

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
    const fed = pollUnAiOfficeGlobalRegistryMesh(json);
    json = toJsonValue(fed.json);

    const last = fed.snap.events[fed.snap.events.length - 1];
    const relay = await publishUnAiOfficeRegistryRelayEvent({
      at: new Date().toISOString(),
      storeSlug: sf.storeSlug,
      eventId: last?.eventId ?? `un-${Date.now()}`,
      regionId: last?.regionId ?? "un_hq_ny",
      globalRecordId: last?.globalRecordId ?? "un-sim",
    });

    const prev = readUnAiOfficeGlobalRegistryMesh(json);
    if (prev) {
      json = toJsonValue(mergeUnAiOfficeGlobalRegistryMesh(json, { ...prev, kafkaRelayed: relay.published }));
    }

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(json) },
    });
    synced++;
  }

  logger.info("un_ai_office_global_registry_mesh_sync_cycle", { synced });
  return { synced };
}
