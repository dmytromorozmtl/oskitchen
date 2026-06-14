import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  holographicAnchorL6FromL5Stack,
  isHypergraphL6HolographicAnchorEnabled,
} from "@/lib/compliance/hypergraph-l6-holographic-anchor";
import { compositionalAnchorL5FromL4Stack } from "@/lib/compliance/hypergraph-l5-compositional-anchor";
import { metaAnchorL4FromL3Stack } from "@/lib/compliance/hypergraph-l4-meta-anchor";
import { recursiveAnchorL3FromEvolution } from "@/lib/compliance/hypergraph-l3-recursive-anchor";
import { evolveHypergraphFromVerifiedDag } from "@/lib/compliance/hypergraph-evolution";
import { rollupHypergraphFromRecursive } from "@/lib/compliance/hypergraph-zk-dna-rollup";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson } from "@/lib/prisma/json";

export async function runHypergraphL6HolographicAnchorCycle(): Promise<{ anchored: number }> {
  if (!isHypergraphL6HolographicAnchorEnabled()) return { anchored: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 100,
  });

  let anchored = 0;
  for (const sf of storefronts) {
    let json = coalesceThemeExperimentJson(sf.themeExperimentJson);
    json = applyThemeExperimentPoll(json, rollupHypergraphFromRecursive);
    json = applyThemeExperimentPoll(json, evolveHypergraphFromVerifiedDag);
    json = applyThemeExperimentPoll(json, recursiveAnchorL3FromEvolution);
    json = applyThemeExperimentPoll(json, metaAnchorL4FromL3Stack);
    json = applyThemeExperimentPoll(json, compositionalAnchorL5FromL4Stack);
    const { json: l6Json, anchor } = holographicAnchorL6FromL5Stack(json);
    if (!anchor) continue;
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: l6Json as object },
    });
    anchored++;
  }

  logger.info("hypergraph_l6_holographic_anchor_cycle", { anchored });
  return { anchored };
}
