/**
 * Era 144 — WooCommerce LIVE smoke PASS wiring cert (Phase 10 #71).
 *
 * Full path: dev store REST → signed webhook → KDS kitchen import → inventory sync.
 */

import {
  WOOCOMMERCE_LIVE_SMOKE_ERA71_INTEGRATION_HEALTH_PATH,
  WOOCOMMERCE_LIVE_SMOKE_ERA71_OPS_DOC,
  WOOCOMMERCE_LIVE_SMOKE_ERA71_POLICY_ID,
  WOOCOMMERCE_LIVE_SMOKE_ERA71_WIRING_PATHS,
} from "@/lib/integrations/woocommerce-live-smoke-era71-policy";

export const WOOCOMMERCE_LIVE_SMOKE_ERA144_POLICY_ID =
  "era144-woocommerce-live-smoke-v1" as const;

export const WOOCOMMERCE_LIVE_SMOKE_ERA144_SUMMARY_ARTIFACT =
  "artifacts/woocommerce-live-smoke-era144-smoke-summary.json" as const;

export const WOOCOMMERCE_LIVE_SMOKE_ERA144_NPM_SCRIPT =
  "smoke:woocommerce-live-era144" as const;

export const WOOCOMMERCE_LIVE_SMOKE_ERA144_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-woocommerce-live-era144.ts" as const;

export const WOOCOMMERCE_LIVE_SMOKE_ERA144_OPS_DOC =
  "docs/woocommerce-live-smoke-era144-setup.md" as const;

export const WOOCOMMERCE_LIVE_SMOKE_ERA144_CANONICAL_OPS_DOC =
  WOOCOMMERCE_LIVE_SMOKE_ERA71_OPS_DOC;

export const WOOCOMMERCE_LIVE_SMOKE_ERA144_WIRING_PATHS =
  WOOCOMMERCE_LIVE_SMOKE_ERA71_WIRING_PATHS;

export const WOOCOMMERCE_LIVE_SMOKE_ERA144_CYCLE_RUNBOOK_STEPS = [
  "Provision HTTPS WooCommerce dev store with COD enabled (real host, not placeholder).",
  "Save connection in Dashboard → Integrations → WooCommerce; register webhook with matching secret.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL.",
  "Run npm run smoke:woo-live — live REST → webhook → ExternalOrder → KDS → inventory.",
  "Run npm run smoke:woocommerce-live-era144 — artifact overall PASSED.",
] as const;

export const WOOCOMMERCE_LIVE_SMOKE_ERA144_CI_SCRIPTS = [
  "test:ci:woocommerce-live-smoke-era144",
  "test:ci:woocommerce-live-smoke-era144:cert",
] as const;

export const WOOCOMMERCE_LIVE_SMOKE_ERA144_UNIT_TESTS = [
  "tests/unit/woocommerce-live-smoke-era144.test.ts",
  "tests/unit/woocommerce-live-smoke-era71.test.ts",
  "tests/unit/smoke-woocommerce-live.test.ts",
] as const;

export const WOOCOMMERCE_LIVE_SMOKE_ERA144_CANONICAL_POLICY_ID =
  WOOCOMMERCE_LIVE_SMOKE_ERA71_POLICY_ID;

export const WOOCOMMERCE_LIVE_SMOKE_ERA144_INTEGRATION_HEALTH_PATH =
  WOOCOMMERCE_LIVE_SMOKE_ERA71_INTEGRATION_HEALTH_PATH;

export const WOOCOMMERCE_LIVE_SMOKE_ERA144_CAPABILITIES = [
  "rest_api",
  "webhook",
  "kds_inventory",
] as const;
