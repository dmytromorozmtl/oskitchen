import { describe, expect, it } from "vitest";

import {
  buildPilotActiveWorkspaceSsoSettingsUpdate,
  buildPilotDeactivateWorkspaceSsoSettingsUpdate,
  resolveSsoLoginDomain,
} from "@/lib/enterprise/workspace-sso-foundation";
import {
  buildSsoAuthCallbackUrl,
} from "@/lib/enterprise/workspace-sso-login-initiate";

describe("workspace SSO login initiate helpers", () => {
  it("resolves login domain from hint or allowed domains", () => {
    expect(
      resolveSsoLoginDomain({
        enabled: true,
        idpVendor: "OKTA",
        allowedEmailDomains: ["acme.com", "other.com"],
        pilotPhase: "PILOT_ACTIVE",
        breakGlassOwnerEnabled: true,
        supabaseSsoProviderRef: "okta-pilot",
        loginHintDomain: "Hint.Acme.com",
      }),
    ).toBe("hint.acme.com");
    expect(
      resolveSsoLoginDomain({
        enabled: true,
        idpVendor: "OKTA",
        allowedEmailDomains: ["acme.com"],
        pilotPhase: "PILOT_ACTIVE",
        breakGlassOwnerEnabled: true,
        supabaseSsoProviderRef: "okta-pilot",
        loginHintDomain: null,
      }),
    ).toBe("acme.com");
  });

  it("builds SSO callback URL with workspace query param", () => {
    const url = buildSsoAuthCallbackUrl({
      workspaceId: "ws-123",
      nextPath: "/dashboard/today",
    });
    expect(url).toContain("sso_workspace_id=ws-123");
    expect(url).toContain("next=");
  });

  it("builds pilot activation and deactivation updates", () => {
    expect(buildPilotActiveWorkspaceSsoSettingsUpdate({ configuredByUserId: "u1" })).toMatchObject({
      enabled: true,
      pilotPhase: "PILOT_ACTIVE",
      configuredByUserId: "u1",
    });
    expect(buildPilotDeactivateWorkspaceSsoSettingsUpdate()).toEqual({
      enabled: false,
      pilotPhase: "PILOT_CONFIGURED",
    });
  });
});
