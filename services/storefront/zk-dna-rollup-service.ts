import { prisma } from "@/lib/prisma";
import { toJsonValue } from "@/lib/prisma/json";
import { logger } from "@/lib/logger";
import { isZkDnaRollupEnabled, rollupZkDnaFromFederation } from "@/lib/compliance/zk-dna-rollup";

export async function runZkDnaRollupCycle(): Promise<{ rolledUp: number }> {
  if (!isZkDnaRollupEnabled()) return { rolledUp: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 50,
  });

  let rolledUp = 0;
  for (const sf of storefronts) {
    const { json, proof } = rollupZkDnaFromFederation(sf.themeExperimentJson);
    if (!proof?.verified) continue;
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: json as object },
    });
    rolledUp++;
  }

  logger.info("zk_dna_rollup_cycle", { rolledUp });
  return { rolledUp };
}
