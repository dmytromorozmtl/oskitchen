import { CapitalPartnerReferralStatus, Prisma } from "@prisma/client";

import { recordAuditLog } from "@/lib/audit-log";
import {
  getCapitalPartnerBySlug,
  listMerchantVisibleLenderPartners,
  mapCountryToCapitalRegion,
  type CapitalPartner,
  type CapitalRegion,
} from "@/lib/commercial/capital-partners";
import { prisma } from "@/lib/prisma";
import { toInputJsonValue } from "@/lib/prisma/json";
import { resolveOwnerWorkspaceId } from "@/lib/scope/resolve-owner-workspace-id";
import type { CapitalLenderOfferRow } from "@/services/commercial/capital-lender-offers-service";

export type CapitalPartnerOfferSnapshot = {
  offerId: string;
  title: string;
  summary: string | null;
  amountMin: number | null;
  amountMax: number | null;
  currency: string;
  termLabel: string | null;
  rateLabel: string | null;
  deepLink: string | null;
  expiresAt: string | null;
  isSelected: boolean;
};

export type CapitalMarketplaceReferralRow = CapitalLenderOfferRow & {
  partnerOffers: CapitalPartnerOfferSnapshot[];
  selectedOfferId: string | null;
  timeline: Array<{ step: string; at: string | null }>;
  oauthConnected: boolean;
  oauthRevokedAt: string | null;
  oauthLastAccessAt: string | null;
};

export type CapitalMarketplaceSnapshot = {
  region: CapitalRegion;
  detectedRegion: CapitalRegion;
  availableRegions: CapitalRegion[];
  partners: CapitalPartner[];
  referrals: CapitalMarketplaceReferralRow[];
};

export type CapitalWebhookOfferInput = {
  partnerOfferId: string;
  title: string;
  summary?: string | null;
  amountMin?: number | null;
  amountMax?: number | null;
  currency?: string | null;
  termLabel?: string | null;
  rateLabel?: string | null;
  deepLink?: string | null;
  expiresAt?: string | null;
};

function decimalToNumber(value: Prisma.Decimal | null | undefined): number | null {
  if (value == null) return null;
  return Number(value.toString());
}

function buildReferralTimeline(row: {
  consentAt: Date;
  attestationSharedAt: Date | null;
  status: CapitalPartnerReferralStatus;
  statusUpdatedAt: Date;
  comparedAt: Date | null;
}): CapitalMarketplaceReferralRow["timeline"] {
  const steps: CapitalMarketplaceReferralRow["timeline"] = [
    { step: "Consent recorded", at: row.consentAt.toISOString() },
    { step: "Revenue shared", at: row.attestationSharedAt?.toISOString() ?? null },
    { step: "Offer opened", at: row.status === "OFFER_VIEWED" ? row.statusUpdatedAt.toISOString() : null },
    { step: "Compared offers", at: row.comparedAt?.toISOString() ?? null },
  ];

  if (row.status === "APPLIED") {
    steps.push({ step: "Application submitted", at: row.statusUpdatedAt.toISOString() });
  } else if (row.status === "FUNDED") {
    steps.push({ step: "Funded", at: row.statusUpdatedAt.toISOString() });
  } else if (row.status === "DECLINED") {
    steps.push({ step: "Declined", at: row.statusUpdatedAt.toISOString() });
  } else if (row.status === "WITHDRAWN") {
    steps.push({ step: "Withdrawn", at: row.statusUpdatedAt.toISOString() });
  }

  return steps;
}

export async function resolveCapitalRegionForOwner(userId: string): Promise<CapitalRegion> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { country: true },
  });
  return mapCountryToCapitalRegion(kitchen?.country);
}

export async function loadCapitalMarketplaceSnapshot(input: {
  userId: string;
  region?: CapitalRegion | null;
}): Promise<CapitalMarketplaceSnapshot> {
  const detectedRegion = await resolveCapitalRegionForOwner(input.userId);
  const region = input.region ?? detectedRegion;
  const partners = listMerchantVisibleLenderPartners({ region });
  const referrals = await listCapitalMarketplaceReferralsForOwner(input.userId);

  return {
    region,
    detectedRegion,
    availableRegions: ["US", "CA", "UK", "EU"],
    partners,
    referrals,
  };
}

export async function listCapitalMarketplaceReferralsForOwner(
  userId: string,
): Promise<CapitalMarketplaceReferralRow[]> {
  const workspaceId = await resolveOwnerWorkspaceId(userId);
  if (!workspaceId) return [];

  const rows = await prisma.capitalPartnerReferral.findMany({
    where: { workspaceId },
    orderBy: { createdAt: "desc" },
    take: 24,
    include: {
      shareLinks: { orderBy: { createdAt: "desc" }, take: 1 },
      partnerOffers: { orderBy: { createdAt: "asc" } },
      selectedOffer: true,
      oauthGrant: true,
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
      selectedOfferId: row.selectedOfferId,
      partnerOffers: row.partnerOffers.map((offer) => ({
        offerId: offer.id,
        title: offer.title,
        summary: offer.summary,
        amountMin: decimalToNumber(offer.amountMin),
        amountMax: decimalToNumber(offer.amountMax),
        currency: offer.currency,
        termLabel: offer.termLabel,
        rateLabel: offer.rateLabel,
        deepLink: offer.deepLink,
        expiresAt: offer.expiresAt?.toISOString() ?? null,
        isSelected: row.selectedOfferId === offer.id,
      })),
      timeline: buildReferralTimeline(row),
      oauthConnected: Boolean(row.oauthGrant && !row.oauthGrant.revokedAt),
      oauthRevokedAt: row.oauthGrant?.revokedAt?.toISOString() ?? null,
      oauthLastAccessAt: row.oauthGrant?.lastAccessAt?.toISOString() ?? null,
    };
  });
}

export async function upsertCapitalPartnerOffersFromWebhook(input: {
  partnerSlug: string;
  referralId: string;
  offers: CapitalWebhookOfferInput[];
}): Promise<{ upserted: number }> {
  const referral = await prisma.capitalPartnerReferral.findFirst({
    where: { id: input.referralId, partnerSlug: input.partnerSlug },
  });
  if (!referral) {
    throw new Error("Referral not found for partner.");
  }

  let upserted = 0;
  for (const offer of input.offers) {
    await prisma.capitalPartnerOffer.upsert({
      where: {
        referralId_partnerOfferId: {
          referralId: referral.id,
          partnerOfferId: offer.partnerOfferId,
        },
      },
      create: {
        referralId: referral.id,
        partnerOfferId: offer.partnerOfferId,
        title: offer.title,
        summary: offer.summary ?? null,
        amountMin: offer.amountMin ?? null,
        amountMax: offer.amountMax ?? null,
        currency: offer.currency?.trim() || "USD",
        termLabel: offer.termLabel ?? null,
        rateLabel: offer.rateLabel ?? null,
        deepLink: offer.deepLink ?? null,
        expiresAt: offer.expiresAt ? new Date(offer.expiresAt) : null,
        metadataJson: toInputJsonValue({ source: "partner_webhook_v2" }),
      },
      update: {
        title: offer.title,
        summary: offer.summary ?? null,
        amountMin: offer.amountMin ?? null,
        amountMax: offer.amountMax ?? null,
        currency: offer.currency?.trim() || "USD",
        termLabel: offer.termLabel ?? null,
        rateLabel: offer.rateLabel ?? null,
        deepLink: offer.deepLink ?? null,
        expiresAt: offer.expiresAt ? new Date(offer.expiresAt) : null,
      },
    });
    upserted += 1;
  }

  await prisma.capitalPartnerReferral.update({
    where: { id: referral.id },
    data: { comparedAt: new Date() },
  });

  return { upserted };
}

export async function selectCapitalReferralOffer(input: {
  userId: string;
  sessionUserId: string;
  referralId: string;
  offerId: string;
}): Promise<{ ok: true; deepLink: string | null } | { ok: false; error: string }> {
  const workspaceId = await resolveOwnerWorkspaceId(input.userId);
  if (!workspaceId) {
    return { ok: false, error: "Workspace required." };
  }

  const referral = await prisma.capitalPartnerReferral.findFirst({
    where: { id: input.referralId, workspaceId },
    include: { partnerOffers: true },
  });
  if (!referral) {
    return { ok: false, error: "Referral not found." };
  }

  const offer = referral.partnerOffers.find((row) => row.id === input.offerId);
  if (!offer) {
    return { ok: false, error: "Offer not found for this referral." };
  }
  if (offer.expiresAt && offer.expiresAt.getTime() <= Date.now()) {
    return { ok: false, error: "This offer has expired — request a refreshed quote from the lender." };
  }

  await prisma.capitalPartnerReferral.update({
    where: { id: referral.id },
    data: {
      selectedOfferId: offer.id,
      comparedAt: new Date(),
      offerId: offer.partnerOfferId,
      offerTitle: offer.title,
      offerSummary: offer.summary,
      offerDeepLink: offer.deepLink ?? referral.offerDeepLink,
    },
  });

  await recordAuditLog({
    userId: input.sessionUserId,
    workspaceId,
    action: "capital.lender_offer_selected",
    entityType: "CapitalPartnerOffer",
    entityId: offer.id,
    metadata: {
      referralId: referral.id,
      partnerSlug: referral.partnerSlug,
      partnerOfferId: offer.partnerOfferId,
    },
  });

  return { ok: true, deepLink: offer.deepLink ?? referral.offerDeepLink };
}
