import { NextResponse } from "next/server";

import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { listCapitalMarketplaceReferralsForOwner } from "@/services/commercial/capital-multi-lender-service";

export async function GET() {
  const access = await requireMutationPermission("reports.read.financial");
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: 403 });
  }

  const actor = await requireTenantActor();
  const referrals = await listCapitalMarketplaceReferralsForOwner(actor.dataUserId);
  return NextResponse.json({ ok: true, referrals });
}
