import { NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { getLaborRealtimeData } from "@/services/labor/labor-realtime-service";

export async function GET() {
  const { dataUserId } = await requireTenantActor();
  const data = await getLaborRealtimeData(dataUserId);
  return NextResponse.json(data);
}
