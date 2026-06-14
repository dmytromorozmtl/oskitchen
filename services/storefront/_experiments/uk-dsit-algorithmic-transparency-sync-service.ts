import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  ingestUkDsitTransparencyEvent,
  isUkDsitAlgorithmicTransparencyEnabled,
  mergeUkDsitAlgorithmicTransparency,
  readUkDsitAlgorithmicTransparency,
} from "@/lib/compliance/uk-dsit-algorithmic-transparency";
import { pollUkDsitStreamEvent } from "@/lib/experiment-production/uk-dsit-api-client";
import { publishUkDsitRelayEvent } from "@/lib/experiment-production/mesh-kafka-relay";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson, toJsonValue } from "@/lib/prisma/json";

export async function runUkDsitAlgorithmicTransparencySyncCycle(): Promise<{ synced: number }> {
  if (!isUkDsitAlgorithmicTransparencyEnabled()) return { synced: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, themeExperimentJson: true },
    take: 100,
  });

  const poll = await pollUkDsitStreamEvent();
  let synced = 0;

  for (const sf of storefronts) {
    let json = coalesceThemeExperimentJson(sf.themeExperimentJson);
    if (poll.ok && poll.event) {
      const { json: merged } = ingestUkDsitTransparencyEvent(json, {
        source: "poll",
        eventId: poll.event.eventId,
        transparencyRecordId: poll.event.transparencyRecordId,
        algorithmicSystemId: poll.event.algorithmicSystemId,
        disclosureLevel: poll.event.disclosureLevel,
        publishedToDsit: true,
      });
      json = toJsonValue(merged);

      const relay = await publishUkDsitRelayEvent({
        at: new Date().toISOString(),
        storeSlug: sf.storeSlug,
        eventId: poll.event.eventId,
        transparencyRecordId: poll.event.transparencyRecordId,
        disclosureLevel: poll.event.disclosureLevel,
      });

      const prev = readUkDsitAlgorithmicTransparency(json);
      if (prev) {
        json = toJsonValue(mergeUkDsitAlgorithmicTransparency(json, { ...prev, kafkaRelayed: relay.published }));
      }
    } else {
      const { json: merged } = ingestUkDsitTransparencyEvent(json, {
        source: "sse",
        transparencyRecordId: `uk-tr-${sf.storeSlug}`,
        algorithmicSystemId: process.env.UK_DSIT_ALGORITHMIC_SYSTEM_ID ?? "kos-experiment",
        disclosureLevel: "enhanced",
        publishedToDsit: true,
      });
      json = toJsonValue(merged);
    }

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(json) },
    });
    synced++;
  }

  logger.info("uk_dsit_algorithmic_transparency_sync_cycle", { synced, pollOk: poll.ok });
  return { synced };
}
