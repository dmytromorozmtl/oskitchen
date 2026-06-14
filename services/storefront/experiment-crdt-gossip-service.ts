import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import { gcCrdtTombstones, isCrdtGossipBusEnabled, localEdgeRegionId } from "@/lib/storefront/theme-experiment-crdt-gossip";
import { getThemeExperimentVersion } from "@/lib/storefront/theme-experiment-version";
import { logger } from "@/lib/logger";

/** O3 — tombstone GC + gossip heartbeat in JSON. */
export async function runCrdtTombstoneGcCycle(): Promise<{ gc: number }> {
  if (!isCrdtGossipBusEnabled()) return { gc: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, themeExperimentJson: true },
  });

  let gc = 0;
  const region = localEdgeRegionId() ?? "local";

  for (const sf of storefronts) {
    const merged = gcCrdtTombstones(sf.themeExperimentJson);
    const version = getThemeExperimentVersion(merged);
    const { mergeGossipIntoJson } = await import("@/lib/storefront/theme-experiment-crdt-gossip");
    const { json } = mergeGossipIntoJson(merged, {
      region,
      vector: version,
      at: new Date().toISOString(),
    });

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: json as object },
    });
    gc++;
    logger.info("experiment_crdt_tombstone_gc", { storeSlug: sf.storeSlug, version });
  }

  return { gc };
}
