/**
 * Enterprise SSO IdP staging smoke plan — Evolution Era 17 Cycle 1.
 *
 * Documents and orchestrates staging IdP login proof path for pilot_ready gate.
 * Does NOT claim production SSO or move delivery to pilot_ready without Cycle 2 artifact.
 */

import {
  ENTERPRISE_SSO_R2_ADMIN_ERA16_POLICY_ID,
  ENTERPRISE_SSO_R2_ADMIN_ERA16_SMOKE_SCRIPT,
} from "@/lib/enterprise/enterprise-sso-r2-admin-era16-policy";

export const ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_POLICY_ID =
  "era17-enterprise-sso-idp-staging-smoke-v1" as const;

export const ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_DECISION_DATE = "2026-05-28" as const;

export const ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_EXTENDS_POLICIES = [
  ENTERPRISE_SSO_R2_ADMIN_ERA16_POLICY_ID,
  "era16-enterprise-sso-r2-runtime-v1",
] as const;

/** Plan only — live IdP login proof is Cycle 2; pilot_ready gate is Cycle 3. */
export const ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_PLAN_STATUS = "plan_ready" as const;

/** Unchanged until Cycle 2 staging login artifact exists. */
export const ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_SSO_DELIVERY_STATUS =
  "pilot_foundation" as const;

export const ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_OPS_DOC =
  "docs/enterprise-sso-idp-staging-smoke-plan.md" as const;

export const ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_MODULE =
  "lib/enterprise/enterprise-sso-idp-staging-smoke-summary.ts" as const;

export const ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_ORCHESTRATOR_SCRIPT =
  "scripts/smoke-enterprise-sso-idp-staging-era17.ts" as const;

export const ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_CERT_SCRIPT =
  "scripts/cert-enterprise-sso-idp-staging-era17.ts" as const;

export const ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_SUMMARY_ARTIFACT =
  "artifacts/enterprise-sso-idp-staging-smoke-summary.json" as const;

export const ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_NPM_SCRIPT =
  "smoke:enterprise-sso-idp-staging" as const;

export const ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_LEGACY_SMOKE =
  ENTERPRISE_SSO_R2_ADMIN_ERA16_SMOKE_SCRIPT;

/** Local / ops env vars for staging IdP smoke — never commit secrets. */
export const ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_ENV_VARS = [
  "E2E_STAGING_BASE_URL",
  "SSO_STAGING_WORKSPACE_ID",
  "SSO_STAGING_IDP_VENDOR",
  "SSO_STAGING_ALLOWED_DOMAIN",
  "SSO_STAGING_TEST_EMAIL",
  "SSO_STAGING_SUPABASE_PROVIDER_REF",
  "SSO_STAGING_BREAK_GLASS_OWNER_EMAIL",
  "E2E_LOGIN_PASSWORD",
  "E2E_PASSWORD",
] as const;

export const ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_SUPPORTED_IDP_VENDORS = [
  "OKTA",
  "ENTRA_ID",
  "AUTH0",
] as const;

export const ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_AUDIT_EVENTS = [
  "sso.login_success",
  "sso.login_denied",
  "sso.break_glass_used",
] as const;

export const ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_PILOT_RUNBOOK_STEPS = [
  "Confirm workspace has ssoOidc entitlement and pilot workspace UUID documented in ops vault.",
  "Provision Okta dev org, Microsoft Entra ID test tenant, or Auth0 SAML app — one IdP per pilot workspace only.",
  "Configure Supabase Auth SAML provider (Dashboard → Authentication → SSO) with IdP metadata.",
  "OS Kitchen Settings → Security → SSO pilot: IdP vendor, allowed domains, Supabase provider ref.",
  "Activate SSO pilot (PILOT_ACTIVE) for staging workspace only — not global launch.",
  "Run npm run smoke:enterprise-sso-r2-pilot (wiring cert) then npm run smoke:enterprise-sso-idp-staging.",
  "Operator: /login → Sign in with SSO → IdP auth → dashboard; capture screenshot + audit sso.login_success.",
  "Break-glass drill: owner email/password when IdP unavailable; confirm sso.break_glass_used or documented skip.",
  "Negative tests: wrong domain, disabled SSO, wrong workspace UUID — expect deny without session.",
  "Record PASSED / FAILED / SKIPPED WITH REASON in artifacts/enterprise-sso-idp-staging-smoke-summary.json.",
  "Cycle 3 only: move delivery to pilot_ready when Cycle 2 artifact proves IdP login on staging.",
] as const;

export const ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_ROLLBACK_STEPS = [
  "Settings → Security → SSO pilot → Deactivate (PILOT_CONFIGURED or DISABLED).",
  "Remove or disable Supabase SAML provider for pilot ref.",
  "Confirm /login Sign in with SSO fails closed for workspace UUID.",
  "Verify break-glass owner email/password still works when breakGlassOwnerEnabled is true.",
  "Document rollback timestamp and operator in ops log.",
] as const;

export const ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_HONEST_SCOPE = {
  claimsProductionSso: false,
  claimsPilotReadyWithoutArtifact: false,
  automatesIdpBrowserLogin: false,
  pilotReadyRequiresCycle2Proof: true,
} as const;

export const ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_CANONICAL_MARKERS = [
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_POLICY_ID,
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_MODULE,
  "enterprise-sso-idp-staging-smoke",
  "pilot_foundation",
] as const;

export const ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_FORBIDDEN_CLAIMS = [
  "production SSO",
  "SAML login is live for all tenants",
  "pilot_ready without IdP staging artifact",
  "SOC 2 Type II certified today",
  "SCIM provisioning is live",
] as const;

export const ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_CI_SCRIPTS = [
  "test:ci:enterprise-sso-idp-staging-era17",
  "test:ci:enterprise-sso-idp-staging-era17:cert",
] as const;

export const ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_UNIT_TESTS = [
  "tests/unit/enterprise-sso-idp-staging-smoke-summary.test.ts",
  "tests/unit/enterprise-sso-idp-staging-smoke-era17-policy.test.ts",
  "tests/unit/enterprise-sso-idp-staging-smoke-era17-cert-live.test.ts",
] as const;

export const ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_CANONICAL_DOC_PATHS = [
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_OPS_DOC,
  "docs/enterprise-sso-r2-pilot-design.md",
  "docs/enterprise-procurement-pack.md",
  "docs/commercial-pilot-runbook.md",
  "docs/feature-maturity-matrix.md",
  "docs/implementation-backlog.md",
] as const;

export const ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_REVIEW_SECTION =
  "Era 17 SSO IdP staging smoke plan (2026-05-28)" as const;

export const ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_REQUIRED_OPS_DOC_SECTIONS = [
  "Purpose and honesty rules",
  "Supported pilot IdPs",
  "Environment variables",
  "Okta test tenant setup",
  "Microsoft Entra ID test tenant setup",
  "Supabase SAML configuration",
  "OS Kitchen workspace SSO pilot wiring",
  "Staging smoke checklist",
  "Break-glass access",
  "Tenant mapping and negative tests",
  "Rollback procedure",
  "Cycle 2 evidence requirements",
] as const;

export function enterpriseSsoIdpStagingSmokeOpsDocCoversRequiredSections(
  docMarkdown: string,
): boolean {
  return ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_REQUIRED_OPS_DOC_SECTIONS.every((section) =>
    docMarkdown.includes(section),
  );
}
