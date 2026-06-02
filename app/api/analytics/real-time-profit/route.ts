import { NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { getRealTimeProfit } from "@/services/analytics/real-time-profit-service";

export async function GET() {
  const { dataUserId } = await requireTenantActor();
  const snapshot = await getRealTimeProfit(dataUserId);
  return NextResponse.json(snapshot);
}
