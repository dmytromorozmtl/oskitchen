import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_SSO_SCIM_LIVE_ERA139_CANONICAL_POLICY_ID,
  ENTERPRISE_SSO_SCIM_LIVE_ERA139_CAPABILITIES,
  ENTERPRISE_SSO_SCIM_LIVE_ERA139_IDPS,
  ENTERPRISE_SSO_SCIM_LIVE_ERA139_POLICY_ID,
  ENTERPRISE_SSO_SCIM_LIVE_ERA139_ROUTE,
  ENTERPRISE_SSO_SCIM_LIVE_ERA139_SERVICE,
  ENTERPRISE_SSO_SCIM_LIVE_ERA139_SUMMARY_ARTIFACT,
  ENTERPRISE_SSO_SCIM_LIVE_ERA139_WIRING_PATHS,
} from "@/lib/enterprise/enterprise-sso-scim-live-era139-policy";
import {
  auditEnterpriseSsoScimLiveSmokeWiring,
  buildEnterpriseSsoScimLiveSmokeEra139Summary,
  resolveEnterpriseSsoScimLiveSmokeEra139ProofStatus,
} from "@/lib/enterprise/enterprise-sso-scim-live-smoke-summary";
import {
  buildEnterpriseIdpLiveCards,
  buildEnterpriseSsoScimLiveDashboard,
} from "@/lib/enterprise/enterprise-sso-scim-live-builders";
import {
  ENTERPRISE_SSO_SCIM_LIVE_POLICY_ID,
  SCIM_API_BASE_PATH,
} from "@/lib/enterprise/enterprise-sso-scim-live-policy";

const ROOT = process.cwd();

describe("enterprise SSO + SCIM live era139", () => {
  it("locks era139 policy and artifact path", () => {
    expect(ENTERPRISE_SSO_SCIM_LIVE_ERA139_POLICY_ID).toBe(
      "era139-enterprise-sso-scim-live-v1",
    );
    expect(ENTERPRISE_SSO_SCIM_LIVE_ERA139_SUMMARY_ARTIFACT).toBe(
      "artifacts/enterprise-sso-scim-live-smoke-summary.json",
    );
    expect(ENTERPRISE_SSO_SCIM_LIVE_ERA139_ROUTE).toBe("/dashboard/enterprise/sso-scim");
    expect(ENTERPRISE_SSO_SCIM_LIVE_ERA139_IDPS).toHaveLength(3);
    expect(ENTERPRISE_SSO_SCIM_LIVE_ERA139_CAPABILITIES).toHaveLength(3);
  });

  it("aligns era139 with canonical enterprise SSO + SCIM policy", () => {
    expect(ENTERPRISE_SSO_SCIM_LIVE_ERA139_CANONICAL_POLICY_ID).toBe(
      ENTERPRISE_SSO_SCIM_LIVE_POLICY_ID,
    );
  });

  it("audits in-repo Enterprise SSO + SCIM wiring", () => {
    const audit = auditEnterpriseSsoScimLiveSmokeWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    for (const rel of ENTERPRISE_SSO_SCIM_LIVE_ERA139_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(true);
    }
  });

  it("includes Okta Entra Google SSO and SCIM wiring", () => {
    const service = readFileSync(join(ROOT, ENTERPRISE_SSO_SCIM_LIVE_ERA139_SERVICE), "utf8");
    expect(service).toContain("loadEnterpriseSsoScimLiveDashboard");
    expect(service).toContain("getWorkspaceScimAdminView");

    const panel = readFileSync(
      join(ROOT, "components/enterprise/enterprise-sso-scim-live-panel.tsx"),
      "utf8",
    );
    expect(panel).toContain("enterprise-sso-scim-live-panel");
    expect(panel).toContain("SCIM LIVE");

    const cards = buildEnterpriseIdpLiveCards({
      activeIdpVendor: "OKTA",
      ssoConfigured: true,
      ssoActive: true,
    });
    expect(cards).toHaveLength(3);
    expect(cards.find((c) => c.id === "okta")?.status).toBe("active");

    const dashboard = buildEnterpriseSsoScimLiveDashboard({
      workspaceId: "ws-era139",
      ssoEntitlementEnabled: true,
      ssoActive: true,
      ssoConfigured: true,
      activeIdpVendor: "OKTA",
      scimEnabled: true,
      scimPhase: "PILOT_ACTIVE",
      scimTokenConfigured: true,
      provisionedUserCount: 3,
      wiringCertPassed: true,
      scimApiRoutesLive: true,
    });
    expect(dashboard.scim.usersEndpoint).toBe(`${SCIM_API_BASE_PATH}/Users`);
    expect(dashboard.ssoDeliveryStatus).toBe("LIVE");
  });

  it("marks proof_passed only when cert and wiring pass", () => {
    expect(
      resolveEnterpriseSsoScimLiveSmokeEra139ProofStatus({
        wiringOk: true,
        certPassed: true,
      }),
    ).toBe("proof_passed");
    expect(
      resolveEnterpriseSsoScimLiveSmokeEra139ProofStatus({
        wiringOk: false,
        certPassed: true,
      }),
    ).toBe("proof_failed_wiring");
  });

  it("builds PASSED summary when wiring and cert pass", () => {
    const summary = buildEnterpriseSsoScimLiveSmokeEra139Summary({
      certPassed: true,
    });
    expect(summary.overall).toBe("PASSED");
    expect(summary.proofStatus).toBe("proof_passed");
    expect(summary.wiringCertPassed).toBe(true);
    expect(summary.capabilities).toContain("scim");
  });
});
