import { randomUUID } from "node:crypto";

import { expect, test } from "@playwright/test";
import { IntegrationProvider, WebhookProcessingJobStatus } from "@prisma/client";

import { assertWorkspaceWebhookReplayAllowed } from "@/lib/webhooks/webhook-replay-permissions";
import { createWebhookEvent } from "@/lib/webhooks/webhook-event-store";
import { prisma } from "@/lib/prisma";
import { requestWebhookReplay } from "@/services/webhooks/webhook-replay-service";

const hasDb = Boolean(process.env.DATABASE_URL?.trim());

async function resolveReplayFixture(): Promise<{
  userId: string;
  connectionId: string;
} | null> {
  const connectionId = process.env.CHANNEL_SMOKE_CONNECTION_ID?.trim();
  if (!connectionId) return null;

  const conn = await prisma.integrationConnection.findUnique({
    where: { id: connectionId },
    select: { id: true, userId: true, provider: true },
  });
  if (!conn) return null;
  if (
    conn.provider !== IntegrationProvider.WOOCOMMERCE &&
    conn.provider !== IntegrationProvider.SHOPIFY
  ) {
    return null;
  }
  return { userId: conn.userId, connectionId: conn.id };
}

test.describe("universal webhook replay", () => {
  test("replay non-existent webhook returns not found", async () => {
    test.skip(!hasDb, "DATABASE_URL required for webhook replay E2E");

    const result = await requestWebhookReplay({
      webhookEventId: randomUUID(),
      reason: "E2E probe — event should not exist",
      actorUserId: randomUUID(),
      actorEmail: "e2e-replay-missing@test.local",
      surface: "workspace",
    });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.error).toMatch(/not found/i);
    }
  });

  test("workspace replay denied for cross-tenant actor", async () => {
    test.skip(!hasDb, "DATABASE_URL required for webhook replay E2E");

    await expect(
      assertWorkspaceWebhookReplayAllowed({
        actorUserId: randomUUID(),
        eventOwnerUserId: randomUUID(),
      }),
    ).rejects.toThrow(/permission/i);
  });

  test("replay blocked for signature-invalid events without platform override", async () => {
    test.skip(!hasDb, "DATABASE_URL required for webhook replay E2E");

    const fixture = await resolveReplayFixture();
    test.skip(!fixture, "CHANNEL_SMOKE_CONNECTION_ID Woo/Shopify connection required");

    const externalEventId = `e2e-invalid-sig-${Date.now()}`;
    const { id: eventId } = await createWebhookEvent({
      userId: fixture.userId,
      connectionId: fixture.connectionId,
      provider: IntegrationProvider.WOOCOMMERCE,
      topic: "order.updated",
      payload: { id: 999001, status: "processing", line_items: [] },
      signatureValid: false,
      externalEventId,
    });

    try {
      const result = await requestWebhookReplay({
        webhookEventId: eventId,
        reason: "E2E invalid signature replay must be blocked",
        actorUserId: fixture.userId,
        actorEmail: "e2e-replay-invalid@test.local",
        surface: "workspace",
        allowInvalidSignature: false,
      });

      expect(result.ok).toBe(false);
      if (!result.ok) {
        expect(result.error).toMatch(/signature-invalid|invalid signature/i);
      }
    } finally {
      await prisma.webhookEvent.delete({ where: { id: eventId } }).catch(() => undefined);
    }
  });

  test("replay success re-queues processing for valid signed event", async () => {
    test.skip(!hasDb, "DATABASE_URL required for webhook replay E2E");

    const fixture = await resolveReplayFixture();
    test.skip(!fixture, "CHANNEL_SMOKE_CONNECTION_ID Woo/Shopify connection required");

    const externalEventId = `e2e-replay-ok-${Date.now()}`;
    const { id: eventId } = await createWebhookEvent({
      userId: fixture.userId,
      connectionId: fixture.connectionId,
      provider: IntegrationProvider.WOOCOMMERCE,
      topic: "order.updated",
      payload: {
        id: 999002,
        status: "processing",
        line_items: [{ id: 1, name: "E2E replay item", quantity: 1, price: "1.00" }],
      },
      signatureValid: true,
      externalEventId,
    });

    try {
      await prisma.webhookEvent.update({
        where: { id: eventId },
        data: { processed: true, processedAt: new Date(), processingError: null },
      });

      const result = await requestWebhookReplay({
        webhookEventId: eventId,
        reason: "E2E replay after transient processing failure",
        actorUserId: fixture.userId,
        actorEmail: "e2e-replay-ok@test.local",
        surface: "workspace",
      });

      expect(result.ok).toBe(true);

      const refreshed = await prisma.webhookEvent.findUnique({
        where: { id: eventId },
        select: { processed: true, processingError: true },
      });
      expect(refreshed?.processed).toBe(false);
      expect(refreshed?.processingError).toBeNull();

      const job = await prisma.webhookProcessingJob.findUnique({
        where: { webhookEventId: eventId },
      });

      if (process.env.WEBHOOK_ASYNC_QUEUE === "1") {
        expect(job?.status).toBe(WebhookProcessingJobStatus.QUEUED);
      } else {
        expect(job === null || job.status === WebhookProcessingJobStatus.QUEUED).toBe(true);
      }
    } finally {
      await prisma.webhookProcessingJob.deleteMany({ where: { webhookEventId: eventId } });
      await prisma.webhookEvent.delete({ where: { id: eventId } }).catch(() => undefined);
    }
  });
});
