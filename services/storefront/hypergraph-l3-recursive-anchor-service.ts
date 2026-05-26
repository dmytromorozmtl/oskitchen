import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  evolveHypergraphFromVerifiedDag,
  isHypergraphEvolutionEnabled,
} from "@/lib/compliance/hypergraph-evolution";
import {
  isHypergraphL3RecursiveAnchorEnabled,
  recursiveAnchorL3FromEvolution,
} from "@/lib/compliance/hypergraph-l3-recursive-anchor";
import { rollupHypergraphFromRecursive } from "@/lib/compliance/hypergraph-zk-dna-rollup";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson } from "@/lib/prisma/json";

export async function runHypergraphL3RecursiveAnchorCycle(): Promise<{ anchored: number }> {
  if (!isHypergraphL3RecursiveAnchorEnabled()) return { anchored: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 100,
  });

  let anchored = 0;
  for (const sf of storefronts) {
    let json = coalesceThemeExperimentJson(sf.themeExperimentJson);
    const rolled = rollupHypergraphFromRecursive(json);
    json = applyThemeExperimentPoll(json, () => ({ json: rolled.json }));
    if (isHypergraphEvolutionEnabled()) {
      const evo = evolveHypergraphFromVerifiedDag(json);
      json = applyThemeExperimentPoll(json, () => ({ json: evo.json }));
    }
    const { json: l3Json, anchor } = recursiveAnchorL3FromEvolution(json);
    if (!anchor) continue;
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(l3Json) },
    });
    anchored++;
  }

  logger.info("hypergraph_l3_recursive_anchor_cycle", { anchored });
  return { anchored };
}
