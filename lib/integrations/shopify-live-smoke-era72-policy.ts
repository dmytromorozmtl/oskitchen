/**
 * Era 72 — Shopify LIVE smoke PASS (P0 critical path #72).
 *
 * Full path: dev store Admin API → signed orders/create webhook → ExternalOrder → KDS kitchen import → inventory sync.
 */

export const SHOPIFY_LIVE_SMOKE_ERA72_POLICY_ID = "era72-shopify-live-smoke-v1" as const;

export const SHOPIFY_LIVE_SMOKE_ERA72_SUMMARY_ARTIFACT =
  "artifacts/shopify-live-smoke-summary.json" as const;

export const SHOPIFY_LIVE_SMOKE_ERA72_NPM_SCRIPT = "smoke:shopify-live" as const;

export const SHOPIFY_LIVE_SMOKE_ERA72_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-shopify-live-era72.ts" as const;

export const SHOPIFY_LIVE_SMOKE_ERA72_OPS_DOC = "docs/shopify-live-smoke-setup.md" as const;

export const SHOPIFY_LIVE_SMOKE_ERA72_WIRING_PATHS = [
  "scripts/smoke-shopify-live.ts",
  "services/integrations/shopify/kitchen-import.service.ts",
  "services/integrations/shopify/inventory-sync.service.ts",
  "lib/webhooks/shopify-webhook-processor.ts",
  "app/api/webhooks/shopify/orders-create/route.ts",
  "app/api/integrations/shopify/sync-products/route.ts",
  "app/api/integrations/shopify/sync-orders/route.ts",
] as const;

export const SHOPIFY_LIVE_SMOKE_ERA72_CYCLE_RUNBOOK_STEPS = [
  "Provision Shopify development store (not smoke-test placeholder host).",
  "Create custom app with read_orders + write_orders; copy Admin API token.",
  "Save connection in Dashboard → Integrations → Shopify; register orders/create webhook with matching secret.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL (or direct SHOPIFY_* env).",
  "Run npm run smoke:shopify-live-era72 — artifact overall PASSED.",
  "Verify steps: Admin API order → staging webhook → ExternalOrder → KDS import → inventory sync wiring.",
] as const;

export const SHOPIFY_LIVE_SMOKE_ERA72_CI_SCRIPTS = [
  "test:ci:shopify-live-smoke-era72",
  "test:ci:shopify-live-smoke-era72:cert",
] as const;

export const SHOPIFY_LIVE_SMOKE_ERA72_UNIT_TESTS = [
  "tests/unit/shopify-live-smoke-era72.test.ts",
  "tests/unit/smoke-shopify-live.test.ts",
  "tests/unit/shopify-inventory-sync.test.ts",
] as const;

export const SHOPIFY_LIVE_SMOKE_ERA72_INTEGRATION_HEALTH_PATH =
  "/dashboard/integration-health" as const;
