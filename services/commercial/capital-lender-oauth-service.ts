import { CapitalPartnerReferralStatus } from "@prisma/client";

import { recordAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import {
  buildCapitalOAuthState,
  defaultCapitalOAuthScopes,
  intersectCapitalOAuthScopes,
  isCapitalLenderOAuthEnabled,
  parseCapitalOAuthState,
  resolveCapitalOAuthRedirectUri,
} from "@/lib/commercial/capital-lender-oauth";
import {
  getCapitalPartnerBySlug,
  loadCapitalPartnersConfig,
  type CapitalPartner,
} from "@/lib/commercial/capital-partners";
import {
  partnerOAuthInstallationHasCapitalScope,
  type CapitalOAuthScope,
  type PartnerOAuthScope,
} from "@/lib/developer/partner-oauth-scopes";
import { buildPartnerOAuthAuthorizeUrl } from "@/lib/oauth/partner-oauth-app-catalog";
import type { PartnerOAuthCredential } from "@/lib/oauth/partner-oauth-auth";
import { toInputJsonValue } from "@/lib/prisma/json";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  verifyRevenueAttestationDocument,
  type RevenueAttestationExportDocument,
} from "@/services/commercial/revenue-attestation-service";

export type CapitalLenderOAuthGrantView = {
  grantId: string;
  referralId: string;
  partnerSlug: string;
  installationId: string;
  scopesGranted: CapitalOAuthScope[];
  revokedAt: string | null;
  lastAccessAt: string | null;
  accessCount: number;
  createdAt: string;
};

export function getCapitalPartnerByOAuthClientId(clientId: string): CapitalPartner | null {
  const trimmed = clientId.trim();
  if (!trimmed) return null;
  const config = loadCapitalPartnersConfig();
  return config.partners.find((p) => p.oauthEnabled && p.oauthClientId === trimmed) ?? null;
}

export function assertCapitalPartnerOAuthConfigured(partner: CapitalPartner): void {
  if (!isCapitalLenderOAuthEnabled()) {
    throw new Error("Capital lender OAuth is not enabled in this environment.");
  }
  if (!partner.oauthEnabled || !partner.oauthClientId?.trim()) {
    throw new Error("This financing partner does not support OAuth authorization.");
  }
  const redirectUri = resolveCapitalOAuthRedirectUri(partner.oauthClientId);
  if (!redirectUri) {
    throw new Error("Partner OAuth redirect URI is not configured.");
  }
}

export function buildCapitalLenderOAuthAuthorizeUrl(input: {
  partner: CapitalPartner;
  referralId: string;
  origin: string;
}): string {
  assertCapitalPartnerOAuthConfigured(input.partner);
  const clientId = input.partner.oauthClientId!.trim();
  const redirectUri = resolveCapitalOAuthRedirectUri(clientId);
  if (!redirectUri) {
    throw new Error("Partner OAuth redirect URI is not configured.");
  }
  return buildPartnerOAuthAuthorizeUrl({
    clientId,
    redirectUri,
    scopes: defaultCapitalOAuthScopes(),
    state: buildCapitalOAuthState(input.referralId),
    origin: input.origin,
  });
}

export async function finalizeCapitalLenderOAuthGrantAfterTokenExchange(input: {
  clientId: string;
  installationId: string;
  workspaceId: string | null;
  scopes: PartnerOAuthScope[];
  oauthState: string | null;
}): Promise<{ created: boolean; grantId?: string }> {
  if (!isCapitalLenderOAuthEnabled()) return { created: false };

  const referralId = parseCapitalOAuthState(input.oauthState);
  if (!referralId) return { created: false };

  const partner = getCapitalPartnerByOAuthClientId(input.clientId);
  if (!partner?.oauthEnabled) return { created: false };

  const capitalScopes = intersectCapitalOAuthScopes(input.scopes);
  if (!capitalScopes.includes("read:capital_attestation")) {
    return { created: false };
  }

  const referral = await prisma.capitalPartnerReferral.findFirst({
    where: {
      id: referralId,
      partnerSlug: partner.slug,
      ...(input.workspaceId ? { workspaceId: input.workspaceId } : {}),
    },
  });
  if (!referral) return { created: false };

  const existing = await prisma.capitalLenderOAuthGrant.findUnique({
    where: { referralId: referral.id },
  });
  if (existing && !existing.revokedAt) {
    return { created: false, grantId: existing.id };
  }

  const grant = await prisma.capitalLenderOAuthGrant.upsert({
    where: { referralId: referral.id },
    create: {
      referralId: referral.id,
      installationId: input.installationId,
      partnerSlug: partner.slug,
      workspaceId: referral.workspaceId,
      scopesGranted: capitalScopes,
    },
    update: {
      installationId: input.installationId,
      scopesGranted: capitalScopes,
      revokedAt: null,
    },
  });

  await prisma.capitalPartnerReferral.update({
    where: { id: referral.id },
    data: {
      status: CapitalPartnerReferralStatus.ATTESTATION_SHARED,
      statusUpdatedAt: new Date(),
      attestationSharedAt: referral.attestationSharedAt ?? new Date(),
      metadataJson: toInputJsonValue({
        ...(typeof referral.metadataJson === "object" && referral.metadataJson
          ? (referral.metadataJson as Record<string, unknown>)
          : {}),
        oauthGrantId: grant.id,
        oauthConnectedAt: new Date().toISOString(),
      }),
    },
  });

  await recordAuditLog({
    userId: referral.userId,
    workspaceId: referral.workspaceId,
    action: "capital.lender_oauth_grant_created",
    entityType: "CapitalLenderOAuthGrant",
    entityId: grant.id,
    metadata: {
      partnerSlug: partner.slug,
      referralId: referral.id,
      installationId: input.installationId,
      scopes: capitalScopes,
    },
  });

  return { created: true, grantId: grant.id };
}

export async function loadAttestationForCapitalOAuthPull(input: {
  credential: PartnerOAuthCredential;
  referralId: string;
  partnerSlug: string;
}): Promise<{
  referralId: string;
  partnerSlug: string;
  document: RevenueAttestationExportDocument;
} | null> {
  if (
    !partnerOAuthInstallationHasCapitalScope(
      input.credential.oauthScopes,
      "read:capital_attestation",
    )
  ) {
    throw new Error("Missing read:capital_attestation scope.");
  }

  const partner = getCapitalPartnerBySlug(input.partnerSlug);
  if (!partner?.oauthEnabled || partner.oauthClientId !== input.credential.clientId) {
    return null;
  }

  const grant = await prisma.capitalLenderOAuthGrant.findFirst({
    where: {
      referralId: input.referralId,
      partnerSlug: input.partnerSlug,
      installationId: input.credential.installationId,
      revokedAt: null,
    },
    include: {
      referral: { include: { attestation: true } },
    },
  });
  if (!grant) return null;

  const workspaceId = await resolveOwnerWorkspaceId(input.credential.userId);
  if (!workspaceId || grant.workspaceId !== workspaceId) return null;

  const attestation = grant.referral.attestation;
  if (!attestation || attestation.expiresAt.getTime() <= Date.now()) return null;

  const payload =
    attestation.payloadJson as import("@/lib/commercial/revenue-attestation-signing").RevenueAttestationSignedPayload;
  const document = {
    payload,
    signature: attestation.signature,
    verifyUrl: "/api/capital/revenue-attestation/verify",
  };

  if (!verifyRevenueAttestationDocument(document).valid) {
    throw new Error("Stored attestation signature is invalid.");
  }

  await prisma.capitalLenderOAuthGrant.update({
    where: { id: grant.id },
    data: {
      lastAccessAt: new Date(),
      accessCount: { increment: 1 },
    },
  });

  await prisma.capitalPartnerReferral.update({
    where: { id: grant.referralId },
    data: {
      status: CapitalPartnerReferralStatus.ATTESTATION_SHARED,
      statusUpdatedAt: new Date(),
      attestationSharedAt: grant.referral.attestationSharedAt ?? new Date(),
    },
  });

  return {
    referralId: grant.referralId,
    partnerSlug: grant.partnerSlug,
    document,
  };
}

export async function loadCapitalReferralForOAuthPull(input: {
  credential: PartnerOAuthCredential;
  referralId: string;
  partnerSlug: string;
}): Promise<{
  referralId: string;
  partnerSlug: string;
  status: CapitalPartnerReferralStatus;
  attestationId: string | null;
  consentAt: string;
  offerTitle: string | null;
  offerSummary: string | null;
} | null> {
  if (
    !partnerOAuthInstallationHasCapitalScope(
      input.credential.oauthScopes,
      "read:capital_referrals",
    )
  ) {
    throw new Error("Missing read:capital_referrals scope.");
  }

  const partner = getCapitalPartnerBySlug(input.partnerSlug);
  if (!partner?.oauthEnabled || partner.oauthClientId !== input.credential.clientId) {
    return null;
  }

  const grant = await prisma.capitalLenderOAuthGrant.findFirst({
    where: {
      referralId: input.referralId,
      partnerSlug: input.partnerSlug,
      installationId: input.credential.installationId,
      revokedAt: null,
    },
    include: { referral: true },
  });
  if (!grant) return null;

  const workspaceId = await resolveOwnerWorkspaceId(input.credential.userId);
  if (!workspaceId || grant.workspaceId !== workspaceId) return null;

  return {
    referralId: grant.referralId,
    partnerSlug: grant.partnerSlug,
    status: grant.referral.status,
    attestationId: grant.referral.attestationId,
    consentAt: grant.referral.consentAt.toISOString(),
    offerTitle: grant.referral.offerTitle,
    offerSummary: grant.referral.offerSummary,
  };
}

export async function listCapitalLenderOAuthGrantsForOwner(
  userId: string,
): Promise<CapitalLenderOAuthGrantView[]> {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  if (!workspaceId) return [];

  const rows = await prisma.capitalLenderOAuthGrant.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    take: 24,
  });

  return rows.map((row) => ({
    grantId: row.id,
    referralId: row.referralId,
    partnerSlug: row.partnerSlug,
    installationId: row.installationId,
    scopesGranted: row.scopesGranted.filter(
      (scope): scope is CapitalOAuthScope =>
        scope === "read:capital_attestation" || scope === "read:capital_referrals",
    ),
    revokedAt: row.revokedAt?.toISOString() ?? null,
    lastAccessAt: row.lastAccessAt?.toISOString() ?? null,
    accessCount: row.accessCount,
    createdAt: row.createdAt.toISOString(),
  }));
}

export async function revokeCapitalLenderOAuthGrant(input: {
  userId: string;
  sessionUserId: string;
  referralId: string;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const workspaceId = await resolveOwnerWorkspaceId(input.userId);
  if (!workspaceId) return { ok: false, error: "Workspace not found." };

  const grant = await prisma.capitalLenderOAuthGrant.findFirst({
    where: { referralId: input.referralId, workspaceId },
  });
  if (!grant) return { ok: false, error: "OAuth grant not found." };
  if (grant.revokedAt) return { ok: true };

  await prisma.capitalLenderOAuthGrant.update({
    where: { id: grant.id },
    data: { revokedAt: new Date() },
  });

  await recordAuditLog({
    userId: input.sessionUserId,
    workspaceId,
    action: "capital.lender_oauth_grant_revoked",
    entityType: "CapitalLenderOAuthGrant",
    entityId: grant.id,
    metadata: { referralId: grant.referralId, partnerSlug: grant.partnerSlug },
  });

  return { ok: true };
}
