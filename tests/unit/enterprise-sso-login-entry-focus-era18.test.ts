import { describe, expect, it } from "vitest";

import {
  buildSsoLoginPilotContext,
  buildSsoPilotLoginUrl,
  parseSsoLoginWorkspaceId,
  shouldShowSsoLoginPilotContextStrip,
} from "@/lib/enterprise/enterprise-sso-login-entry-focus-era18";
import {
  ENTERPRISE_SSO_LOGIN_ENTRY_FOCUS_ERA18_POLICY_ID,
  ENTERPRISE_SSO_LOGIN_ENTRY_FOCUS_ERA18_PROOF_STATUS,
  ENTERPRISE_SSO_LOGIN_ENTRY_FOCUS_ERA18_SSO_DELIVERY_PROOF_STATUS,
  SSO_LOGIN_WORKSPACE_QUERY_PARAM,
} from "@/lib/enterprise/enterprise-sso-login-entry-focus-era18-policy";

describe("enterprise SSO login entry focus era18", () => {
  it("locks era18 SSO login entry focus policy id", () => {
    expect(ENTERPRISE_SSO_LOGIN_ENTRY_FOCUS_ERA18_POLICY_ID).toBe(
      "era18-enterprise-sso-login-entry-focus-v1",
    );
    expect(ENTERPRISE_SSO_LOGIN_ENTRY_FOCUS_ERA18_PROOF_STATUS).toBe(
      "enterprise_sso_login_entry_pilot_context_wired",
    );
    expect(ENTERPRISE_SSO_LOGIN_ENTRY_FOCUS_ERA18_SSO_DELIVERY_PROOF_STATUS).toBe(
      "awaiting_idp_login_proof",
    );
  });

  it("parses workspace id from canonical and alias query params", () => {
    expect(
      parseSsoLoginWorkspaceId(
        new URLSearchParams(`${SSO_LOGIN_WORKSPACE_QUERY_PARAM}=ws-pilot-1`),
      ),
    ).toBe("ws-pilot-1");
    expect(parseSsoLoginWorkspaceId(new URLSearchParams("workspace=ws-alias-1"))).toBe(
      "ws-alias-1",
    );
    expect(parseSsoLoginWorkspaceId(new URLSearchParams(""))).toBeNull();
    expect(parseSsoLoginWorkspaceId(new URLSearchParams("workspaceId=  "))).toBeNull();
  });

  it("builds pilot login url with optional redirect", () => {
    expect(buildSsoPilotLoginUrl("ws-pilot-1")).toBe("/login?workspaceId=ws-pilot-1");
    expect(buildSsoPilotLoginUrl("ws-pilot-1", "/dashboard/today")).toBe(
      "/login?workspaceId=ws-pilot-1&redirect=%2Fdashboard%2Ftoday",
    );
  });

  it("builds pilot context strip payload when workspace is prefilled", () => {
    expect(shouldShowSsoLoginPilotContextStrip("ws-pilot-1")).toBe(true);
    expect(buildSsoLoginPilotContext("ws-pilot-1")).toMatchObject({
      workspaceId: "ws-pilot-1",
      headline: "Pilot workspace ready",
    });
    expect(buildSsoLoginPilotContext(null)).toBeNull();
  });
});
