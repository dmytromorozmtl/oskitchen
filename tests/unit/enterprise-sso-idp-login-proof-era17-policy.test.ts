import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_POLICY_ID,
  ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_PROOF_STATUS,
  ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_SSO_DELIVERY_STATUS,
} from "@/lib/enterprise/enterprise-sso-idp-login-proof-era17-policy";

describe("enterprise SSO IdP login proof era17 policy", () => {
  it("locks era17 IdP login proof policy id", () => {
    expect(ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_POLICY_ID).toBe(
      "era17-enterprise-sso-idp-login-proof-v1",
    );
  });

  it("awaits operator proof and keeps pilot_foundation delivery", () => {
    expect(ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_PROOF_STATUS).toBe("awaiting_operator_proof");
    expect(ENTERPRISE_SSO_IDP_LOGIN_PROOF_ERA17_SSO_DELIVERY_STATUS).toBe("pilot_foundation");
  });
});
