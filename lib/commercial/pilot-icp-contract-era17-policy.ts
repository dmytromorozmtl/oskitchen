/**
 * Pilot ICP + contract template — Evolution Era 17 Cycle 15 (Workstream D).
 *
 * Qualified customer profile and contract language for paid pilots.
 * Does NOT claim production certification or fake enterprise parity.
 */

import { COMMERCIAL_PILOT_EVIDENCE_ERA16_POLICY_ID } from "@/lib/commercial/commercial-pilot-evidence-pack-era16-policy";
import { COMMERCIAL_PILOT_RUNBOOK_POLICY_ID } from "@/lib/commercial/commercial-pilot-runbook-policy";

export const PILOT_ICP_CONTRACT_ERA17_POLICY_ID = "era17-pilot-icp-contract-v1" as const;

export const PILOT_ICP_CONTRACT_ERA17_DECISION_DATE = "2026-05-28" as const;

export const PILOT_ICP_CONTRACT_ERA17_DOC = "docs/pilot-icp-contract-template-era17.md" as const;

export const PILOT_ICP_CONTRACT_ERA17_MODULE =
  "lib/commercial/pilot-icp-contract-era17.ts" as const;

export const PILOT_ICP_CONTRACT_ERA17_EXTENDS_POLICIES = [
  COMMERCIAL_PILOT_RUNBOOK_POLICY_ID,
  COMMERCIAL_PILOT_EVIDENCE_ERA16_POLICY_ID,
  "era17-channel-pilot-playbook-v1",
] as const;

/** Template ready for sales/legal review — not a signed customer contract. */
export const PILOT_ICP_CONTRACT_ERA17_STATUS = "template_ready" as const;

export const PILOT_ICP_CONTRACT_ERA17_DEFAULT_DURATION_DAYS = 90 as const;

export const PILOT_ICP_CONTRACT_ERA17_REQUIRED_SECTIONS = [
  "Qualified pilot customer profile (ICP)",
  "Disqualifiers",
  "Allowed contract claims",
  "Forbidden contract claims",
  "Support boundaries",
  "Rollback summary",
  "Pilot duration and success metrics",
  "Contract clause boilerplate",
  "Pre-signature checklist",
] as const;

export const PILOT_ICP_CONTRACT_ERA17_ICP_CRITERIA = [
  "Single-location or small multi-unit operator (≤5 locations in pilot scope)",
  "Owner or ops lead engaged in onboarding and weekly check-ins",
  "Needs kitchen + order hub + storefront and/or in-browser POS software path",
  "Accepts qualified beta / pilot_ready labels from feature maturity matrix",
  "Optional Woo or Shopify test shop — not full marketplace live ops requirement",
  "Willing to run staging golden path before production traffic",
] as const;

export const PILOT_ICP_CONTRACT_ERA17_DISQUALIFIERS = [
  "Requires production SSO / SAML for all staff without pilot qualification",
  "Requires SOC 2 Type II attestation or SCIM in pilot term",
  "Requires unified cross-channel inventory depletion or unified rewards ledger",
  "Requires rush-hour KDS SLA or live DoorDash/Uber Eats marketplace ops",
  "Requires offline POS or Toast/Square hardware certification parity",
  "Requires Public API production SLA or unlimited partner throughput",
  "Refuses qualified wording — demands “production certified for all tenants”",
] as const;

export const PILOT_ICP_CONTRACT_ERA17_SUCCESS_METRICS = [
  "Orders per day (manual + storefront + POS) — baseline week 2 vs week 8",
  "Storefront checkout success rate (pay-later path minimum)",
  "POS tier-2b cash checkout completion without blocker defects",
  "KDS bump/recall operational (manual sign-off — not rush-hour certified)",
  "Support tickets per week and time-to-first-response",
  "Operator feedback score (1–5) at midpoint and close",
  "GO/NO-GO evidence pack outcome recorded (`cert:commercial-pilot-evidence-era16`)",
] as const;

export const PILOT_ICP_CONTRACT_ERA17_CANONICAL_MARKERS = [
  PILOT_ICP_CONTRACT_ERA17_POLICY_ID,
  "era17-pilot-icp-contract",
  "qualified pilot customer profile",
  "pilot duration",
  "success metrics",
] as const;

export const PILOT_ICP_CONTRACT_ERA17_FORBIDDEN_CLAIMS = [
  "production certified for all tenants",
  "enterprise sso included for all staff",
  "soc 2 type ii compliant",
  "unified cross-channel inventory depletion",
  "rush-hour kds certified",
  "live doordash uber eats marketplace",
] as const;

export const PILOT_ICP_CONTRACT_ERA17_CI_SCRIPTS = [
  "test:ci:pilot-icp-contract-era17",
  "test:ci:pilot-icp-contract-era17:cert",
] as const;

export const PILOT_ICP_CONTRACT_ERA17_UNIT_TESTS = [
  "tests/unit/pilot-icp-contract-era17-policy.test.ts",
  "tests/unit/pilot-icp-contract-era17.test.ts",
  "tests/unit/pilot-icp-contract-era17-cert-live.test.ts",
] as const;

export const PILOT_ICP_CONTRACT_ERA17_CANONICAL_DOC_PATHS = [
  PILOT_ICP_CONTRACT_ERA17_DOC,
  "docs/commercial-pilot-runbook.md",
  "docs/enterprise-procurement-pack.md",
  "docs/feature-maturity-matrix.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
] as const;

export const PILOT_ICP_CONTRACT_ERA17_REVIEW_SECTION =
  "Era 17 pilot ICP + contract template (2026-05-28)" as const;
