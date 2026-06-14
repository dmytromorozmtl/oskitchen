import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  ENTERPRISE_SSO_SAML_E2E_P2_51_ARTIFACT,
  ENTERPRISE_SSO_SAML_E2E_P2_51_AUTH_CALLBACK,
  ENTERPRISE_SSO_SAML_E2E_P2_51_CALLBACK_SERVICE,
  ENTERPRISE_SSO_SAML_E2E_P2_51_FLOW_HELPER,
  ENTERPRISE_SSO_SAML_E2E_P2_51_FLOW_STEPS,
  ENTERPRISE_SSO_SAML_E2E_P2_51_LOGIN_INITIATE,
  ENTERPRISE_SSO_SAML_E2E_P2_51_POLICY_ID,
  ENTERPRISE_SSO_SAML_E2E_P2_51_READY_HELPER,
  ENTERPRISE_SSO_SAML_E2E_P2_51_SPEC,
  ENTERPRISE_SSO_SAML_E2E_P2_51_SSO_ENTRY,
} from "@/lib/qa/enterprise-sso-saml-e2e-p2-51-policy";

export type EnterpriseSsoSamlE2P251AuditSummary = {
  policyId: typeof ENTERPRISE_SSO_SAML_E2E_P2_51_POLICY_ID;
  specPresent: boolean;
  flowHelperPresent: boolean;
  readyHelperPresent: boolean;
  samlLoginInitiateWired: boolean;
  samlCallbackWired: boolean;
  ssoEntryWired: boolean;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditEnterpriseSsoSamlE2P251(
  root = process.cwd(),
): EnterpriseSsoSamlE2P251AuditSummary {
  const specPresent = existsSync(join(root, ENTERPRISE_SSO_SAML_E2E_P2_51_SPEC));
  const flowHelperPresent = existsSync(join(root, ENTERPRISE_SSO_SAML_E2E_P2_51_FLOW_HELPER));
  const readyHelperPresent = existsSync(join(root, ENTERPRISE_SSO_SAML_E2E_P2_51_READY_HELPER));

  let samlLoginInitiateWired = false;
  const loginPath = join(root, ENTERPRISE_SSO_SAML_E2E_P2_51_LOGIN_INITIATE);
  if (existsSync(loginPath)) {
    const source = readFileSync(loginPath, "utf8");
    samlLoginInitiateWired =
      source.includes("initiateWorkspaceSsoLogin") &&
      source.includes("signInWithSSO") &&
      source.includes("buildSsoAuthCallbackUrl");
  }

  let samlCallbackWired = false;
  const callbackRoutePath = join(root, ENTERPRISE_SSO_SAML_E2E_P2_51_AUTH_CALLBACK);
  if (existsSync(callbackRoutePath)) {
    const route = readFileSync(callbackRoutePath, "utf8");
    samlCallbackWired =
      route.includes("completeWorkspaceSsoCallback") &&
      route.includes("exchangeCodeForSession");
  }

  const callbackServicePath = join(root, ENTERPRISE_SSO_SAML_E2E_P2_51_CALLBACK_SERVICE);
  if (existsSync(callbackServicePath)) {
    const service = readFileSync(callbackServicePath, "utf8");
    samlCallbackWired =
      samlCallbackWired &&
      service.includes("completeWorkspaceSsoCallback") &&
      service.includes("sso.login_success");
  }

  let ssoEntryWired = false;
  const entryPath = join(root, ENTERPRISE_SSO_SAML_E2E_P2_51_SSO_ENTRY);
  if (existsSync(entryPath)) {
    const entry = readFileSync(entryPath, "utf8");
    ssoEntryWired =
      entry.includes("initiateWorkspaceSsoLoginAction") &&
      entry.includes("sso-login-submit") &&
      entry.includes("redirectUrl");
  }

  let artifactPresent = false;
  const artifactPath = join(root, ENTERPRISE_SSO_SAML_E2E_P2_51_ARTIFACT);
  if (existsSync(artifactPath)) {
    const artifact = JSON.parse(readFileSync(artifactPath, "utf8")) as {
      policyId?: string;
      flowSteps?: string[];
      idpVendor?: string;
    };
    artifactPresent =
      artifact.policyId === ENTERPRISE_SSO_SAML_E2E_P2_51_POLICY_ID &&
      artifact.idpVendor === "OKTA" &&
      JSON.stringify(artifact.flowSteps) === JSON.stringify([...ENTERPRISE_SSO_SAML_E2E_P2_51_FLOW_STEPS]);
  }

  let flowReferencesSteps = false;
  if (flowHelperPresent) {
    const flow = readFileSync(join(root, ENTERPRISE_SSO_SAML_E2E_P2_51_FLOW_HELPER), "utf8");
    flowReferencesSteps =
      flow.includes("saml_redirect") &&
      flow.includes("saml_assertion") &&
      flow.includes("dashboard");
  }

  const passed =
    specPresent &&
    flowHelperPresent &&
    readyHelperPresent &&
    samlLoginInitiateWired &&
    samlCallbackWired &&
    ssoEntryWired &&
    artifactPresent &&
    flowReferencesSteps;

  return {
    policyId: ENTERPRISE_SSO_SAML_E2E_P2_51_POLICY_ID,
    specPresent,
    flowHelperPresent,
    readyHelperPresent,
    samlLoginInitiateWired,
    samlCallbackWired,
    ssoEntryWired,
    artifactPresent,
    passed,
  };
}

export function formatEnterpriseSsoSamlE2P251AuditLines(
  summary: EnterpriseSsoSamlE2P251AuditSummary,
): string[] {
  return [
    `Enterprise SSO SAML E2E (${summary.policyId})`,
    `E2E spec: ${summary.specPresent ? "present" : "missing"}`,
    `SAML login initiate: ${summary.samlLoginInitiateWired ? "wired" : "missing"}`,
    `SAML callback: ${summary.samlCallbackWired ? "wired" : "missing"}`,
    `SSO login entry: ${summary.ssoEntryWired ? "wired" : "missing"}`,
    `Flow helper: ${summary.flowHelperPresent ? "present" : "missing"}`,
    `Artifact present: ${summary.artifactPresent ? "yes" : "no"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
