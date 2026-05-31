import { describe, expect, it } from "vitest";

import {
  intersectPartnerOAuthScopes,
  partnerOAuthScopesToDeveloperScopes,
  validatePartnerOAuthScopes,
} from "@/lib/developer/partner-oauth-scopes";
import {
  getPartnerOAuthAppByClientId,
  listPartnerOAuthAppDefinitions,
  validatePartnerOAuthAppDefinition,
} from "@/lib/oauth/partner-oauth-app-catalog";
import { validatePartnerOAuthAuthorizeParams } from "@/services/platform/partner-oauth-service";

describe("partner-oauth-apps catalog", () => {
  it("loads sandbox apps with valid definitions", () => {
    const apps = listPartnerOAuthAppDefinitions();
    expect(apps.length).toBeGreaterThanOrEqual(2);
    for (const app of apps) {
      expect(validatePartnerOAuthAppDefinition(app)).toEqual([]);
    }
  });

  it("resolves known client id", () => {
    const app = getPartnerOAuthAppByClientId("sandbox-opsbridge-connector");
    expect(app?.name).toContain("OpsBridge");
    expect(app?.allowedScopes).toContain("read:orders");
  });
});

describe("partner-oauth scopes", () => {
  it("maps read:orders to developer API scopes", () => {
    const mapped = partnerOAuthScopesToDeveloperScopes(["read:orders"]);
    expect(mapped).toContain("orders:read");
  });

  it("intersects requested scopes with app allowed list", () => {
    const app = getPartnerOAuthAppByClientId("sandbox-opsbridge-connector");
    expect(app).not.toBeNull();
    const scopes = intersectPartnerOAuthScopes(
      ["read:orders", "write:orders"],
      app!.allowedScopes,
    );
    expect(scopes).toEqual(["read:orders"]);
    expect(validatePartnerOAuthScopes(scopes)).toEqual([]);
  });
});

describe("partner-oauth authorize params", () => {
  it("accepts valid authorization request", () => {
    const app = getPartnerOAuthAppByClientId("sandbox-opsbridge-connector");
    expect(app).not.toBeNull();
    const result = validatePartnerOAuthAuthorizeParams({
      clientId: app!.clientId,
      redirectUri: app!.redirectUris[0]!,
      responseType: "code",
      scope: "read:orders manage:webhooks",
    });
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.scopes).toContain("read:orders");
      expect(result.scopes).toContain("manage:webhooks");
    }
  });

  it("rejects unknown client", () => {
    const result = validatePartnerOAuthAuthorizeParams({
      clientId: "unknown-app",
      redirectUri: "http://localhost:3000/api/oauth/callback/sandbox",
      responseType: "code",
      scope: "read:orders",
    });
    expect(result.ok).toBe(false);
  });
});
