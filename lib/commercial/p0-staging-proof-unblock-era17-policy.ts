/**
 * P0 staging proof unblock orchestrator — Evolution Era 17 P0 ops bundle.
 *
 * Aggregates SSO IdP, GitHub first-green, and Woo/Shopify live smoke artifacts.
 * Does NOT fake PASS — missing credentials → SKIPPED WITH REASON.
 */

import { STAGING_WORKFLOWS_FIRST_GREEN_ERA17_POLICY_ID } from "@/lib/ci/staging-workflows-first-green-era17-policy";
import { STAGING_WORKFLOWS_FIRST_GREEN_ERA16_SUMMARY_ARTIFACT } from "@/lib/ci/staging-workflows-first-green-era16-policy";
import {
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_POLICY_ID,
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_SUMMARY_ARTIFACT,
} from "@/lib/enterprise/enterprise-sso-idp-staging-smoke-era17-policy";
import { CHANNEL_LIVE_SMOKE_WOO_ERA17_POLICY_ID } from "@/lib/integrations/channel-live-smoke-woo-era17-policy";
import { CHANNEL_LIVE_SMOKE_SHOPIFY_ERA17_POLICY_ID } from "@/lib/integrations/channel-live-smoke-shopify-era17-policy";
import { CHANNEL_LIVE_SMOKE_ERA16_SUMMARY_ARTIFACT } from "@/lib/integrations/channel-live-smoke-era16-policy";

export const P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID =
  "era17-p0-staging-proof-unblock-v1" as const;

export const P0_STAGING_PROOF_UNBLOCK_ERA17_DECISION_DATE = "2026-05-28" as const;

export const P0_STAGING_PROOF_UNBLOCK_ERA17_EXTENDS_POLICIES = [
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_POLICY_ID,
  STAGING_WORKFLOWS_FIRST_GREEN_ERA17_POLICY_ID,
  CHANNEL_LIVE_SMOKE_WOO_ERA17_POLICY_ID,
  CHANNEL_LIVE_SMOKE_SHOPIFY_ERA17_POLICY_ID,
] as const;

export const P0_STAGING_PROOF_UNBLOCK_ERA17_CANONICAL_MARKERS = [
  "p0ProofStatus",
  "awaiting_ops_credentials",
  "allMissingEnvVars",
  "smoke:p0-staging-proof-unblock",
] as const;

export const P0_STAGING_PROOF_UNBLOCK_ERA17_PROOF_STATUS =
  "awaiting_ops_credentials" as const;

export const P0_STAGING_PROOF_UNBLOCK_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-p0-staging-proof-unblock-era17.ts" as const;

export const P0_STAGING_PROOF_UNBLOCK_ERA17_NPM_SCRIPT =
  "smoke:p0-staging-proof-unblock" as const;

export const P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT =
  "artifacts/p0-staging-proof-unblock-summary.json" as const;

export const P0_STAGING_PROOF_UNBLOCK_ERA17_CHILD_SMOKES = [
  "smoke:enterprise-sso-idp-staging",
  "smoke:staging-workflows-first-green",
  "smoke:woo-shopify-live",
] as const;

export const P0_STAGING_PROOF_UNBLOCK_ERA17_CHILD_ARTIFACTS = [
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_SUMMARY_ARTIFACT,
  STAGING_WORKFLOWS_FIRST_GREEN_ERA16_SUMMARY_ARTIFACT,
  CHANNEL_LIVE_SMOKE_ERA16_SUMMARY_ARTIFACT,
] as const;

export const P0_STAGING_PROOF_UNBLOCK_ERA17_UNBLOCK_STEPS = [
  "Configure SSO IdP staging env vars (6) — see docs/enterprise-sso-idp-staging-smoke-plan.md",
  "Configure GitHub staging secrets + record GITHUB_*_RUN_URL outcomes — see docs/GITHUB_E2E_STAGING_SECRETS.md",
  "Configure DATABASE_URL + ENCRYPTION_KEY + CHANNEL_SMOKE_OWNER_EMAIL for Woo/Shopify live smoke",
  "Re-run npm run smoke:p0-staging-proof-unblock — review artifacts/p0-staging-proof-unblock-summary.json",
  "Do not claim pilot_ready SSO, staging first-green, or live channel ops until child artifacts show proof_passed",
] as const;

export const P0_STAGING_PROOF_UNBLOCK_ERA17_FORBIDDEN_CLAIMS = [
  "p0 staging proof passed without child artifacts",
  "sso pilot_ready without idp login artifact",
  "github staging green without run url",
  "woo shopify live without channel smoke pass",
] as const;

export const P0_STAGING_PROOF_UNBLOCK_ERA17_CI_SCRIPTS = [
  "test:ci:p0-staging-proof-unblock-era17",
  "test:ci:p0-staging-proof-unblock-era17:cert",
] as const;

export const P0_STAGING_PROOF_UNBLOCK_ERA17_UNIT_TESTS = [
  "tests/unit/p0-staging-proof-unblock-era17-policy.test.ts",
  "tests/unit/p0-staging-proof-unblock-summary.test.ts",
  "tests/unit/p0-staging-proof-unblock-era17-cert-live.test.ts",
] as const;

export const P0_STAGING_PROOF_UNBLOCK_ERA17_CANONICAL_DOC_PATHS = [
  "docs/commercial-pilot-runbook.md",
  "docs/GITHUB_E2E_STAGING_SECRETS.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
  "docs/next-master-prompt-input-2026-05-28-era18.md",
] as const;

export const P0_STAGING_PROOF_UNBLOCK_ERA17_REVIEW_SECTION =
  "Era 17 P0 staging proof unblock (2026-05-28)" as const;

export const P0_STAGING_PROOF_UNBLOCK_ERA17_BACKLOG_ID = "KOS-E17-042" as const;
