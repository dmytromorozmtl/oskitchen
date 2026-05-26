import { CopyObjectCommand, GetObjectCommand, PutObjectCommand, S3Client } from "@aws-sdk/client-s3";

import type { Soc2Manifest } from "@/services/storefront/experiment-soc2-s3-service";

function client(): S3Client | null {
  const bucket = process.env.AUDIT_ARCHIVE_S3_BUCKET?.trim();
  if (!bucket) return null;
  return new S3Client({ region: process.env.AWS_REGION?.trim() || "us-east-1" });
}

function prefix(): string {
  return (process.env.AUDIT_ARCHIVE_S3_PREFIX ?? "experiment-audit").replace(/\/$/, "");
}

function primaryBucket(): string | null {
  return process.env.AUDIT_ARCHIVE_S3_BUCKET?.trim() ?? null;
}

function replicaBucket(): string | null {
  return process.env.AUDIT_ARCHIVE_S3_REPLICA_BUCKET?.trim() ?? null;
}

/** O4 — replicate soc2/ prefix to secondary region bucket (CRR-style app copy). */
export async function replicateSoc2PrefixToSecondaryRegion(): Promise<{
  copied: number;
  ok: boolean;
}> {
  const src = primaryBucket();
  const dst = replicaBucket();
  const c = client();
  if (!c || !src || !dst || src === dst) {
    return { copied: 0, ok: false };
  }

  const keys = [
    `${prefix()}/soc2/manifest.json`,
    `${prefix()}/soc2/manifest-previous.json`,
  ];

  let copied = 0;
  for (const key of keys) {
    try {
      await c.send(
        new CopyObjectCommand({
          Bucket: dst,
          Key: key,
          CopySource: `${src}/${key}`,
        }),
      );
      copied++;
    } catch {
      /* key may not exist yet */
    }
  }

  return { copied, ok: copied > 0 };
}

export type AccessCertificationExport = {
  generatedAt: string;
  auditorRole: string;
  users: { userId: string; role: string; provisionedAt: string }[];
};

/** Quarterly access review export for experiment-auditors SCIM group. */
export async function buildExperimentAccessCertificationExport(): Promise<AccessCertificationExport> {
  const { prisma } = await import("@/lib/prisma");
  const roles = await prisma.platformUserRole.findMany({
    where: { role: "STANDARD_USER" },
    select: { userId: true, role: true, createdAt: true },
  });

  return {
    generatedAt: new Date().toISOString(),
    auditorRole: "PLATFORM_READONLY_AUDITOR → STANDARD_USER",
    users: roles.map((r) => ({
      userId: r.userId,
      role: r.role,
      provisionedAt: r.createdAt.toISOString(),
    })),
  };
}

export async function uploadAccessCertificationToS3(
  payload: AccessCertificationExport,
): Promise<boolean> {
  const bucket = primaryBucket();
  const c = client();
  if (!c || !bucket) return false;

  const key = `${prefix()}/soc2/access-certification-${payload.generatedAt.slice(0, 10)}.json`;
  await c.send(
    new PutObjectCommand({
      Bucket: bucket,
      Key: key,
      Body: JSON.stringify(payload, null, 2),
      ContentType: "application/json",
    }),
  );
  return true;
}

export async function readSoc2ManifestFromReplica(): Promise<Soc2Manifest | null> {
  const bucket = replicaBucket();
  const c = client();
  if (!c || !bucket) return null;
  const key = `${prefix()}/soc2/manifest.json`;
  try {
    const res = await c.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const body = await res.Body?.transformToString("utf-8");
    if (!body) return null;
    return JSON.parse(body) as Soc2Manifest;
  } catch {
    return null;
  }
}
