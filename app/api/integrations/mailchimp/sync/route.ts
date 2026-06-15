import { NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { syncCustomersToMailchimp } from "@/services/integrations/mailchimp-sync-service";

export async function POST(request: Request) {
  const { dataUserId } = await requireTenantActor();
  const body = (await request.json().catch(() => ({}))) as {
    days?: number;
    limit?: number;
  };

  const result = await syncCustomersToMailchimp(dataUserId, {
    days: body.days,
    limit: body.limit,
  });

  return NextResponse.json(result, { status: result.ok || result.synced > 0 ? 200 : 400 });
}
