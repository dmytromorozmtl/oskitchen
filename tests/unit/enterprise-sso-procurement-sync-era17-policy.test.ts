import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_BACKLOG_ID,
  ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_POLICY_ID,
  ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_PROOF_STATUS,
  ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_SSO_DELIVERY_STATUS,
  enterpriseSsoProcurementPackAvoidsForbiddenClaims,
  enterpriseSsoProcurementPackCoversRequiredMarkers,
} from "@/lib/enterprise/enterprise-sso-procurement-sync-era17-policy";

describe("enterprise SSO procurement sync era17 policy", () => {
  it("locks era17 enterprise SSO procurement sync policy id", () => {
    expect(ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_POLICY_ID).toBe(
      "era17-enterprise-sso-procurement-sync-v1",
    );
  });

  it("keeps pilot_foundation delivery and procurement sync proof status", () => {
    expect(ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_SSO_DELIVERY_STATUS).toBe("pilot_foundation");
    expect(ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_PROOF_STATUS).toBe("procurement_sync_complete");
    expect(ENTERPRISE_SSO_PROCUREMENT_SYNC_ERA17_BACKLOG_ID).toBe("KOS-E17-041");
  });

  it("validates marker and forbidden-claim helpers", () => {
    const good = `
      era17-enterprise-sso-procurement-sync-v1
      pilot_foundation qualified pilot only
      not production SSO for all tenants
      awaiting_operator_proof
    `;
    expect(enterpriseSsoProcurementPackCoversRequiredMarkers(good)).toBe(true);
    expect(enterpriseSsoProcurementPackAvoidsForbiddenClaims(good)).toBe(true);
    expect(
      enterpriseSsoProcurementPackAvoidsForbiddenClaims("production sso for all tenants today"),
    ).toBe(false);
  });
});
