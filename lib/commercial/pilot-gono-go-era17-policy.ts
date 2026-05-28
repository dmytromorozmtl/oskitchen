/**
 * Paid pilot GO/NO-GO evaluator — Evolution Era 17 Cycle 18 (Workstream D).
 *
 * Aggregates Era 17 evidence artifacts + ICP qualification into a single decision.
 * Does NOT fake customer LOI or paid pilot execution.
 */

import {
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_POLICY_ID,
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_SUMMARY_ARTIFACT,
} from "@/lib/commercial/pilot-forbidden-claims-enforcement-era17-policy";
import { COMMERCIAL_PILOT_EVIDENCE_ERA16_POLICY_ID } from "@/lib/commercial/commercial-pilot-evidence-pack-era16-policy";
import { PILOT_ICP_CONTRACT_ERA17_POLICY_ID } from "@/lib/commercial/pilot-icp-contract-era17-policy";
import { PILOT_OPERATOR_GOLDEN_PATH_ERA17_POLICY_ID } from "@/lib/commercial/pilot-operator-golden-path-era17-policy";
import { P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID } from "@/lib/commercial/p0-staging-proof-unblock-era17-policy";
import { PILOT_TIER_PREFLIGHT_ERA17_POLICY_ID } from "@/lib/commercial/pilot-tier-preflight-era17-policy";

export const PILOT_GONOGO_ERA17_POLICY_ID = "era17-pilot-gono-go-v1" as const;

export const PILOT_GONOGO_ERA17_DECISION_DATE = "2026-05-28" as const;

export const PILOT_GONOGO_ERA17_EXTENDS_POLICIES = [
  COMMERCIAL_PILOT_EVIDENCE_ERA16_POLICY_ID,
  PILOT_ICP_CONTRACT_ERA17_POLICY_ID,
  PILOT_TIER_PREFLIGHT_ERA17_POLICY_ID,
  PILOT_OPERATOR_GOLDEN_PATH_ERA17_POLICY_ID,
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_POLICY_ID,
  P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID,
] as const;

/** No signed LOI / customer on record — evaluator only, not pilot start. */
export const PILOT_GONOGO_ERA17_PROOF_STATUS = "awaiting_customer_execution" as const;

export const PILOT_GONOGO_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pilot-gono-go-era17.ts" as const;

export const PILOT_GONOGO_ERA17_NPM_SCRIPT = "smoke:pilot-gono-go" as const;

export const PILOT_GONOGO_ERA17_SUMMARY_ARTIFACT = "artifacts/pilot-gono-go-summary.json" as const;

export const PILOT_GONOGO_ERA17_INPUT_ARTIFACTS = [
  "artifacts/pilot-tier-preflight-summary.json",
  "artifacts/pilot-operator-golden-path-summary.json",
  "artifacts/pilot-forbidden-claims-enforcement-summary.json",
  "artifacts/p0-staging-proof-unblock-summary.json",
  "artifacts/commercial-pilot-evidence-pack-summary.json",
] as const;

export const PILOT_GONOGO_ERA17_OPTIONAL_EVIDENCE_ARTIFACTS = [
  "artifacts/enterprise-sso-idp-staging-smoke-summary.json",
  "artifacts/channel-live-smoke-summary.json",
  "artifacts/staging-workflows-first-green-summary.json",
] as const;

export const PILOT_GONOGO_ERA17_CUSTOMER_ENV_VARS = [
  "PILOT_GONOGO_CUSTOMER_NAME",
  "PILOT_GONOGO_LOI_SIGNED_DATE",
  "PILOT_GONOGO_ICP_INPUT_JSON",
  "PILOT_GONOGO_ROLE_CHECKLISTS_COMPLETE",
  "PILOT_GONOGO_FORBIDDEN_CLAIMS_IN_CONTRACT",
  "PILOT_GONOGO_TIER3_PASS",
] as const;

export const PILOT_GONOGO_ERA17_CYCLE_RUNBOOK_STEPS = [
  "Run npm run smoke:p0-staging-proof-unblock — review artifacts/p0-staging-proof-unblock-summary.json (P0 #1–#3).",
  "Run Tier 0/1 preflight and Tier 2 golden path on staging; store summary artifacts.",
  "Run npm run smoke:pilot-forbidden-claims-enforcement on release branch before contract signature.",
  "Qualify prospect with evaluatePilotIcpQualification (set PILOT_GONOGO_ICP_INPUT_JSON when ready).",
  "Complete role checklists; set PILOT_GONOGO_ROLE_CHECKLISTS_COMPLETE=1 when verified.",
  "Run npm run smoke:pilot-gono-go — review artifacts/pilot-gono-go-summary.json.",
  "Record customer name + LOI date only when real signature exists — never fake execution.",
  "NO-GO is expected until P0 staging proof, tiers, ICP, and customer evidence are all present.",
] as const;

export const PILOT_GONOGO_ERA17_CANONICAL_MARKERS = [
  PILOT_GONOGO_ERA17_POLICY_ID,
  "pilot-gono-go",
  "awaiting_customer_execution",
  "customerExecutionStatus",
  "forbidden_claims_enforcement",
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_POLICY_ID,
  "p0_staging_proof",
  P0_STAGING_PROOF_UNBLOCK_ERA17_POLICY_ID,
] as const;

export const PILOT_GONOGO_ERA17_CI_SCRIPTS = [
  "test:ci:pilot-gono-go-era17",
  "test:ci:pilot-gono-go-era17:cert",
] as const;

export const PILOT_GONOGO_ERA17_UNIT_TESTS = [
  "tests/unit/pilot-gono-go-era17-policy.test.ts",
  "tests/unit/pilot-gono-go-summary.test.ts",
  "tests/unit/pilot-gono-go-era17-cert-live.test.ts",
] as const;

export const PILOT_GONOGO_ERA17_CANONICAL_DOC_PATHS = [
  "docs/commercial-pilot-runbook.md",
  "docs/pilot-icp-contract-template-era17.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
  "docs/feature-maturity-matrix.md",
] as const;

export const PILOT_GONOGO_ERA17_REVIEW_SECTION = "Era 17 pilot GO/NO-GO evaluator (2026-05-28)" as const;
