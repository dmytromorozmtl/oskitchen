import { randomUUID } from "crypto";

import {
  assertPciSafeOfflineCardCapture,
  OFFLINE_CARD_PCI_NOTES,
  type OfflineCardCaptureInput,
} from "@/lib/pos/offline-card-pci";
import { offlinePaymentReference } from "@/lib/pos/offline-sync";
import { prisma } from "@/lib/prisma";
import { processTerminalPayment } from "@/services/payments/stripe-terminal-service";
import { getStripe } from "@/lib/stripe";

export { OFFLINE_CARD_PCI_NOTES };

export type OfflineCardCaptureStatus = "queued" | "syncing" | "captured" | "failed" | "expired";

export type OfflineCardCaptureRecord = {
  id: string;
  userId: string;
  workspaceId: string | null;
  offlineSaleId: string;
  registerId: string;
  orderId: string | null;
  amountCents: number;
  currency: string;
  cardBrand: string;
  last4: string;
  paymentIntentId: string | null;
  stripeOfflineReference: string | null;
  tableId: string | null;
  deviceId: string | null;
  status: OfflineCardCaptureStatus;
  createdAt: string;
  capturedAt: string | null;
  lastError: string | null;
};

const captures = new Map<string, OfflineCardCaptureRecord[]>();

function queueKey(userId: string, workspaceId: string | null): string {
  return `${userId}:${workspaceId ?? "none"}`;
}

export function offlineCardCaptureReference(offlineSaleId: string): string {
  return `offline-card:${offlineSaleId}`;
}

export async function enqueueOfflineCardCapture(input: {
  userId: string;
  workspaceId?: string | null;
  capture: OfflineCardCaptureInput;
}): Promise<{ id: string; record: OfflineCardCaptureRecord }> {
  const safe = assertPciSafeOfflineCardCapture(input.capture);
  const id = randomUUID();
  const record: OfflineCardCaptureRecord = {
    id,
    userId: input.userId,
    workspaceId: input.workspaceId ?? null,
    offlineSaleId: safe.offlineSaleId,
    registerId: safe.registerId,
    orderId: null,
    amountCents: safe.amountCents,
    currency: safe.currency ?? "usd",
    cardBrand: safe.cardBrand,
    last4: safe.last4,
    paymentIntentId: safe.paymentIntentId ?? null,
    stripeOfflineReference: safe.stripeOfflineReference ?? null,
    tableId: safe.tableId ?? null,
    deviceId: safe.deviceId ?? null,
    status: "queued",
    createdAt: new Date().toISOString(),
    capturedAt: null,
    lastError: null,
  };

  const key = queueKey(input.userId, record.workspaceId);
  const list = captures.get(key) ?? [];
  const duplicate = list.find(
    (r) => r.offlineSaleId === record.offlineSaleId && r.status === "queued",
  );
  if (duplicate) {
    return { id: duplicate.id, record: duplicate };
  }
  list.push(record);
  captures.set(key, list);
  return { id, record };
}

export async function linkOfflineCardCaptureToOrder(input: {
  userId: string;
  workspaceId?: string | null;
  offlineSaleId: string;
  orderId: string;
}): Promise<boolean> {
  const key = queueKey(input.userId, input.workspaceId ?? null);
  const list = captures.get(key) ?? [];
  const row = list.find((r) => r.offlineSaleId === input.offlineSaleId);
  if (!row) return false;
  row.orderId = input.orderId;
  return true;
}

export async function listOfflineCardCaptures(input: {
  userId: string;
  workspaceId?: string | null;
  status?: OfflineCardCaptureStatus | OfflineCardCaptureStatus[];
}): Promise<OfflineCardCaptureRecord[]> {
  const key = queueKey(input.userId, input.workspaceId ?? null);
  const list = captures.get(key) ?? [];
  const statuses = input.status
    ? Array.isArray(input.status)
      ? input.status
      : [input.status]
    : null;
  return list
    .filter((r) => !statuses || statuses.includes(r.status))
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt));
}

export type SyncOfflineCardCapturesResult = {
  attempted: number;
  captured: number;
  failed: number;
  errors: Array<{ id: string; error: string }>;
};

async function markOrderPaidAfterCapture(
  userId: string,
  orderId: string,
  paymentIntentId: string,
): Promise<void> {
  const stripe = getStripe();
  if (stripe) {
    await processTerminalPayment(paymentIntentId, orderId, userId);
    return;
  }

  await prisma.$transaction(async (tx) => {
    await tx.order.update({
      where: { id: orderId },
      data: {
        paymentStatus: "PAID",
        paymentMode: "OFFLINE_CARD_QUEUED",
      },
    });
    const txn = await tx.pOSTransaction.findFirst({ where: { orderId, userId } });
    if (txn) {
      await tx.pOSTransaction.update({
        where: { id: txn.id },
        data: {
          paymentStatus: "PAID",
          paymentMode: "OFFLINE_CARD_QUEUED",
          externalPaymentReference: paymentIntentId,
        },
      });
      const payment = await tx.pOSPayment.findFirst({ where: { transactionId: txn.id } });
      if (payment) {
        await tx.pOSPayment.update({
          where: { id: payment.id },
          data: {
            status: "PAID",
            provider: "STRIPE",
            providerReference: paymentIntentId,
          },
        });
      }
    }
  });
}

/**
 * Replay queued offline card captures when online.
 * Requires `paymentIntentId` from Stripe Terminal offline flow — never raw card data.
 */
export async function syncOfflineCardCaptures(input: {
  userId: string;
  workspaceId?: string | null;
  online?: boolean;
}): Promise<SyncOfflineCardCapturesResult> {
  const result: SyncOfflineCardCapturesResult = {
    attempted: 0,
    captured: 0,
    failed: 0,
    errors: [],
  };

  if (input.online === false) {
    return result;
  }

  const pending = await listOfflineCardCaptures({
    userId: input.userId,
    workspaceId: input.workspaceId,
    status: "queued",
  });

  for (const record of pending) {
    if (!record.orderId) {
      result.failed += 1;
      record.status = "failed";
      record.lastError = "Order not linked — replay POS checkout before card capture.";
      result.errors.push({ id: record.id, error: record.lastError });
      continue;
    }

    result.attempted += 1;
    record.status = "syncing";

    if (!record.paymentIntentId) {
      record.status = "failed";
      record.lastError =
        "Missing Stripe payment intent — complete tap on Terminal when online, or use cash offline.";
      result.failed += 1;
      result.errors.push({ id: record.id, error: record.lastError });
      continue;
    }

    try {
      await markOrderPaidAfterCapture(
        input.userId,
        record.orderId,
        record.paymentIntentId,
      );
      record.status = "captured";
      record.capturedAt = new Date().toISOString();
      record.lastError = null;
      result.captured += 1;

      await prisma.pOSAuditEvent.create({
        data: {
          userId: input.userId,
          registerId: record.registerId,
          action: "pos.offline_card.captured",
          metadataJson: {
            offlineSaleId: record.offlineSaleId,
            orderId: record.orderId,
            last4: record.last4,
            cardBrand: record.cardBrand,
            paymentIntentId: record.paymentIntentId,
            reference: offlineCardCaptureReference(record.offlineSaleId),
          },
        },
      });
    } catch (e) {
      const message = e instanceof Error ? e.message : "Capture failed.";
      record.status = "failed";
      record.lastError = message;
      result.failed += 1;
      result.errors.push({ id: record.id, error: message });
    }
  }

  return result;
}

export async function getOfflineCardDashboard(input: {
  userId: string;
  workspaceId?: string | null;
}) {
  const rows = await listOfflineCardCaptures({
    userId: input.userId,
    workspaceId: input.workspaceId,
  });
  return {
    pciNotes: OFFLINE_CARD_PCI_NOTES,
    queued: rows.filter((r) => r.status === "queued").length,
    captured: rows.filter((r) => r.status === "captured").length,
    failed: rows.filter((r) => r.status === "failed").length,
    pending: rows.filter((r) => r.status === "queued" || r.status === "failed"),
  };
}

export function resetOfflineCardCapturesForTests(): void {
  captures.clear();
}

/** Idempotent external reference on POS transaction for offline card sales. */
export function offlineCardPaymentExternalRef(offlineSaleId: string): string {
  return offlinePaymentReference(offlineCardCaptureReference(offlineSaleId));
}
