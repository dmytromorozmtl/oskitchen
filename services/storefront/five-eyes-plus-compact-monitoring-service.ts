import { mkdirSync, writeFileSync } from "node:fs";
import { toJsonValue } from "@/lib/prisma/json";
import { join } from "node:path";

import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";
import {
  buildFiveEyesPlusCompactEvidence,
  fiveEyesPlusCompactPdfLines,
  isFiveEyesPlusCompactEnabled,
} from "@/lib/compliance/five-eyes-plus-compact";
import {
  fetchCloudResidencyAttestations,
  mergeCloudAttestationsIntoFiveEyesPlus,
} from "@/lib/experiment-production/five-eyes-cloud-attestation";

function fiveEyesPlusOutDir(): string {
  return process.env.FIVE_EYES_PLUS_COMPACT_OUT_DIR?.trim() || "/tmp/kos-five-eyes-plus";
}

export async function runFiveEyesPlusCompactMonitoringCycle(): Promise<{ monitored: number }> {
  if (!isFiveEyesPlusCompactEnabled()) return { monitored: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, themeExperimentJson: true },
    take: 50,
  });

  const outDir = fiveEyesPlusOutDir();
  mkdirSync(outDir, { recursive: true });

  let monitored = 0;
  for (const sf of storefronts) {
    const base = buildFiveEyesPlusCompactEvidence(sf.themeExperimentJson);
    const attestations = await fetchCloudResidencyAttestations();
    const ev = mergeCloudAttestationsIntoFiveEyesPlus(base, attestations);
    const period = ev.period.replace(/[^\w-]/g, "_");
    const path = join(outDir, `${sf.storeSlug}-${period}-five-eyes-plus.json`);
    writeFileSync(path, JSON.stringify(ev, null, 2));
    writeFileSync(
      join(outDir, `${sf.storeSlug}-${period}-five-eyes-plus.txt`),
      fiveEyesPlusCompactPdfLines(ev),
    );
    monitored++;
  }

  logger.info("five_eyes_plus_compact_monitoring_cycle", { monitored, outDir });
  return { monitored };
}
