import { createHash } from "node:crypto";
import { toJsonValue } from "@/lib/prisma/json";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  isPqcDnaArchivalEnabled,
  pqcDnaArchivalPdfLines,
  sealPqcDnaArchivalFromTrail,
} from "@/lib/compliance/pqc-dna-archival";
import { uploadAuditCsvToS3WithLock } from "@/services/storefront/storefront-experiment-audit-archive-service";
import { prisma } from "@/lib/prisma";

export async function runPqcDnaArchivalSealCycle(): Promise<{ sealed: number }> {
  if (!isPqcDnaArchivalEnabled()) return { sealed: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, themeExperimentJson: true },
    take: 50,
  });

  const outDir = process.env.PQC_DNA_ARCHIVAL_OUT_DIR?.trim() || "/tmp/pqc-dna-archival";
  mkdirSync(outDir, { recursive: true });
  const prefix = (process.env.AUDIT_ARCHIVE_S3_PREFIX ?? "experiment-audit").replace(/\/$/, "");

  let sealed = 0;
  for (const sf of storefronts) {
    const { json, snap } = sealPqcDnaArchivalFromTrail(sf.themeExperimentJson);
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: json as object },
    });

    const body = JSON.stringify(snap, null, 2);
    const period = snap.archivalPeriod ?? new Date().toISOString().slice(0, 7);
    writeFileSync(join(outDir, `${sf.storeSlug}-${period}.json`), body, "utf-8");

    await uploadAuditCsvToS3WithLock({
      key: `${prefix}/pqc-dna-archival/${sf.storeSlug}/${period}/seals.json`,
      body,
      contentType: "application/json",
    });
    await uploadAuditCsvToS3WithLock({
      key: `${prefix}/pqc-dna-archival/${sf.storeSlug}/${period}/seals.pdf`,
      body: pqcDnaArchivalPdfLines(snap),
      contentType: "application/pdf",
    });
    await uploadAuditCsvToS3WithLock({
      key: `${prefix}/pqc-dna-archival/${sf.storeSlug}/${period}/manifest.json`,
      body: JSON.stringify({
        storeSlug: sf.storeSlug,
        chainSealed: snap.chainSealed,
        sha256: createHash("sha256").update(body).digest("hex"),
      }),
      contentType: "application/json",
    });
    sealed++;
  }

  return { sealed };
}
