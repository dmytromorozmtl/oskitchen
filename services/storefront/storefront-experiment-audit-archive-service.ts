import { PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import { prisma } from "@/lib/prisma";
import { s3PutObjectCmekParams } from "@/lib/compliance/experiment-bq-private-link";
import { exportStorefrontExperimentAuditCsv } from "@/services/storefront/storefront-experiment-audit-export";

const ARCHIVE_DAYS = 90;

function objectLockRetainUntil(): Date {
  const compliance = process.env.AUDIT_ARCHIVE_S3_COMPLIANCE_MODE === "1";
  const years = compliance ? 7 : 1;
  return new Date(Date.now() + years * 365 * 24 * 60 * 60 * 1000);
}

/** Upload with optional S3 Object Lock (GOVERNANCE 1y or COMPLIANCE 7y). */
export async function uploadAuditCsvToS3WithLock(input: {
  key: string;
  body: string;
  contentType?: string;
}): Promise<boolean> {
  const bucket = process.env.AUDIT_ARCHIVE_S3_BUCKET?.trim();
  if (!bucket) return false;

  const client = new S3Client({
    region: process.env.AWS_REGION?.trim() || "us-east-1",
  });

  const objectLock = process.env.AUDIT_ARCHIVE_S3_OBJECT_LOCK === "1";
  const compliance = process.env.AUDIT_ARCHIVE_S3_COMPLIANCE_MODE === "1";

  const cmek = s3PutObjectCmekParams();

  await client.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: input.key,
      Body: input.body,
      ContentType: input.contentType ?? "text/csv; charset=utf-8",
      ...(cmek ?? {}),
      ...(objectLock
        ? {
            ObjectLockMode: compliance ? "COMPLIANCE" : "GOVERNANCE",
            ObjectLockRetainUntilDate: objectLockRetainUntil(),
          }
        : {}),
    }),
  );
  return true;
}

async function uploadAuditCsvToS3(input: {
  key: string;
  body: string;
  contentType: string;
}): Promise<boolean> {
  return uploadAuditCsvToS3WithLock(input);
}

async function postAuditArchiveWebhook(body: string, meta: Record<string, unknown>): Promise<boolean> {
  const url = process.env.STOREFRONT_AUDIT_ARCHIVE_WEBHOOK_URL?.trim();
  if (!url) return false;

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...meta,
      csv: body,
      days: ARCHIVE_DAYS,
    }),
  });
  return res.ok;
}

export async function archiveStorefrontExperimentAudits(): Promise<{
  archived: number;
  skipped: number;
  s3: number;
  webhook: number;
}> {
  const storefronts = await prisma.storefrontSettings.findMany({
    where: { enabled: true, experimentLegalHoldAt: null },
    select: { id: true, storeSlug: true, workspaceId: true },
  });

  let archived = 0;
  let skipped = 0;
  let s3 = 0;
  let webhook = 0;
  const prefix = (process.env.AUDIT_ARCHIVE_S3_PREFIX ?? "experiment-audit").replace(/\/$/, "");
  const date = new Date().toISOString().slice(0, 10);

  for (const sf of storefronts) {
    const { body, rowCount } = await exportStorefrontExperimentAuditCsv({
      storefrontId: sf.id,
      storeSlug: sf.storeSlug,
      days: ARCHIVE_DAYS,
    });
    if (rowCount === 0) {
      skipped++;
      continue;
    }

    const key = `${prefix}/${sf.storeSlug}/${date}-experiment-audit-${ARCHIVE_DAYS}d.csv`;
    let didArchive = false;

    if (await uploadAuditCsvToS3({ key, body, contentType: "text/csv; charset=utf-8" })) {
      s3++;
      didArchive = true;
    }

    if (
      await postAuditArchiveWebhook(body, {
        storeSlug: sf.storeSlug,
        storefrontId: sf.id,
        workspaceId: sf.workspaceId,
        rowCount,
        s3Key: didArchive ? key : null,
      })
    ) {
      webhook++;
      didArchive = true;
    }

    if (didArchive) archived++;
    else skipped++;
  }

  return { archived, skipped, s3, webhook };
}
