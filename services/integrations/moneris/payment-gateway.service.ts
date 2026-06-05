import { randomUUID } from "node:crypto";

import type { MonerisPaymentGatewayResult } from "@/lib/integrations/moneris-live-types";
import { createMonerisPurchase } from "@/services/integrations/moneris/moneris-api";
import { getMonerisCredentials } from "@/services/integrations/moneris/moneris-credentials";
import { ensureMonerisConnection } from "@/services/integrations/moneris/moneris-live-service";

export async function processMonerisPayment(
  userId: string,
  input: {
    amount: number;
    currency?: string;
    orderId?: string;
  },
): Promise<MonerisPaymentGatewayResult> {
  const conn = await ensureMonerisConnection(userId);
  const creds = getMonerisCredentials(conn);
  if (!creds?.storeId) {
    return {
      ok: false,
      transactionId: null,
      status: null,
      amountCents: 0,
      currency: input.currency ?? "CAD",
      message: "Connect Moneris via OAuth and set MONERIS_STORE_ID.",
    };
  }

  const amountCents = Math.max(1, Math.round(input.amount * 100));
  const result = await createMonerisPurchase({
    accessToken: creds.accessToken,
    apiToken: creds.apiToken,
    storeId: creds.storeId,
    amountCents,
    currency: input.currency,
    orderId: input.orderId,
    idempotencyKey: randomUUID(),
  });

  if (!result.ok) {
    return {
      ok: false,
      transactionId: null,
      status: null,
      amountCents,
      currency: input.currency ?? "CAD",
      message: result.error,
    };
  }

  return {
    ok: true,
    transactionId: result.transactionId,
    status: result.status,
    amountCents,
    currency: input.currency ?? "CAD",
    message: `Transaction ${result.transactionId} ${result.status}`,
  };
}
