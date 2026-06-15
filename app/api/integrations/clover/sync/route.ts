import { NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { importOrdersFromClover } from "@/services/integrations/clover-sync-service";

export async function POST() {
  const { dataUserId } = await requireTenantActor();
  const result = await importOrdersFromClover(dataUserId);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
