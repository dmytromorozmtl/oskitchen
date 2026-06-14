import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  categoricalQuantumAnchorL12FromL11Stack,
  isHypergraphL12CategoricalQuantumAnchorEnabled,
} from "@/lib/compliance/hypergraph-l12-categorical-quantum-anchor";
import { topologicalFaultTolerantAnchorL11FromL10Stack } from "@/lib/compliance/hypergraph-l11-topological-fault-tolerant-anchor";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson } from "@/lib/prisma/json";

export async function runHypergraphL12CategoricalQuantumAnchorCycle(): Promise<{ anchored: number }> {
  if (!isHypergraphL12CategoricalQuantumAnchorEnabled()) return { anchored: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 100,
  });

  let anchored = 0;
  for (const sf of storefronts) {
    let json = coalesceThemeExperimentJson(sf.themeExperimentJson);
    json = applyThemeExperimentPoll(json, topologicalFaultTolerantAnchorL11FromL10Stack);
    const result = categoricalQuantumAnchorL12FromL11Stack(json);
    if (result.anchor) {
      await prisma.storefrontSettings.update({
        where: { id: sf.id },
        data: { themeExperimentJson: result.json as object },
      });
      anchored++;
    }
  }

  logger.info("hypergraph_l12_categorical_quantum_anchor_cycle", { anchored });
  return { anchored };
}
