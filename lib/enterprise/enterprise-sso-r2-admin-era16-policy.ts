/**
 * Enterprise SSO R2 pilot admin wiring — Evolution Era 16 Cycle 4.
 *
 * Admin-safe workspace SSO configuration, ssoOidc entitlement gate, and gated login entry.
 * Does **not** claim production SSO or move delivery to live without staging smoke PASS.
 */

export const ENTERPRISE_SSO_R2_ADMIN_ERA16_POLICY_ID =
  "era16-enterprise-sso-r2-admin-v1" as const;

export const ENTERPRISE_SSO_R2_ADMIN_ERA16_EXTENDS_POLICIES = [
  "era16-enterprise-sso-r2-runtime-v1",
  "era16-enterprise-sso-r2-schema-v1",
  "era16-enterprise-sso-r2-pilot-v1",
] as const;

export const ENTERPRISE_SSO_R2_ADMIN_ERA16_DECISION_DATE = "2026-05-28" as const;

/** Admin wiring complete; staging IdP smoke still required for pilot_ready. */
export const ENTERPRISE_SSO_R2_ADMIN_ERA16_PILOT_STATUS = "schema_ready" as const;

/** Pilot admin + login entry wired; not production SSO for all tenants. */
export const ENTERPRISE_SSO_R2_ADMIN_ERA16_SSO_DELIVERY_STATUS =
  "pilot_foundation" as const;

export const ENTERPRISE_SSO_R2_ADMIN_ERA16_ADMIN_MODULES = [
  "lib/enterprise/workspace-sso-admin-service.ts",
  "lib/enterprise/workspace-sso-login-initiate.ts",
  "actions/workspace-sso.ts",
  "app/dashboard/settings/security/sso/page.tsx",
  "components/auth/sso-login-entry.tsx",
] as const;

export const ENTERPRISE_SSO_R2_ADMIN_ERA16_AUDIT_ACTIONS = [
  "sso.settings_configured",
  "sso.settings_activated",
  "sso.settings_deactivated",
] as const;

export const ENTERPRISE_SSO_R2_ADMIN_ERA16_PILOT_RUNBOOK_STEPS = [
  "Confirm workspace owner has ssoOidc entitlement (Enterprise plan or override).",
  "Configure Supabase SAML/OIDC provider in Supabase dashboard for pilot IdP (Okta or Entra ID).",
  "Settings → Security → SSO pilot: save IdP vendor, allowed domains, Supabase provider ref.",
  "Activate SSO pilot for the workspace (remains tenant-scoped — not global launch).",
  "Staff uses /login → Sign in with SSO with workspace UUID; callback validates tenant/domain.",
  "Run npm run smoke:enterprise-sso-r2-pilot for CI cert wiring (not live IdP attestation).",
  "Optional staging: complete full login → dashboard → guarded mutation under SSO session.",
  "Break-glass: owner email/password remains when breakGlassOwnerEnabled is true.",
] as const;

export const ENTERPRISE_SSO_R2_ADMIN_ERA16_REVIEW_SECTION =
  "Era 16 SSO R2 pilot admin wiring (2026-05-28)" as const;

export const ENTERPRISE_SSO_R2_ADMIN_ERA16_CANONICAL_MARKERS = [
  ENTERPRISE_SSO_R2_ADMIN_ERA16_POLICY_ID,
  ENTERPRISE_SSO_R2_ADMIN_ERA16_SSO_DELIVERY_STATUS,
  "pilot_admin_wiring",
  "ssoOidc",
  "Sign in with SSO",
] as const;

export const ENTERPRISE_SSO_R2_ADMIN_ERA16_FORBIDDEN_DELIVERY_CLAIMS = [
  "SSO is available in production",
  "SAML login is live",
  "enterprise SSO included",
  "OIDC SSO enabled for all tenants",
  "pilot_ready",
  "production_certified",
] as const;

export const ENTERPRISE_SSO_R2_ADMIN_ERA16_CI_SCRIPTS = [
  "test:ci:enterprise-sso-r2-admin-era16",
  "test:ci:enterprise-sso-r2-admin-era16:cert",
] as const;

export const ENTERPRISE_SSO_R2_ADMIN_ERA16_SMOKE_SCRIPT =
  "smoke:enterprise-sso-r2-pilot" as const;

export const ENTERPRISE_SSO_R2_ADMIN_ERA16_UNIT_TESTS = [
  "tests/unit/enterprise-sso-r2-admin-era16-policy.test.ts",
  "tests/unit/enterprise-sso-r2-admin-era16-cert-live.test.ts",
  "tests/unit/workspace-sso-admin-service.test.ts",
  "tests/unit/workspace-sso-login-initiate.test.ts",
] as const;

export const ENTERPRISE_SSO_R2_ADMIN_ERA16_CANONICAL_DOC_PATHS = [
  "docs/enterprise-sso-r2-pilot-design.md",
  "docs/enterprise-procurement-pack.md",
  "docs/feature-maturity-matrix.md",
  "docs/commercial-pilot-runbook.md",
] as const;
