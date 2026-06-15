import { NextResponse } from "next/server";
import { z } from "zod";

import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { createCapitalLenderReferralWithConsent } from "@/services/commercial/capital-lender-offers-service";

const bodySchema = z.object({
  partnerSlug: z.string().min(1).max(80),
  attestationId: z.string().uuid().optional(),
  consentAccepted: z.literal(true),
});

export async function POST(request: Request) {
  const access = await requireMutationPermission("reports.export");
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Consent and partner selection are required." }, { status: 400 });
  }

  try {
    const actor = await requireTenantActor();
    const result = await createCapitalLenderReferralWithConsent({
      userId: actor.dataUserId,
      sessionUserId: actor.sessionUser.id,
      partnerSlug: parsed.data.partnerSlug,
      attestationId: parsed.data.attestationId ?? null,
    });

    return NextResponse.json({
      ok: true,
      referral: result.referral,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
