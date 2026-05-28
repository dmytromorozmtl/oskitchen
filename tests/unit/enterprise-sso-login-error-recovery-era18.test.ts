import { describe, expect, it } from "vitest";

import { buildSsoPilotLoginUrl } from "@/lib/enterprise/enterprise-sso-login-entry-focus-era18";
import {
  resolveSsoLoginErrorRecovery,
  isSsoLoginFailureCode,
} from "@/lib/enterprise/enterprise-sso-login-error-recovery-era18";
import {
  ENTERPRISE_SSO_LOGIN_ERROR_RECOVERY_ERA18_POLICY_ID,
  ENTERPRISE_SSO_LOGIN_ERROR_RECOVERY_ERA18_PROOF_STATUS,
  ENTERPRISE_SSO_LOGIN_ERROR_RECOVERY_ERA18_SSO_DELIVERY_PROOF_STATUS,
} from "@/lib/enterprise/enterprise-sso-login-error-recovery-era18-policy";

describe("enterprise SSO login error recovery era18", () => {
  it("locks era18 SSO login error recovery policy id", () => {
    expect(ENTERPRISE_SSO_LOGIN_ERROR_RECOVERY_ERA18_POLICY_ID).toBe(
      "era18-enterprise-sso-login-error-recovery-v1",
    );
    expect(ENTERPRISE_SSO_LOGIN_ERROR_RECOVERY_ERA18_PROOF_STATUS).toBe(
      "enterprise_sso_login_error_recovery_wired",
    );
    expect(ENTERPRISE_SSO_LOGIN_ERROR_RECOVERY_ERA18_SSO_DELIVERY_PROOF_STATUS).toBe(
      "awaiting_idp_login_proof",
    );
  });

  it("recognizes canonical failure codes", () => {
    expect(isSsoLoginFailureCode("sso_disabled")).toBe(true);
    expect(isSsoLoginFailureCode("unknown")).toBe(false);
  });

  it("maps workspace not found to retry guidance", () => {
    expect(
      resolveSsoLoginErrorRecovery({
        code: "workspace_not_found",
        workspaceId: "ws-pilot-1",
      }),
    ).toMatchObject({
      title: "Workspace not found",
      href: buildSsoPilotLoginUrl("ws-pilot-1"),
      tone: "urgent",
    });
  });

  it("maps inactive SSO to admin guidance without fake pass", () => {
    expect(
      resolveSsoLoginErrorRecovery({
        code: "sso_disabled",
      }),
    ).toMatchObject({
      title: "SSO pilot not active",
      href: null,
      tone: "urgent",
    });
  });

  it("maps supabase errors to retry with IdP detail", () => {
    expect(
      resolveSsoLoginErrorRecovery({
        code: "supabase_error",
        error: "Invalid SAML response",
        workspaceId: "ws-pilot-1",
      }),
    ).toMatchObject({
      title: "IdP connection failed",
      detail: "Invalid SAML response",
      ctaLabel: "Retry SSO sign-in",
    });
  });
});
