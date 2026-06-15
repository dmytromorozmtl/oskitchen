/**
 * Enterprise SSO architecture spike (R1) — Evolution Era 9 Cycle 1.
 *
 * Documents target SAML/OIDC integration design only. Does **not** implement IdP,
 * tenant SSO config UI, or SCIM. Extends `era6-enterprise-identity-roadmap-v1`.
 */

export const ENTERPRISE_SSO_SPIKE_POLICY_ID =
  "era9-enterprise-sso-architecture-spike-v1" as const;

export const ENTERPRISE_SSO_SPIKE_EXTENDS_POLICY_ID =
  "era6-enterprise-identity-roadmap-v1" as const;

export const ENTERPRISE_SSO_SPIKE_PHASE = "R1" as const;

export const ENTERPRISE_SSO_SPIKE_DOC =
  "docs/enterprise-sso-architecture-spike-r1.md" as const;

export const ENTERPRISE_SSO_SPIKE_DELIVERY_STATUS = "not_implemented" as const;

/** Production auth spine files referenced by the spike (grep anchors). */
export const ENTERPRISE_SSO_SPIKE_EVIDENCE_PATHS = [
  "app/login/page.tsx",
  "actions/auth.ts",
  "app/auth/callback/route.ts",
  "lib/auth.ts",
  "lib/scope/require-tenant-actor.ts",
  "lib/permissions/mutation-access.ts",
] as const;

export const ENTERPRISE_SSO_SPIKE_REQUIRED_DOC_SECTIONS = [
  "Purpose and honesty rules",
  "Current production auth spine",
  "R1 spike scope (design only)",
  "Proposed target architecture",
  "Session bridge and workspace mapping",
  "Break-glass and operations",
  "RBAC and audit implications",
  "Explicitly not in R1",
  "R2 pilot prerequisites",
  "Procurement alignment",
] as const;

export const ENTERPRISE_SSO_SPIKE_CANONICAL_DOC_PATHS = [
  ENTERPRISE_SSO_SPIKE_DOC,
  "docs/enterprise-procurement-pack.md",
  "docs/feature-maturity-matrix.md",
] as const;

export const ENTERPRISE_SSO_SPIKE_CANONICAL_MARKERS = [
  ENTERPRISE_SSO_SPIKE_POLICY_ID,
  ENTERPRISE_SSO_SPIKE_PHASE,
  "not_implemented",
  "architecture spike",
] as const;

export const ENTERPRISE_SSO_SPIKE_FORBIDDEN_DELIVERY_CLAIMS = [
  "SSO is available in production",
  "SAML login is live",
  "enterprise SSO included",
  "OIDC SSO enabled for all tenants",
] as const;

export const ENTERPRISE_SSO_SPIKE_CI_SCRIPTS = [
  "test:ci:enterprise-sso-spike",
  "test:ci:enterprise-sso-spike:cert",
] as const;

export const ENTERPRISE_SSO_SPIKE_UNIT_TESTS = [
  "tests/unit/enterprise-sso-architecture-spike-policy.test.ts",
  "tests/unit/enterprise-sso-architecture-spike-ci-live.test.ts",
] as const;

export function enterpriseSsoSpikeDocCoversRequiredSections(docMarkdown: string): boolean {
  return ENTERPRISE_SSO_SPIKE_REQUIRED_DOC_SECTIONS.every((section) =>
    docMarkdown.includes(section),
  );
}
