import { NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { importOrdersFromSquare } from "@/services/integrations/square-sync-service";

export async function POST() {
  const { dataUserId } = await requireTenantActor();
  const result = await importOrdersFromSquare(dataUserId);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
