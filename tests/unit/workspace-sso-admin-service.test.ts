import { describe, expect, it } from "vitest";

import {
  buildPilotConfiguredWorkspaceSsoSettingsInput,
  evaluateWorkspaceSsoRuntimeGate,
} from "@/lib/enterprise/workspace-sso-foundation";

describe("workspace SSO admin service assumptions", () => {
  it("keeps configured pilot inactive until explicit activation", () => {
    const configured = buildPilotConfiguredWorkspaceSsoSettingsInput({
      workspaceId: "ws-1",
      idpVendor: "OKTA",
      allowedEmailDomains: ["acme.com"],
      supabaseSsoProviderRef: "okta-pilot",
    });
    expect(configured.enabled).toBe(false);
    expect(configured.pilotPhase).toBe("PILOT_CONFIGURED");
    expect(
      evaluateWorkspaceSsoRuntimeGate({
        enabled: configured.enabled,
        idpVendor: configured.idpVendor,
        allowedEmailDomains: configured.allowedEmailDomains,
        pilotPhase: configured.pilotPhase,
        breakGlassOwnerEnabled: true,
        supabaseSsoProviderRef: configured.supabaseSsoProviderRef,
        loginHintDomain: null,
      }).allowed,
    ).toBe(false);
  });

  it("allows runtime gate only after PILOT_ACTIVE activation shape", () => {
    expect(
      evaluateWorkspaceSsoRuntimeGate({
        enabled: true,
        idpVendor: "ENTRA_ID",
        allowedEmailDomains: ["acme.com"],
        pilotPhase: "PILOT_ACTIVE",
        breakGlassOwnerEnabled: true,
        supabaseSsoProviderRef: "entra-pilot",
        loginHintDomain: "acme.com",
      }),
    ).toEqual({ allowed: true, reason: "pilot_active" });
  });
});
