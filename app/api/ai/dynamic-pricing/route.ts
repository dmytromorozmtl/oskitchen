import { NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { loadDynamicPricingDashboard } from "@/services/ai/dynamic-pricing-service";

export async function GET() {
  const { dataUserId } = await requireTenantActor();
  const dashboard = await loadDynamicPricingDashboard(dataUserId);
  return NextResponse.json(dashboard);
}
