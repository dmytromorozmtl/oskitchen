/**
 * Enterprise SSO IdP login proof — Evolution Era 17 Cycle 2.
 *
 * Operator evidence path for staging IdP login → dashboard proof.
 * Does NOT move SSO to pilot_ready (Cycle 3 gate).
 */

import { ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_POLICY_ID } from "@/lib/enterprise/enterprise-sso-idp-staging-smoke-era17-policy";

export const ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_POLICY_ID =
  "era17-enterprise-sso-idp-login-proof-v1" as const;

export const ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_DECISION_DATE = "2026-05-28" as const;

export const ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_EXTENDS_POLICIES = [
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_POLICY_ID,
  "era16-enterprise-sso-r2-admin-v1",
] as const;

/** Cycle 2 outcome — proof_passed only when operator evidence validates. */
export const ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_PROOF_STATUS = "awaiting_operator_proof" as const;

/** Unchanged until Cycle 3 gate with validated proof artifact. */
export const ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_SSO_DELIVERY_STATUS =
  "pilot_foundation" as const;

/** Operator-recorded evidence env vars (never commit values). */
export const ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_OPERATOR_ENV_VARS = [
  "SSO_STAGING_OPERATOR_EMAIL",
  "SSO_STAGING_LOGIN_SCREENSHOT_PATH",
  "SSO_STAGING_AUDIT_EVENT_REF",
  "SSO_STAGING_NEGATIVE_TEST_NOTE",
  "SSO_STAGING_BREAK_GLASS_DRILL_NOTE",
] as const;

export const ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_REQUIRED_AUDIT_ACTION =
  "sso.login_success" as const;

export const ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_CYCLE2_RUNBOOK_STEPS = [
  "Set all SSO_STAGING_* prerequisite env vars (see enterprise-sso-idp-staging-smoke-plan.md).",
  "Configure Okta or Entra test tenant + Supabase SAML + KitchenOS PILOT_ACTIVE workspace.",
  "Operator completes /login → Sign in with SSO → IdP auth → dashboard on staging.",
  "Save screenshot to ops vault; set SSO_STAGING_LOGIN_SCREENSHOT_PATH to local file path.",
  "Export audit row with sso.login_success; set SSO_STAGING_AUDIT_EVENT_REF.",
  "Document at least one denial test in SSO_STAGING_NEGATIVE_TEST_NOTE.",
  "Set SSO_STAGING_OPERATOR_EMAIL to operator identity.",
  "Run npm run smoke:enterprise-sso-idp-staging — idp_browser_login must show PASSED.",
  "Do not claim pilot_ready until Cycle 3 gate reviews the artifact.",
] as const;

export const ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_CANONICAL_MARKERS = [
  ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_POLICY_ID,
  "era17-enterprise-sso-idp-login-proof",
  "idp_browser_login",
  "sso.login_success",
  "era17-enterprise-sso-pilot-ready-v1",
] as const;

export const ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_FORBIDDEN_CLAIMS = [
  "production SSO",
  "SAML login is live for all tenants",
  "pilot_ready",
  "enterprise SSO included",
] as const;

export const ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_CI_SCRIPTS = [
  "test:ci:enterprise-sso-idp-login-proof-era17",
  "test:ci:enterprise-sso-idp-login-proof-era17:cert",
] as const;

export const ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_UNIT_TESTS = [
  "tests/unit/enterprise-sso-idp-login-proof-era17-policy.test.ts",
  "tests/unit/enterprise-sso-idp-login-proof-era17-cert-live.test.ts",
] as const;

export const ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_CANONICAL_DOC_PATHS = [
  "docs/enterprise-sso-idp-staging-smoke-plan.md",
  "docs/enterprise-sso-r2-pilot-design.md",
  "docs/commercial-pilot-runbook.md",
  "docs/implementation-backlog.md",
  "docs/canonical-doc-index.md",
] as const;

export const ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_REVIEW_SECTION =
  "Era 17 SSO IdP login proof (2026-05-28)" as const;
