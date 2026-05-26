import { mkdirSync, writeFileSync } from "node:fs";
import { toJsonValue } from "@/lib/prisma/json";
import { join } from "node:path";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  attestIndoPacificCompact,
  indoPacificCompactPdfLines,
  isIndoPacificCompactEnabled,
} from "@/lib/compliance/indo-pacific-compact";

function indoPacificOutDir(): string {
  return process.env.INDO_PACIFIC_COMPACT_OUT_DIR?.trim() || "/tmp/kos-indo-pacific";
}

export async function runIndoPacificCompactSyncCycle(): Promise<{ attested: number }> {
  if (!isIndoPacificCompactEnabled()) return { attested: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, themeExperimentJson: true },
    take: 50,
  });

  const outDir = indoPacificOutDir();
  mkdirSync(outDir, { recursive: true });

  let attested = 0;
  for (const sf of storefronts) {
    const { json, snap } = attestIndoPacificCompact(sf.themeExperimentJson);
    const period = snap.evidence.period.replace(/[^\w-]/g, "_");
    writeFileSync(
      join(outDir, `${sf.storeSlug}-${period}-indo-pacific.json`),
      JSON.stringify(snap.evidence, null, 2),
    );
    writeFileSync(
      join(outDir, `${sf.storeSlug}-${period}-indo-pacific.txt`),
      indoPacificCompactPdfLines(snap.evidence).join("\n"),
    );
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: json as object },
    });
    attested++;
  }

  logger.info("indo_pacific_compact_sync_cycle", { attested, outDir });
  return { attested };
}
