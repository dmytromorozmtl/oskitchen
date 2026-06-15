/**
 * Enterprise SSO R2 pilot decision — Evolution Era 16 Cycle 1.
 *
 * Locks the R2 pilot integration path after auth architecture inspection.
 * Does **not** implement SAML/OIDC, tenant IdP UI, or SCIM.
 * Extends Era 9 R1 spike and Era 13 identity recert.
 */

export const ENTERPRISE_SSO_R2_PILOT_ERA16_POLICY_ID =
  "era16-enterprise-sso-r2-pilot-v1" as const;

export const ENTERPRISE_SSO_R2_PILOT_ERA16_EXTENDS_POLICIES = [
  "era6-enterprise-identity-roadmap-v1",
  "era9-enterprise-sso-architecture-spike-v1",
  "era13-enterprise-identity-recert-v1",
] as const;

export const ENTERPRISE_SSO_R2_PILOT_ERA16_DECISION_DATE = "2026-05-28" as const;

/** R2 pilot architecture locked — implementation cycles 2–4 still required. */
export const ENTERPRISE_SSO_R2_PILOT_STATUS = "design_locked" as const;

/** Product delivery unchanged until R2 code + tests ship. */
export const ENTERPRISE_SSO_R2_SSO_DELIVERY_STATUS = "not_implemented" as const;

export const ENTERPRISE_SSO_R2_SCIM_DELIVERY_STATUS = "not_implemented" as const;

export const ENTERPRISE_SSO_R2_SOC2_TYPE2_STATUS = "not_certified" as const;

/**
 * Option A from R1 spike — Supabase SAML/OIDC enterprise SSO as session bridge.
 * Rejected for R2 pilot: custom_oidc_bridge (B), hybrid_multi_path (C).
 */
export const ENTERPRISE_SSO_R2_SELECTED_PATH = "supabase_saml_sso" as const;

/** Pilot uses exactly one customer IdP — chosen at onboarding, not both in code. */
export const ENTERPRISE_SSO_R2_PILOT_IDP = "okta_or_entra_id" as const;

export const ENTERPRISE_SSO_R2_REJECTED_PATHS = [
  "custom_oidc_bridge",
  "hybrid_multi_path",
  "roadmap_only_no_decision",
] as const;

export const ENTERPRISE_SSO_R2_PILOT_ERA16_DOC =
  "docs/enterprise-sso-r2-pilot-design.md" as const;

export const ENTERPRISE_SSO_R2_PILOT_ERA16_R1_SPIKE_DOC =
  "docs/enterprise-sso-architecture-spike-r1.md" as const;

export const ENTERPRISE_SSO_R2_PILOT_ERA16_REVIEW_SECTION =
  "Era 16 SSO R2 pilot decision (2026-05-28)" as const;

/** Production auth spine inspected for R2 decision (grep anchors). */
export const ENTERPRISE_SSO_R2_PILOT_ERA16_EVIDENCE_PATHS = [
  "app/login/page.tsx",
  "actions/auth.ts",
  "app/auth/callback/route.ts",
  "lib/auth.ts",
  "lib/supabase/server.ts",
  "lib/billing/entitlements.ts",
  "lib/scope/require-tenant-actor.ts",
  "lib/permissions/mutation-access.ts",
] as const;

export const ENTERPRISE_SSO_R2_PILOT_ERA16_REQUIRED_DOC_SECTIONS = [
  "Purpose and honesty rules",
  "Auth architecture inspection",
  "R2 path decision",
  "Rejected alternatives",
  "Target session bridge (Supabase SAML SSO)",
  "Workspace mapping and RBAC",
  "Break-glass and operations",
  "Implementation phases (Cycles 2–4)",
  "R2 pilot acceptance criteria",
  "Procurement alignment",
] as const;

export const ENTERPRISE_SSO_R2_PILOT_ERA16_CANONICAL_MARKERS = [
  ENTERPRISE_SSO_R2_PILOT_ERA16_POLICY_ID,
  ENTERPRISE_SSO_R2_PILOT_STATUS,
  ENTERPRISE_SSO_R2_SELECTED_PATH,
  "not_implemented",
  "design_locked",
] as const;

export const ENTERPRISE_SSO_R2_PILOT_ERA16_FORBIDDEN_DELIVERY_CLAIMS = [
  "SSO is available in production",
  "SAML login is live",
  "enterprise SSO included",
  "OIDC SSO enabled for all tenants",
  "SCIM provisioning is live",
  "SOC 2 Type II certified today",
] as const;

export const ENTERPRISE_SSO_R2_PILOT_ERA16_CI_SCRIPTS = [
  "test:ci:enterprise-sso-r2-pilot-era16",
  "test:ci:enterprise-sso-r2-pilot-era16:cert",
] as const;

export const ENTERPRISE_SSO_R2_PILOT_ERA16_UNIT_TESTS = [
  "tests/unit/enterprise-sso-r2-pilot-era16-policy.test.ts",
  "tests/unit/enterprise-sso-r2-pilot-era16-cert-live.test.ts",
] as const;

export const ENTERPRISE_SSO_R2_PILOT_ERA16_CANONICAL_DOC_PATHS = [
  ENTERPRISE_SSO_R2_PILOT_ERA16_DOC,
  "docs/enterprise-procurement-pack.md",
  "docs/feature-maturity-matrix.md",
  "docs/commercial-pilot-runbook.md",
] as const;

export function enterpriseSsoR2PilotDocCoversRequiredSections(docMarkdown: string): boolean {
  return ENTERPRISE_SSO_R2_PILOT_ERA16_REQUIRED_DOC_SECTIONS.every((section) =>
    docMarkdown.includes(section),
  );
}
