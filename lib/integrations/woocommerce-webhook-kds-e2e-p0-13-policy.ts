/**
 * P0-13 — WooCommerce webhook → KDS E2E: test payload → WebhookEvent → KitchenTask → KDS.
 *
 * @see docs/woocommerce-webhook-kds-e2e-p0-13.md
 * @see e2e/woocommerce-webhook-kds-e2e.spec.ts
 */

import {
  WOOCOMMERCE_WEBHOOK_KDS_LIVE_SMOKE_POLICY_ID,
} from "@/lib/integrations/woocommerce-webhook-kds-live-smoke-policy";

export const WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_POLICY_ID =
  "p0-13-woocommerce-webhook-kds-e2e-v1" as const;

export const WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_DOC =
  "docs/woocommerce-webhook-kds-e2e-p0-13.md" as const;

export const WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_ARTIFACT =
  "artifacts/woocommerce-webhook-kds-e2e.json" as const;

export const WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_E2E_SPEC =
  "e2e/woocommerce-webhook-kds-e2e.spec.ts" as const;

export const WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_FLOW_HELPER =
  "e2e/helpers/woocommerce-webhook-kds-e2e-flow.ts" as const;

export const WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_SERVICE =
  "services/integrations/woocommerce-webhook-kds-e2e-p0-13.ts" as const;

export const WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_WEBHOOK_TOPIC = "order.created" as const;

export const WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_SMOKE_SKU = "GOLDEN-WOO-1" as const;

export const WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_REQUIRED_STEP_IDS = [
  "test_payload",
  "webhook_event_persisted",
  "kitchen_task_linked",
  "kds_ticket_visible",
] as const;

export const WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_CHECK_NPM_SCRIPT =
  "check:woocommerce-webhook-kds-e2e-p0-13" as const;

export const WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_CI_NPM_SCRIPT =
  "test:ci:woocommerce-webhook-kds-e2e-p0-13" as const;

export const WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_E2E_NPM_SCRIPT =
  "test:e2e:woocommerce-webhook-kds-e2e" as const;

export const WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_EXTENDS_POLICY_ID =
  WOOCOMMERCE_WEBHOOK_KDS_LIVE_SMOKE_POLICY_ID;

export const WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_WIRING_PATHS = [
  WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_DOC,
  WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_SERVICE,
  "services/integrations/woocommerce-webhook-kds-smoke.ts",
  "lib/webhooks/woocommerce-webhook-processor.ts",
  WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_FLOW_HELPER,
  WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_E2E_SPEC,
  "tests/unit/woocommerce-webhook-kds-e2e-p0-13.test.ts",
  WOOCOMMERCE_WEBHOOK_KDS_E2E_P0_13_ARTIFACT,
] as const;
