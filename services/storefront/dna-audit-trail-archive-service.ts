import { createHash } from "node:crypto";
import { toJsonValue } from "@/lib/prisma/json";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import {
  appendDnaAuditBlock,
  dnaTrailPdfLines,
  isDnaAuditTrailEnabled,
  readDnaAuditTrail,
} from "@/lib/compliance/dna-encoded-audit-trail";
import { uploadAuditCsvToS3WithLock } from "@/services/storefront/storefront-experiment-audit-archive-service";
import { prisma } from "@/lib/prisma";

export async function runDnaAuditTrailArchiveCycle(): Promise<{ archived: number }> {
  if (!isDnaAuditTrailEnabled()) return { archived: 0 };

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, themeExperimentJson: true },
    take: 50,
  });

  const outDir = process.env.DNA_AUDIT_TRAIL_OUT_DIR?.trim() || "/tmp/dna-audit-trail";
  mkdirSync(outDir, { recursive: true });
  const prefix = (process.env.AUDIT_ARCHIVE_S3_PREFIX ?? "experiment-audit").replace(/\/$/, "");

  let archived = 0;
  for (const sf of storefronts) {
    const { json } = appendDnaAuditBlock(sf.themeExperimentJson, {
      eventType: "dna_archive_cycle",
      payload: { storeSlug: sf.storeSlug, at: new Date().toISOString() },
    });

    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: json as object },
    });

    const trail = readDnaAuditTrail(json);
    if (!trail) continue;

    const jsonBody = JSON.stringify(trail, null, 2);
    const period = trail.soc2Period ?? new Date().toISOString().slice(0, 7);
    writeFileSync(join(outDir, `${sf.storeSlug}-${period}.json`), jsonBody, "utf-8");

    await uploadAuditCsvToS3WithLock({
      key: `${prefix}/dna-audit-trail/${sf.storeSlug}/${period}/trail.json`,
      body: jsonBody,
      contentType: "application/json",
    });
    await uploadAuditCsvToS3WithLock({
      key: `${prefix}/dna-audit-trail/${sf.storeSlug}/${period}/trail.pdf`,
      body: dnaTrailPdfLines(trail),
      contentType: "application/pdf",
    });
    await uploadAuditCsvToS3WithLock({
      key: `${prefix}/dna-audit-trail/${sf.storeSlug}/${period}/manifest.json`,
      body: JSON.stringify({
        storeSlug: sf.storeSlug,
        chainValid: trail.chainValid,
        sha256: createHash("sha256").update(jsonBody).digest("hex"),
      }),
      contentType: "application/json",
    });
    archived++;
  }

  return { archived };
}
