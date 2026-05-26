import { toJsonValue } from "@/lib/prisma/json";
/**
 * Q3 — Private Link BQ ingest: VPC-SC, CMEK audit S3, row-level workspace ACL.
 */

export type BqWorkspaceAclRow = {
  workspaceId: string;
  storeSlug: string;
  role: "OWNER" | "EDITOR" | "VIEWER" | "AUDITOR";
  principalEmail: string;
};

export type BqPrivateLinkAudit = {
  at: string;
  vpcScEnabled: boolean;
  vpcScPerimeter: string | null;
  cmekKeyArn: string | null;
  cmekRotationDays: number;
  rowLevelAclCount: number;
  aclRows: BqWorkspaceAclRow[];
  ingestEndpoint: string | null;
  lastVerifiedAt: string;
  status: "compliant" | "drift" | "unknown";
};

export function isBqPrivateLinkEnabled(): boolean {
  return process.env.THEME_EXPERIMENT_BQ_PRIVATE_LINK === "1";
}

export function requiredCmekKeyArn(): string | null {
  return process.env.AUDIT_ARCHIVE_S3_CMEK_KEY_ARN?.trim() || null;
}

export function readBqPrivateLinkAudit(raw: unknown): BqPrivateLinkAudit | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const o = (raw as Record<string, unknown>).bqPrivateLinkAudit;
  if (!o || typeof o !== "object" || Array.isArray(o)) return null;
  const a = o as Record<string, unknown>;
  return {
    at: typeof a.at === "string" ? a.at : new Date().toISOString(),
    vpcScEnabled: a.vpcScEnabled === true,
    vpcScPerimeter: typeof a.vpcScPerimeter === "string" ? a.vpcScPerimeter : null,
    cmekKeyArn: typeof a.cmekKeyArn === "string" ? a.cmekKeyArn : null,
    cmekRotationDays: typeof a.cmekRotationDays === "number" ? a.cmekRotationDays : 90,
    rowLevelAclCount: typeof a.rowLevelAclCount === "number" ? a.rowLevelAclCount : 0,
    aclRows: Array.isArray(a.aclRows) ? (a.aclRows as BqWorkspaceAclRow[]) : [],
    ingestEndpoint: typeof a.ingestEndpoint === "string" ? a.ingestEndpoint : null,
    lastVerifiedAt: typeof a.lastVerifiedAt === "string" ? a.lastVerifiedAt : new Date().toISOString(),
    status: a.status === "drift" ? "drift" : a.status === "compliant" ? "compliant" : "unknown",
  };
}

export function evaluateBqPrivateLinkCompliance(): BqPrivateLinkAudit {
  const cmek = requiredCmekKeyArn();
  const vpcSc = process.env.GCP_VPC_SC_PERIMETER?.trim() || null;
  const ingest = process.env.BQ_PRIVATE_LINK_INGEST_HOST?.trim() || null;

  const vpcScEnabled = Boolean(vpcSc);
  let status: BqPrivateLinkAudit["status"] = "unknown";
  if (vpcScEnabled && cmek) status = "compliant";
  else if (vpcSc || cmek) status = "drift";

  return {
    at: new Date().toISOString(),
    vpcScEnabled,
    vpcScPerimeter: vpcSc,
    cmekKeyArn: cmek,
    cmekRotationDays: Number(process.env.AUDIT_ARCHIVE_CMEK_ROTATION_DAYS ?? "90"),
    rowLevelAclCount: 0,
    aclRows: [],
    ingestEndpoint: ingest,
    lastVerifiedAt: new Date().toISOString(),
    status,
  };
}

export function mergeBqPrivateLinkAudit(
  previousRaw: unknown,
  audit: BqPrivateLinkAudit,
): Record<string, unknown> {
  const base =
    previousRaw && typeof previousRaw === "object" && !Array.isArray(previousRaw)
      ? { ...(previousRaw as Record<string, unknown>) }
      : {};
  base.bqPrivateLinkAudit = audit;
  return base;
}

export function mergeWorkspaceAclRows(
  previousRaw: unknown,
  rows: BqWorkspaceAclRow[],
): Record<string, unknown> {
  const audit = readBqPrivateLinkAudit(previousRaw) ?? evaluateBqPrivateLinkCompliance();
  const next: BqPrivateLinkAudit = {
    ...audit,
    at: new Date().toISOString(),
    aclRows: rows,
    rowLevelAclCount: rows.length,
    lastVerifiedAt: new Date().toISOString(),
    status: audit.vpcScEnabled && audit.cmekKeyArn ? "compliant" : "drift",
  };
  return mergeBqPrivateLinkAudit(previousRaw, next);
}

export function s3PutObjectCmekParams(): { ServerSideEncryption: "aws:kms"; SSEKMSKeyId: string } | null {
  const arn = requiredCmekKeyArn();
  if (!arn) return null;
  return { ServerSideEncryption: "aws:kms", SSEKMSKeyId: arn };
}
