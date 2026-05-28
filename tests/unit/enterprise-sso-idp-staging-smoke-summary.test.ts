import { describe, expect, it } from "vitest";

import {
  buildEnterpriseSsoIdpStagingSmokeSummary,
  evaluateEnterpriseSsoIdpLoginProofEvidence,
  evaluateEnterpriseSsoIdpStagingSmokePrerequisites,
  formatEnterpriseSsoIdpStagingSmokeStepLine,
  formatMissingEnterpriseSsoIdpStagingEnvVarsReason,
  listMissingEnterpriseSsoIdpStagingEnvVars,
  normalizeSsoIdpVendor,
  resolveEnterpriseSsoIdpLoginProofStatus,
  resolveEnterpriseSsoIdpStagingSmokeOverall,
} from "@/lib/enterprise/enterprise-sso-idp-staging-smoke-summary";

describe("enterprise SSO IdP staging smoke summary", () => {
  it("evaluates IdP staging prerequisites with explicit skip reasons", () => {
    const missing = listMissingEnterpriseSsoIdpStagingEnvVars({});
    expect(missing).toEqual([
      "E2E_STAGING_BASE_URL",
      "SSO_STAGING_WORKSPACE_ID",
      "SSO_STAGING_IDP_VENDOR",
      "SSO_STAGING_ALLOWED_DOMAIN",
      "SSO_STAGING_TEST_EMAIL",
      "SSO_STAGING_SUPABASE_PROVIDER_REF",
    ]);
    expect(evaluateEnterpriseSsoIdpStagingSmokePrerequisites({})).toEqual({
      ok: false,
      reason: formatMissingEnterpriseSsoIdpStagingEnvVarsReason(missing),
    });
    expect(
      evaluateEnterpriseSsoIdpStagingSmokePrerequisites({
        stagingBaseUrl: "https://staging.example.com",
      }),
    ).toEqual({
      ok: false,
      reason: formatMissingEnterpriseSsoIdpStagingEnvVarsReason(
        listMissingEnterpriseSsoIdpStagingEnvVars({
          stagingBaseUrl: "https://staging.example.com",
        }),
      ),
    });
    expect(
      evaluateEnterpriseSsoIdpStagingSmokePrerequisites({
        stagingBaseUrl: "https://staging.example.com",
        workspaceId: "ws-123",
      }),
    ).toEqual({
      ok: false,
      reason: formatMissingEnterpriseSsoIdpStagingEnvVarsReason(
        listMissingEnterpriseSsoIdpStagingEnvVars({
          stagingBaseUrl: "https://staging.example.com",
          workspaceId: "ws-123",
        }),
      ),
    });
    expect(
      evaluateEnterpriseSsoIdpStagingSmokePrerequisites({
        stagingBaseUrl: "https://staging.example.com",
        workspaceId: "ws-123",
        idpVendor: "OKTA",
        allowedDomain: "pilot.example.com",
        testEmail: "staff@pilot.example.com",
        supabaseProviderRef: "provider-ref-1",
      }),
    ).toEqual({ ok: true, idpVendor: "OKTA" });
  });

  it("normalizes Entra ID vendor aliases", () => {
    expect(normalizeSsoIdpVendor("entra")).toBe("ENTRA_ID");
    expect(normalizeSsoIdpVendor("azure")).toBe("ENTRA_ID");
    expect(normalizeSsoIdpVendor("OKTA")).toBe("OKTA");
    expect(normalizeSsoIdpVendor("google")).toBeNull();
  });

  it("formats step lines with SKIPPED WITH REASON", () => {
    expect(
      formatEnterpriseSsoIdpStagingSmokeStepLine({
        id: "idp_browser_login",
        label: "Operator IdP login → dashboard on staging",
        status: "SKIPPED",
        reason: "Requires manual browser SSO login",
      }),
    ).toBe(
      "[SKIPPED WITH REASON] Operator IdP login → dashboard on staging: Requires manual browser SSO login",
    );
  });

  it("resolves overall PASSED, FAILED, and SKIPPED", () => {
    expect(
      resolveEnterpriseSsoIdpStagingSmokeOverall([
        { id: "wiring_cert", label: "Wiring cert", status: "PASSED" },
        { id: "idp_login", label: "IdP login", status: "SKIPPED", reason: "ops" },
      ]),
    ).toBe("PASSED");
    expect(
      resolveEnterpriseSsoIdpStagingSmokeOverall([
        { id: "wiring_cert", label: "Wiring cert", status: "FAILED" },
      ]),
    ).toBe("FAILED");
    expect(
      resolveEnterpriseSsoIdpStagingSmokeOverall([
        { id: "idp_login", label: "IdP login", status: "SKIPPED", reason: "ops" },
      ]),
    ).toBe("SKIPPED");
  });

  it("builds summary artifact shape with login proof status", () => {
    const summary = buildEnterpriseSsoIdpStagingSmokeSummary(
      [{ id: "wiring_cert", label: "Wiring cert", status: "PASSED" }],
      { missingEnvVars: ["E2E_STAGING_BASE_URL"] },
    );
    expect(summary.version).toBe("era17-enterprise-sso-idp-staging-smoke-v1");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.overall).toBe("PASSED");
    expect(summary.loginProofStatus).toBe("proof_skipped_missing_prerequisites");
    expect(summary.missingEnvVars).toEqual(["E2E_STAGING_BASE_URL"]);
  });

  it("validates operator login proof evidence", () => {
    expect(
      evaluateEnterpriseSsoIdpLoginProofEvidence({
        operatorEmail: "ops@example.com",
        screenshotPath: "/tmp/sso-proof.png",
        auditEventRef: "sso.login_success@2026-05-28",
        negativeTestNote: "Wrong domain denied",
        screenshotExists: true,
      }),
    ).toEqual({ ok: true });
    expect(
      evaluateEnterpriseSsoIdpLoginProofEvidence({
        operatorEmail: "ops@example.com",
      }).ok,
    ).toBe(false);
  });

  it("resolves login proof status from steps", () => {
    expect(
      resolveEnterpriseSsoIdpLoginProofStatus({
        prerequisitesMet: false,
      }),
    ).toBe("proof_skipped_missing_prerequisites");
    expect(
      resolveEnterpriseSsoIdpLoginProofStatus({
        prerequisitesMet: true,
        idpBrowserLoginStep: { id: "idp_browser_login", label: "Login", status: "PASSED" },
      }),
    ).toBe("proof_passed");
  });
});
