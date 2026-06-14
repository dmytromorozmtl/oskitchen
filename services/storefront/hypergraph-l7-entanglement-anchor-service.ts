import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  entanglementAnchorL7FromL6Stack,
  isHypergraphL7EntanglementAnchorEnabled,
} from "@/lib/compliance/hypergraph-l7-entanglement-anchor";
import { holographicAnchorL6FromL5Stack } from "@/lib/compliance/hypergraph-l6-holographic-anchor";
import { compositionalAnchorL5FromL4Stack } from "@/lib/compliance/hypergraph-l5-compositional-anchor";
import { metaAnchorL4FromL3Stack } from "@/lib/compliance/hypergraph-l4-meta-anchor";
import { recursiveAnchorL3FromEvolution } from "@/lib/compliance/hypergraph-l3-recursive-anchor";
import { evolveHypergraphFromVerifiedDag } from "@/lib/compliance/hypergraph-evolution";
import { rollupHypergraphFromRecursive } from "@/lib/compliance/hypergraph-zk-dna-rollup";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson } from "@/lib/prisma/json";

export async function runHypergraphL7EntanglementAnchorCycle(): Promise<{ anchored: number }> {
  if (!isHypergraphL7EntanglementAnchorEnabled()) return { anchored: 0 };

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
    json = applyThemeExperimentPoll(json, holographicAnchorL6FromL5Stack);
    const { json: l7Json, anchor } = entanglementAnchorL7FromL6Stack(json);
    if (!anchor) continue;
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: l7Json as object },
    });
    anchored++;
  }

  logger.info("hypergraph_l7_entanglement_anchor_cycle", { anchored });
  return { anchored };
}
