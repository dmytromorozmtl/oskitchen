import { NextResponse } from "next/server";

import { requireTenantActor } from "@/lib/scope/require-tenant-actor";
import { processMonerisPayment } from "@/services/integrations/moneris/payment-gateway.service";
import { updateMonerisLiveSettings } from "@/services/integrations/moneris/moneris-live-service";

export async function POST(request: Request) {
  const { dataUserId } = await requireTenantActor();
  const body = (await request.json().catch(() => ({}))) as {
    amount?: number;
    currency?: string;
    orderId?: string;
  };

  if (typeof body.amount !== "number" || body.amount <= 0) {
    return NextResponse.json({ ok: false, message: "amount is required." }, { status: 400 });
  }

  const result = await processMonerisPayment(dataUserId, body);

  if (result.ok && result.transactionId) {
    await updateMonerisLiveSettings(dataUserId, {
      lastPaymentAt: new Date().toISOString(),
      lastTransactionId: result.transactionId,
      lastGatewayStatus: result.status,
    });
  }

  return NextResponse.json(result, { status: result.ok ? 200 : 400 });
}
