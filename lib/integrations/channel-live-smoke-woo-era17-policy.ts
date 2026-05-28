/**
 * Channel live Woo smoke proof — Evolution Era 17 Cycle 7.
 *
 * Extends Era 16 live channel orchestrator with Woo-specific proof path.
 * Does NOT claim full marketplace live ops. Shopify proof: Cycle 8 policy.
 */

import { CHANNEL_LIVE_SMOKE_ERA16_POLICY_ID } from "@/lib/integrations/channel-live-smoke-era16-policy";

export const CHANNEL_LIVE_SMOKE_WOO_ERA17_POLICY_ID =
  "era17-channel-live-smoke-woo-v1" as const;

export const CHANNEL_LIVE_SMOKE_WOO_ERA17_DECISION_DATE = "2026-05-28" as const;

export const CHANNEL_LIVE_SMOKE_WOO_ERA17_EXTENDS_POLICIES = [
  CHANNEL_LIVE_SMOKE_ERA16_POLICY_ID,
  "era14-channel-golden-path-recert-v1",
] as const;

/** Awaiting staging DATABASE_URL + Woo connection credentials. */
export const CHANNEL_LIVE_SMOKE_WOO_ERA17_PROOF_STATUS = "awaiting_live_credentials" as const;

export const CHANNEL_LIVE_SMOKE_WOO_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-woo-shopify-live-era17.ts" as const;

export const CHANNEL_LIVE_SMOKE_WOO_ERA17_NPM_SCRIPT = "smoke:woo-shopify-live" as const;

export const CHANNEL_LIVE_SMOKE_WOO_ERA17_LEGACY_SMOKE = "smoke:woo-shopify" as const;

export const CHANNEL_LIVE_SMOKE_WOO_ERA17_TENANT_SCRIPT =
  "scripts/smoke-woo-shopify-certification.ts" as const;

export const CHANNEL_LIVE_SMOKE_WOO_ERA17_SUMMARY_ARTIFACT =
  "artifacts/channel-live-smoke-summary.json" as const;

export const CHANNEL_LIVE_SMOKE_WOO_ERA17_PREREQUISITE_ENV_VARS = [
  "DATABASE_URL",
  "ENCRYPTION_KEY",
  "CHANNEL_SMOKE_OWNER_EMAIL",
  "CHANNEL_SMOKE_CONNECTION_ID",
] as const;

export const CHANNEL_LIVE_SMOKE_WOO_ERA17_WOO_PROVIDER = "woocommerce" as const;

export const CHANNEL_LIVE_SMOKE_WOO_ERA17_CYCLE_RUNBOOK_STEPS = [
  "Run npm run test:ci:channel-golden-path:cert (synthetic golden path — always-on).",
  "Configure Woo connection in dashboard; set ENCRYPTION_KEY for credential decryption.",
  "Set DATABASE_URL to staging database with Woo connection row.",
  "Set CHANNEL_SMOKE_OWNER_EMAIL or CHANNEL_SMOKE_CONNECTION_ID for Woo tenant.",
  "Run npm run smoke:woo-shopify-live — review artifacts/channel-live-smoke-summary.json.",
  "Woo step uses --provider woocommerce; Shopify uses --provider shopify (era17-channel-live-smoke-shopify-v1).",
  "Missing credentials → SKIPPED WITH REASON (exit 0). Live failure → FAILED (exit 1).",
  "Optional: GitHub Woo Shopify Staging Smoke workflow after local PASS.",
] as const;

export const CHANNEL_LIVE_SMOKE_WOO_ERA17_CANONICAL_MARKERS = [
  CHANNEL_LIVE_SMOKE_WOO_ERA17_POLICY_ID,
  "era17-channel-live-smoke-woo",
  "woo_live_certification",
  "awaiting_live_credentials",
] as const;

export const CHANNEL_LIVE_SMOKE_WOO_ERA17_FORBIDDEN_CLAIMS = [
  "full marketplace integration live",
  "production-certified marketplace",
  "shopify live ops proven",
] as const;

export const CHANNEL_LIVE_SMOKE_WOO_ERA17_CI_SCRIPTS = [
  "test:ci:channel-live-smoke-woo-era17",
  "test:ci:channel-live-smoke-woo-era17:cert",
] as const;

export const CHANNEL_LIVE_SMOKE_WOO_ERA17_UNIT_TESTS = [
  "tests/unit/channel-live-smoke-woo-era17-policy.test.ts",
  "tests/unit/channel-live-smoke-woo-era17-cert-live.test.ts",
] as const;

export const CHANNEL_LIVE_SMOKE_WOO_ERA17_CANONICAL_DOC_PATHS = [
  "docs/WOO_SHOPIFY_CERTIFICATION_CHECKLIST.md",
  "docs/commercial-pilot-runbook.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/feature-maturity-matrix.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
] as const;

export const CHANNEL_LIVE_SMOKE_WOO_ERA17_REVIEW_SECTION =
  "Era 17 channel live Woo smoke (2026-05-28)" as const;
