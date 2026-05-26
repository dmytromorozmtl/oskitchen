import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  homotopyTypeTheoreticAnchorL13FromL12Stack,
  isHypergraphL13HomotopyTypeTheoreticAnchorEnabled,
} from "@/lib/compliance/hypergraph-l13-homotopy-type-theoretic-anchor";
import { categoricalQuantumAnchorL12FromL11Stack } from "@/lib/compliance/hypergraph-l12-categorical-quantum-anchor";
import { topologicalFaultTolerantAnchorL11FromL10Stack } from "@/lib/compliance/hypergraph-l11-topological-fault-tolerant-anchor";
import { applyThemeExperimentPoll, coalesceThemeExperimentJson, toInputJsonValue, type ThemeExperimentJson } from "@/lib/prisma/json";

export async function runHypergraphL13HomotopyTypeTheoreticAnchorCycle(): Promise<{ anchored: number }> {
  if (!isHypergraphL13HomotopyTypeTheoreticAnchorEnabled()) return { anchored: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 100,
  });

  let anchored = 0;
  for (const sf of storefronts) {
    let json = coalesceThemeExperimentJson(sf.themeExperimentJson);
    json = applyThemeExperimentPoll(json, topologicalFaultTolerantAnchorL11FromL10Stack);
    json = applyThemeExperimentPoll(json, categoricalQuantumAnchorL12FromL11Stack);
    const result = homotopyTypeTheoreticAnchorL13FromL12Stack(json);
    if (result.anchor) {
      await prisma.storefrontSettings.update({
        where: { id: sf.id },
        data: { themeExperimentJson: result.json as object },
      });
      anchored++;
    }
  }

  logger.info("hypergraph_l13_homotopy_type_theoretic_anchor_cycle", { anchored });
  return { anchored };
}
