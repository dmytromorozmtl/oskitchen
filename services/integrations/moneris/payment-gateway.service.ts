import { randomUUID } from "crypto";

import { IntegrationProvider } from "@prisma/client";

import type { MonerisPaymentGatewayResult } from "@/lib/integrations/moneris-live-types";
import { prisma } from "@/lib/prisma";
import { integrationConnectionByProviderWhereForOwner } from "@/lib/scope/workspace-resource-scope";
import { createMonerisPurchase } from "@/services/integrations/moneris/moneris-api";
import { getMonerisCredentials } from "@/services/integrations/moneris/moneris-credentials";

export async function processMonerisPayment(
  userId: string,
  input: {
    amount: number;
    currency?: string;
    orderId?: string;
  },
): Promise<MonerisPaymentGatewayResult> {
  const currency = (input.currency ?? "CAD").toUpperCase();
  const amountCents = Math.round(input.amount * 100);

  if (amountCents <= 0) {
    return {
      ok: false,
      transactionId: null,
      status: null,
      amountCents,
      currency,
      message: "amount must be positive.",
    };
  }

  const where = await integrationConnectionByProviderWhereForOwner(
    userId,
    IntegrationProvider.MONERIS,
  );
  const conn = await prisma.integrationConnection.findFirst({ where });
  if (!conn) {
    return {
      ok: false,
      transactionId: null,
      status: null,
      amountCents,
      currency,
      message: "Moneris is not connected.",
    };
  }

  const creds = getMonerisCredentials(conn);
  if (!creds?.storeId) {
    return {
      ok: false,
      transactionId: null,
      status: null,
      amountCents,
      currency,
      message: "Moneris credentials or store ID missing.",
    };
  }

  const purchase = await createMonerisPurchase({
    accessToken: creds.accessToken,
    apiToken: creds.apiToken,
    storeId: creds.storeId,
    amountCents,
    currency,
    orderId: input.orderId,
    idempotencyKey: randomUUID(),
  });

  if (!purchase.ok) {
    return {
      ok: false,
      transactionId: null,
      status: null,
      amountCents,
      currency,
      message: purchase.error,
    };
  }

  return {
    ok: true,
    transactionId: purchase.transactionId,
    status: purchase.status,
    amountCents,
    currency,
    message: "Payment processed.",
  };
}
