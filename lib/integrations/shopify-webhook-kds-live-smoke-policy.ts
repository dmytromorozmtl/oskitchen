/** P0-3 — Shopify LIVE smoke artifact: webhook HMAC → KitchenTask → KDS bump. */

export const SHOPIFY_WEBHOOK_KDS_LIVE_SMOKE_POLICY_ID =
  "p0-3-shopify-webhook-kds-live-smoke-v1" as const;

export const SHOPIFY_WEBHOOK_KDS_LIVE_SMOKE_ARTIFACT =
  "artifacts/shopify-webhook-kds-live-smoke.json" as const;

export const SHOPIFY_WEBHOOK_KDS_REQUIRED_STEP_IDS = [
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
