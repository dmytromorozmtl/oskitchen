import { describe, expect, it } from "vitest";

import {
  buildDefaultWorkspaceSsoSettingsInput,
  buildPilotConfiguredWorkspaceSsoSettingsInput,
  evaluateWorkspaceSsoRuntimeGate,
  extractEmailDomain,
  isEmailDomainAllowed,
  normalizeAllowedEmailDomains,
  normalizeIdpSubject,
} from "@/lib/enterprise/workspace-sso-foundation";

describe("workspace SSO foundation", () => {
  it("builds disabled-by-default workspace SSO settings input", () => {
    const input = buildDefaultWorkspaceSsoSettingsInput("ws-1");
    expect(input).toEqual({
      workspaceId: "ws-1",
      enabled: false,
      pilotPhase: "DISABLED",
      allowedEmailDomains: [],
      breakGlassOwnerEnabled: true,
    });
  });

  it("builds pilot-configured settings with enabled still false", () => {
    const input = buildPilotConfiguredWorkspaceSsoSettingsInput({
      workspaceId: "ws-2",
      idpVendor: "OKTA",
      allowedEmailDomains: ["@Acme.COM", "acme.com", " pilot.com "],
      supabaseSsoProviderRef: "okta-pilot",
      loginHintDomain: "Acme.com",
    });
    expect(input.enabled).toBe(false);
    expect(input.pilotPhase).toBe("PILOT_CONFIGURED");
    expect(input.allowedEmailDomains).toEqual(["acme.com", "pilot.com"]);
    expect(input.loginHintDomain).toBe("acme.com");
  });

  it("normalizes email domains and validates membership fail-closed", () => {
    expect(normalizeAllowedEmailDomains(["@Foo.com", "BAR.com", ""])).toEqual([
      "bar.com",
      "foo.com",
    ]);
    expect(extractEmailDomain("Staff@Example.org")).toBe("example.org");
    expect(isEmailDomainAllowed("staff@example.org", ["example.org"])).toBe(true);
    expect(isEmailDomainAllowed("staff@other.org", ["example.org"])).toBe(false);
    expect(isEmailDomainAllowed("staff@example.org", [])).toBe(false);
  });

  it("evaluates runtime gate fail-closed until PILOT_ACTIVE with provider ref", () => {
    expect(evaluateWorkspaceSsoRuntimeGate(null)).toEqual({
      allowed: false,
      reason: "not_configured",
    });
    expect(
      evaluateWorkspaceSsoRuntimeGate({
        enabled: false,
        idpVendor: "OKTA",
        allowedEmailDomains: ["acme.com"],
        pilotPhase: "PILOT_CONFIGURED",
        breakGlassOwnerEnabled: true,
        supabaseSsoProviderRef: "okta-pilot",
        loginHintDomain: "acme.com",
      }),
    ).toEqual({ allowed: false, reason: "disabled" });
    expect(
      evaluateWorkspaceSsoRuntimeGate({
        enabled: true,
        idpVendor: "ENTRA_ID",
        allowedEmailDomains: ["acme.com"],
        pilotPhase: "PILOT_ACTIVE",
        breakGlassOwnerEnabled: true,
        supabaseSsoProviderRef: "  ",
        loginHintDomain: null,
      }),
    ).toEqual({ allowed: false, reason: "missing_provider_ref" });
    expect(
      evaluateWorkspaceSsoRuntimeGate({
        enabled: true,
        idpVendor: "ENTRA_ID",
        allowedEmailDomains: ["acme.com"],
        pilotPhase: "PILOT_ACTIVE",
        breakGlassOwnerEnabled: true,
        supabaseSsoProviderRef: "entra-pilot",
        loginHintDomain: null,
      }),
    ).toEqual({ allowed: true, reason: "pilot_active" });
  });

  it("normalizes IdP subject keys", () => {
    expect(normalizeIdpSubject("  abc-123  ")).toBe("abc-123");
  });
});
