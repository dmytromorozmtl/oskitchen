/**
 * Tier 2 staging golden path orchestrator — Era 20 Workstream G.
 *
 * Woo webhook → Order Hub → KDS → Packing on staging.
 * Blocked until P0 `proof_passed` — never fake PASS.
 */

import { P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import { PILOT_OPERATOR_GOLDEN_PATH_ERA17_SUMMARY_ARTIFACT } from "@/lib/commercial/pilot-operator-golden-path-era17-policy";
import { ERA20_OPERATOR_GOLDEN_PATH_PROOF_POLICY_ID } from "@/lib/commercial/era20-operator-golden-path-proof-era20-policy";

export const TIER2_STAGING_GOLDEN_PATH_ERA20_POLICY_ID =
  "era20-tier2-staging-golden-path-v1" as const;

export const TIER2_STAGING_GOLDEN_PATH_ERA20_NPM_SCRIPT =
  "smoke:tier2-staging-golden-path" as const;

export const TIER2_STAGING_GOLDEN_PATH_ERA20_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-tier2-staging-golden-path-era20.ts" as const;

export const TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT =
  "artifacts/tier2-staging-golden-path-summary.json" as const;

export const TIER2_STAGING_GOLDEN_PATH_ERA20_PLAYBOOK_DOC =
  "docs/tier2-staging-golden-path-execution-playbook-2026-05-28.md" as const;

export const TIER2_STAGING_GOLDEN_PATH_ERA20_EXTENDS_POLICIES = [
  "era17-p0-staging-proof-unblock-v1",
  ERA20_OPERATOR_GOLDEN_PATH_PROOF_POLICY_ID,
  "era17-pilot-operator-golden-path-v1",
] as const;

export const TIER2_STAGING_GOLDEN_PATH_ERA20_PREREQ_ARTIFACT =
  P0_STAGING_PROOF_UNBLOCK_ERA17_SUMMARY_ARTIFACT;

export const TIER2_STAGING_GOLDEN_PATH_ERA20_CHILD_SMOKES = [
  "smoke:woo-shopify-live",
  "smoke:staging-workflows-first-green",
  "smoke:pilot-operator-golden-path",
] as const;

export const TIER2_STAGING_GOLDEN_PATH_ERA20_MANUAL_PHASES = [
  {
    id: "channel_webhook",
    label: "Place live Woo/Shopify order → canonical external order",
    route: "/dashboard/order-hub",
    manualEnvKey: "TIER2_CHANNEL_WEBHOOK_MANUAL",
  },
  {
    id: "kds_bump",
    label: "KDS bump ticket on staging",
    route: "/dashboard/kitchen",
    manualEnvKey: "TIER2_KDS_BUMP_MANUAL",
  },
  {
    id: "packing_complete",
    label: "Packing verify + label on staging",
    route: "/dashboard/packing",
    manualEnvKey: "TIER2_PACKING_COMPLETE_MANUAL",
  },
] as const;

export const TIER2_STAGING_GOLDEN_PATH_ERA20_OPERATOR_ENV_VARS = [
  "PILOT_GOLDEN_PATH_STAGING_URL",
  "PILOT_GOLDEN_PATH_OPERATOR_EMAIL",
  "PILOT_GOLDEN_PATH_COMMIT_SHA",
  "PILOT_GOLDEN_PATH_DURATION_MINUTES",
] as const;

export const TIER2_STAGING_GOLDEN_PATH_ERA20_GITHUB_EVIDENCE_VARS = [
  "GITHUB_KDS_STAGING_RUN_URL",
  "GITHUB_KDS_STAGING_RUN_OUTCOME",
  "GITHUB_E2E_STAGING_RUN_URL",
  "GITHUB_E2E_STAGING_RUN_OUTCOME",
] as const;

export const TIER2_STAGING_GOLDEN_PATH_ERA20_PROOF_STATUS =
  "awaiting_p0_proof_passed" as const;

export const TIER2_STAGING_GOLDEN_PATH_ERA20_FORBIDDEN_CLAIMS = [
  "tier 2 golden path passed without p0 proof_passed",
  "tier 2 passed without manual phase env vars",
  "tier 2 passed without github kds run url",
] as const;

export const TIER2_STAGING_GOLDEN_PATH_ERA20_RELATED_ARTIFACTS = [
  TIER2_STAGING_GOLDEN_PATH_ERA20_SUMMARY_ARTIFACT,
  PILOT_OPERATOR_GOLDEN_PATH_ERA17_SUMMARY_ARTIFACT,
  "artifacts/channel-live-smoke-summary.json",
  "artifacts/staging-workflows-first-green-summary.json",
] as const;
