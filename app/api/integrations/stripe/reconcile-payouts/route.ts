import { NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { reconcileStripePayouts } from "@/services/integrations/stripe/payout-reconciliation.service";
import { updateStripeLiveSettings } from "@/services/integrations/stripe/stripe-live-service";

export async function POST(request: Request) {
  const { dataUserId } = await requireTenantActor();
  const body = (await request.json().catch(() => ({}))) as { limit?: number };

  const result = await reconcileStripePayouts(dataUserId, { limit: body.limit });

  if (result.ok) {
    await updateStripeLiveSettings(dataUserId, {
      lastPayoutReconcileAt: new Date().toISOString(),
      lastPayoutReconcileCount: result.reconciled,
    });
  }

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
