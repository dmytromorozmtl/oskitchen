import { randomUUID } from "node:crypto";

import type { SquareRefundSyncResult } from "@/lib/integrations/square-payments-live-types";
import { prisma } from "@/lib/prisma";
import {
  createSquareRefundApi,
  listSquareRefundsApi,
} from "@/services/integrations/square-payments/square-payments-api";
import { getSquarePaymentsCredentials } from "@/services/integrations/square-payments/square-payments-credentials";
import { ensureSquarePaymentsConnection } from "@/services/integrations/square-payments/square-payments-live-service";

export async function syncSquareRefunds(
  userId: string,
  opts?: { paymentId?: string; limit?: number },
): Promise<SquareRefundSyncResult> {
  const conn = await ensureSquarePaymentsConnection(userId);
  const creds = getSquarePaymentsCredentials(conn);
  if (!creds?.accessToken || !creds.locationId) {
    return { ok: false, synced: 0, failed: 0, message: "Connect Square Payments via OAuth first." };
  }

  const refunds = await listSquareRefundsApi({
    accessToken: creds.accessToken,
    locationId: creds.locationId,
    limit: opts?.limit ?? 25,
  });

  let synced = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const refund of refunds) {
    if (opts?.paymentId && refund.paymentId !== opts.paymentId) continue;

    const tx = await prisma.pOSTransaction.findFirst({
      where: {
        userId,
        externalPaymentReference: refund.paymentId,
      },
      select: { id: true, orderId: true },
    });

    if (!tx) {
      synced += 1;
      continue;
    }

    await prisma.order.updateMany({
      where: { id: tx.orderId, userId },
      data: { paymentStatus: "REFUNDED" },
    });
    synced += 1;
  }

  if (opts?.paymentId && refunds.length === 0) {
    const created = await createSquareRefundApi({
      accessToken: creds.accessToken,
      paymentId: opts.paymentId,
      idempotencyKey: randomUUID(),
    });
    if (created.ok) {
      synced += 1;
    } else {
      failed += 1;
      errors.push(created.error);
    }
  }

  return {
    ok: failed === 0,
    synced,
    failed,
    message: `Synced ${synced} refunds (${failed} failed)`,
    errors: errors.length ? errors : undefined,
  };
}
