#!/usr/bin/env tsx
/**
 * SOC2 evidence pack — signed audit CSV + manifest per storefront.
 * Run: npm run ops:soc2-experiment-evidence
 */

import { createHash } from "node:crypto";
import { writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

import { signAuditExportPayload } from "@/lib/audit/signed-export";
import { prisma } from "@/lib/prisma";
import { exportStorefrontExperimentAuditCsv } from "@/services/storefront/storefront-experiment-audit-export";

const DAYS = 90;
const outDir = process.env.SOC2_EVIDENCE_OUT_DIR?.trim() || "./tmp/soc2-experiment-evidence";

async function main() {
  mkdirSync(outDir, { recursive: true });

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, storeSlug: true, experimentLegalHoldAt: true },
  });

  const manifest: {
    generatedAt: string;
    days: number;
    stores: {
      storeSlug: string;
      rowCount: number;
      csvSha256: string;
      signature: string | null;
      exportedAt: string;
      legalHold: boolean;
    }[];
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
    if (signature) {
      writeFileSync(
        join(base, "signature.json"),
        JSON.stringify({ exportedAt, signature, algorithm: "hmac-sha256" }, null, 2),
        "utf-8",
      );
    }
    manifest.stores.push({
      storeSlug: sf.storeSlug,
      rowCount,
      csvSha256,
      signature,
      exportedAt,
      legalHold: Boolean(sf.experimentLegalHoldAt),
    });
  }

  writeFileSync(join(outDir, "manifest.json"), JSON.stringify(manifest, null, 2), "utf-8");
  console.log(JSON.stringify({ ok: true, outDir, storeCount: manifest.stores.length }, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
