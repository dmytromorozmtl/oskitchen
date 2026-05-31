import { NextResponse } from "next/server";
import { z } from "zod";

import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  generateRevenueAttestationForOwner,
  isAllowedAttestationMonths,
} from "@/services/commercial/revenue-attestation-service";

const bodySchema = z.object({
  months: z.coerce.number().int(),
});

export async function POST(request: Request) {
  const access = await requireMutationPermission("reports.export");
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: 403 });
  }

  const json = await request.json().catch(() => null);
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success || !isAllowedAttestationMonths(parsed.data.months)) {
    return NextResponse.json({ error: "Invalid period — use 3, 6, or 12 months." }, { status: 400 });
  }

  try {
    const actor = await requireTenantActor();
    const origin = new URL(request.url).origin;
    const result = await generateRevenueAttestationForOwner({
      userId: actor.dataUserId,
      sessionUserId: actor.sessionUser.id,
      months: parsed.data.months,
      verifyBaseUrl: origin,
    });

    return NextResponse.json({
      ok: true,
      attestationId: result.attestation.id,
      expiresAt: result.attestation.expiresAt.toISOString(),
      downloadUrl: `/api/capital/revenue-attestation/${result.attestation.id}/download`,
      grossOrderRevenue: result.document.payload.grossOrderRevenue,
      orderCount: result.document.payload.orderCount,
      currency: result.document.payload.currency,
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
