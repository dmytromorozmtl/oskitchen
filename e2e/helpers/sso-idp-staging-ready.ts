import { test } from "@playwright/test";

import {
  evaluateEnterpriseSsoIdpStagingSmokePrerequisites,
  listMissingEnterpriseSsoIdpStagingEnvVars,
} from "@/lib/enterprise/enterprise-sso-idp-staging-smoke-summary";

/**
 * SSO IdP staging E2E prerequisites — mirrors era17 IdP staging smoke vault vars.
 *
 * Contract tests in `sso-idp-smoke.spec.ts` always run.
 * Live staging proofs skip with reason until all six `SSO_STAGING_*` + base URL are set.
 *
 * @see docs/sso-idp-smoke-test-plan.md
 * @see docs/enterprise-sso-idp-staging-smoke-plan.md
 */

export function readSsoIdpStagingPrerequisiteInput() {
  return {
    stagingBaseUrl:
      process.env.E2E_STAGING_BASE_URL?.trim() ||
      process.env.PLAYWRIGHT_BASE_URL?.trim() ||
      null,
    workspaceId: process.env.SSO_STAGING_WORKSPACE_ID ?? null,
    idpVendor: process.env.SSO_STAGING_IDP_VENDOR ?? null,
    allowedDomain: process.env.SSO_STAGING_ALLOWED_DOMAIN ?? null,
    testEmail: process.env.SSO_STAGING_TEST_EMAIL ?? null,
    supabaseProviderRef: process.env.SSO_STAGING_SUPABASE_PROVIDER_REF ?? null,
  };
}

export function getSsoIdpStagingMissingEnv(): string[] {
  return listMissingEnterpriseSsoIdpStagingEnvVars(readSsoIdpStagingPrerequisiteInput());
}

export function getSsoIdpStagingSkipReason(): string | null {
  const input = readSsoIdpStagingPrerequisiteInput();
  const evaluated = evaluateEnterpriseSsoIdpStagingSmokePrerequisites(input);
  if (evaluated.ok) return null;
  return `SSO IdP staging E2E SKIPPED — ${evaluated.reason}`;
}

export function isSsoIdpStagingReady(): boolean {
  return evaluateEnterpriseSsoIdpStagingSmokePrerequisites(readSsoIdpStagingPrerequisiteInput()).ok;
}

export function skipSsoIdpStagingIfNotReady(): void {
  const reason = getSsoIdpStagingSkipReason();
  if (reason) test.skip(true, reason);
}
