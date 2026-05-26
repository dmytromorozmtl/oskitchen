import { mkdirSync, writeFileSync } from "node:fs";
import { toJsonValue } from "@/lib/prisma/json";
import { join } from "node:path";

import { prisma } from "@/lib/prisma";
import {
  evaluateBqPrivateLinkCompliance,
  isBqPrivateLinkEnabled,
  mergeBqPrivateLinkAudit,
  s3PutObjectCmekParams,
} from "@/lib/compliance/experiment-bq-private-link";
import { uploadAuditCsvToS3WithLock } from "@/services/storefront/storefront-experiment-audit-archive-service";

export async function runBqPrivateLinkAuditCycle(): Promise<{
  ok: boolean;
  storefronts: number;
  compliant: number;
  drift: number;
}> {
  if (!isBqPrivateLinkEnabled()) {
    return { ok: true, storefronts: 0, compliant: 0, drift: 0 };
  }

  const audit = evaluateBqPrivateLinkCompliance();
  const cmek = s3PutObjectCmekParams();

  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true },
    select: { id: true, themeExperimentJson: true },
    take: 100,
  });

  let compliant = 0;
  let drift = 0;

  for (const sf of storefronts) {
    const merged = mergeBqPrivateLinkAudit(sf.themeExperimentJson, audit);
    await prisma.storefrontSettings.update({
      where: { id: sf.id },
      data: { themeExperimentJson: merged as object },
    });
    if (audit.status === "compliant") compliant++;
    else drift++;
  }

  const outDir = process.env.BQ_PRIVATE_LINK_AUDIT_OUT_DIR?.trim() || "/tmp/bq-private-link-audit";
  mkdirSync(outDir, { recursive: true });
  const body = JSON.stringify({ audit, cmekConfigured: Boolean(cmek) }, null, 2);
  writeFileSync(join(outDir, `audit-${audit.at.slice(0, 10)}.json`), body, "utf-8");

  const prefix = (process.env.AUDIT_ARCHIVE_S3_PREFIX ?? "experiment-audit").replace(/\/$/, "");
  await uploadAuditCsvToS3WithLock({
    key: `${prefix}/bq-private-link/${audit.at.slice(0, 10)}.json`,
    body,
    contentType: "application/json",
  });

  return {
    ok: audit.status !== "drift",
    storefronts: storefronts.length,
    compliant,
    drift,
  };
}
