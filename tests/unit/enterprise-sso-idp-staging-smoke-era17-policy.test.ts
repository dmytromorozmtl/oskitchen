import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_POLICY_ID,
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_SSO_DELIVERY_STATUS,
  ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_SUPPORTED_IDP_VENDORS,
} from "@/lib/enterprise/enterprise-sso-idp-staging-smoke-era17-policy";

describe("enterprise SSO IdP staging smoke era17 policy", () => {
  it("locks era17 IdP staging smoke policy id", () => {
    expect(ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_POLICY_ID).toBe(
      "era17-enterprise-sso-idp-staging-smoke-v1",
    );
  });

  it("keeps SSO delivery at pilot_foundation until Cycle 2 proof", () => {
    expect(ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_SSO_DELIVERY_STATUS).toBe("pilot_foundation");
  });

  it("supports Okta and Entra ID only", () => {
    expect(ENTERPRISE_SSO_IDP_STAGING_SMOKE_ERA17_SUPPORTED_IDP_VENDORS).toEqual([
      "OKTA",
      "ENTRA_ID",
    ]);
  });
});
