"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { z } from "zod";

import { getCapitalPartnerBySlug } from "@/lib/commercial/capital-partners";
import { isCapitalLenderOAuthEnabled } from "@/lib/commercial/capital-lender-oauth";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import { createCapitalLenderReferralWithConsent } from "@/services/commercial/capital-lender-offers-service";
import {
  buildCapitalLenderOAuthAuthorizeUrl,
  revokeCapitalLenderOAuthGrant,
} from "@/services/commercial/capital-lender-oauth-service";
import { selectCapitalReferralOffer } from "@/services/commercial/capital-multi-lender-service";

const consentSchema = z.object({
  partnerSlug: z.string().min(1).max(80),
  attestationId: z.string().uuid().optional(),
  consentAccepted: z.literal(true),
  useOAuth: z.boolean().optional(),
});

export async function consentCapitalLenderOfferAction(formData: FormData) {
  try {
    const access = await requireMutationPermission("reports.export");
    if (!access.ok) return { error: access.error };

    const parsed = consentSchema.safeParse({
      partnerSlug: formData.get("partnerSlug"),
      attestationId: formData.get("attestationId") || undefined,
      consentAccepted: formData.get("consentAccepted") === "true" ? true : undefined,
      useOAuth: formData.get("useOAuth") === "true" ? true : undefined,
    });
    if (!parsed.success) {
      return { error: "Consent and partner selection are required." };
    }

    const actor = await requireTenantActor();
    const result = await createCapitalLenderReferralWithConsent({
      userId: actor.dataUserId,
      sessionUserId: actor.sessionUser.id,
      partnerSlug: parsed.data.partnerSlug,
      attestationId: parsed.data.attestationId ?? null,
    });

    revalidatePath("/dashboard/analytics/capital");

    const partner = getCapitalPartnerBySlug(parsed.data.partnerSlug);
    const wantsOAuth =
      parsed.data.useOAuth === true &&
      isCapitalLenderOAuthEnabled() &&
      partner?.oauthEnabled &&
      partner.oauthClientId;

    if (wantsOAuth && partner) {
      const h = await headers();
      const origin =
        process.env.NEXT_PUBLIC_APP_URL?.trim() ||
        (h.get("x-forwarded-host") ? `https://${h.get("x-forwarded-host")}` : null) ||
        "http://localhost:3000";
      const normalizedOrigin = origin.startsWith("http") ? origin : `https://${origin}`;
      const oauthAuthorizeUrl = buildCapitalLenderOAuthAuthorizeUrl({
        partner,
        referralId: result.referral.referralId,
        origin: normalizedOrigin,
      });
      return {
        ok: true as const,
        referralId: result.referral.referralId,
        offerDeepLink: result.referral.offerDeepLink,
        oauthAuthorizeUrl,
      };
    }

    return {
      ok: true as const,
      referralId: result.referral.referralId,
      offerDeepLink: result.referral.offerDeepLink,
    };
  } catch (e) {
    return { error: safeError(e) };
  }
}

const selectOfferSchema = z.object({
  referralId: z.string().uuid(),
  offerId: z.string().uuid(),
});

export async function selectCapitalReferralOfferAction(formData: FormData) {
  try {
    const access = await requireMutationPermission("reports.export");
    if (!access.ok) return { error: access.error };

    const parsed = selectOfferSchema.safeParse({
      referralId: formData.get("referralId"),
      offerId: formData.get("offerId"),
    });
    if (!parsed.success) return { error: "Invalid offer selection." };

    const actor = await requireTenantActor();
    const result = await selectCapitalReferralOffer({
      userId: actor.dataUserId,
      sessionUserId: actor.sessionUser.id,
      referralId: parsed.data.referralId,
      offerId: parsed.data.offerId,
    });

    if (!result.ok) return { error: result.error };

    revalidatePath("/dashboard/analytics/capital");
    return { ok: true as const, deepLink: result.deepLink };
  } catch (e) {
    return { error: safeError(e) };
  }
}

const revokeOAuthSchema = z.object({
  referralId: z.string().uuid(),
});

export async function revokeCapitalLenderOAuthGrantAction(formData: FormData) {
  try {
    const access = await requireMutationPermission("reports.export");
    if (!access.ok) return { error: access.error };

    const parsed = revokeOAuthSchema.safeParse({
      referralId: formData.get("referralId"),
    });
    if (!parsed.success) return { error: "Invalid referral." };

    const actor = await requireTenantActor();
    const result = await revokeCapitalLenderOAuthGrant({
      userId: actor.dataUserId,
      sessionUserId: actor.sessionUser.id,
      referralId: parsed.data.referralId,
    });

    if (!result.ok) return { error: result.error };

    revalidatePath("/dashboard/analytics/capital");
    return { ok: true as const };
  } catch (e) {
    return { error: safeError(e) };
  }
}
