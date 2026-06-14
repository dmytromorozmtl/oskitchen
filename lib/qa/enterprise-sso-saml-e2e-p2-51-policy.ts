/**
 * P2-51 — Enterprise SSO SAML E2E: Okta sandbox → SAML redirect → assertion → dashboard.
 *
 * @see docs/enterprise-sso-saml-e2e-p2-51.md
 * @see e2e/enterprise-sso-saml-e2e.spec.ts
 */

export const ENTERPRISE_SSO_SAML_E2E_P2_51_POLICY_ID =
  "enterprise-sso-saml-e2e-p2-51-v1" as const;

export const ENTERPRISE_SSO_SAML_E2E_P2_51_DOC = "docs/enterprise-sso-saml-e2e-p2-51.md" as const;

export const ENTERPRISE_SSO_SAML_E2E_P2_51_ARTIFACT =
  "artifacts/enterprise-sso-saml-e2e-p2-51.json" as const;

export const ENTERPRISE_SSO_SAML_E2E_P2_51_AUDIT_MODULE =
  "lib/qa/enterprise-sso-saml-e2e-p2-51-audit.ts" as const;

export const ENTERPRISE_SSO_SAML_E2E_P2_51_CHECK_NPM_SCRIPT =
  "check:enterprise-sso-saml-e2e-p2-51" as const;

export const ENTERPRISE_SSO_SAML_E2E_P2_51_CI_NPM_SCRIPT =
  "test:ci:enterprise-sso-saml-e2e-p2-51" as const;

export const ENTERPRISE_SSO_SAML_E2E_P2_51_UNIT_TEST =
  "tests/unit/enterprise-sso-saml-e2e-p2-51.test.ts" as const;

export const ENTERPRISE_SSO_SAML_E2E_P2_51_CI_WORKFLOW = ".github/workflows/ci.yml" as const;

export const ENTERPRISE_SSO_SAML_E2E_P2_51_SPEC = "e2e/enterprise-sso-saml-e2e.spec.ts" as const;

export const ENTERPRISE_SSO_SAML_E2E_P2_51_FLOW_HELPER =
  "e2e/helpers/enterprise-sso-saml-e2e-flow.ts" as const;

export const ENTERPRISE_SSO_SAML_E2E_P2_51_READY_HELPER =
  "e2e/helpers/enterprise-sso-saml-e2e-ready.ts" as const;

export const ENTERPRISE_SSO_SAML_E2E_P2_51_AUTH_CALLBACK = "app/auth/callback/route.ts" as const;

export const ENTERPRISE_SSO_SAML_E2E_P2_51_LOGIN_INITIATE =
  "lib/enterprise/workspace-sso-login-initiate.ts" as const;

export const ENTERPRISE_SSO_SAML_E2E_P2_51_CALLBACK_SERVICE =
  "lib/enterprise/workspace-sso-callback-service.ts" as const;

export const ENTERPRISE_SSO_SAML_E2E_P2_51_SSO_ENTRY = "components/auth/sso-login-entry.tsx" as const;

export const ENTERPRISE_SSO_SAML_E2E_P2_51_VISIBLE_MS = 120_000 as const;

export const ENTERPRISE_SSO_SAML_E2E_P2_51_FLOW_STEPS = [
  "login_entry",
  "saml_redirect",
  "saml_assertion",
  "dashboard",
] as const;

export type EnterpriseSsoSamlE2P251FlowStep =
  (typeof ENTERPRISE_SSO_SAML_E2E_P2_51_FLOW_STEPS)[number];

export const ENTERPRISE_SSO_SAML_E2E_P2_51_IDP_URL_PATTERN =
  /okta\.com|supabase\.co\/auth|login\.microsoftonline\.com/i;

export const ENTERPRISE_SSO_SAML_E2E_P2_51_WIRING_PATHS = [
  ENTERPRISE_SSO_SAML_E2E_P2_51_DOC,
  ENTERPRISE_SSO_SAML_E2E_P2_51_ARTIFACT,
  ENTERPRISE_SSO_SAML_E2E_P2_51_AUDIT_MODULE,
  ENTERPRISE_SSO_SAML_E2E_P2_51_UNIT_TEST,
  ENTERPRISE_SSO_SAML_E2E_P2_51_CI_WORKFLOW,
  ENTERPRISE_SSO_SAML_E2E_P2_51_SPEC,
  ENTERPRISE_SSO_SAML_E2E_P2_51_FLOW_HELPER,
  ENTERPRISE_SSO_SAML_E2E_P2_51_READY_HELPER,
  ENTERPRISE_SSO_SAML_E2E_P2_51_AUTH_CALLBACK,
  ENTERPRISE_SSO_SAML_E2E_P2_51_LOGIN_INITIATE,
  ENTERPRISE_SSO_SAML_E2E_P2_51_CALLBACK_SERVICE,
  ENTERPRISE_SSO_SAML_E2E_P2_51_SSO_ENTRY,
  "e2e/sso-idp-smoke.spec.ts",
] as const;

export function isEnterpriseSsoSamlE2EEnabled(): boolean {
  return process.env.E2E_ENTERPRISE_SSO_SAML?.trim() === "true";
}

export function hasEnterpriseSsoSamlOktaCredentials(): boolean {
  return Boolean(
    process.env.SSO_STAGING_OKTA_USERNAME?.trim() &&
      process.env.SSO_STAGING_OKTA_PASSWORD?.trim(),
  );
}

export function isOktaSamlIdpVendor(): boolean {
  return process.env.SSO_STAGING_IDP_VENDOR?.trim().toUpperCase() === "OKTA";
}
