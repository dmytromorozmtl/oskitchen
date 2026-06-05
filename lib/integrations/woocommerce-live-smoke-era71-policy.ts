/**
 * Era 71 — WooCommerce LIVE smoke PASS (P0 critical path #71).
 *
 * Full path: dev store REST → signed webhook → ExternalOrder → KDS kitchen import → inventory sync.
 */

export const WOOCOMMERCE_LIVE_SMOKE_ERA71_POLICY_ID = "era71-woocommerce-live-smoke-v1" as const;

export const WOOCOMMERCE_LIVE_SMOKE_ERA71_SUMMARY_ARTIFACT =
  "artifacts/woocommerce-live-smoke-summary.json" as const;

export const WOOCOMMERCE_LIVE_SMOKE_ERA71_NPM_SCRIPT = "smoke:woo-live" as const;

export const WOOCOMMERCE_LIVE_SMOKE_ERA71_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-woocommerce-live-era71.ts" as const;

export const WOOCOMMERCE_LIVE_SMOKE_ERA71_OPS_DOC = "docs/woocommerce-live-smoke-setup.md" as const;

export const WOOCOMMERCE_LIVE_SMOKE_ERA71_WIRING_PATHS = [
  "scripts/smoke-woocommerce-live.ts",
  "services/integrations/woocommerce/kitchen-import.service.ts",
  "services/integrations/woocommerce/inventory-sync.service.ts",
  "lib/webhooks/woocommerce-webhook-processor.ts",
  "app/api/webhooks/woocommerce/route.ts",
  "app/api/integrations/woocommerce/sync-products/route.ts",
  "app/api/integrations/woocommerce/sync-orders/route.ts",
] as const;

export const WOOCOMMERCE_LIVE_SMOKE_ERA71_CYCLE_RUNBOOK_STEPS = [
  "Provision HTTPS WooCommerce dev store with COD enabled (not smoke-test placeholder host).",
  "Save connection in Dashboard → Integrations → WooCommerce; register outbound webhook with matching secret.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL (or direct WOOCOMMERCE_* env).",
  "Run npm run smoke:woocommerce-live-era71 — artifact overall PASSED.",
  "Verify steps: REST order → staging webhook → ExternalOrder → KDS import → inventory sync wiring.",
] as const;

export const WOOCOMMERCE_LIVE_SMOKE_ERA71_CI_SCRIPTS = [
  "test:ci:woocommerce-live-smoke-era71",
  "test:ci:woocommerce-live-smoke-era71:cert",
] as const;

export const WOOCOMMERCE_LIVE_SMOKE_ERA71_UNIT_TESTS = [
  "tests/unit/woocommerce-live-smoke-era71.test.ts",
  "tests/unit/smoke-woocommerce-live.test.ts",
  "tests/unit/woocommerce-inventory-sync.test.ts",
] as const;

export const WOOCOMMERCE_LIVE_SMOKE_ERA71_INTEGRATION_HEALTH_PATH =
  "/dashboard/integration-health" as const;
