import { NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { processSquarePayment } from "@/services/integrations/square-payments/payment-processing.service";
import { updateSquarePaymentsLiveSettings } from "@/services/integrations/square-payments/square-payments-live-service";

export async function POST(request: Request) {
  const { dataUserId } = await requireTenantActor();
  const body = (await request.json().catch(() => ({}))) as {
    amount?: number;
    currency?: string;
    sourceId?: string;
    orderId?: string;
  };

  if (typeof body.amount !== "number" || body.amount <= 0) {
    return NextResponse.json({ ok: false, message: "amount is required." }, { status: 400 });
  }
  if (!body.sourceId?.trim()) {
    return NextResponse.json({ ok: false, message: "sourceId is required." }, { status: 400 });
  }

  const result = await processSquarePayment(dataUserId, {
    amount: body.amount,
    currency: body.currency,
    sourceId: body.sourceId.trim(),
    orderId: body.orderId,
  });

  if (result.ok && result.paymentId) {
    await updateSquarePaymentsLiveSettings(dataUserId, {
      lastPaymentAt: new Date().toISOString(),
      lastPaymentId: result.paymentId,
    });
  }

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
