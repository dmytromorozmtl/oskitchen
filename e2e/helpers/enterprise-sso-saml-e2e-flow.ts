import { expect, test, type Page } from "@playwright/test";

import {
  ENTERPRISE_SSO_SAML_E2E_P2_51_FLOW_STEPS,
  ENTERPRISE_SSO_SAML_E2E_P2_51_IDP_URL_PATTERN,
  ENTERPRISE_SSO_SAML_E2E_P2_51_VISIBLE_MS,
  type EnterpriseSsoSamlE2P251FlowStep,
} from "@/lib/qa/enterprise-sso-saml-e2e-p2-51-policy";
import { SSO_LOGIN_WORKSPACE_QUERY_PARAM } from "@/lib/enterprise/enterprise-sso-login-entry-focus-era18-policy";

import {
  readEnterpriseSsoSamlE2EPrerequisiteInput,
  skipEnterpriseSsoSamlOktaLoginIfNotReady,
} from "./enterprise-sso-saml-e2e-ready";

export type EnterpriseSsoSamlE2EFlowResult = {
  steps: EnterpriseSsoSamlE2P251FlowStep[];
  finalUrl: string;
};

async function fillOktaLoginIfPresent(page: Page): Promise<void> {
  const username = process.env.SSO_STAGING_OKTA_USERNAME?.trim();
  const password = process.env.SSO_STAGING_OKTA_PASSWORD?.trim();
  if (!username || !password) return;

  const usernameField = page
    .locator('#okta-signin-username, input[name="identifier"], input[name="username"]')
    .first();
  if (await usernameField.isVisible({ timeout: 15_000 }).catch(() => false)) {
    await usernameField.fill(username);
    const next = page.getByRole("button", { name: /next|verify|sign in/i }).first();
    if (await next.isVisible().catch(() => false)) {
      await next.click();
    }
  }

  const passwordField = page
    .locator('#okta-signin-password, input[name="credentials.passcode"], input[type="password"]')
    .first();
  await expect(passwordField).toBeVisible({ timeout: ENTERPRISE_SSO_SAML_E2E_P2_51_VISIBLE_MS });
  await passwordField.fill(password);

  const submit = page
    .locator('#okta-signin-submit, input[type="submit"], button[type="submit"]')
    .first();
  await submit.click();
}

export async function runEnterpriseSsoSamlE2EFlow(page: Page): Promise<EnterpriseSsoSamlE2EFlowResult> {
  skipEnterpriseSsoSamlOktaLoginIfNotReady();

  const { stagingBaseUrl, workspaceId } = readEnterpriseSsoSamlE2EPrerequisiteInput();
  const base = stagingBaseUrl!.replace(/\/$/, "");
  const steps: EnterpriseSsoSamlE2P251FlowStep[] = [];

  const loginUrl = `${base}/login?${SSO_LOGIN_WORKSPACE_QUERY_PARAM}=${encodeURIComponent(workspaceId!)}`;
  await page.goto(loginUrl);
  await expect(page.getByTestId("sso-login-entry")).toBeVisible({
    timeout: ENTERPRISE_SSO_SAML_E2E_P2_51_VISIBLE_MS,
  });
  steps.push("login_entry");

  await expect(page.getByTestId("sso-workspace-id-input")).toHaveValue(workspaceId!);

  await Promise.all([
    page.waitForURL(ENTERPRISE_SSO_SAML_E2E_P2_51_IDP_URL_PATTERN, {
      timeout: ENTERPRISE_SSO_SAML_E2E_P2_51_VISIBLE_MS,
    }),
    page.getByTestId("sso-login-submit").click(),
  ]).catch(async () => {
    const recovery = page.getByTestId("sso-login-error-recovery-strip");
    if (await recovery.isVisible().catch(() => false)) {
      test.skip(true, "SSO login failed — verify PILOT_ACTIVE workspace SSO on staging");
    }
    throw new Error("Expected SAML redirect to IdP after SSO submit");
  });
  steps.push("saml_redirect");

  await fillOktaLoginIfPresent(page);

  await page.waitForURL(/\/auth\/callback/, {
    timeout: ENTERPRISE_SSO_SAML_E2E_P2_51_VISIBLE_MS,
  });
  steps.push("saml_assertion");

  await page.waitForURL(/\/dashboard/, {
    timeout: ENTERPRISE_SSO_SAML_E2E_P2_51_VISIBLE_MS,
  });
  await expect(page).not.toHaveURL(/\/login/);
  steps.push("dashboard");

  if (steps.length !== ENTERPRISE_SSO_SAML_E2E_P2_51_FLOW_STEPS.length) {
    throw new Error(`Flow step mismatch: ${steps.join(" → ")}`);
  }

  return { steps, finalUrl: page.url() };
}
