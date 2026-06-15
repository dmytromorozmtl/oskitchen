import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_SSO_TENANT_MAPPING_ERA17_BACKLOG_ID,
  ENTERPRISE_SSO_TENANT_MAPPING_ERA17_FORBIDDEN_CLAIMS,
  ENTERPRISE_SSO_TENANT_MAPPING_ERA17_POLICY_ID,
  ENTERPRISE_SSO_TENANT_MAPPING_ERA17_PROOF_STATUS,
  ENTERPRISE_SSO_TENANT_MAPPING_ERA17_REQUIRED_SCENARIOS,
  ENTERPRISE_SSO_TENANT_MAPPING_ERA17_SSO_DELIVERY_STATUS,
} from "@/lib/enterprise/enterprise-sso-tenant-mapping-era17-policy";

describe("enterprise SSO tenant mapping era17 policy", () => {
  it("locks era17 enterprise SSO tenant mapping policy id", () => {
    expect(ENTERPRISE_SSO_TENANT_MAPPING_ERA17_POLICY_ID).toBe(
      "era17-enterprise-sso-tenant-mapping-v1",
    );
  });

  it("keeps pilot_foundation delivery and test-backed proof status", () => {
    expect(ENTERPRISE_SSO_TENANT_MAPPING_ERA17_PROOF_STATUS).toBe(
      "tenant_mapping_test_backed",
    );
    expect(ENTERPRISE_SSO_TENANT_MAPPING_ERA17_SSO_DELIVERY_STATUS).toBe("pilot_foundation");
    expect(ENTERPRISE_SSO_TENANT_MAPPING_ERA17_BACKLOG_ID).toBe("KOS-E17-040");
  });

  it("defines six required tenant mapping scenarios", () => {
    expect(ENTERPRISE_SSO_TENANT_MAPPING_ERA17_REQUIRED_SCENARIOS).toEqual([
      "wrong_email_domain_denied",
      "wrong_workspace_uuid_denied",
      "disabled_sso_pilot_denied",
      "missing_provider_ref_denied",
      "no_entitlement_denied",
      "valid_pilot_workspace_allowed",
    ]);
    expect(ENTERPRISE_SSO_TENANT_MAPPING_ERA17_FORBIDDEN_CLAIMS.length).toBeGreaterThan(2);
  });
});
