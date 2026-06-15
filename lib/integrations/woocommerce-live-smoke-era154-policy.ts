/**
 * Era 154 — WooCommerce LIVE integration wiring cert (Phase 1 Round 2 #6).
 *
 * Full path: dev store REST → signed webhook → canonical ExternalOrder → KDS → inventory → registry LIVE.
 */

import {
  WOOCOMMERCE_LIVE_SMOKE_ERA71_INTEGRATION_HEALTH_PATH,
  WOOCOMMERCE_LIVE_SMOKE_ERA71_OPS_DOC,
  WOOCOMMERCE_LIVE_SMOKE_ERA71_POLICY_ID,
  WOOCOMMERCE_LIVE_SMOKE_ERA71_SUMMARY_ARTIFACT,
  WOOCOMMERCE_LIVE_SMOKE_ERA71_WIRING_PATHS,
} from "@/lib/integrations/woocommerce-live-smoke-era71-policy";

export const WOOCOMMERCE_LIVE_SMOKE_ERA154_POLICY_ID = "era154-woocommerce-live-v1" as const;

export const WOOCOMMERCE_LIVE_SMOKE_ERA154_SUMMARY_ARTIFACT =
  "artifacts/woocommerce-live-smoke-era154-smoke-summary.json" as const;

export const WOOCOMMERCE_LIVE_SMOKE_ERA154_NPM_SCRIPT = "smoke:woocommerce-live-era154" as const;

export const WOOCOMMERCE_LIVE_SMOKE_ERA154_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-woocommerce-live-era154.ts" as const;

export const WOOCOMMERCE_LIVE_SMOKE_ERA154_OPS_DOC =
  "docs/woocommerce-live-smoke-era154-setup.md" as const;

export const WOOCOMMERCE_LIVE_SMOKE_ERA154_CANONICAL_OPS_DOC =
  WOOCOMMERCE_LIVE_SMOKE_ERA71_OPS_DOC;

export const WOOCOMMERCE_LIVE_SMOKE_ERA154_CANONICAL_SUMMARY_ARTIFACT =
  WOOCOMMERCE_LIVE_SMOKE_ERA71_SUMMARY_ARTIFACT;

export const WOOCOMMERCE_LIVE_SMOKE_ERA154_WIRING_PATHS =
  WOOCOMMERCE_LIVE_SMOKE_ERA71_WIRING_PATHS;

export const WOOCOMMERCE_LIVE_SMOKE_ERA154_CYCLE_RUNBOOK_STEPS = [
  "Provision HTTPS WooCommerce dev store with COD enabled (real host, not placeholder).",
  "Save connection in Dashboard → Integrations → WooCommerce; register webhook with matching secret.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL.",
  "Run npm run smoke:woo-live — live REST → webhook → ExternalOrder → KDS → inventory.",
  "Run npm run smoke:woocommerce-live-era154 — artifact overall PASSED.",
] as const;

export const WOOCOMMERCE_LIVE_SMOKE_ERA154_CI_SCRIPTS = [
  "test:ci:woocommerce-live-smoke-era154",
  "test:ci:woocommerce-live-smoke-era154:cert",
] as const;

export const WOOCOMMERCE_LIVE_SMOKE_ERA154_UNIT_TESTS = [
  "tests/unit/woocommerce-live-smoke-era154.test.ts",
  "tests/unit/woocommerce-live-smoke-era71.test.ts",
  "tests/unit/smoke-woocommerce-live.test.ts",
] as const;

export const WOOCOMMERCE_LIVE_SMOKE_ERA154_CANONICAL_POLICY_ID =
  WOOCOMMERCE_LIVE_SMOKE_ERA71_POLICY_ID;

export const WOOCOMMERCE_LIVE_SMOKE_ERA154_INTEGRATION_HEALTH_PATH =
  WOOCOMMERCE_LIVE_SMOKE_ERA71_INTEGRATION_HEALTH_PATH;

export const WOOCOMMERCE_LIVE_SMOKE_ERA154_CAPABILITIES = [
  "rest_api",
  "webhook",
  "canonical_order",
  "kds_inventory",
] as const;
