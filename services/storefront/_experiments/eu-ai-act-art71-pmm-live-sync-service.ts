import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  ingestEuAiActArt71PmmEvent,
  isEuAiActArt71PmmLiveEnabled,
  mergeEuAiActArt71PmmLive,
  pollEuAiActArt71PmmFeed,
  readEuAiActArt71PmmLive,
} from "@/lib/compliance/eu-ai-act-art71-pmm-live";
import { pollEuRegistryStream } from "@/lib/compliance/eu-ai-act-live-registry";
import { pollNistRmfControlFeed } from "@/lib/compliance/nist-ai-rmf-live-control-feed";
import { publishEuAiActPmmRelayEvent } from "@/lib/experiment-production/mesh-kafka-relay";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson, toJsonValue } from "@/lib/prisma/json";

export async function runEuAiActArt71PmmLiveSyncCycle(): Promise<{ synced: number }> {
  if (!isEuAiActArt71PmmLiveEnabled()) return { synced: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, themeExperimentJson: true },
    take: 100,
  });

  let synced = 0;
  for (const sf of storefronts) {
    let json = coalesceThemeExperimentJson(sf.themeExperimentJson);
    json = applyThemeExperimentPoll(json, pollEuRegistryStream);
    json = applyThemeExperimentPoll(json, pollNistRmfControlFeed);
    const fed = pollEuAiActArt71PmmFeed(json);
    json = toJsonValue(fed.json);

    const relay = await publishEuAiActPmmRelayEvent({
      at: new Date().toISOString(),
      storeSlug: sf.storeSlug,
      eventId: fed.snap.events[fed.snap.events.length - 1]?.eventId ?? `pmm-${Date.now()}`,
      incidentId: fed.snap.events[fed.snap.events.length - 1]?.incidentId ?? "pmm-sim",
      severity: fed.snap.events[fed.snap.events.length - 1]?.severity ?? "informational",
      status: fed.snap.events[fed.snap.events.length - 1]?.status ?? "resolved",
    });

    const prev = readEuAiActArt71PmmLive(json);
    if (prev) {
      json = toJsonValue(mergeEuAiActArt71PmmLive(json, { ...prev, kafkaRelayed: relay.published }));
    }

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(json) },
    });
    synced++;
  }

  logger.info("eu_ai_act_art71_pmm_live_sync_cycle", { synced });
  return { synced };
}
