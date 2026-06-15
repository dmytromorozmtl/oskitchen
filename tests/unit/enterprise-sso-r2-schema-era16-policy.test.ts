import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_SSO_R2_SCHEMA_ERA16_PILOT_STATUS,
  ENTERPRISE_SSO_R2_SCHEMA_ERA16_POLICY_ID,
  ENTERPRISE_SSO_R2_SCHEMA_ERA16_SSO_DELIVERY_STATUS,
} from "@/lib/enterprise/enterprise-sso-r2-schema-era16-policy";

describe("enterprise SSO R2 schema era16 policy", () => {
  it("locks era16 schema foundation without production SSO delivery", () => {
    expect(ENTERPRISE_SSO_R2_SCHEMA_ERA16_POLICY_ID).toBe(
      "era16-enterprise-sso-r2-schema-v1",
    );
    expect(ENTERPRISE_SSO_R2_SCHEMA_ERA16_PILOT_STATUS).toBe("schema_ready");
    expect(ENTERPRISE_SSO_R2_SCHEMA_ERA16_SSO_DELIVERY_STATUS).toBe(
      "pilot_foundation",
    );
  });
});
