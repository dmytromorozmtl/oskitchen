/**
 * Enterprise identity Era 13 recertification — Evolution Era 13 Cycle 1.
 *
 * Re-validates Era 6 roadmap_only posture and Era 9 SSO R1 spike after Era 12.
 * Does **not** implement SSO/SAML, SCIM, or SOC 2 delivery.
 */

export const ENTERPRISE_IDENTITY_ERA13_POLICY_ID =
  "era13-enterprise-identity-recert-v1" as const;

export const ENTERPRISE_IDENTITY_ERA13_EXTENDS_POLICIES = [
  "era6-enterprise-identity-roadmap-v1",
  "era9-enterprise-sso-architecture-spike-v1",
] as const;

export const ENTERPRISE_IDENTITY_ERA13_REVIEW_DATE = "2026-05-27" as const;

export const ENTERPRISE_IDENTITY_ERA13_DELIVERY_DECISION = "roadmap_only" as const;

export const ENTERPRISE_IDENTITY_ERA13_SSO_DELIVERY_STATUS = "not_implemented" as const;

export const ENTERPRISE_IDENTITY_ERA13_SCIM_DELIVERY_STATUS = "not_implemented" as const;

export const ENTERPRISE_IDENTITY_ERA13_SOC2_TYPE2_STATUS = "not_certified" as const;

export const ENTERPRISE_IDENTITY_ERA13_R2_PILOT_STATUS = "not_started" as const;

export const ENTERPRISE_IDENTITY_ERA13_REVIEW_SECTION =
  "Era 13 enterprise identity recert (2026-05-27)" as const;

export const ENTERPRISE_IDENTITY_ERA13_PROCUREMENT_DOC =
  "docs/enterprise-procurement-pack.md" as const;

export const ENTERPRISE_IDENTITY_ERA13_SPIKE_DOC =
  "docs/enterprise-sso-architecture-spike-r1.md" as const;

export const ENTERPRISE_IDENTITY_ERA13_CANONICAL_MARKERS = [
  ENTERPRISE_IDENTITY_ERA13_POLICY_ID,
  ENTERPRISE_IDENTITY_ERA13_DELIVERY_DECISION,
  ENTERPRISE_IDENTITY_ERA13_R2_PILOT_STATUS,
  "not_implemented",
  "not_certified",
] as const;

export const ENTERPRISE_IDENTITY_ERA13_FORBIDDEN_DELIVERY_CLAIMS = [
  "SSO is available in production",
  "SCIM provisioning is live",
  "SOC 2 Type II certified today",
  "enterprise SSO included",
  "SAML login is live",
] as const;

export const ENTERPRISE_IDENTITY_ERA13_CI_SCRIPTS = [
  "test:ci:enterprise-identity-era13",
  "test:ci:enterprise-identity-era13:cert",
] as const;

export const ENTERPRISE_IDENTITY_ERA13_UNIT_TESTS = [
  "tests/unit/enterprise-identity-era13-policy.test.ts",
  "tests/unit/enterprise-identity-era13-cert-live.test.ts",
] as const;

export const ENTERPRISE_IDENTITY_ERA13_CANONICAL_DOC_PATHS = [
  ENTERPRISE_IDENTITY_ERA13_PROCUREMENT_DOC,
  "docs/feature-maturity-matrix.md",
  "docs/commercial-pilot-runbook.md",
  "docs/qa-master-test-plan.md",
] as const;
