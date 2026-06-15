/**
 * Era 145 — Shopify LIVE smoke PASS wiring cert (Phase 10 #72).
 *
 * Full path: dev store Admin API → signed orders/create webhook → ExternalOrder → KDS → inventory sync.
 */

import {
  SHOPIFY_LIVE_SMOKE_ERA72_INTEGRATION_HEALTH_PATH,
  SHOPIFY_LIVE_SMOKE_ERA72_OPS_DOC,
  SHOPIFY_LIVE_SMOKE_ERA72_POLICY_ID,
  SHOPIFY_LIVE_SMOKE_ERA72_WIRING_PATHS,
} from "@/lib/integrations/shopify-live-smoke-era72-policy";

export const SHOPIFY_LIVE_SMOKE_ERA145_POLICY_ID = "era145-shopify-live-smoke-v1" as const;

export const SHOPIFY_LIVE_SMOKE_ERA145_SUMMARY_ARTIFACT =
  "artifacts/shopify-live-smoke-era145-smoke-summary.json" as const;

export const SHOPIFY_LIVE_SMOKE_ERA145_NPM_SCRIPT = "smoke:shopify-live-era145" as const;

export const SHOPIFY_LIVE_SMOKE_ERA145_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-shopify-live-era145.ts" as const;

export const SHOPIFY_LIVE_SMOKE_ERA145_OPS_DOC = "docs/shopify-live-smoke-era145-setup.md" as const;

export const SHOPIFY_LIVE_SMOKE_ERA145_CANONICAL_OPS_DOC = SHOPIFY_LIVE_SMOKE_ERA72_OPS_DOC;

export const SHOPIFY_LIVE_SMOKE_ERA145_WIRING_PATHS = SHOPIFY_LIVE_SMOKE_ERA72_WIRING_PATHS;

export const SHOPIFY_LIVE_SMOKE_ERA145_CYCLE_RUNBOOK_STEPS = [
  "Provision Shopify development store (real myshopify.com host, not placeholder).",
  "Create custom app with read_orders + write_orders; copy Admin API token.",
  "Save connection in Dashboard → Integrations → Shopify; register orders/create webhook.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL.",
  "Run npm run smoke:shopify-live — live Admin API → webhook → KDS → inventory.",
  "Run npm run smoke:shopify-live-era145 — artifact overall PASSED.",
] as const;

export const SHOPIFY_LIVE_SMOKE_ERA145_CI_SCRIPTS = [
  "test:ci:shopify-live-smoke-era145",
  "test:ci:shopify-live-smoke-era145:cert",
] as const;

export const SHOPIFY_LIVE_SMOKE_ERA145_UNIT_TESTS = [
  "tests/unit/shopify-live-smoke-era145.test.ts",
  "tests/unit/shopify-live-smoke-era72.test.ts",
  "tests/unit/smoke-shopify-live.test.ts",
] as const;

export const SHOPIFY_LIVE_SMOKE_ERA145_CANONICAL_POLICY_ID = SHOPIFY_LIVE_SMOKE_ERA72_POLICY_ID;

export const SHOPIFY_LIVE_SMOKE_ERA145_INTEGRATION_HEALTH_PATH =
  SHOPIFY_LIVE_SMOKE_ERA72_INTEGRATION_HEALTH_PATH;

export const SHOPIFY_LIVE_SMOKE_ERA145_CAPABILITIES = [
  "admin_api",
  "webhook",
  "kds_inventory",
] as const;
