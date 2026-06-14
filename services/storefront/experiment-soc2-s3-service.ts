import {
  GetObjectCommand,
  ListObjectsV2Command,
  S3Client,
  type _Object,
} from "@aws-sdk/client-s3";
import { createHash, createHmac } from "node:crypto";

export type Soc2ManifestEntry = {
  storeSlug: string;
  rowCount: number;
  csvSha256: string;
  signature: string | null;
};

export type Soc2Manifest = {
  generatedAt: string;
  days: number;
  stores: Soc2ManifestEntry[];
};

function s3Client(): S3Client | null {
  const bucket = process.env.AUDIT_ARCHIVE_S3_BUCKET?.trim();
  if (!bucket) return null;
  return new S3Client({ region: process.env.AWS_REGION?.trim() || "us-east-1" });
}

function manifestKey(): string {
  const prefix = (process.env.AUDIT_ARCHIVE_S3_PREFIX ?? "experiment-audit").replace(/\/$/, "");
  return `${prefix}/soc2/manifest.json`;
}

/** Read manifest from S3 (no local filesystem). */
export async function readSoc2ManifestPreviousFromS3(): Promise<Soc2Manifest | null> {
  const client = s3Client();
  const bucket = process.env.AUDIT_ARCHIVE_S3_BUCKET?.trim();
  if (!client || !bucket) return null;

  const prefix = (process.env.AUDIT_ARCHIVE_S3_PREFIX ?? "experiment-audit").replace(/\/$/, "");
  const key = `${prefix}/soc2/manifest-previous.json`;

  try {
    const res = await client.send(new GetObjectCommand({ Bucket: bucket, Key: key }));
    const body = await res.Body?.transformToString("utf-8");
    if (!body) return null;
    return JSON.parse(body) as Soc2Manifest;
  } catch {
    return null;
  }
}

export async function readSoc2ManifestFromS3(): Promise<Soc2Manifest | null> {
  const client = s3Client();
  const bucket = process.env.AUDIT_ARCHIVE_S3_BUCKET?.trim();
  if (!client || !bucket) return null;

  try {
    const res = await client.send(
      new GetObjectCommand({ Bucket: bucket, Key: manifestKey() }),
    );
    const body = await res.Body?.transformToString("utf-8");
    if (!body) return null;
    return JSON.parse(body) as Soc2Manifest;
  } catch {
    return null;
  }
}

export async function listSoc2EvidenceObjects(prefix = "soc2/"): Promise<_Object[]> {
  const client = s3Client();
  const bucket = process.env.AUDIT_ARCHIVE_S3_BUCKET?.trim();
  if (!client || !bucket) return [];

  const fullPrefix = `${(process.env.AUDIT_ARCHIVE_S3_PREFIX ?? "experiment-audit").replace(/\/$/, "")}/${prefix}`;
  const res = await client.send(
    new ListObjectsV2Command({ Bucket: bucket, Prefix: fullPrefix, MaxKeys: 200 }),
  );
  return res.Contents ?? [];
}

/**
 * SigV4 presigned GET URL (no @aws-sdk/s3-request-presigner dependency).
 * Valid for `expiresInSeconds` (default 15 min).
 */
export function createPresignedGetUrl(input: {
  key: string;
  expiresInSeconds?: number;
}): string | null {
  const bucket = process.env.AUDIT_ARCHIVE_S3_BUCKET?.trim();
  const accessKey = process.env.AWS_ACCESS_KEY_ID?.trim();
  const secretKey = process.env.AWS_SECRET_ACCESS_KEY?.trim();
  const region = process.env.AWS_REGION?.trim() || "us-east-1";
  if (!bucket || !accessKey || !secretKey) return null;

  const expires = input.expiresInSeconds ?? 900;
  const now = new Date();
  const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
  const credential = `${accessKey}/${credentialScope}`;

  const query = new URLSearchParams({
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": credential,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(expires),
    "X-Amz-SignedHeaders": "host",
  });

  const host = `${bucket}.s3.${region}.amazonaws.com`;
  const canonicalRequest = [
    "GET",
    `/${input.key}`,
    query.toString(),
    `host:${host}\n`,
    "host",
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  const stringToSign = [
    "AWS4-HMAC-SHA256",
    amzDate,
    credentialScope,
    createHash("sha256").update(canonicalRequest).digest("hex"),
  ].join("\n");

  const kDate = createHmac("sha256", `AWS4${secretKey}`).update(dateStamp).digest();
  const kRegion = createHmac("sha256", kDate).update(region).digest();
  const kService = createHmac("sha256", kRegion).update("s3").digest();
  const kSigning = createHmac("sha256", kService).update("aws4_request").digest();
  const signature = createHmac("sha256", kSigning).update(stringToSign).digest("hex");

  query.set("X-Amz-Signature", signature);
  return `https://${host}/${input.key}?${query.toString()}`;
}
