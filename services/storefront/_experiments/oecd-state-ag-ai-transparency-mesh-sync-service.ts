import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  isOecdStateAgAiTransparencyMeshEnabled,
  mergeOecdStateAgAiTransparencyMesh,
  pollOecdStateAgTransparencyMesh,
  readOecdStateAgAiTransparencyMesh,
} from "@/lib/compliance/oecd-state-ag-ai-transparency-mesh";
import { pollUsFtcTransparencyFeed } from "@/lib/compliance/us-ftc-ai-transparency-live-feed";
import { pollNistRmfControlFeed } from "@/lib/compliance/nist-ai-rmf-live-control-feed";
import { publishOecdStateAgTransparencyRelayEvent } from "@/lib/experiment-production/mesh-kafka-relay";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson, toJsonValue } from "@/lib/prisma/json";

export async function runOecdStateAgAiTransparencyMeshSyncCycle(): Promise<{ synced: number }> {
  if (!isOecdStateAgAiTransparencyMeshEnabled()) return { synced: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, themeExperimentJson: true },
    take: 100,
  });

  let synced = 0;
  for (const sf of storefronts) {
    let json = coalesceThemeExperimentJson(sf.themeExperimentJson);
    for (let i = 0; i < 4; i++) {
      json = applyThemeExperimentPoll(json, pollNistRmfControlFeed);
    }
    json = applyThemeExperimentPoll(json, pollUsFtcTransparencyFeed);
    const fed = pollOecdStateAgTransparencyMesh(json);
    json = toJsonValue(fed.json);

    const last = fed.snap.events[fed.snap.events.length - 1];
    const relay = await publishOecdStateAgTransparencyRelayEvent({
      at: new Date().toISOString(),
      storeSlug: sf.storeSlug,
      eventId: last?.eventId ?? `oecd-${Date.now()}`,
      jurisdictionId: last?.jurisdictionId ?? "oecd_core",
      disclosureRecordId: last?.disclosureRecordId ?? "oecd-sim",
    });

    const prev = readOecdStateAgAiTransparencyMesh(json);
    if (prev) {
      json = toJsonValue(mergeOecdStateAgAiTransparencyMesh(json, { ...prev, kafkaRelayed: relay.published }));
    }

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(json) },
    });
    synced++;
  }

  logger.info("oecd_state_ag_ai_transparency_mesh_sync_cycle", { synced });
  return { synced };
}
