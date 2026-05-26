import { createHash } from "node:crypto";
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

import { signAuditExportPayload } from "@/lib/audit/signed-export";
import { prisma } from "@/lib/prisma";
import { exportStorefrontExperimentAuditCsv } from "@/services/storefront/storefront-experiment-audit-export";
import { uploadAuditCsvToS3WithLock } from "@/services/storefront/storefront-experiment-audit-archive-service";

async function uploadManifestToS3(manifestJson: string): Promise<boolean> {
  const prefix = (process.env.AUDIT_ARCHIVE_S3_PREFIX ?? "experiment-audit").replace(/\/$/, "");
  return uploadAuditCsvToS3WithLock({
    key: `${prefix}/soc2/manifest.json`,
    body: manifestJson,
    contentType: "application/json",
  });
}

const DAYS = 90;

export async function runSoc2ExperimentEvidencePack(): Promise<{
  ok: boolean;
  storeCount: number;
  outDir: string;
  s3Uploaded: number;
  error?: string;
}> {
  const outDir = process.env.SOC2_EVIDENCE_OUT_DIR?.trim() || "/tmp/soc2-experiment-evidence";
  mkdirSync(outDir, { recursive: true });

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, experimentLegalHoldAt: true },
  });

  let s3Uploaded = 0;

  try {
    const manifest: {
      generatedAt: string;
      days: number;
      stores: { storeSlug: string; rowCount: number; csvSha256: string; signature: string | null }[];
    } = {
      generatedAt: new Date().toISOString(),
      days: DAYS,
      stores: [],
    };

    for (const sf of storefronts) {
      const { body, rowCount } = await exportStorefrontExperimentAuditCsv({
        storefrontId: sf.id,
        storeSlug: sf.storeSlug,
        days: DAYS,
      });
      const exportedAt = new Date().toISOString();
      const signature = signAuditExportPayload(body, exportedAt);
      const csvSha256 = createHash("sha256").update(body).digest("hex");
      const base = join(outDir, sf.storeSlug);
      mkdirSync(base, { recursive: true });
      writeFileSync(join(base, `experiment-audit-${DAYS}d.csv`), body, "utf-8");

      const key = `soc2/${sf.storeSlug}/${exportedAt.slice(0, 10)}-experiment-audit-${DAYS}d.csv`;
      if (await uploadAuditCsvToS3WithLock({ key, body })) s3Uploaded++;

      manifest.stores.push({ storeSlug: sf.storeSlug, rowCount, csvSha256, signature });
    }

    const manifestJson = JSON.stringify(manifest, null, 2);
    writeFileSync(join(outDir, "manifest.json"), manifestJson, "utf-8");

    const prefix = (process.env.AUDIT_ARCHIVE_S3_PREFIX ?? "experiment-audit").replace(/\/$/, "");
    const prevKey = `${prefix}/soc2/manifest-previous.json`;

    try {
      const { readSoc2ManifestFromS3 } = await import(
        "@/services/storefront/experiment-soc2-s3-service"
      );
      const existing = await readSoc2ManifestFromS3();
      if (existing) {
        await uploadAuditCsvToS3WithLock({
          key: prevKey,
          body: JSON.stringify(existing, null, 2),
          contentType: "application/json",
        });
      }
    } catch {
      /* first run — no previous manifest */
    }

    if (await uploadManifestToS3(manifestJson)) s3Uploaded++;

    return { ok: true, storeCount: manifest.stores.length, outDir, s3Uploaded };
  } catch (e) {
    return {
      ok: false,
      storeCount: 0,
      outDir,
      s3Uploaded,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}
