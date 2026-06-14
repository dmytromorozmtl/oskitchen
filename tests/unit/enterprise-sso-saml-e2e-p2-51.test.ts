import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditEnterpriseSsoSamlE2P251,
  formatEnterpriseSsoSamlE2P251AuditLines,
} from "@/lib/qa/enterprise-sso-saml-e2e-p2-51-audit";
import {
  ENTERPRISE_SSO_SAML_E2E_P2_51_ARTIFACT,
  ENTERPRISE_SSO_SAML_E2E_P2_51_AUTH_CALLBACK,
  ENTERPRISE_SSO_SAML_E2E_P2_51_CHECK_NPM_SCRIPT,
  ENTERPRISE_SSO_SAML_E2E_P2_51_CI_NPM_SCRIPT,
  ENTERPRISE_SSO_SAML_E2E_P2_51_CI_WORKFLOW,
  ENTERPRISE_SSO_SAML_E2E_P2_51_DOC,
  ENTERPRISE_SSO_SAML_E2E_P2_51_FLOW_HELPER,
  ENTERPRISE_SSO_SAML_E2E_P2_51_FLOW_STEPS,
  ENTERPRISE_SSO_SAML_E2E_P2_51_LOGIN_INITIATE,
  ENTERPRISE_SSO_SAML_E2E_P2_51_POLICY_ID,
  ENTERPRISE_SSO_SAML_E2E_P2_51_SPEC,
  ENTERPRISE_SSO_SAML_E2E_P2_51_WIRING_PATHS,
  isEnterpriseSsoSamlE2EEnabled,
} from "@/lib/qa/enterprise-sso-saml-e2e-p2-51-policy";
import { buildSsoAuthCallbackUrl } from "@/lib/enterprise/workspace-sso-login-initiate";

const ROOT = process.cwd();

function readSource(relativePath: string): string {
  return readFileSync(join(ROOT, relativePath), "utf8");
}

describe("Enterprise SSO SAML E2E (P2-51)", () => {
  it("locks P2-51 policy and Okta SAML lifecycle steps", () => {
    expect(ENTERPRISE_SSO_SAML_E2E_P2_51_POLICY_ID).toBe("enterprise-sso-saml-e2e-p2-51-v1");
    expect(ENTERPRISE_SSO_SAML_E2E_P2_51_FLOW_STEPS).toEqual([
      "login_entry",
      "saml_redirect",
      "saml_assertion",
      "dashboard",
    ]);
  });

  it("passes full P2-51 audit — SAML initiate, callback, SSO entry, E2E flow", () => {
    const summary = auditEnterpriseSsoSamlE2P251(ROOT);
    expect(summary.specPresent).toBe(true);
    expect(summary.flowHelperPresent).toBe(true);
    expect(summary.readyHelperPresent).toBe(true);
    expect(summary.samlLoginInitiateWired).toBe(true);
    expect(summary.samlCallbackWired).toBe(true);
    expect(summary.ssoEntryWired).toBe(true);
    expect(summary.artifactPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("builds SAML callback URL with workspace routing", () => {
    const url = buildSsoAuthCallbackUrl({
      workspaceId: "cccccccc-cccc-4ccc-8ccc-cccccccccccc",
    });
    expect(url).toContain("sso_workspace_id=");
    expect(url).toContain("/auth/callback");
  });

  it("auth callback route exchanges code and completes SSO callback", () => {
    const route = readSource(ENTERPRISE_SSO_SAML_E2E_P2_51_AUTH_CALLBACK);
    expect(route).toContain("exchangeCodeForSession");
    expect(route).toContain("completeWorkspaceSsoCallback");

    const login = readSource(ENTERPRISE_SSO_SAML_E2E_P2_51_LOGIN_INITIATE);
    expect(login).toContain("signInWithSSO");
  });

  it("P2-51 wiring paths exist including doc, artifact, E2E spec, and CI gate", () => {
    for (const path of ENTERPRISE_SSO_SAML_E2E_P2_51_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = readSource("package.json");
    expect(pkg).toContain(`"${ENTERPRISE_SSO_SAML_E2E_P2_51_CHECK_NPM_SCRIPT}"`);
    expect(pkg).toContain(`"${ENTERPRISE_SSO_SAML_E2E_P2_51_CI_NPM_SCRIPT}"`);
    expect(pkg).toContain("test:e2e:enterprise-sso-saml-e2e");

    const ci = readSource(ENTERPRISE_SSO_SAML_E2E_P2_51_CI_WORKFLOW);
    expect(ci).toContain(ENTERPRISE_SSO_SAML_E2E_P2_51_CHECK_NPM_SCRIPT);

    const doc = readSource(ENTERPRISE_SSO_SAML_E2E_P2_51_DOC);
    expect(doc).toContain(ENTERPRISE_SSO_SAML_E2E_P2_51_POLICY_ID);

    const spec = readSource(ENTERPRISE_SSO_SAML_E2E_P2_51_SPEC);
    expect(spec).toContain(ENTERPRISE_SSO_SAML_E2E_P2_51_POLICY_ID);

    const flow = readSource(ENTERPRISE_SSO_SAML_E2E_P2_51_FLOW_HELPER);
    expect(flow).toContain("runEnterpriseSsoSamlE2EFlow");

    const artifact = JSON.parse(readSource(ENTERPRISE_SSO_SAML_E2E_P2_51_ARTIFACT));
    expect(artifact.policyId).toBe(ENTERPRISE_SSO_SAML_E2E_P2_51_POLICY_ID);
    expect(artifact.idpVendor).toBe("OKTA");
  });

  it("E2E gate requires E2E_ENTERPRISE_SSO_SAML flag", () => {
    const original = process.env.E2E_ENTERPRISE_SSO_SAML;
    delete process.env.E2E_ENTERPRISE_SSO_SAML;
    expect(isEnterpriseSsoSamlE2EEnabled()).toBe(false);
    process.env.E2E_ENTERPRISE_SSO_SAML = "true";
    expect(isEnterpriseSsoSamlE2EEnabled()).toBe(true);
    if (original !== undefined) process.env.E2E_ENTERPRISE_SSO_SAML = original;
    else delete process.env.E2E_ENTERPRISE_SSO_SAML;
  });

  it("formats audit lines", () => {
    const summary = auditEnterpriseSsoSamlE2P251(ROOT);
    const lines = formatEnterpriseSsoSamlE2P251AuditLines(summary);
    expect(lines.some((line) => line.includes(ENTERPRISE_SSO_SAML_E2E_P2_51_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
