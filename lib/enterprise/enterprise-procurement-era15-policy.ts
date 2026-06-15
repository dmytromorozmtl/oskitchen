/**
 * Enterprise procurement Era 15 recertification — Evolution Era 15 Cycle 2.
 *
 * Re-validates Era 4 procurement honesty pack + Era 13 identity roadmap_only posture
 * after Era 14 honesty/recert cycles. Does not implement SSO, SCIM, or SOC 2 delivery.
 */

import {
  ENTERPRISE_PROCUREMENT_FORBIDDEN_AFFIRMATIVE_CLAIMS,
  ENTERPRISE_PROCUREMENT_PACK_DOC,
  ENTERPRISE_PROCUREMENT_POLICY_ID,
  ENTERPRISE_PROCUREMENT_REQUIRED_SECTIONS,
} from "@/lib/enterprise/enterprise-procurement-policy";
import {
  ENTERPRISE_IDENTITY_ERA13_DELIVERY_DECISION,
  ENTERPRISE_IDENTITY_ERA13_POLICY_ID,
  ENTERPRISE_IDENTITY_ERA13_R2_PILOT_STATUS,
} from "@/lib/enterprise/enterprise-identity-era13-policy";

export const ENTERPRISE_PROCUREMENT_ERA15_POLICY_ID =
  "era15-enterprise-procurement-recert-v1" as const;

export const ENTERPRISE_PROCUREMENT_ERA15_EXTENDS_POLICIES = [
  ENTERPRISE_PROCUREMENT_POLICY_ID,
  ENTERPRISE_IDENTITY_ERA13_POLICY_ID,
  "era6-enterprise-identity-roadmap-v1",
] as const;

export const ENTERPRISE_PROCUREMENT_ERA15_REQUIRED_SECTIONS =
  ENTERPRISE_PROCUREMENT_REQUIRED_SECTIONS;

export const ENTERPRISE_PROCUREMENT_ERA15_FORBIDDEN_AFFIRMATIVE_CLAIMS =
  ENTERPRISE_PROCUREMENT_FORBIDDEN_AFFIRMATIVE_CLAIMS;

export const ENTERPRISE_PROCUREMENT_ERA15_IDENTITY_DELIVERY = {
  decision: ENTERPRISE_IDENTITY_ERA13_DELIVERY_DECISION,
  ssoR2Pilot: ENTERPRISE_IDENTITY_ERA13_R2_PILOT_STATUS,
} as const;

/** Era 14 recert policy ids buyers may cite as CI evidence (honesty only — not compliance). */
export const ENTERPRISE_PROCUREMENT_ERA15_ERA14_EVIDENCE_POLICY_IDS = [
  "era14-nav-page-maturity-recert-v1",
  "era14-cross-channel-rewards-recert-v1",
  "era14-mutation-access-consolidation-recert-v1",
  "era14-cron-surface-recert-v1",
  "era14-channel-golden-path-recert-v1",
] as const;

export const ENTERPRISE_PROCUREMENT_ERA15_PILOT_CHECKLIST = [
  "Run npm run smoke:enterprise-procurement before enterprise discovery or RFP response.",
  "Answer questionnaires from docs/enterprise-procurement-pack.md only — not marketing superlatives.",
  "SSO/SAML R2 remains not_started; do not contract for live SSO without a future era delivery.",
  "Cite Era 14 CI recert policy ids for operational honesty; do not imply SOC 2 or ISO certification.",
  "Pair with feature-maturity-matrix.md and commercial-pilot-runbook.md for pilot GO/NO-GO.",
] as const;

export const ENTERPRISE_PROCUREMENT_ERA15_OPS_DOC = ENTERPRISE_PROCUREMENT_PACK_DOC;

export const ENTERPRISE_PROCUREMENT_ERA15_SMOKE_SCRIPT =
  "scripts/smoke-enterprise-procurement.ts" as const;

export const ENTERPRISE_PROCUREMENT_ERA15_SMOKE_NPM_SCRIPT =
  "smoke:enterprise-procurement" as const;

export const ENTERPRISE_PROCUREMENT_ERA15_CI_SCRIPTS = [
  "test:ci:enterprise-procurement-era15",
  "test:ci:enterprise-procurement-era15:cert",
] as const;

export const ENTERPRISE_PROCUREMENT_ERA15_UNIT_TESTS = [
  "tests/unit/enterprise-procurement-era15-policy.test.ts",
  "tests/unit/enterprise-procurement-era15-cert-live.test.ts",
] as const;

export const ENTERPRISE_PROCUREMENT_ERA15_CANONICAL_DOC_PATHS = [
  ENTERPRISE_PROCUREMENT_ERA15_OPS_DOC,
  "docs/feature-maturity-matrix.md",
  "docs/devops-release-enterprise-readiness.md",
  "docs/qa-master-test-plan.md",
  "docs/ci-e2e-tier-matrix.md",
  "docs/commercial-pilot-runbook.md",
  "docs/implementation-backlog.md",
] as const;

export const ENTERPRISE_PROCUREMENT_ERA15_CANONICAL_MARKERS = [
  ENTERPRISE_PROCUREMENT_ERA15_POLICY_ID,
  ENTERPRISE_PROCUREMENT_POLICY_ID,
  ENTERPRISE_IDENTITY_ERA13_POLICY_ID,
  "Security questionnaire guide",
  "Procurement FAQ",
  "roadmap_only",
  "not_implemented",
] as const;
