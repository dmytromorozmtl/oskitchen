/** P0-2 — WooCommerce LIVE smoke artifact: webhook → WebhookEvent → KitchenTask → KDS bump. */

export const WOOCOMMERCE_WEBHOOK_KDS_LIVE_SMOKE_POLICY_ID =
  "p0-2-woocommerce-webhook-kds-live-smoke-v1" as const;

export const WOOCOMMERCE_WEBHOOK_KDS_LIVE_SMOKE_ARTIFACT =
  "artifacts/woocommerce-webhook-kds-live-smoke.json" as const;

export const WOOCOMMERCE_WEBHOOK_KDS_REQUIRED_STEP_IDS = [
  "env_validation",
  "hmac_self_check",
  "webhook_event_persisted",
  "staging_webhook_delivery",
  "db_canonical_order",
  "kds_kitchen_import",
  "kitchen_task_linked",
  "kds_ticket_visible",
  "kds_bump_ready",
] as const;

export type WooCommerceWebhookKdsLiveSmokeStepId =
  (typeof WOOCOMMERCE_WEBHOOK_KDS_REQUIRED_STEP_IDS)[number];
