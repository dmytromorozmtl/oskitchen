import { NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { getProfitEngineSnapshot } from "@/services/analytics/profit-engine-service";

export async function GET() {
  const { dataUserId } = await requireTenantActor();
  const snapshot = await getProfitEngineSnapshot(dataUserId);
  return NextResponse.json(snapshot);
}
