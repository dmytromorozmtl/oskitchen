import { describe, expect, it } from "vitest";

import {
  buildEnterpriseIdpLiveCards,
  buildEnterpriseScimLiveStatus,
  buildEnterpriseSsoScimLiveDashboard,
} from "@/lib/enterprise/enterprise-sso-scim-live-builders";
import {
  ENTERPRISE_SSO_LIVE_IDPS,
  ENTERPRISE_SSO_SCIM_LIVE_POLICY_ID,
  SCIM_API_BASE_PATH,
} from "@/lib/enterprise/enterprise-sso-scim-live-policy";

describe("enterprise SSO + SCIM LIVE (ENT-66)", () => {
  it("locks ENT-66 policy id and three LIVE IdPs", () => {
    expect(ENTERPRISE_SSO_SCIM_LIVE_POLICY_ID).toBe("enterprise-sso-scim-live-ent66-v1");
    expect(ENTERPRISE_SSO_LIVE_IDPS.map((row) => row.vendor)).toEqual([
      "OKTA",
      "ENTRA_ID",
      "GOOGLE_WORKSPACE",
    ]);
  });

  it("builds IdP cards with active Okta when workspace SSO is live", () => {
    const cards = buildEnterpriseIdpLiveCards({
      activeIdpVendor: "OKTA",
      ssoConfigured: true,
      ssoActive: true,
    });
    expect(cards).toHaveLength(3);
    expect(cards.find((c) => c.id === "okta")?.status).toBe("active");
    expect(cards.find((c) => c.id === "entra")?.status).toBe("available");
    expect(cards.find((c) => c.id === "google")?.status).toBe("available");
  });

  it("builds SCIM LIVE status with RFC endpoints", () => {
    const scim = buildEnterpriseScimLiveStatus({
      scimEnabled: true,
      scimPhase: "PILOT_ACTIVE",
      scimTokenConfigured: true,
      provisionedUserCount: 12,
    });
    expect(scim.deliveryStatus).toBe("LIVE");
    expect(scim.usersEndpoint).toBe(`${SCIM_API_BASE_PATH}/Users`);
    expect(scim.provisionedUserCount).toBe(12);
    expect(scim.features.length).toBeGreaterThanOrEqual(4);
  });

  it("assembles enterprise SSO + SCIM LIVE dashboard", () => {
    const dashboard = buildEnterpriseSsoScimLiveDashboard({
      workspaceId: "ws-1",
      ssoEntitlementEnabled: true,
      ssoActive: true,
      ssoConfigured: true,
      activeIdpVendor: "ENTRA_ID",
      scimEnabled: true,
      scimPhase: "PILOT_ACTIVE",
      scimTokenConfigured: true,
      provisionedUserCount: 5,
      wiringCertPassed: true,
      scimApiRoutesLive: true,
    });
    expect(dashboard.policyId).toBe(ENTERPRISE_SSO_SCIM_LIVE_POLICY_ID);
    expect(dashboard.ssoDeliveryStatus).toBe("LIVE");
    expect(dashboard.scimDeliveryStatus).toBe("LIVE");
    expect(dashboard.summary.liveIdpCount).toBe(3);
    expect(dashboard.summary.activeIdpVendor).toBe("ENTRA_ID");
    expect(dashboard.warnings).toHaveLength(0);
    expect(dashboard.basePath).toBe("/dashboard/enterprise/sso-scim");
  });

  it("warns when entitlement or SCIM token missing", () => {
    const dashboard = buildEnterpriseSsoScimLiveDashboard({
      workspaceId: "ws-1",
      ssoEntitlementEnabled: false,
      ssoActive: false,
      ssoConfigured: false,
      activeIdpVendor: null,
      scimEnabled: false,
      scimPhase: null,
      scimTokenConfigured: false,
      provisionedUserCount: 0,
      wiringCertPassed: false,
      scimApiRoutesLive: true,
    });
    expect(dashboard.warnings.some((w) => w.includes("ssoOidc"))).toBe(true);
    expect(dashboard.warnings.some((w) => w.includes("wiring cert"))).toBe(true);
    expect(dashboard.warnings.some((w) => w.includes("bearer token"))).toBe(true);
  });
});
