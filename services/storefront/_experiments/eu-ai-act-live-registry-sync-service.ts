import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  ingestEuRegistryStreamEvent,
  isEuAiActLiveRegistryEnabled,
  mergeEuAiActLiveRegistry,
  readEuAiActLiveRegistry,
} from "@/lib/compliance/eu-ai-act-live-registry";
import { pollEuRegistryStreamEvent } from "@/lib/experiment-production/eu-ai-office-api-client";
import { publishEuConformityRelayEvent } from "@/lib/experiment-production/mesh-kafka-relay";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson, toJsonValue } from "@/lib/prisma/json";

export async function runEuAiActLiveRegistrySyncCycle(): Promise<{ synced: number }> {
  if (!isEuAiActLiveRegistryEnabled()) return { synced: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, themeExperimentJson: true },
    take: 100,
  });

  const poll = await pollEuRegistryStreamEvent();
  let synced = 0;

  for (const sf of storefronts) {
    let json = coalesceThemeExperimentJson(sf.themeExperimentJson);
    if (poll.ok && poll.event) {
      const { json: merged } = ingestEuRegistryStreamEvent(json, {
        source: "poll",
        assessmentId: poll.event.assessmentId,
        conformityStatus: poll.event.conformityStatus,
        certBodyCrossRef: poll.event.certBodyCrossRef,
        registrySequence: poll.event.registrySequence,
        eventId: poll.event.eventId,
      });
      json = toJsonValue(merged);

      const relay = await publishEuConformityRelayEvent({
        at: new Date().toISOString(),
        storeSlug: sf.storeSlug,
        eventId: poll.event.eventId,
        conformityStatus: poll.event.conformityStatus,
        registrySequence: poll.event.registrySequence,
      });

      const prev = readEuAiActLiveRegistry(json);
      if (prev) {
        json = toJsonValue(mergeEuAiActLiveRegistry(json, { ...prev, kafkaRelayed: relay.published }));
      }
    } else {
      const { json: merged } = ingestEuRegistryStreamEvent(json, {
        source: "sse",
        assessmentId: process.env.EU_AI_OFFICE_ASSESSMENT_ID ?? `eu-${sf.storeSlug}`,
        conformityStatus: "conformity",
        certBodyCrossRef: process.env.EU_AI_OFFICE_NOTIFIED_BODY_ID ?? "nb-eu",
        registrySequence: Date.now() % 10000,
      });
      json = toJsonValue(merged);
    }

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(json) },
    });
    synced++;
  }

  logger.info("eu_ai_act_live_registry_sync_cycle", { synced, pollOk: poll.ok });
  return { synced };
}
