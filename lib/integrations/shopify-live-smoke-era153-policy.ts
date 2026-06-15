/**
 * Era 153 — Shopify LIVE integration wiring cert (Phase 1 Round 2 #5).
 *
 * Full path: dev store Admin API → signed webhook → KDS → inventory sync → registry LIVE.
 */

import {
  SHOPIFY_LIVE_SMOKE_ERA72_INTEGRATION_HEALTH_PATH,
  SHOPIFY_LIVE_SMOKE_ERA72_OPS_DOC,
  SHOPIFY_LIVE_SMOKE_ERA72_POLICY_ID,
  SHOPIFY_LIVE_SMOKE_ERA72_SUMMARY_ARTIFACT,
  SHOPIFY_LIVE_SMOKE_ERA72_WIRING_PATHS,
} from "@/lib/integrations/shopify-live-smoke-era72-policy";

export const SHOPIFY_LIVE_SMOKE_ERA153_POLICY_ID = "era153-shopify-live-v1" as const;

export const SHOPIFY_LIVE_SMOKE_ERA153_SUMMARY_ARTIFACT =
  "artifacts/shopify-live-smoke-era153-smoke-summary.json" as const;

export const SHOPIFY_LIVE_SMOKE_ERA153_NPM_SCRIPT = "smoke:shopify-live-era153" as const;

export const SHOPIFY_LIVE_SMOKE_ERA153_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-shopify-live-era153.ts" as const;

export const SHOPIFY_LIVE_SMOKE_ERA153_OPS_DOC = "docs/shopify-live-smoke-era153-setup.md" as const;

export const SHOPIFY_LIVE_SMOKE_ERA153_CANONICAL_OPS_DOC = SHOPIFY_LIVE_SMOKE_ERA72_OPS_DOC;

export const SHOPIFY_LIVE_SMOKE_ERA153_CANONICAL_SUMMARY_ARTIFACT =
  SHOPIFY_LIVE_SMOKE_ERA72_SUMMARY_ARTIFACT;

export const SHOPIFY_LIVE_SMOKE_ERA153_WIRING_PATHS = SHOPIFY_LIVE_SMOKE_ERA72_WIRING_PATHS;

export const SHOPIFY_LIVE_SMOKE_ERA153_CYCLE_RUNBOOK_STEPS = [
  "Provision Shopify development store (real myshopify.com host, not placeholder).",
  "Create custom app with read_orders + write_orders; copy Admin API token.",
  "Save connection in Dashboard → Integrations → Shopify; register orders/create webhook.",
  "Set DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL.",
  "Run npm run smoke:shopify-live — live Admin API → webhook → KDS → inventory.",
  "Run npm run smoke:shopify-live-era153 — artifact overall PASSED.",
] as const;

export const SHOPIFY_LIVE_SMOKE_ERA153_CI_SCRIPTS = [
  "test:ci:shopify-live-smoke-era153",
  "test:ci:shopify-live-smoke-era153:cert",
] as const;

export const SHOPIFY_LIVE_SMOKE_ERA153_UNIT_TESTS = [
  "tests/unit/shopify-live-smoke-era153.test.ts",
  "tests/unit/shopify-live-smoke-era72.test.ts",
  "tests/unit/smoke-shopify-live.test.ts",
] as const;

export const SHOPIFY_LIVE_SMOKE_ERA153_CANONICAL_POLICY_ID = SHOPIFY_LIVE_SMOKE_ERA72_POLICY_ID;

export const SHOPIFY_LIVE_SMOKE_ERA153_INTEGRATION_HEALTH_PATH =
  SHOPIFY_LIVE_SMOKE_ERA72_INTEGRATION_HEALTH_PATH;

export const SHOPIFY_LIVE_SMOKE_ERA153_CAPABILITIES = [
  "admin_api",
  "webhook",
  "kds_inventory",
] as const;
