import { CapitalPartnerReferralStatus } from "@prisma/client";

import {
  buildPartnerApplyUrl,
  attestationShareExpiresAt,
  generateCapitalAttestationShareToken,
} from "@/lib/commercial/capital-lender-offers";
import {
  getCapitalPartnerBySlug,
  listLenderOfferPartners,
  type CapitalPartner,
} from "@/lib/commercial/capital-partners";
import { recordAuditLog } from "@/lib/audit-log";
import { prisma } from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/prisma/json";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import {
  verifyRevenueAttestationDocument,
  type RevenueAttestationExportDocument,
} from "@/services/commercial/revenue-attestation-service";

export type CapitalLenderOfferRow = {
  referralId: string;
  partnerSlug: string;
  partnerName: string;
  status: CapitalPartnerReferralStatus;
  statusUpdatedAt: string;
  offerTitle: string | null;
  offerSummary: string | null;
  offerDeepLink: string | null;
  attestationId: string | null;
  consentAt: string;
  shareExpiresAt: string | null;
};

const ALLOWED_WEBHOOK_STATUSES: CapitalPartnerReferralStatus[] = [
  CapitalPartnerReferralStatus.OFFER_VIEWED,
  CapitalPartnerReferralStatus.APPLIED,
  CapitalPartnerReferralStatus.FUNDED,
  CapitalPartnerReferralStatus.DECLINED,
  CapitalPartnerReferralStatus.WITHDRAWN,
];

export function listConfiguredLenderOfferPartners(): CapitalPartner[] {
  return listLenderOfferPartners();
}

export async function listCapitalLenderOffersForOwner(userId: string): Promise<CapitalLenderOfferRow[]> {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  if (!workspaceId) return [];

  const rows = await prisma.capitalPartnerReferral.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    take: 12,
    include: {
      shareLinks: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  return rows.map((row) => {
    const partner = getCapitalPartnerBySlug(row.partnerSlug);
    return {
      referralId: row.id,
      partnerSlug: row.partnerSlug,
      partnerName: partner?.name ?? row.partnerSlug,
      status: row.status,
      statusUpdatedAt: row.statusUpdatedAt.toISOString(),
      offerTitle: row.offerTitle,
      offerSummary: row.offerSummary,
      offerDeepLink: row.offerDeepLink,
      attestationId: row.attestationId,
      consentAt: row.consentAt.toISOString(),
      shareExpiresAt: row.shareLinks[0]?.expiresAt.toISOString() ?? null,
    };
  });
}

export async function createCapitalLenderReferralWithConsent(input: {
  userId: string;
  sessionUserId: string;
  partnerSlug: string;
  attestationId?: string | null;
  verifyBaseUrl?: string;
}): Promise<{ referral: CapitalLenderOfferRow; shareToken: string | null }> {
  const partner = getCapitalPartnerBySlug(input.partnerSlug);
  if (!partner?.offersEnabled) {
    throw new Error("This financing partner is not enabled for embedded offers.");
  }

  const workspaceId = await resolveOwnerWorkspaceId(input.userId);
  if (!workspaceId) {
    throw new Error("Workspace required before sharing data with a financing partner.");
  }

  let attestationId: string | null = input.attestationId?.trim() || null;
  if (attestationId) {
    const attestation = await prisma.revenueAttestation.findFirst({
      where: { id: attestationId, workspaceId, expiresAt: { gt: new Date() } },
    });
    if (!attestation) {
      throw new Error("Selected revenue export is missing or expired.");
    }
  } else {
    const latest = await prisma.revenueAttestation.findFirst({
      where: { workspaceId, expiresAt: { gt: new Date() } },
      orderBy: { createdAt: "desc" },
    });
    attestationId = latest?.id ?? null;
  }

  const now = new Date();
  let shareToken: string | null = null;
  let offerDeepLink = partner.offerApplyUrlTemplate
    ? buildPartnerApplyUrl(partner.offerApplyUrlTemplate, { referralId: "pending" })
    : partner.href;

  const referral = await prisma.$transaction(async (tx) => {
    const created = await tx.capitalPartnerReferral.create({
      data: {
        workspaceId,
        userId: input.sessionUserId,
        partnerSlug: partner.slug,
        attestationId,
        consentAt: now,
        attestationSharedAt: attestationId ? now : null,
        status: attestationId
          ? CapitalPartnerReferralStatus.ATTESTATION_SHARED
          : CapitalPartnerReferralStatus.CONSENTED,
        statusUpdatedAt: now,
        offerTitle: partner.offerProgramName ?? `${partner.name} application`,
        offerSummary: partner.offerAmountLabel ?? null,
        offerDeepLink: null,
        metadataJson: toInputJsonValue({
          consentCopyVersion: "capital-lender-v1",
          attestationRequired: Boolean(attestationId),
        }),
      },
    });

    if (attestationId && partner.offerApplyUrlTemplate) {
      const token = generateCapitalAttestationShareToken();
      shareToken = token;
      await tx.capitalAttestationShare.create({
        data: {
          referralId: created.id,
          attestationId,
          shareToken: token,
          expiresAt: attestationShareExpiresAt(now),
        },
      });
      offerDeepLink = buildPartnerApplyUrl(partner.offerApplyUrlTemplate, {
        referralId: created.id,
        shareToken: token,
      });
    } else if (partner.offerApplyUrlTemplate) {
      offerDeepLink = buildPartnerApplyUrl(partner.offerApplyUrlTemplate, {
        referralId: created.id,
        shareToken: null,
      });
    }

    await tx.capitalPartnerReferral.update({
      where: { id: created.id },
      data: {
        offerDeepLink,
        status: CapitalPartnerReferralStatus.OFFER_VIEWED,
        statusUpdatedAt: new Date(),
      },
    });

    return created.id;
  });

  const referralRow = await prisma.capitalPartnerReferral.findUnique({
    where: { id: referral },
    include: { shareLinks: { orderBy: { createdAt: "desc" }, take: 1 } },
  });
  if (!referralRow) {
    throw new Error("Referral not found after creation.");
  }

  await recordAuditLog({
    userId: input.sessionUserId,
    workspaceId,
    action: "capital.lender_consent_granted",
    entityType: "CapitalPartnerReferral",
    entityId: referralRow.id,
    metadata: {
      partnerSlug: partner.slug,
      attestationId,
      shareCreated: Boolean(shareToken),
    },
  });

  return {
    referral: {
      referralId: referralRow.id,
      partnerSlug: referralRow.partnerSlug,
      partnerName: partner.name,
      status: referralRow.status,
      statusUpdatedAt: referralRow.statusUpdatedAt.toISOString(),
      offerTitle: referralRow.offerTitle,
      offerSummary: referralRow.offerSummary,
      offerDeepLink: referralRow.offerDeepLink,
      attestationId: referralRow.attestationId,
      consentAt: referralRow.consentAt.toISOString(),
      shareExpiresAt: referralRow.shareLinks[0]?.expiresAt.toISOString() ?? null,
    },
    shareToken,
  };
}

export async function loadSharedAttestationForPartner(input: {
  shareToken: string;
  partnerSlug: string;
}): Promise<{
  referralId: string;
  partnerSlug: string;
  document: RevenueAttestationExportDocument;
} | null> {
  const share = await prisma.capitalAttestationShare.findUnique({
    where: { shareToken: input.shareToken },
    include: {
      referral: true,
      attestation: true,
    },
  });

  if (!share) return null;
  if (share.referral.partnerSlug !== input.partnerSlug) return null;
  if (share.expiresAt.getTime() <= Date.now()) return null;
  if (share.attestation.expiresAt.getTime() <= Date.now()) return null;

  const payload = share.attestation.payloadJson as import("@/lib/commercial/revenue-attestation-signing").RevenueAttestationSignedPayload;
  const document = {
    payload,
    signature: share.attestation.signature,
    verifyUrl: "/api/capital/revenue-attestation/verify",
  };

  if (!verifyRevenueAttestationDocument(document).valid) {
    throw new Error("Stored attestation signature is invalid.");
  }

  await prisma.capitalAttestationShare.update({
    where: { id: share.id },
    data: {
      accessedAt: new Date(),
      accessCount: { increment: 1 },
    },
  });

  await prisma.capitalPartnerReferral.update({
    where: { id: share.referralId },
    data: {
      status: CapitalPartnerReferralStatus.ATTESTATION_SHARED,
      statusUpdatedAt: new Date(),
      attestationSharedAt: share.referral.attestationSharedAt ?? new Date(),
    },
  });

  return {
    referralId: share.referralId,
    partnerSlug: share.referral.partnerSlug,
    document,
  };
}

export async function applyCapitalLenderWebhookUpdate(input: {
  partnerSlug: string;
  referralId: string;
  status: CapitalPartnerReferralStatus;
  offerId?: string | null;
  offerTitle?: string | null;
  offerSummary?: string | null;
  offerDeepLink?: string | null;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  if (!ALLOWED_WEBHOOK_STATUSES.includes(input.status)) {
    return { ok: false, error: "Unsupported referral status for webhook update." };
  }

  const referral = await prisma.capitalPartnerReferral.findFirst({
    where: { id: input.referralId, partnerSlug: input.partnerSlug },
  });
  if (!referral) {
    return { ok: false, error: "Referral not found for partner." };
  }

  await prisma.capitalPartnerReferral.update({
    where: { id: referral.id },
    data: {
      status: input.status,
      statusUpdatedAt: new Date(),
      offerId: input.offerId ?? referral.offerId,
      offerTitle: input.offerTitle ?? referral.offerTitle,
      offerSummary: input.offerSummary ?? referral.offerSummary,
      offerDeepLink: input.offerDeepLink ?? referral.offerDeepLink,
    },
  });

  await recordAuditLog({
    userId: referral.userId,
    workspaceId: referral.workspaceId,
    action: "capital.lender_webhook_status",
    entityType: "CapitalPartnerReferral",
    entityId: referral.id,
    metadata: {
      partnerSlug: input.partnerSlug,
      status: input.status,
      offerId: input.offerId ?? null,
    },
  });

  return { ok: true };
}
