"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { safeError } from "@/lib/security";
import { createCapitalLenderReferralWithConsent } from "@/services/commercial/capital-lender-offers-service";

const consentSchema = z.object({
  partnerSlug: z.string().min(1).max(80),
  attestationId: z.string().uuid().optional(),
  consentAccepted: z.literal(true),
});

export async function consentCapitalLenderOfferAction(formData: FormData) {
  try {
    const access = await requireMutationPermission("reports.export");
    if (!access.ok) return { error: access.error };

    const parsed = consentSchema.safeParse({
      partnerSlug: formData.get("partnerSlug"),
      attestationId: formData.get("attestationId") || undefined,
      consentAccepted: formData.get("consentAccepted") === "true" ? true : undefined,
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
    return {
      ok: true as const,
      referralId: result.referral.referralId,
      offerDeepLink: result.referral.offerDeepLink,
    };
  } catch (e) {
    return { error: safeError(e) };
  }
}
