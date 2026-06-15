/**
 * Pilot forbidden-claims enforcement — Evolution Era 17 P0 #5 (Workstream D).
 *
 * Pre-sales claims gate: strict verify-claims + registry audit + cert wiring.
 * Does NOT claim pilot sales readiness without PASS artifact on release branch.
 */

import { PILOT_ICP_CONTRACT_ERA17_POLICY_ID } from "@/lib/commercial/pilot-icp-contract-era17-policy";
import { PILOT_TIER_PREFLIGHT_ERA17_POLICY_ID } from "@/lib/commercial/pilot-tier-preflight-era17-policy";
import { PILOT_PREFLIGHT_CLAIMS_POLICY_ID } from "@/lib/governance/pilot-preflight-claims-policy";

export const PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_POLICY_ID =
  "era17-pilot-forbidden-claims-enforcement-v1" as const;

export const PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_DECISION_DATE = "2026-05-28" as const;

export const PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_EXTENDS_POLICIES = [
  PILOT_TIER_PREFLIGHT_ERA17_POLICY_ID,
  PILOT_ICP_CONTRACT_ERA17_POLICY_ID,
  PILOT_PREFLIGHT_CLAIMS_POLICY_ID,
  "era7-marketing-claims-governance-v1",
  "era8-claims-registry-v1",
] as const;

/** Run smoke on release branch before contract signature — not auto-passed. */
export const PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_PROOF_STATUS =
  "awaiting_forbidden_claims_enforcement_pass" as const;

export const PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-pilot-forbidden-claims-enforcement-era17.ts" as const;

export const PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_NPM_SCRIPT =
  "smoke:pilot-forbidden-claims-enforcement" as const;

export const PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_SUMMARY_ARTIFACT =
  "artifacts/pilot-forbidden-claims-enforcement-summary.json" as const;

export const PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_STRICT_ENV = "MARKETING_CLAIMS_STRICT" as const;

export const PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_STRICT_ENV_VALUE = "1" as const;

export const PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_COMMANDS = [
  "verify-claims",
  "audit:marketing-claims",
  "test:ci:pilot-preflight-claims:cert",
  "test:ci:marketing-claims-governance:cert",
  "test:ci:claims-registry:cert",
  "test:ci:enterprise-procurement:cert",
] as const;

export const PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_FORBIDDEN_SALES_CLAIMS = [
  "production SSO",
  "SOC2 Type II",
  "SCIM",
  "unified inventory",
  "unified rewards",
  "offline POS",
  "rush-hour KDS",
  "live marketplace integrations",
  "Public API SLA",
] as const;

export const PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_CYCLE_RUNBOOK_STEPS = [
  "Run npm run smoke:pilot-forbidden-claims-enforcement on release branch before pilot contract signature.",
  "Review artifacts/pilot-forbidden-claims-enforcement-summary.json — claimsEnforcementProofStatus.",
  "MARKETING_CLAIMS_STRICT=1 verify-claims must PASS — blocks unqualified roadmap terms in GTM copy.",
  "audit:marketing-claims must PASS — registry aligned with feature maturity matrix.",
  "Enterprise procurement cert must PASS — no false SSO/SOC2/SCIM affirmative claims in buyer pack.",
  "FAIL blocks paid pilot sales until copy/registry/procurement docs are corrected.",
] as const;

export const PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_CANONICAL_MARKERS = [
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_POLICY_ID,
  "pilot-forbidden-claims-enforcement",
  "awaiting_forbidden_claims_enforcement_pass",
  "claimsEnforcementProofStatus",
  "MARKETING_CLAIMS_STRICT=1",
] as const;

export const PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_CI_SCRIPTS = [
  "test:ci:pilot-forbidden-claims-enforcement-era17",
  "test:ci:pilot-forbidden-claims-enforcement-era17:cert",
] as const;

export const PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_UNIT_TESTS = [
  "tests/unit/pilot-forbidden-claims-enforcement-era17-policy.test.ts",
  "tests/unit/pilot-forbidden-claims-enforcement-summary.test.ts",
  "tests/unit/pilot-forbidden-claims-enforcement-era17-cert-live.test.ts",
] as const;

export const PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_CANONICAL_DOC_PATHS = [
  "docs/commercial-pilot-runbook.md",
  "docs/pilot-icp-contract-template-era17.md",
  "docs/enterprise-procurement-pack.md",
  "docs/feature-maturity-matrix.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
  "docs/qa-master-test-plan.md",
] as const;

export const PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_REVIEW_SECTION =
  "Era 17 pilot forbidden-claims enforcement (2026-05-28)" as const;
