import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_SSO_R2_PILOT_ERA16_POLICY_ID,
  ENTERPRISE_SSO_R2_PILOT_STATUS,
  ENTERPRISE_SSO_R2_SELECTED_PATH,
  ENTERPRISE_SSO_R2_SSO_DELIVERY_STATUS,
} from "@/lib/enterprise/enterprise-sso-r2-pilot-era16-policy";

describe("enterprise SSO R2 pilot era16 policy", () => {
  it("locks era16 R2 pilot decision without implying production SSO delivery", () => {
    expect(ENTERPRISE_SSO_R2_PILOT_ERA16_POLICY_ID).toBe(
      "era16-enterprise-sso-r2-pilot-v1",
    );
    expect(ENTERPRISE_SSO_R2_PILOT_STATUS).toBe("design_locked");
    expect(ENTERPRISE_SSO_R2_SELECTED_PATH).toBe("supabase_saml_sso");
    expect(ENTERPRISE_SSO_R2_SSO_DELIVERY_STATUS).toBe("not_implemented");
  });
});
