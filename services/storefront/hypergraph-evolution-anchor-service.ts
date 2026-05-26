import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  evolveHypergraphFromVerifiedDag,
  isHypergraphEvolutionEnabled,
} from "@/lib/compliance/hypergraph-evolution";
import { rollupHypergraphFromRecursive } from "@/lib/compliance/hypergraph-zk-dna-rollup";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson } from "@/lib/prisma/json";

export async function runHypergraphEvolutionAnchorCycle(): Promise<{ anchored: number }> {
  if (!isHypergraphEvolutionEnabled()) return { anchored: 0 };

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
    const { json: evolved, anchor } = evolveHypergraphFromVerifiedDag(json);
    if (!anchor) continue;
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: toInputJsonValue(evolved) },
    });
    anchored++;
  }

  logger.info("hypergraph_evolution_anchor_cycle", { anchored });
  return { anchored };
}
