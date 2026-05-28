/**
 * Pilot Tier 0/1 preflight — Evolution Era 17 Cycle 16 (Workstream D).
 *
 * Records engineering + staging readiness before paid pilot GO/NO-GO.
 * Does NOT claim pilot execution or customer signature.
 */

import { COMMERCIAL_PILOT_EVIDENCE_ERA16_POLICY_ID } from "@/lib/commercial/commercial-pilot-evidence-pack-era16-policy";
import { COMMERCIAL_PILOT_RUNBOOK_POLICY_ID } from "@/lib/commercial/commercial-pilot-runbook-policy";
import { PILOT_ICP_CONTRACT_ERA17_POLICY_ID } from "@/lib/commercial/pilot-icp-contract-era17-policy";

export const PILOT_TIER_PREFLIGHT_ERA17_POLICY_ID = "era17-pilot-tier-preflight-v1" as const;

export const PILOT_TIER_PREFLIGHT_ERA17_DECISION_DATE = "2026-05-28" as const;

export const PILOT_TIER_PREFLIGHT_ERA17_EXTENDS_POLICIES = [
  COMMERCIAL_PILOT_RUNBOOK_POLICY_ID,
  COMMERCIAL_PILOT_EVIDENCE_ERA16_POLICY_ID,
  PILOT_ICP_CONTRACT_ERA17_POLICY_ID,
  "era8-pilot-preflight-claims-strict-v1",
  "era8-claims-registry-v1",
] as const;

/** Awaiting full Tier 0/1 PASS on release branch — not pilot GO yet. */
export const PILOT_TIER_PREFLIGHT_ERA17_PROOF_STATUS = "awaiting_tier_preflight_pass" as const;

export const PILOT_TIER_PREFLIGHT_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pilot-tier-preflight-era17.ts" as const;

export const PILOT_TIER_PREFLIGHT_ERA17_NPM_SCRIPT = "smoke:pilot-tier-preflight" as const;

export const PILOT_TIER_PREFLIGHT_ERA17_SUMMARY_ARTIFACT =
  "artifacts/pilot-tier-preflight-summary.json" as const;

export const PILOT_TIER_PREFLIGHT_ERA17_TIER0_COMMANDS = [
  "test:ci:governance-bundles",
  "test:ci:scorecard:cert",
  "validate:production-crons",
  "validate:cron-inventory",
] as const;

export const PILOT_TIER_PREFLIGHT_ERA17_TIER1_COMMANDS = [
  "verify-claims",
  "audit:marketing-claims",
  "verify:staging-env",
  "test:ci:pilot-preflight-claims:cert",
] as const;

export const PILOT_TIER_PREFLIGHT_ERA17_CYCLE_RUNBOOK_STEPS = [
  "Record release commit SHA (git rev-parse HEAD) in pilot tracker.",
  "Run npm run smoke:pilot-tier-preflight on release branch (full — includes governance bundles).",
  "Review artifacts/pilot-tier-preflight-summary.json — tier0ProofStatus and tier1ProofStatus.",
  "Tier 0 FAIL blocks paid pilot GO; Tier 1 staging-env may SKIPPED WITH REASON locally.",
  "Re-run with MARKETING_CLAIMS_STRICT=1 before sales contract signature (P0 forbidden claims).",
  "Chain into npm run cert:commercial-pilot-evidence-era16 after Tier 0/1 PASS.",
] as const;

export const PILOT_TIER_PREFLIGHT_ERA17_CANONICAL_MARKERS = [
  PILOT_TIER_PREFLIGHT_ERA17_POLICY_ID,
  "pilot-tier-preflight",
  "awaiting_tier_preflight_pass",
  "tier0ProofStatus",
  "tier1ProofStatus",
] as const;

export const PILOT_TIER_PREFLIGHT_ERA17_CI_SCRIPTS = [
  "test:ci:pilot-tier-preflight-era17",
  "test:ci:pilot-tier-preflight-era17:cert",
] as const;

export const PILOT_TIER_PREFLIGHT_ERA17_UNIT_TESTS = [
  "tests/unit/pilot-tier-preflight-era17-policy.test.ts",
  "tests/unit/pilot-tier-preflight-summary.test.ts",
  "tests/unit/pilot-tier-preflight-era17-cert-live.test.ts",
] as const;

export const PILOT_TIER_PREFLIGHT_ERA17_CANONICAL_DOC_PATHS = [
  "docs/commercial-pilot-runbook.md",
  "docs/pilot-icp-contract-template-era17.md",
  "docs/devops-release-enterprise-readiness.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
] as const;

export const PILOT_TIER_PREFLIGHT_ERA17_REVIEW_SECTION =
  "Era 17 pilot Tier 0/1 preflight (2026-05-28)" as const;
