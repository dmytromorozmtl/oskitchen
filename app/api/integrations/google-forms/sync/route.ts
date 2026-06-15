import { NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { importSubmissionsFromGoogleForms } from "@/services/integrations/google-forms-sync-service";

export async function POST() {
  const { dataUserId } = await requireTenantActor();
  const result = await importSubmissionsFromGoogleForms(dataUserId);
  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
