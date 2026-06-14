import type { RevenueAttestation } from "@prisma/client";

import {
  aggregateCapitalRevenueForWindow,
  capitalRevenueWindowMonthsAgo,
} from "@/lib/commercial/capital-revenue-aggregation";
import {
  attestationExpiresAt,
  REVENUE_ATTESTATION_DISCLAIMER,
  REVENUE_ATTESTATION_STATUS_DEFINITION,
  signRevenueAttestationPayload,
  verifyRevenueAttestationSignature,
  type RevenueAttestationSignedPayload,
} from "@/lib/commercial/revenue-attestation-signing";
import { recordAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/prisma/json";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";

export type RevenueAttestationExportDocument = {
  payload: RevenueAttestationSignedPayload;
  signature: string;
  verifyUrl: string;
};

export type RevenueAttestationListRow = {
  id: string;
  periodStart: string;
  periodEnd: string;
  grossOrderRevenue: number;
  orderCount: number;
  currency: string;
  createdAt: string;
  expiresAt: string;
  expired: boolean;
};

const ALLOWED_ATTESTATION_MONTHS = [3, 6, 12] as const;
export type RevenueAttestationMonths = (typeof ALLOWED_ATTESTATION_MONTHS)[number];

export function isAllowedAttestationMonths(value: number): value is RevenueAttestationMonths {
  return (ALLOWED_ATTESTATION_MONTHS as readonly number[]).includes(value);
}

export function buildRevenueAttestationExportDocument(input: {
  attestationId: string;
  aggregate: Awaited<ReturnType<typeof aggregateCapitalRevenueForWindow>>;
  generatedAt?: Date;
  expiresAt?: Date;
  verifyBaseUrl?: string;
}): RevenueAttestationExportDocument {
  if (!input.aggregate.workspaceId) {
    throw new Error("Workspace is required to generate a revenue attestation.");
  }
  if (!input.aggregate.hasOrderData) {
    throw new Error("No revenue-eligible orders in the selected period.");
  }

  const generatedAt = (input.generatedAt ?? new Date()).toISOString();
  const expiresAt = (input.expiresAt ?? attestationExpiresAt()).toISOString();

  const payload: RevenueAttestationSignedPayload = {
    version: "kitchenos-revenue-attestation-v1",
    attestationId: input.attestationId,
    workspaceId: input.aggregate.workspaceId,
    businessName: input.aggregate.businessName,
    periodStart: input.aggregate.periodStart,
    periodEnd: input.aggregate.periodEnd,
    grossOrderRevenue: input.aggregate.grossOrderRevenue,
    orderCount: input.aggregate.orderCount,
    cancelledOrderCount: input.aggregate.cancelledOrderCount,
    currency: input.aggregate.currency,
    locationsIncluded: input.aggregate.locationsIncluded,
    revenueStatusDefinition: REVENUE_ATTESTATION_STATUS_DEFINITION,
    generatedAt,
    expiresAt,
    disclaimer: REVENUE_ATTESTATION_DISCLAIMER,
  };

  const signature = signRevenueAttestationPayload(payload);
  const verifyBase = input.verifyBaseUrl?.replace(/\/$/, "") ?? "";
  return {
    payload,
    signature,
    verifyUrl: verifyBase
      ? `${verifyBase}/api/capital/revenue-attestation/verify`
      : "/api/capital/revenue-attestation/verify",
  };
}

export async function generateRevenueAttestationForOwner(input: {
  userId: string;
  sessionUserId: string;
  months: RevenueAttestationMonths;
  verifyBaseUrl?: string;
}): Promise<{ attestation: RevenueAttestation; document: RevenueAttestationExportDocument }> {
  const workspaceId = await resolveOwnerWorkspaceId(input.userId);
  if (!workspaceId) {
    throw new Error("Workspace not found — revenue attestation requires an active workspace.");
  }

  const { from, to } = capitalRevenueWindowMonthsAgo(input.months);
  const aggregate = await aggregateCapitalRevenueForWindow({
    userId: input.userId,
    from,
    to,
  });

  const attestationId = crypto.randomUUID();
  const expiresAtDate = attestationExpiresAt();
  const document = buildRevenueAttestationExportDocument({
    attestationId,
    aggregate,
    expiresAt: expiresAtDate,
    verifyBaseUrl: input.verifyBaseUrl,
  });

  const attestation = await prisma.revenueAttestation.create({
    data: {
      id: attestationId,
      workspaceId,
      userId: input.sessionUserId,
      periodStart: new Date(`${aggregate.periodStart}T00:00:00.000Z`),
      periodEnd: new Date(`${aggregate.periodEnd}T00:00:00.000Z`),
      payloadJson: toInputJsonValue(document.payload),
      signature: document.signature,
      expiresAt: expiresAtDate,
    },
  });

  await recordAuditLog({
    userId: input.sessionUserId,
    workspaceId,
    action: "capital.revenue_attestation_generated",
    entityType: "RevenueAttestation",
    entityId: attestation.id,
    metadata: {
      months: input.months,
      grossOrderRevenue: aggregate.grossOrderRevenue,
      orderCount: aggregate.orderCount,
      currency: aggregate.currency,
      expiresAt: expiresAtDate.toISOString(),
    },
  });

  return { attestation, document };
}

export async function listRevenueAttestationsForOwner(userId: string): Promise<RevenueAttestationListRow[]> {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  if (!workspaceId) return [];

  const rows = await prisma.revenueAttestation.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    take: 12,
  });

  const now = Date.now();
  return rows.map((row) => {
    const payload = row.payloadJson as RevenueAttestationSignedPayload;
    return {
      id: row.id,
      periodStart: row.periodStart.toISOString().slice(0, 10),
      periodEnd: row.periodEnd.toISOString().slice(0, 10),
      grossOrderRevenue: payload.grossOrderRevenue,
      orderCount: payload.orderCount,
      currency: payload.currency,
      createdAt: row.createdAt.toISOString(),
      expiresAt: row.expiresAt.toISOString(),
      expired: row.expiresAt.getTime() <= now,
    };
  });
}

export async function loadRevenueAttestationExportForOwner(input: {
  userId: string;
  attestationId: string;
  verifyBaseUrl?: string;
}): Promise<RevenueAttestationExportDocument | null> {
  const workspaceId = await resolveOwnerWorkspaceId(input.userId);
  if (!workspaceId) return null;

  const row = await prisma.revenueAttestation.findFirst({
    where: { id: input.attestationId, workspaceId },
  });
  if (!row) return null;

  const payload = row.payloadJson as RevenueAttestationSignedPayload;
  if (!verifyRevenueAttestationSignature({ payload, signature: row.signature })) {
    throw new Error("Stored attestation signature is invalid — contact support.");
  }

  const verifyBase = input.verifyBaseUrl?.replace(/\/$/, "") ?? "";
  return {
    payload,
    signature: row.signature,
    verifyUrl: verifyBase
      ? `${verifyBase}/api/capital/revenue-attestation/verify`
      : "/api/capital/revenue-attestation/verify",
  };
}

export function verifyRevenueAttestationDocument(document: {
  payload: RevenueAttestationSignedPayload;
  signature: string;
}): { valid: boolean; expired: boolean; reason?: string } {
  const expired = new Date(document.payload.expiresAt).getTime() <= Date.now();
  const valid = verifyRevenueAttestationSignature(document);
  if (!valid) {
    return { valid: false, expired, reason: "Signature mismatch — document may have been tampered with." };
  }
  if (expired) {
    return { valid: true, expired: true, reason: "Attestation expired — generate a fresh export." };
  }
  return { valid: true, expired: false };
}

export function revenueAttestationToDownloadJson(document: RevenueAttestationExportDocument): string {
  return `${JSON.stringify(
    {
      ...document.payload,
      signature: document.signature,
      verifyUrl: document.verifyUrl,
    },
    null,
    2,
  )}\n`;
}
