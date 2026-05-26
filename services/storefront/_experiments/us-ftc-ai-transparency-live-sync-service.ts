import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  isUsFtcAiTransparencyLiveEnabled,
  mergeUsFtcAiTransparencyLive,
  pollUsFtcTransparencyFeed,
  readUsFtcAiTransparencyLive,
} from "@/lib/compliance/us-ftc-ai-transparency-live-feed";
import { pollEuAiActArt71PmmFeed } from "@/lib/compliance/eu-ai-act-art71-pmm-live";
import { pollNistRmfControlFeed } from "@/lib/compliance/nist-ai-rmf-live-control-feed";
import { publishUsFtcTransparencyRelayEvent } from "@/lib/experiment-production/mesh-kafka-relay";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson, toJsonValue } from "@/lib/prisma/json";

export async function runUsFtcAiTransparencyLiveSyncCycle(): Promise<{ synced: number }> {
  if (!isUsFtcAiTransparencyLiveEnabled()) return { synced: 0 };

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
    json = applyThemeExperimentPoll(json, pollEuAiActArt71PmmFeed);
    const fed = pollUsFtcTransparencyFeed(json);
    json = toJsonValue(fed.json);

    const last = fed.snap.events[fed.snap.events.length - 1];
    const relay = await publishUsFtcTransparencyRelayEvent({
      at: new Date().toISOString(),
      storeSlug: sf.storeSlug,
      eventId: last?.eventId ?? `ftc-${Date.now()}`,
      transparencyRecordId: last?.transparencyRecordId ?? "ftc-sim",
      consumerHarmRisk: last?.consumerHarmRisk ?? "low",
    });

    const prev = readUsFtcAiTransparencyLive(json);
    if (prev) {
      json = toJsonValue(mergeUsFtcAiTransparencyLive(json, { ...prev, kafkaRelayed: relay.published }));
    }

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(json) },
    });
    synced++;
  }

  logger.info("us_ftc_ai_transparency_live_sync_cycle", { synced });
  return { synced };
}
