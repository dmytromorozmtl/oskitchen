import { NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { importOrdersFromToast } from "@/services/integrations/toast-sync-service";

export async function POST() {
  const { dataUserId } = await requireTenantActor();
  const result = await importOrdersFromToast(dataUserId);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
