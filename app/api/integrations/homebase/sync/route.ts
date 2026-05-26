import { NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import {
  exportScheduleToHomebase,
  importScheduleFromHomebase,
} from "@/services/integrations/scheduling-sync-service";

export async function POST(request: Request) {
  const { dataUserId } = await requireTenantActor();
  const body = (await request.json().catch(() => ({}))) as { direction?: string };
  const result =
    body.direction === "import"
      ? await importScheduleFromHomebase(dataUserId)
      : await exportScheduleToHomebase(dataUserId);
  return NextResponse.json(result);
}
