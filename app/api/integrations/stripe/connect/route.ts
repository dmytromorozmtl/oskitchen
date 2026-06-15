import { NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { connectStripeLive } from "@/services/integrations/stripe/stripe-live-service";

export async function POST() {
  const { dataUserId } = await requireTenantActor();
  const result = await connectStripeLive(dataUserId);
  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.error }, { status: 400 });
  }
  return NextResponse.json({ ok: true, message: "Stripe LIVE connected." });
}
