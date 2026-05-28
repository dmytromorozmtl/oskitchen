import { describe, expect, it } from "vitest";

import {
  extractSsoIdpSubject,
  inferSsoIdpVendorFromUser,
  isSsoCallbackRequest,
  mapSsoCallbackDenyReasonToLoginError,
  parseSsoCallbackWorkspaceId,
  SSO_CALLBACK_WORKSPACE_QUERY_PARAM,
  validateSsoCallbackSession,
} from "@/lib/enterprise/workspace-sso-runtime-adapter";

const activeSettings = {
  enabled: true,
  idpVendor: "OKTA" as const,
  allowedEmailDomains: ["acme.com"],
  pilotPhase: "PILOT_ACTIVE" as const,
  breakGlassOwnerEnabled: true,
  supabaseSsoProviderRef: "okta-pilot",
  loginHintDomain: "acme.com",
};

describe("workspace SSO runtime adapter", () => {
  it("parses SSO callback workspace query param", () => {
    const params = new URLSearchParams({ [SSO_CALLBACK_WORKSPACE_QUERY_PARAM]: " ws-1 " });
    expect(parseSsoCallbackWorkspaceId(params)).toBe("ws-1");
    expect(isSsoCallbackRequest(params)).toBe(true);
    expect(isSsoCallbackRequest(new URLSearchParams())).toBe(false);
  });

  it("extracts IdP subject from Supabase user metadata", () => {
    expect(
      extractSsoIdpSubject({
        id: "user-1",
        app_metadata: { sso_subject: " name-id-1 " },
      }),
    ).toBe("name-id-1");
    expect(
      extractSsoIdpSubject({
        id: "user-2",
        identities: [{ provider: "saml", identity_data: { sub: "oidc-sub" } }],
      }),
    ).toBe("oidc-sub");
    expect(extractSsoIdpSubject({ id: "user-3" })).toBeNull();
  });

  it("infers IdP vendor from provider hints", () => {
    expect(
      inferSsoIdpVendorFromUser({
        id: "u1",
        identities: [{ provider: "okta-saml" }],
      }),
    ).toBe("OKTA");
    expect(
      inferSsoIdpVendorFromUser({
        id: "u2",
        app_metadata: { provider: "azure-ad" },
      }),
    ).toBe("ENTRA_ID");
    expect(inferSsoIdpVendorFromUser({ id: "u3" })).toBeNull();
  });

  it("validates callback session fail-closed until PILOT_ACTIVE gate passes", () => {
    expect(
      validateSsoCallbackSession({
        workspaceId: "ws-1",
        userId: "user-1",
        email: "staff@acme.com",
        idpSubject: "sub-1",
        inferredIdpVendor: "OKTA",
        settings: { ...activeSettings, enabled: false },
        userHasWorkspaceAccess: true,
        ssoEntitlementEnabled: true,
      }),
    ).toEqual({ ok: false, reason: "runtime_gate_denied" });
  });

  it("denies domain, entitlement, workspace access, and vendor mismatch", () => {
    expect(
      validateSsoCallbackSession({
        workspaceId: "ws-1",
        userId: "user-1",
        email: "staff@other.com",
        idpSubject: "sub-1",
        inferredIdpVendor: "OKTA",
        settings: activeSettings,
        userHasWorkspaceAccess: true,
        ssoEntitlementEnabled: true,
      }),
    ).toEqual({ ok: false, reason: "domain_not_allowed" });

    expect(
      validateSsoCallbackSession({
        workspaceId: "ws-1",
        userId: "user-1",
        email: "staff@acme.com",
        idpSubject: "sub-1",
        inferredIdpVendor: "OKTA",
        settings: activeSettings,
        userHasWorkspaceAccess: true,
        ssoEntitlementEnabled: false,
      }),
    ).toEqual({ ok: false, reason: "entitlement_denied" });

    expect(
      validateSsoCallbackSession({
        workspaceId: "ws-1",
        userId: "user-1",
        email: "staff@acme.com",
        idpSubject: "sub-1",
        inferredIdpVendor: "OKTA",
        settings: activeSettings,
        userHasWorkspaceAccess: false,
        ssoEntitlementEnabled: true,
      }),
    ).toEqual({ ok: false, reason: "workspace_access_denied" });

    expect(
      validateSsoCallbackSession({
        workspaceId: "ws-1",
        userId: "user-1",
        email: "staff@acme.com",
        idpSubject: "sub-1",
        inferredIdpVendor: "ENTRA_ID",
        settings: activeSettings,
        userHasWorkspaceAccess: true,
        ssoEntitlementEnabled: true,
      }),
    ).toEqual({ ok: false, reason: "idp_vendor_mismatch" });
  });

  it("allows callback when gate, domain, entitlement, and membership pass", () => {
    expect(
      validateSsoCallbackSession({
        workspaceId: "ws-1",
        userId: "user-1",
        email: "staff@acme.com",
        idpSubject: "sub-1",
        inferredIdpVendor: "OKTA",
        settings: activeSettings,
        userHasWorkspaceAccess: true,
        ssoEntitlementEnabled: true,
      }),
    ).toEqual({ ok: true, idpVendor: "OKTA", idpSubject: "sub-1" });
  });

  it("maps deny reasons to login error codes", () => {
    expect(mapSsoCallbackDenyReasonToLoginError("domain_not_allowed")).toBe("sso_domain_denied");
    expect(mapSsoCallbackDenyReasonToLoginError("runtime_gate_denied")).toBe("sso_denied");
  });
});
