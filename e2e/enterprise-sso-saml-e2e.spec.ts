import { expect, test } from "@playwright/test";

import {
  buildSsoAuthCallbackUrl,
  initiateWorkspaceSsoLogin,
} from "@/lib/enterprise/workspace-sso-login-initiate";
import {
  ENTERPRISE_SSO_SAML_E2E_P2_51_FLOW_STEPS,
  ENTERPRISE_SSO_SAML_E2E_P2_51_POLICY_ID,
  isEnterpriseSsoSamlE2EEnabled,
  isOktaSamlIdpVendor,
} from "@/lib/qa/enterprise-sso-saml-e2e-p2-51-policy";

import { runEnterpriseSsoSamlE2EFlow } from "./helpers/enterprise-sso-saml-e2e-flow";
import {
  skipEnterpriseSsoSamlE2EIfNotReady,
  skipEnterpriseSsoSamlOktaLoginIfNotReady,
} from "./helpers/enterprise-sso-saml-e2e-ready";

/**
 * Enterprise SSO SAML E2E — Okta sandbox → SAML redirect → assertion → dashboard.
 *
 * @see docs/enterprise-sso-saml-e2e-p2-51.md
 * @see e2e/sso-idp-smoke.spec.ts
 */

test.describe("enterprise SSO SAML E2E policy (contract)", () => {
  test("locks P2-51 policy and four-step SAML lifecycle", () => {
    expect(ENTERPRISE_SSO_SAML_E2E_P2_51_POLICY_ID).toBe("enterprise-sso-saml-e2e-p2-51-v1");
    expect(ENTERPRISE_SSO_SAML_E2E_P2_51_FLOW_STEPS).toEqual([
      "login_entry",
      "saml_redirect",
      "saml_assertion",
      "dashboard",
    ]);
  });

  test("SSO auth callback URL includes workspace param for SAML assertion routing", () => {
    const url = buildSsoAuthCallbackUrl({
      workspaceId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",
      nextPath: "/dashboard/today",
    });
    expect(url).toContain("sso_workspace_id=aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa");
    expect(url).toContain("/auth/callback");
  });

  test("initiateWorkspaceSsoLogin is exported for SAML redirect", () => {
    expect(typeof initiateWorkspaceSsoLogin).toBe("function");
  });

  test("E2E gate requires E2E_ENTERPRISE_SSO_SAML flag", () => {
    const original = process.env.E2E_ENTERPRISE_SSO_SAML;
    delete process.env.E2E_ENTERPRISE_SSO_SAML;
    expect(isEnterpriseSsoSamlE2EEnabled()).toBe(false);
    process.env.E2E_ENTERPRISE_SSO_SAML = "true";
    expect(isEnterpriseSsoSamlE2EEnabled()).toBe(true);
    if (original !== undefined) process.env.E2E_ENTERPRISE_SSO_SAML = original;
    else delete process.env.E2E_ENTERPRISE_SSO_SAML;
  });

  test("Okta vendor gate requires SSO_STAGING_IDP_VENDOR=OKTA", () => {
    const original = process.env.SSO_STAGING_IDP_VENDOR;
    process.env.SSO_STAGING_IDP_VENDOR = "OKTA";
    expect(isOktaSamlIdpVendor()).toBe(true);
    process.env.SSO_STAGING_IDP_VENDOR = "ENTRA_ID";
    expect(isOktaSamlIdpVendor()).toBe(false);
    if (original !== undefined) process.env.SSO_STAGING_IDP_VENDOR = original;
    else delete process.env.SSO_STAGING_IDP_VENDOR;
  });
});

test.describe("enterprise SSO SAML E2E (chromium-authed, Okta vault)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Enterprise SSO SAML E2E runs in chromium-authed project only",
    );
    skipEnterpriseSsoSamlE2EIfNotReady();
  });

  test("staging login pre-fills pilot workspace for SAML entry", async ({ page }) => {
    skipEnterpriseSsoSamlOktaLoginIfNotReady();
    const result = await runEnterpriseSsoSamlE2EFlow(page);
    expect(result.steps).toEqual(ENTERPRISE_SSO_SAML_E2E_P2_51_FLOW_STEPS);
    expect(result.finalUrl).toMatch(/\/dashboard/);
  });
});
