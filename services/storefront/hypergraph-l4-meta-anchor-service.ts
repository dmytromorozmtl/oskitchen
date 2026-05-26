import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import { metaAnchorL4FromL3Stack, isHypergraphL4MetaAnchorEnabled } from "@/lib/compliance/hypergraph-l4-meta-anchor";
import { recursiveAnchorL3FromEvolution } from "@/lib/compliance/hypergraph-l3-recursive-anchor";
import { evolveHypergraphFromVerifiedDag } from "@/lib/compliance/hypergraph-evolution";
import { rollupHypergraphFromRecursive } from "@/lib/compliance/hypergraph-zk-dna-rollup";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson } from "@/lib/prisma/json";

export async function runHypergraphL4MetaAnchorCycle(): Promise<{ anchored: number }> {
  if (!isHypergraphL4MetaAnchorEnabled()) return { anchored: 0 };

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
    const { json: l4Json, anchor } = metaAnchorL4FromL3Stack(json);
    if (!anchor) continue;
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: l4Json as object },
    });
    anchored++;
  }

  logger.info("hypergraph_l4_meta_anchor_cycle", { anchored });
  return { anchored };
}
