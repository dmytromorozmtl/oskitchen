import { describe, expect, it } from "vitest";

import { buildSsoPilotLoginUrl } from "@/lib/enterprise/enterprise-sso-login-entry-focus-era18";
import {
  isSsoCallbackLoginErrorCode,
  parseSsoCallbackLoginErrorFromSearchParams,
  resolveSsoCallbackLoginErrorRecovery,
} from "@/lib/enterprise/enterprise-sso-callback-error-recovery-era18";
import {
  ENTERPRISE_SSO_CALLBACK_ERROR_RECOVERY_ERA18_POLICY_ID,
  ENTERPRISE_SSO_CALLBACK_ERROR_RECOVERY_ERA18_PROOF_STATUS,
  ENTERPRISE_SSO_CALLBACK_ERROR_RECOVERY_ERA18_SSO_DELIVERY_PROOF_STATUS,
} from "@/lib/enterprise/enterprise-sso-callback-error-recovery-era18-policy";

describe("enterprise SSO callback error recovery era18", () => {
  it("locks era18 SSO callback error recovery policy id", () => {
    expect(ENTERPRISE_SSO_CALLBACK_ERROR_RECOVERY_ERA18_POLICY_ID).toBe(
      "era18-enterprise-sso-callback-error-recovery-v1",
    );
    expect(ENTERPRISE_SSO_CALLBACK_ERROR_RECOVERY_ERA18_PROOF_STATUS).toBe(
      "enterprise_sso_callback_error_recovery_wired",
    );
    expect(ENTERPRISE_SSO_CALLBACK_ERROR_RECOVERY_ERA18_SSO_DELIVERY_PROOF_STATUS).toBe(
      "awaiting_idp_login_proof",
    );
  });

  it("recognizes callback login error codes", () => {
    expect(isSsoCallbackLoginErrorCode("sso_domain_denied")).toBe(true);
    expect(isSsoCallbackLoginErrorCode("confirmation_failed")).toBe(false);
  });

  it("parses callback error from login search params", () => {
    expect(
      parseSsoCallbackLoginErrorFromSearchParams(
        new URLSearchParams("error=sso_workspace_denied&workspaceId=ws-1"),
      ),
    ).toBe("sso_workspace_denied");
    expect(parseSsoCallbackLoginErrorFromSearchParams(new URLSearchParams(""))).toBeNull();
  });

  it("maps domain deny to retry guidance with workspace context", () => {
    expect(
      resolveSsoCallbackLoginErrorRecovery({
        errorCode: "sso_domain_denied",
        workspaceId: "ws-pilot-1",
      }),
    ).toMatchObject({
      title: "Email domain not allowed",
      href: buildSsoPilotLoginUrl("ws-pilot-1"),
      tone: "urgent",
    });
  });

  it("maps generic callback deny with break-glass hint", () => {
    expect(
      resolveSsoCallbackLoginErrorRecovery({
        errorCode: "sso_denied",
      }),
    ).toMatchObject({
      title: "SSO sign-in denied after IdP callback",
      tone: "urgent",
    });
  });

  it("returns null for non-callback error codes", () => {
    expect(
      resolveSsoCallbackLoginErrorRecovery({
        errorCode: "confirmation_failed",
      }),
    ).toBeNull();
  });
});
