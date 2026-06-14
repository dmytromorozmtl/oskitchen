import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  ingestNistRmfControlStreamEvent,
  isNistAiRmfLiveControlFeedEnabled,
  mergeNistAiRmfLiveControlFeed,
  readNistAiRmfLiveControlFeed,
} from "@/lib/compliance/nist-ai-rmf-live-control-feed";
import { pollNistRmfControlStreamEvent } from "@/lib/experiment-production/nist-ai-rmf-api-client";
import { publishNistRmfRelayEvent } from "@/lib/experiment-production/mesh-kafka-relay";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson, toJsonValue } from "@/lib/prisma/json";

export async function runNistAiRmfLiveControlFeedSyncCycle(): Promise<{ synced: number }> {
  if (!isNistAiRmfLiveControlFeedEnabled()) return { synced: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, themeExperimentJson: true },
    take: 100,
  });

  const poll = await pollNistRmfControlStreamEvent();
  let synced = 0;

  for (const sf of storefronts) {
    let json = coalesceThemeExperimentJson(sf.themeExperimentJson);
    if (poll.ok && poll.event) {
      const { json: merged } = ingestNistRmfControlStreamEvent(json, {
        source: "poll",
        eventId: poll.event.eventId,
        controlId: poll.event.controlId,
        rmfFunction: poll.event.rmfFunction,
        previousStatus: "partial",
        newStatus: poll.event.newStatus,
        syncedToNistFeed: true,
      });
      json = toJsonValue(merged);

      const relay = await publishNistRmfRelayEvent({
        at: new Date().toISOString(),
        storeSlug: sf.storeSlug,
        eventId: poll.event.eventId,
        controlId: poll.event.controlId,
        rmfFunction: poll.event.rmfFunction,
      });

      const prev = readNistAiRmfLiveControlFeed(json);
      if (prev) {
        json = toJsonValue(mergeNistAiRmfLiveControlFeed(json, { ...prev, kafkaRelayed: relay.published }));
      }
    } else {
      const { json: merged } = ingestNistRmfControlStreamEvent(json, {
        source: "sse",
        controlId: `nist-${sf.storeSlug}`,
        rmfFunction: "govern",
        previousStatus: null,
        newStatus: "complete",
        syncedToNistFeed: true,
      });
      json = toJsonValue(merged);
    }

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(json) },
    });
    synced++;
  }

  logger.info("nist_ai_rmf_live_control_feed_sync_cycle", { synced, pollOk: poll.ok });
  return { synced };
}
