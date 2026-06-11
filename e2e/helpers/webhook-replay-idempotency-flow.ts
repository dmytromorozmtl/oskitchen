import { expect } from "@playwright/test";
import { IntegrationProvider } from "@prisma/client";

import { buildWebhookReplayIdempotencyAuditReport } from "@/lib/qa/webhook-replay-idempotency-e2e-audit";
import {
  WEBHOOK_REPLAY_IDEMPOTENCY_EXPECTED_ROUTE_COUNT,
  WEBHOOK_REPLAY_IDEMPOTENCY_FLOW_STEPS,
  type WebhookReplayIdempotencyFlowStep,
} from "@/lib/qa/webhook-replay-idempotency-e2e-policy";
import { createWebhookEvent } from "@/lib/webhooks/webhook-event-store";
import { recordWebhookIngressOrDuplicate } from "@/lib/webhooks/webhook-ingress-replay-guard";
import { prisma } from "@/lib/prisma";

export type WebhookReplayIdempotencyFlowResult = {
  matrixRouteCount: number;
  duplicateEventId: string | null;
  ingressDuplicate: boolean;
  steps: WebhookReplayIdempotencyFlowStep[];
};

export function validateWebhookReplayIdempotencyMatrix59(): number {
  const report = buildWebhookReplayIdempotencyAuditReport();
  expect(report.totalRoutes).toBe(WEBHOOK_REPLAY_IDEMPOTENCY_EXPECTED_ROUTE_COUNT);
  expect(report.overall).toBe("PASSED");
  expect(report.missingIdempotencyCount).toBe(0);
  return report.totalRoutes;
}

export async function assertWebhookEventStoreDuplicate(input: {
  userId: string;
  connectionId: string;
  externalEventId: string;
}): Promise<string> {
  const payload = { id: 424242, status: "processing", line_items: [] };

  const first = await createWebhookEvent({
    userId: input.userId,
    connectionId: input.connectionId,
    provider: IntegrationProvider.WOOCOMMERCE,
    topic: "order.updated",
    payload,
    signatureValid: true,
    externalEventId: input.externalEventId,
  });
  expect(first.duplicate).toBe(false);

  const second = await createWebhookEvent({
    userId: input.userId,
    connectionId: input.connectionId,
    provider: IntegrationProvider.WOOCOMMERCE,
    topic: "order.updated",
    payload,
    signatureValid: true,
    externalEventId: input.externalEventId,
  });
  expect(second.duplicate).toBe(true);
  expect(second.id).toBe(first.id);

  return first.id;
}

export async function assertIngressDedupeDuplicate(): Promise<boolean> {
  const externalEventId = `e2e-ingress-dedupe-${Date.now()}`;
  const first = await recordWebhookIngressOrDuplicate({
    routeKey: "resend",
    externalEventId,
  });
  expect(first.duplicate).toBe(false);

  const second = await recordWebhookIngressOrDuplicate({
    routeKey: "resend",
    externalEventId,
  });
  expect(second.duplicate).toBe(true);
  return true;
}

export async function runWebhookReplayIdempotencyFlow(input: {
  userId: string;
  connectionId: string;
}): Promise<WebhookReplayIdempotencyFlowResult> {
  const steps: WebhookReplayIdempotencyFlowStep[] = [];

  const matrixRouteCount = validateWebhookReplayIdempotencyMatrix59();
  steps.push("validate_matrix_59");

  const externalEventId = `e2e-replay-idempotency-${Date.now()}`;
  const eventId = await assertWebhookEventStoreDuplicate({
    userId: input.userId,
    connectionId: input.connectionId,
    externalEventId,
  });
  steps.push("simulate_duplicate_ingest");

  const ingressDuplicate = await assertIngressDedupeDuplicate();
  expect(ingressDuplicate).toBe(true);
  steps.push("assert_idempotent_replay");

  await prisma.webhookEvent.delete({ where: { id: eventId } }).catch(() => undefined);
  await prisma.webhookIngressDedupe.deleteMany({
    where: { externalEventId: { startsWith: "e2e-ingress-dedupe-" } },
  });

  if (steps.length !== WEBHOOK_REPLAY_IDEMPOTENCY_FLOW_STEPS.length) {
    throw new Error(`Flow step mismatch: ${steps.join(" → ")}`);
  }

  return {
    matrixRouteCount,
    duplicateEventId: eventId,
    ingressDuplicate,
    steps,
  };
}
