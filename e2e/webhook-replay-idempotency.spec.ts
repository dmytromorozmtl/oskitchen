import { expect, test } from "@playwright/test";
import { IntegrationProvider } from "@prisma/client";

import {
  WEBHOOK_ALL_INGRESS_ROUTE_COUNT,
  WEBHOOK_REPLAY_IDEMPOTENCY_E2E_POLICY_ID,
  WEBHOOK_REPLAY_IDEMPOTENCY_EXPECTED_ROUTE_COUNT,
  WEBHOOK_REPLAY_IDEMPOTENCY_FLOW_STEPS,
  WEBHOOK_SECURITY_EXPECTED_ROUTE_COUNT,
} from "@/lib/qa/webhook-replay-idempotency-e2e-policy";
import { buildWebhookReplayIdempotencyAuditReport } from "@/lib/qa/webhook-replay-idempotency-e2e-audit";
import { prisma } from "@/lib/prisma";

import {
  runWebhookReplayIdempotencyFlow,
  validateWebhookReplayIdempotencyMatrix59,
} from "./helpers/webhook-replay-idempotency-flow";
import {
  skipWebhookReplayIdempotencyIfGateDisabled,
  skipWebhookReplayIdempotencyIfNoConnection,
  skipWebhookReplayIdempotencyIfNoDb,
} from "./helpers/webhook-replay-idempotency-ready";

/**
 * Webhook replay idempotency — all 59 ingress routes classified + duplicate ingest proof.
 *
 * @see e2e/webhook-replay.spec.ts
 * @see scripts/audit-webhook-signatures.ts
 */

test.describe("webhook replay idempotency policy", () => {
  test("exports 59-route matrix and flow steps", () => {
    expect(WEBHOOK_REPLAY_IDEMPOTENCY_E2E_POLICY_ID).toBe(
      "webhook-replay-idempotency-e2e-v1",
    );
    expect(WEBHOOK_SECURITY_EXPECTED_ROUTE_COUNT).toBe(55);
    expect(WEBHOOK_ALL_INGRESS_ROUTE_COUNT).toBe(59);
    expect(WEBHOOK_REPLAY_IDEMPOTENCY_EXPECTED_ROUTE_COUNT).toBe(59);
    expect(WEBHOOK_REPLAY_IDEMPOTENCY_FLOW_STEPS).toEqual([
      "validate_matrix_59",
      "simulate_duplicate_ingest",
      "assert_idempotent_replay",
    ]);
  });

  test("classifies all 59 webhook routes with idempotency wiring", () => {
    const report = buildWebhookReplayIdempotencyAuditReport();
    expect(report.totalRoutes).toBe(59);
    expect(report.overall).toBe("PASSED");
    expect(report.wiredCount).toBe(59);
    expect(report.missingIdempotencyCount).toBe(0);
  });

  test("validates matrix contract helper", () => {
    expect(validateWebhookReplayIdempotencyMatrix59()).toBe(59);
  });
});

test.describe("webhook replay idempotency duplicate ingest (database)", () => {
  test.beforeEach(() => {
    skipWebhookReplayIdempotencyIfGateDisabled();
    skipWebhookReplayIdempotencyIfNoDb();
    skipWebhookReplayIdempotencyIfNoConnection();
  });

  test("duplicate webhook event and ingress dedupe are idempotent", async () => {
    const connectionId = process.env.CHANNEL_SMOKE_CONNECTION_ID!.trim();
    const conn = await prisma.integrationConnection.findUnique({
      where: { id: connectionId },
      select: { id: true, userId: true, provider: true },
    });
    test.skip(!conn, "CHANNEL_SMOKE_CONNECTION_ID connection not found");
    test.skip(
      conn!.provider !== IntegrationProvider.WOOCOMMERCE &&
        conn!.provider !== IntegrationProvider.SHOPIFY,
      "Connection must be WooCommerce or Shopify",
    );

    const result = await runWebhookReplayIdempotencyFlow({
      userId: conn!.userId,
      connectionId: conn!.id,
    });
    expect(result.steps).toEqual(WEBHOOK_REPLAY_IDEMPOTENCY_FLOW_STEPS);
    expect(result.matrixRouteCount).toBe(59);
    expect(result.duplicateEventId).toBeTruthy();
    expect(result.ingressDuplicate).toBe(true);
  });
});
