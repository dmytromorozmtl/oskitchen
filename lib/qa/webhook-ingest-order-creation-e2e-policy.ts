/**
 * Blueprint P1-48 — Webhook ingest → order creation E2E (webhook processing).
 *
 * @see e2e/webhook-ingest-order-creation.spec.ts
 * @see e2e/woocommerce-webhook-order-hub.spec.ts
 * @see lib/webhooks/woocommerce-webhook-processor.ts
 */

export {
  ORDER_HUB_ALL_TAB_QUERY,
  ORDER_HUB_INCOMING_CHANNELS_HEADING,
  ORDER_HUB_PATH,
  WOOCOMMERCE_ORDER_HUB_PROVIDER_LABEL,
  WOOCOMMERCE_WEBHOOK_ORDER_HUB_VISIBLE_MS,
  WOOCOMMERCE_WEBHOOK_PATH,
  WOOCOMMERCE_WEBHOOK_TOPIC_ORDER_UPDATED,
  isWooCommerceOrderWebhookTopic,
  signWooWebhookBody,
  woocommerceWebhookUrl,
} from "@/lib/integrations/woocommerce-webhook-order-hub-e2e-policy";

export { storefrontKdsTicketTestId } from "@/lib/storefront/storefront-checkout-kds-e2e-policy";

export const WEBHOOK_INGEST_ORDER_CREATION_E2E_POLICY_ID =
  "webhook-ingest-order-creation-e2e-v1" as const;

export const KDS_KITCHEN_PATH = "/dashboard/kitchen" as const;

export const ORDER_HUB_PANEL_TEST_ID = "order-hub-panel" as const;

export const WEBHOOK_INGEST_ORDER_CREATION_VISIBLE_MS = 20_000 as const;

export const WEBHOOK_INGEST_ORDER_CREATION_E2E_SPEC =
  "e2e/webhook-ingest-order-creation.spec.ts" as const;
export const WEBHOOK_INGEST_ORDER_CREATION_FLOW_HELPER =
  "e2e/helpers/webhook-ingest-order-creation-flow.ts" as const;
export const WEBHOOK_INGEST_ORDER_CREATION_READY_HELPER =
  "e2e/helpers/webhook-ingest-order-creation-ready.ts" as const;
export const WEBHOOK_INGEST_ORDER_CREATION_AUDIT_SCRIPT =
  "scripts/audit-webhook-ingest-order-creation-e2e.ts" as const;
export const WEBHOOK_INGEST_ORDER_CREATION_NPM_SCRIPT =
  "audit:webhook-ingest-order-creation-e2e" as const;
export const WEBHOOK_INGEST_ORDER_CREATION_UNIT_TEST =
  "tests/unit/webhook-ingest-order-creation-e2e.test.ts" as const;
export const WEBHOOK_INGEST_ORDER_CREATION_CI_WORKFLOW =
  ".github/workflows/deploy-prod-gate.yml" as const;

export const WEBHOOK_INGEST_ORDER_CREATION_FLOW_STEPS = [
  "webhook_ingest",
  "verify_external_order",
  "verify_kitchen_import",
  "verify_kds_ticket",
] as const;

export type WebhookIngestOrderCreationFlowStep =
  (typeof WEBHOOK_INGEST_ORDER_CREATION_FLOW_STEPS)[number];

export const WEBHOOK_INGEST_KITCHEN_IMPORT_TIMEOUT_MS = 20_000 as const;

export function hasWebhookIngestOrderCreationCredentials(): boolean {
  return Boolean(
    process.env.E2E_LOGIN_EMAIL?.trim() && process.env.E2E_LOGIN_PASSWORD?.trim(),
  );
}

export function hasWebhookIngestOrderCreationDb(): boolean {
  return Boolean(process.env.DATABASE_URL?.trim());
}

export function hasWebhookIngestConnection(): boolean {
  return Boolean(process.env.CHANNEL_SMOKE_CONNECTION_ID?.trim());
}

export function isWebhookIngestOrderCreationE2EEnabled(): boolean {
  return process.env.E2E_WEBHOOK_INGEST_E2E?.trim() === "true";
}

export function isWebhookIngestOrderCreationKdsGateEnabled(): boolean {
  return (
    process.env.NODE_ENV === "production" ||
    process.env.ENABLE_KDS_V1_CERTIFIED === "true"
  );
}
