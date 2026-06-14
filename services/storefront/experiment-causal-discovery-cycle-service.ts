import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import { logger } from "@/lib/logger";
import {
  isCausalDiscoveryAgentEnabled,
  readCausalDiscoveryAgent,
  runCausalDiscoveryClosedLoop,
} from "@/lib/storefront/theme-experiment-causal-discovery-agent";
import { readSpilloverDaily } from "@/lib/storefront/theme-experiment-causal-dag";

export async function runCausalDiscoveryMaintenanceCycle(): Promise<{
  processed: number;
  pendingApproval: number;
}> {
  if (!isCausalDiscoveryAgentEnabled()) return { processed: 0, pendingApproval: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 50,
  });

  let processed = 0;
  let pendingApproval = 0;

  for (const sf of storefronts) {
    const spill = readSpilloverDaily(sf.themeExperimentJson);
    if (!spill?.cells.length) continue;

    const { json } = runCausalDiscoveryClosedLoop(sf.themeExperimentJson, spill.cells);
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: json as object },
    });
    processed++;
    const agent = readCausalDiscoveryAgent(json);
    if (agent?.pendingApproval) pendingApproval++;
  }

  logger.info("causal_discovery_maintenance_cycle", { processed, pendingApproval });
  return { processed, pendingApproval };
}
