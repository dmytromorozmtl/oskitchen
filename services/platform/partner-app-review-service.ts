import type { Prisma } from "@prisma/client";
import { PartnerOAuthAppRegistryStatus } from "@prisma/client";

import { recordAuditLog } from "@/lib/audit-log";
import {
  isPartnerOAuthScope,
  validatePartnerOAuthScopes,
  type PartnerOAuthScope,
} from "@/lib/developer/partner-oauth-scopes";
import { getPartnerOAuthAppByClientId } from "@/lib/oauth/partner-oauth-app-catalog";
import { prisma } from "@/lib/prisma";
import { listPartnerAppReviewChecklist } from "@/services/platform/partner-oauth-app-registry-service";

export type SubmitPartnerAppInput = {
  clientId: string;
  name: string;
  publisher: string;
  description: string;
  redirectUris: string[];
  allowedScopes: PartnerOAuthScope[];
  embedUrl?: string | null;
  embedOrigins?: string[];
  contactEmail: string;
  honestyNote?: string | null;
};

function slugifyClientId(raw: string): string {
  return raw
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 96);
}

export function validatePartnerAppSubmission(input: SubmitPartnerAppInput): string[] {
  const errors: string[] = [];
  const clientId = slugifyClientId(input.clientId);
  if (!clientId || clientId.length < 4) errors.push("clientId must be at least 4 characters.");
  if (!input.name.trim()) errors.push("name is required.");
  if (!input.publisher.trim()) errors.push("publisher is required.");
  if (!input.description.trim()) errors.push("description is required.");
  if (!input.contactEmail.includes("@")) errors.push("contactEmail must be valid.");
  if (input.redirectUris.length === 0) errors.push("At least one redirect URI is required.");
  errors.push(...validatePartnerOAuthScopes(input.allowedScopes));
  for (const uri of input.redirectUris) {
    try {
      const parsed = new URL(uri);
      if (parsed.protocol !== "https:" && !parsed.hostname.match(/^(localhost|127\.0\.0\.1)$/)) {
        errors.push(`Redirect URI must use HTTPS: ${uri}`);
      }
    } catch {
      errors.push(`Invalid redirect URI: ${uri}`);
    }
  }
  if (input.embedUrl) {
    try {
      new URL(input.embedUrl);
    } catch {
      errors.push("embedUrl must be a valid URL.");
    }
  }
  return errors;
}

export async function submitPartnerOAuthAppForReview(
  input: SubmitPartnerAppInput,
): Promise<{ ok: true; clientId: string } | { ok: false; error: string }> {
  const errors = validatePartnerAppSubmission(input);
  if (errors.length > 0) return { ok: false, error: errors[0] ?? "Invalid submission." };

  const clientId = slugifyClientId(input.clientId);
  if (getPartnerOAuthAppByClientId(clientId)) {
    return { ok: false, error: "This client id is reserved by a built-in sandbox app." };
  }

  const existingConfigCollision = await prisma.partnerOAuthAppRegistry.findUnique({
    where: { clientId },
  });

  const checklistDefaults = Object.fromEntries(
    listPartnerAppReviewChecklist().map((item) => [item.id, false]),
  );

  const data: Prisma.PartnerOAuthAppRegistryCreateInput = {
    clientId,
    name: input.name.trim(),
    publisher: input.publisher.trim(),
    description: input.description.trim(),
    status: PartnerOAuthAppRegistryStatus.IN_REVIEW,
    redirectUris: input.redirectUris.map((u) => u.trim()),
    allowedScopes: input.allowedScopes.filter(isPartnerOAuthScope),
    embedUrl: input.embedUrl?.trim() || null,
    embedOrigins: input.embedOrigins ?? [],
    contactEmail: input.contactEmail.trim(),
    honestyNote: input.honestyNote?.trim() || null,
    checklistJson: checklistDefaults,
    submittedAt: new Date(),
  };

  if (existingConfigCollision) {
    if (
      existingConfigCollision.status !== PartnerOAuthAppRegistryStatus.DRAFT &&
      existingConfigCollision.status !== PartnerOAuthAppRegistryStatus.IN_REVIEW
    ) {
      return { ok: false, error: "An app with this client id already exists." };
    }
    await prisma.partnerOAuthAppRegistry.update({
      where: { clientId },
      data: {
        ...data,
        reviewedAt: null,
        reviewedByUserId: null,
        reviewNotes: null,
      },
    });
  } else {
    await prisma.partnerOAuthAppRegistry.create({ data });
  }

  return { ok: true, clientId };
}

export async function approvePartnerOAuthAppReview(input: {
  registryId: string;
  reviewerUserId: string;
  checklist: Record<string, boolean>;
  reviewNotes?: string | null;
  publishAsSandbox?: boolean;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const row = await prisma.partnerOAuthAppRegistry.findUnique({ where: { id: input.registryId } });
  if (!row) return { ok: false, error: "App not found." };
  if (row.status !== PartnerOAuthAppRegistryStatus.IN_REVIEW) {
    return { ok: false, error: "App is not in review." };
  }

  const required = listPartnerAppReviewChecklist().filter((item) => item.required);
  for (const item of required) {
    if (!input.checklist[item.id]) {
      return { ok: false, error: `Required checklist item not satisfied: ${item.label}` };
    }
  }

  await prisma.partnerOAuthAppRegistry.update({
    where: { id: row.id },
    data: {
      status: input.publishAsSandbox
        ? PartnerOAuthAppRegistryStatus.SANDBOX
        : PartnerOAuthAppRegistryStatus.PUBLISHED,
      checklistJson: input.checklist,
      reviewNotes: input.reviewNotes?.trim() || null,
      reviewedAt: new Date(),
      reviewedByUserId: input.reviewerUserId,
    },
  });

  await recordAuditLog({
    userId: input.reviewerUserId,
    action: "PARTNER_OAUTH_APP_APPROVED",
    entityType: "PartnerOAuthAppRegistry",
    entityId: row.id,
    metadata: { clientId: row.clientId, checklist: input.checklist },
  });

  return { ok: true };
}

export async function rejectPartnerOAuthAppReview(input: {
  registryId: string;
  reviewerUserId: string;
  reviewNotes: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const row = await prisma.partnerOAuthAppRegistry.findUnique({ where: { id: input.registryId } });
  if (!row) return { ok: false, error: "App not found." };

  await prisma.partnerOAuthAppRegistry.update({
    where: { id: row.id },
    data: {
      status: PartnerOAuthAppRegistryStatus.DRAFT,
      reviewNotes: input.reviewNotes.trim(),
      reviewedAt: new Date(),
      reviewedByUserId: input.reviewerUserId,
    },
  });

  await recordAuditLog({
    userId: input.reviewerUserId,
    action: "PARTNER_OAUTH_APP_REJECTED",
    entityType: "PartnerOAuthAppRegistry",
    entityId: row.id,
    metadata: { clientId: row.clientId, reviewNotes: input.reviewNotes },
  });

  return { ok: true };
}

export async function suspendPartnerOAuthApp(input: {
  registryId: string;
  reviewerUserId: string;
  reason: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const row = await prisma.partnerOAuthAppRegistry.findUnique({ where: { id: input.registryId } });
  if (!row) return { ok: false, error: "App not found." };

  await prisma.partnerOAuthAppRegistry.update({
    where: { id: row.id },
    data: {
      status: PartnerOAuthAppRegistryStatus.SUSPENDED,
      reviewNotes: input.reason.trim(),
      reviewedAt: new Date(),
      reviewedByUserId: input.reviewerUserId,
    },
  });

  return { ok: true };
}
