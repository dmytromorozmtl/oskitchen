import { randomUUID } from "node:crypto";

import type { SquarePaymentProcessResult } from "@/lib/integrations/square-payments-live-types";
import { createSquarePaymentApi } from "@/services/integrations/square-payments/square-payments-api";
import { getSquarePaymentsCredentials } from "@/services/integrations/square-payments/square-payments-credentials";
import { ensureSquarePaymentsConnection } from "@/services/integrations/square-payments/square-payments-live-service";

export async function processSquarePayment(
  userId: string,
  input: {
    amount: number;
    currency?: string;
    sourceId: string;
    orderId?: string;
  },
): Promise<SquarePaymentProcessResult> {
  const conn = await ensureSquarePaymentsConnection(userId);
  const creds = getSquarePaymentsCredentials(conn);
  if (!creds?.accessToken || !creds.locationId) {
    return {
      ok: false,
      paymentId: null,
      status: null,
      amountCents: 0,
      currency: input.currency ?? "USD",
      message: "Connect Square Payments via OAuth first.",
    };
  }

  const amountCents = Math.max(1, Math.round(input.amount * 100));
  const result = await createSquarePaymentApi({
    accessToken: creds.accessToken,
    locationId: creds.locationId,
    amountCents,
    currency: input.currency,
    sourceId: input.sourceId,
    idempotencyKey: randomUUID(),
    orderId: input.orderId,
  });

  if (!result.ok) {
    return {
      ok: false,
      paymentId: null,
      status: null,
      amountCents,
      currency: input.currency ?? "USD",
      message: result.error,
    };
  }

  return {
    ok: true,
    paymentId: result.paymentId,
    status: result.status,
    amountCents,
    currency: input.currency ?? "USD",
    message: `Payment ${result.paymentId} ${result.status}`,
  };
}
