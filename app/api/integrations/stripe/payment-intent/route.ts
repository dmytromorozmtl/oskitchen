import { NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { createStripeLivePaymentIntent } from "@/services/integrations/stripe/payment-intent.service";
import { updateStripeLiveSettings } from "@/services/integrations/stripe/stripe-live-service";

export async function POST(request: Request) {
  const { dataUserId } = await requireTenantActor();
  const body = (await request.json().catch(() => ({}))) as {
    amount?: number;
    currency?: string;
    orderId?: string;
    description?: string;
  };

  if (typeof body.amount !== "number" || body.amount <= 0) {
    return NextResponse.json({ ok: false, message: "amount is required." }, { status: 400 });
  }

  const result = await createStripeLivePaymentIntent({
    amount: body.amount,
    currency: body.currency,
    orderId: body.orderId,
    userId: dataUserId,
    description: body.description,
  });

  if (result.ok && result.paymentIntentId) {
    await updateStripeLiveSettings(dataUserId, {
      lastPaymentIntentAt: new Date().toISOString(),
      lastPaymentIntentId: result.paymentIntentId,
    });
  }

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
