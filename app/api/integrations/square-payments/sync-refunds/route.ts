import { NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { syncSquareRefunds } from "@/services/integrations/square-payments/refund-sync.service";
import { updateSquarePaymentsLiveSettings } from "@/services/integrations/square-payments/square-payments-live-service";

export async function POST(request: Request) {
  const { dataUserId } = await requireTenantActor();
  const body = (await request.json().catch(() => ({}))) as {
    paymentId?: string;
    limit?: number;
  };

  const result = await syncSquareRefunds(dataUserId, body);

  if (result.synced > 0) {
    await updateSquarePaymentsLiveSettings(dataUserId, {
      lastRefundSyncAt: new Date().toISOString(),
      lastRefundSynced: result.synced,
    });
  }

  return NextResponse.json(result, { status: result.ok || result.synced > 0 ? 200 : 400 });
}
