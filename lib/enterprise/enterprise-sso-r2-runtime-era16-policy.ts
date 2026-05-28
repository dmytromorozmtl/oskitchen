/**
 * Enterprise SSO R2 runtime callback foundation — Evolution Era 16 Cycle 3.
 *
 * Adds Supabase SSO callback adapter + tenant/domain guardrails behind fail-closed gate.
 * Does **not** expose production SSO login UI or claim live SAML/OIDC delivery.
 */

export const ENTERPRISE_SSO_R2_RUNTIME_ERA16_POLICY_ID =
  "era16-enterprise-sso-r2-runtime-v1" as const;

export const ENTERPRISE_SSO_R2_RUNTIME_ERA16_EXTENDS_POLICIES = [
  "era16-enterprise-sso-r2-schema-v1",
  "era16-enterprise-sso-r2-pilot-v1",
  "era9-enterprise-sso-architecture-spike-v1",
] as const;

export const ENTERPRISE_SSO_R2_RUNTIME_ERA16_DECISION_DATE = "2026-05-28" as const;

/** R2 pilot unchanged — callback adapter does not complete pilot proof. */
export const ENTERPRISE_SSO_R2_RUNTIME_ERA16_PILOT_STATUS = "schema_ready" as const;

/** Callback adapter + audit events; login UI / staging smoke still Cycle 4. */
export const ENTERPRISE_SSO_R2_RUNTIME_ERA16_SSO_DELIVERY_STATUS =
  "pilot_foundation" as const;

export const ENTERPRISE_SSO_R2_RUNTIME_ERA16_RUNTIME_MODULES = [
  "lib/enterprise/workspace-sso-runtime-adapter.ts",
  "lib/enterprise/workspace-sso-callback-service.ts",
  "app/auth/callback/route.ts",
] as const;

export const ENTERPRISE_SSO_R2_RUNTIME_ERA16_CALLBACK_QUERY_PARAM =
  "sso_workspace_id" as const;

export const ENTERPRISE_SSO_R2_RUNTIME_ERA16_AUDIT_ACTIONS = [
  "sso.login_success",
  "sso.login_denied",
] as const;

export const ENTERPRISE_SSO_R2_RUNTIME_ERA16_REVIEW_SECTION =
  "Era 16 SSO R2 runtime callback foundation (2026-05-28)" as const;

export const ENTERPRISE_SSO_R2_RUNTIME_ERA16_CANONICAL_MARKERS = [
  ENTERPRISE_SSO_R2_RUNTIME_ERA16_POLICY_ID,
  ENTERPRISE_SSO_R2_RUNTIME_ERA16_SSO_DELIVERY_STATUS,
  "callback_adapter",
  "sso_workspace_id",
  "validateSsoCallbackSession",
] as const;

export const ENTERPRISE_SSO_R2_RUNTIME_ERA16_FORBIDDEN_DELIVERY_CLAIMS = [
  "SSO is available in production",
  "SAML login is live",
  "enterprise SSO included",
  "OIDC SSO enabled for all tenants",
  "pilot_ready",
  "production_certified",
] as const;

export const ENTERPRISE_SSO_R2_RUNTIME_ERA16_CI_SCRIPTS = [
  "test:ci:enterprise-sso-r2-runtime-era16",
  "test:ci:enterprise-sso-r2-runtime-era16:cert",
] as const;

export const ENTERPRISE_SSO_R2_RUNTIME_ERA16_UNIT_TESTS = [
  "tests/unit/enterprise-sso-r2-runtime-era16-policy.test.ts",
  "tests/unit/enterprise-sso-r2-runtime-era16-cert-live.test.ts",
  "tests/unit/workspace-sso-runtime-adapter.test.ts",
] as const;

export const ENTERPRISE_SSO_R2_RUNTIME_ERA16_CANONICAL_DOC_PATHS = [
  "docs/enterprise-sso-r2-pilot-design.md",
  "docs/enterprise-procurement-pack.md",
  "docs/feature-maturity-matrix.md",
] as const;
