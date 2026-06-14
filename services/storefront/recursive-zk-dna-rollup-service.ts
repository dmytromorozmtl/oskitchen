import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import { logger } from "@/lib/logger";
import {
  batchRecursiveZkFromRollups,
  isRecursiveZkDnaRollupEnabled,
} from "@/lib/compliance/recursive-zk-dna-rollup";

export async function runRecursiveZkDnaRollupCycle(): Promise<{ batched: number }> {
  if (!isRecursiveZkDnaRollupEnabled()) return { batched: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 50,
  });

  let batched = 0;
  for (const sf of storefronts) {
    const { json, batch } = batchRecursiveZkFromRollups(sf.themeExperimentJson);
    if (!batch?.verified) continue;
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: json as object },
    });
    batched++;
  }

  logger.info("recursive_zk_dna_rollup_cycle", { batched });
  return { batched };
}
