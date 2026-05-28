/**
 * Enterprise identity / compliance annual review — Evolution Era 6 Cycle 5.
 *
 * E6-5 decision: defer SSO, SCIM, and SOC 2 Type II **delivery**; refresh honest
 * roadmap in the procurement pack. Does not implement IdP or compliance programs.
 */

export const ENTERPRISE_IDENTITY_ROADMAP_POLICY_ID = "era6-enterprise-identity-roadmap-v1" as const;

export const ENTERPRISE_IDENTITY_ANNUAL_REVIEW_DATE = "2026-05-27" as const;

/** Product delivery posture after Era 6 review — not a GTM lock on future eras. */
export const ENTERPRISE_IDENTITY_DELIVERY_DECISION = "roadmap_only" as const;

export const ENTERPRISE_SSO_DELIVERY_STATUS = "not_implemented" as const;

export const ENTERPRISE_SCIM_DELIVERY_STATUS = "not_implemented" as const;

export const ENTERPRISE_SOC2_TYPE2_STATUS = "not_certified" as const;

export const ENTERPRISE_IDENTITY_ANNUAL_REVIEW_SECTION =
  "Annual enterprise identity review (2026-05-27)" as const;

export const ENTERPRISE_IDENTITY_PROCUREMENT_DOC = "docs/enterprise-procurement-pack.md" as const;

export const ENTERPRISE_IDENTITY_REQUIRED_MARKERS = [
  "era4-procurement-honesty-v1",
  "era9-enterprise-sso-architecture-spike-v1",
  "era6-enterprise-identity-roadmap-v1",
  ENTERPRISE_IDENTITY_DELIVERY_DECISION,
  "not_implemented",
  "not_certified",
] as const;

/** Affirmative delivery claims forbidden in procurement/GTM docs (CI scan). */
export const ENTERPRISE_IDENTITY_FORBIDDEN_DELIVERY_CLAIMS = [
  "SSO is available in production",
  "SCIM provisioning is live",
  "SOC 2 Type II certified today",
  "enterprise SSO included",
] as const;

export const ENTERPRISE_IDENTITY_CI_SCRIPTS = [
  "test:ci:enterprise-identity-roadmap",
  "test:ci:enterprise-identity-roadmap:cert",
] as const;

export const ENTERPRISE_IDENTITY_UNIT_TESTS = [
  "tests/unit/enterprise-identity-roadmap-policy.test.ts",
  "tests/unit/enterprise-identity-roadmap-ci-live.test.ts",
] as const;
