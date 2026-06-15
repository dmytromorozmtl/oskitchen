import { NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { importOrdersFromLightspeed } from "@/services/integrations/lightspeed-sync-service";

export async function POST() {
  const { dataUserId } = await requireTenantActor();
  const result = await importOrdersFromLightspeed(dataUserId);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
