import { test } from "@playwright/test";

import {
  evaluateEnterpriseSsoIdpStagingSmokePrerequisites,
  listMissingEnterpriseSsoIdpStagingEnvVars,
} from "@/lib/enterprise/enterprise-sso-idp-staging-smoke-summary";
import {
  hasEnterpriseSsoSamlOktaCredentials,
  isEnterpriseSsoSamlE2EEnabled,
  isOktaSamlIdpVendor,
} from "@/lib/qa/enterprise-sso-saml-e2e-p2-51-policy";

import { readSsoIdpStagingPrerequisiteInput } from "./sso-idp-staging-ready";

export function readEnterpriseSsoSamlE2EPrerequisiteInput() {
  return readSsoIdpStagingPrerequisiteInput();
}

export function getEnterpriseSsoSamlE2EMissingEnv(): string[] {
  const missing = listMissingEnterpriseSsoIdpStagingEnvVars(
    readEnterpriseSsoSamlE2EPrerequisiteInput(),
  );
  if (!isEnterpriseSsoSamlE2EEnabled()) {
    missing.push("E2E_ENTERPRISE_SSO_SAML=true");
  }
  if (!isOktaSamlIdpVendor()) {
    missing.push("SSO_STAGING_IDP_VENDOR=OKTA");
  }
  return missing;
}

export function getEnterpriseSsoSamlE2ESkipReason(): string | null {
  if (!isEnterpriseSsoSamlE2EEnabled()) {
    return "Enterprise SSO SAML E2E SKIPPED — set E2E_ENTERPRISE_SSO_SAML=true";
  }
  const input = readEnterpriseSsoSamlE2EPrerequisiteInput();
  const evaluated = evaluateEnterpriseSsoIdpStagingSmokePrerequisites(input);
  if (!evaluated.ok) {
    return `Enterprise SSO SAML E2E SKIPPED — ${evaluated.reason}`;
  }
  if (!isOktaSamlIdpVendor()) {
    return "Enterprise SSO SAML E2E SKIPPED — SSO_STAGING_IDP_VENDOR must be OKTA";
  }
  return null;
}

export function getEnterpriseSsoSamlOktaLoginSkipReason(): string | null {
  const base = getEnterpriseSsoSamlE2ESkipReason();
  if (base) return base;
  if (!hasEnterpriseSsoSamlOktaCredentials()) {
    return "Enterprise SSO SAML E2E SKIPPED — SSO_STAGING_OKTA_USERNAME and SSO_STAGING_OKTA_PASSWORD required for assertion step";
  }
  return null;
}

export function skipEnterpriseSsoSamlE2EIfNotReady(): void {
  const reason = getEnterpriseSsoSamlE2ESkipReason();
  if (reason) test.skip(true, reason);
}

export function skipEnterpriseSsoSamlOktaLoginIfNotReady(): void {
  const reason = getEnterpriseSsoSamlOktaLoginSkipReason();
  if (reason) test.skip(true, reason);
}
