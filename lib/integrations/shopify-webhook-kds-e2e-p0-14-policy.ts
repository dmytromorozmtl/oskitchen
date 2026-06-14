/**
 * P0-14 — Shopify webhook → KDS E2E: HMAC → WebhookEvent → KitchenTask → KDS.
 *
 * @see docs/shopify-webhook-kds-e2e-p0-14.md
 * @see e2e/shopify-webhook-kds-e2e.spec.ts
 */

import { SHOPIFY_WEBHOOK_KDS_LIVE_SMOKE_POLICY_ID } from "@/lib/integrations/shopify-webhook-kds-live-smoke-policy";

export const SHOPIFY_WEBHOOK_KDS_E2E_P0_14_POLICY_ID =
  "p0-14-shopify-webhook-kds-e2e-v1" as const;

export const SHOPIFY_WEBHOOK_KDS_E2E_P0_14_DOC =
  "docs/shopify-webhook-kds-e2e-p0-14.md" as const;

export const SHOPIFY_WEBHOOK_KDS_E2E_P0_14_ARTIFACT =
  "artifacts/shopify-webhook-kds-e2e.json" as const;

export const SHOPIFY_WEBHOOK_KDS_E2E_P0_14_E2E_SPEC =
  "e2e/shopify-webhook-kds-e2e.spec.ts" as const;

export const SHOPIFY_WEBHOOK_KDS_E2E_P0_14_FLOW_HELPER =
  "e2e/helpers/shopify-webhook-kds-e2e-flow.ts" as const;

export const SHOPIFY_WEBHOOK_KDS_E2E_P0_14_SERVICE =
  "services/integrations/shopify-webhook-kds-e2e-p0-14.ts" as const;

export const SHOPIFY_WEBHOOK_KDS_E2E_P0_14_WEBHOOK_TOPIC = "orders/create" as const;

export const SHOPIFY_WEBHOOK_KDS_E2E_P0_14_SMOKE_SKU = "GOLDEN-SHOPIFY-1" as const;

export const SHOPIFY_WEBHOOK_KDS_E2E_P0_14_REQUIRED_STEP_IDS = [
  "hmac_self_check",
  "test_payload",
  "webhook_event_persisted",
  "kitchen_task_linked",
  "kds_ticket_visible",
] as const;

export const SHOPIFY_WEBHOOK_KDS_E2E_P0_14_CHECK_NPM_SCRIPT =
  "check:shopify-webhook-kds-e2e-p0-14" as const;

export const SHOPIFY_WEBHOOK_KDS_E2E_P0_14_CI_NPM_SCRIPT =
  "test:ci:shopify-webhook-kds-e2e-p0-14" as const;

export const SHOPIFY_WEBHOOK_KDS_E2E_P0_14_E2E_NPM_SCRIPT =
  "test:e2e:shopify-webhook-kds-e2e" as const;

export const SHOPIFY_WEBHOOK_KDS_E2E_P0_14_EXTENDS_POLICY_ID =
  SHOPIFY_WEBHOOK_KDS_LIVE_SMOKE_POLICY_ID;

export const SHOPIFY_WEBHOOK_KDS_E2E_P0_14_WIRING_PATHS = [
  SHOPIFY_WEBHOOK_KDS_E2E_P0_14_DOC,
  SHOPIFY_WEBHOOK_KDS_E2E_P0_14_SERVICE,
  "services/integrations/shopify-webhook-kds-smoke.ts",
  "lib/webhooks/shopify-webhook-processor.ts",
  SHOPIFY_WEBHOOK_KDS_E2E_P0_14_FLOW_HELPER,
  SHOPIFY_WEBHOOK_KDS_E2E_P0_14_E2E_SPEC,
  "tests/unit/shopify-webhook-kds-e2e-p0-14.test.ts",
  SHOPIFY_WEBHOOK_KDS_E2E_P0_14_ARTIFACT,
] as const;
