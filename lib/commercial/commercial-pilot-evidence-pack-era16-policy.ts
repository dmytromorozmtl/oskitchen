/**
 * Commercial pilot GO/NO-GO evidence pack — Evolution Era 16 Cycle 9.
 *
 * Single decision surface for founders/sales/operators — aligned with
 * `docs/feature-maturity-matrix.md` and `era7-commercial-pilot-runbooks-v1`.
 * Does NOT claim production certification or enterprise SSO for all tenants.
 */

export const COMMERCIAL_PILOT_EVIDENCE_ERA16_POLICY_ID =
  "era16-commercial-pilot-evidence-pack-v1" as const;

export const COMMERCIAL_PILOT_EVIDENCE_ERA16_DECISION_DATE = "2026-05-28" as const;

export const COMMERCIAL_PILOT_EVIDENCE_ERA16_EXTENDS_POLICIES = [
  "era7-commercial-pilot-runbooks-v1",
  "era15-enterprise-procurement-recert-v1",
] as const;

export const COMMERCIAL_PILOT_EVIDENCE_ERA16_MODULE =
  "lib/commercial/commercial-pilot-evidence-pack.ts" as const;

export const COMMERCIAL_PILOT_EVIDENCE_ERA16_CERT_SCRIPT =
  "scripts/cert-commercial-pilot-evidence-era16.ts" as const;

export const COMMERCIAL_PILOT_EVIDENCE_ERA16_SUMMARY_ARTIFACT =
  "artifacts/commercial-pilot-evidence-pack-summary.json" as const;

export const COMMERCIAL_PILOT_EVIDENCE_ERA16_RUNBOOK_DOC =
  "docs/commercial-pilot-runbook.md" as const;

/** Required H2 sections added by Era 16 evidence pack. */
export const COMMERCIAL_PILOT_EVIDENCE_ERA16_RUNBOOK_SECTIONS = [
  "Pilot GO/NO-GO decision (Era 16)",
  "Role checklist — owner",
  "Role checklist — manager",
  "Role checklist — cashier",
  "Role checklist — kitchen",
  "Role checklist — support and platform admin",
  "Allowed pilot features",
  "Forbidden pilot claims and support boundaries",
  "Rollback plan",
  "Issue escalation",
] as const;

export const COMMERCIAL_PILOT_EVIDENCE_ERA16_ROLES = [
  "owner",
  "manager",
  "cashier",
  "kitchen",
  "support_admin",
] as const;

export type CommercialPilotEvidenceRole = (typeof COMMERCIAL_PILOT_EVIDENCE_ERA16_ROLES)[number];

export const COMMERCIAL_PILOT_EVIDENCE_ERA16_HONEST_SCOPE = {
  replacesFeatureMaturityMatrix: false,
  replacesEnterpriseProcurementPack: false,
  claimsProductionCertification: false,
  claimsEnterpriseSsoForAllTenants: false,
  singlePageGoNoGo: true,
} as const;

export const COMMERCIAL_PILOT_EVIDENCE_ERA16_CANONICAL_MARKERS = [
  COMMERCIAL_PILOT_EVIDENCE_ERA16_POLICY_ID,
  COMMERCIAL_PILOT_EVIDENCE_ERA16_MODULE,
  "commercial-pilot-evidence-pack",
  "pilot go/no-go",
] as const;

export const COMMERCIAL_PILOT_EVIDENCE_ERA16_FORBIDDEN_CLAIMS = [
  "production certified for all tenants",
  "enterprise sso included for all staff",
  "soc 2 type ii compliant",
  "unified cross-channel inventory depletion",
  "rush-hour kds certified",
  "live doordash uber eats marketplace",
] as const;

export const COMMERCIAL_PILOT_EVIDENCE_ERA16_CI_SCRIPTS = [
  "test:ci:commercial-pilot-evidence-era16",
  "test:ci:commercial-pilot-evidence-era16:cert",
] as const;

export const COMMERCIAL_PILOT_EVIDENCE_ERA16_UNIT_TESTS = [
  "tests/unit/commercial-pilot-evidence-pack.test.ts",
  "tests/unit/commercial-pilot-evidence-pack-era16-policy.test.ts",
  "tests/unit/commercial-pilot-evidence-pack-era16-cert-live.test.ts",
] as const;

export const COMMERCIAL_PILOT_EVIDENCE_ERA16_CANONICAL_DOC_PATHS = [
  "docs/commercial-pilot-runbook.md",
  "docs/feature-maturity-matrix.md",
  "docs/enterprise-procurement-pack.md",
  "docs/ci-e2e-tier-matrix.md",
] as const;

export const COMMERCIAL_PILOT_EVIDENCE_ERA16_REVIEW_SECTION =
  "Era 16 commercial pilot evidence pack (2026-05-28)" as const;
