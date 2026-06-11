/**
 * Blueprint P1-54 — Webhook replay idempotency (all 59 webhook types).
 *
 * @see e2e/webhook-replay-idempotency.spec.ts
 * @see lib/security/webhook-security-matrix.ts
 * @see lib/webhooks/webhook-event-store.ts
 */

export {
  WEBHOOK_ALL_INGRESS_ROUTE_COUNT,
  WEBHOOK_EXTENDED_INGRESS_ROUTE_COUNT,
} from "@/lib/security/webhook-ingress-extended";

export { WEBHOOK_SECURITY_EXPECTED_ROUTE_COUNT } from "@/lib/security/webhook-security-matrix";

export type { WebhookReplayKind } from "@/lib/security/webhook-security-matrix";

export const WEBHOOK_REPLAY_IDEMPOTENCY_E2E_POLICY_ID =
  "webhook-replay-idempotency-e2e-v1" as const;

export const WEBHOOK_REPLAY_IDEMPOTENCY_EXPECTED_ROUTE_COUNT = 59 as const;

export const WEBHOOK_REPLAY_IDEMPOTENCY_ARTIFACT =
  "artifacts/webhook-replay-idempotency-audit.json" as const;

export const WEBHOOK_REPLAY_IDEMPOTENCY_E2E_SPEC =
  "e2e/webhook-replay-idempotency.spec.ts" as const;
export const WEBHOOK_REPLAY_IDEMPOTENCY_FLOW_HELPER =
  "e2e/helpers/webhook-replay-idempotency-flow.ts" as const;
export const WEBHOOK_REPLAY_IDEMPOTENCY_READY_HELPER =
  "e2e/helpers/webhook-replay-idempotency-ready.ts" as const;
export const WEBHOOK_REPLAY_IDEMPOTENCY_AUDIT_SCRIPT =
  "scripts/audit-webhook-replay-idempotency-e2e.ts" as const;
export const WEBHOOK_REPLAY_IDEMPOTENCY_NPM_SCRIPT =
  "audit:webhook-replay-idempotency-e2e" as const;
export const WEBHOOK_REPLAY_IDEMPOTENCY_UNIT_TEST =
  "tests/unit/webhook-replay-idempotency-e2e.test.ts" as const;
export const WEBHOOK_REPLAY_IDEMPOTENCY_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const WEBHOOK_REPLAY_IDEMPOTENCY_FLOW_STEPS = [
  "validate_matrix_59",
  "simulate_duplicate_ingest",
  "assert_idempotent_replay",
] as const;

export type WebhookReplayIdempotencyFlowStep =
  (typeof WEBHOOK_REPLAY_IDEMPOTENCY_FLOW_STEPS)[number];

/** Static code signals for each replay protection strategy. */
export const WEBHOOK_REPLAY_IDEMPOTENCY_DETECTORS: Record<
  import("@/lib/security/webhook-security-matrix").WebhookReplayKind,
  readonly RegExp[]
> = {
  billing_event_id: [/stripe_event_id/i, /billingEvent/i, /constructEvent/i],
  webhook_event_store: [
    /createWebhookEvent/i,
    /connectionId_externalEventId/i,
    /webhookProcessingKey/i,
    /recordInboundWebhook/i,
  ],
  provider_event_id: [/externalEventId/i, /provider_event_id/i, /providerEventId/i],
  scim_upsert: [/provisionExperimentAuditorFromScim/i, /scim.*upsert/i],
  ingress_dedupe: [
    /recordWebhookIngressOrDuplicate/i,
    /webhookIngressDedupe/i,
    /claimCapitalLenderWebhookDelivery/i,
    /claim.*WebhookDelivery/i,
  ],
  none: [],
};

export function hasWebhookReplayIdempotencyDb(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function isWebhookReplayIdempotencyE2EEnabled(): boolean {
  return process.env.E2E_WEBHOOK_REPLAY_IDEMPOTENCY?.trim() === "true";
}

export function hasWebhookReplayIdempotencyConnection(): boolean {
  return Boolean(process.env.CHANNEL_SMOKE_CONNECTION_ID?.trim());
}
