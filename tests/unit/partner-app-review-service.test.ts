import { describe, expect, it } from "vitest";

import {
  mintPartnerAppEmbedToken,
  verifyPartnerAppEmbedToken,
} from "@/lib/oauth/partner-app-embed-token";
import { validatePartnerAppSubmission } from "@/services/platform/partner-app-review-service";
import {
  INSTALLABLE_OAUTH_APP_STATUSES,
  isPartnerOAuthAppInstallable,
} from "@/services/platform/partner-oauth-app-registry-service";
import {
  validatePartnerOAuthAuthorizeParamsWithApp,
} from "@/services/platform/partner-oauth-service";
import { getPartnerOAuthAppByClientId } from "@/lib/oauth/partner-oauth-app-catalog";

describe("partner-app embed token", () => {
  it("mints and verifies a signed embed session", () => {
    const token = mintPartnerAppEmbedToken({
      installationId: "inst-1",
      workspaceId: "ws-1",
      clientId: "sandbox-opsbridge-connector",
      userId: "user-1",
      ttlSeconds: 900,
    });
    const payload = verifyPartnerAppEmbedToken(token);
    expect(payload?.installationId).toBe("inst-1");
    expect(payload?.clientId).toBe("sandbox-opsbridge-connector");
  });

  it("rejects tampered tokens", () => {
    const token = mintPartnerAppEmbedToken({
      installationId: "inst-1",
      workspaceId: null,
      clientId: "app",
      userId: "user-1",
    });
    const tampered = `${token}x`;
    expect(verifyPartnerAppEmbedToken(tampered)).toBeNull();
  });
});

describe("partner-app review validation", () => {
  it("requires HTTPS redirect URIs in production", () => {
    const errors = validatePartnerAppSubmission({
      clientId: "acme-bridge",
      name: "Acme Bridge",
      publisher: "Acme SI",
      description: "Ops alerts fan-out for pilot kitchens with webhook receivers.",
      redirectUris: ["http://evil.example.com/callback"],
      allowedScopes: ["read:orders"],
      contactEmail: "ops@acme.example",
    });
    expect(errors.some((e) => e.includes("HTTPS"))).toBe(true);
  });

  it("allows localhost http redirect for sandbox dev", () => {
    const errors = validatePartnerAppSubmission({
      clientId: "acme-bridge",
      name: "Acme Bridge",
      publisher: "Acme SI",
      description: "Ops alerts fan-out for pilot kitchens with webhook receivers.",
      redirectUris: ["http://localhost:3000/api/oauth/callback/sandbox"],
      allowedScopes: ["read:orders", "manage:webhooks"],
      contactEmail: "ops@acme.example",
      embedUrl: "https://app.acme.example/embed",
    });
    expect(errors).toEqual([]);
  });
});

describe("partner oauth installable registry merge", () => {
  it("only SANDBOX and PUBLISHED are installable", () => {
    expect(INSTALLABLE_OAUTH_APP_STATUSES).toEqual(["SANDBOX", "PUBLISHED"]);
    expect(isPartnerOAuthAppInstallable("SANDBOX")).toBe(true);
    expect(isPartnerOAuthAppInstallable("IN_REVIEW")).toBe(false);
    expect(isPartnerOAuthAppInstallable("DRAFT")).toBe(false);
  });

  it("blocks authorize for non-installable status", () => {
    const app = getPartnerOAuthAppByClientId("sandbox-opsbridge-connector");
    expect(app).not.toBeNull();
    const blocked = validatePartnerOAuthAuthorizeParamsWithApp(
      {
        clientId: app!.clientId,
        redirectUri: app!.redirectUris[0]!,
        responseType: "code",
        scope: "read:orders",
      },
      { ...app!, status: "IN_REVIEW" },
    );
    expect(blocked.ok).toBe(false);
  });
});
