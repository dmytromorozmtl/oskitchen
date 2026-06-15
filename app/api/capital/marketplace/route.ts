import { NextResponse } from "next/server";

import { CAPITAL_REGIONS, type CapitalRegion } from "@/lib/commercial/capital-partners";
import { requireMutationPermission } from "@/lib/permissions/mutation-access";
import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { loadCapitalMarketplaceSnapshot } from "@/services/commercial/capital-multi-lender-service";

export async function GET(request: Request) {
  const access = await requireMutationPermission("reports.read.financial");
  if (!access.ok) {
    return NextResponse.json({ error: access.error }, { status: 403 });
  }

  const url = new URL(request.url);
  const regionParam = url.searchParams.get("region")?.trim().toUpperCase() ?? null;
  const region =
    regionParam && CAPITAL_REGIONS.includes(regionParam as CapitalRegion)
      ? (regionParam as CapitalRegion)
      : null;

  const actor = await requireTenantActor();
  const snapshot = await loadCapitalMarketplaceSnapshot({
    userId: actor.dataUserId,
    region,
  });

  return NextResponse.json({ ok: true, marketplace: snapshot });
}
