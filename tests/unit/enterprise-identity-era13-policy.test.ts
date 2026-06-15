import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_IDENTITY_ERA13_DELIVERY_DECISION,
  ENTERPRISE_IDENTITY_ERA13_POLICY_ID,
  ENTERPRISE_IDENTITY_ERA13_R2_PILOT_STATUS,
  ENTERPRISE_IDENTITY_ERA13_SSO_DELIVERY_STATUS,
} from "@/lib/enterprise/enterprise-identity-era13-policy";

describe("enterprise identity era13 policy", () => {
  it("locks era13 enterprise identity recert policy id and honest delivery", () => {
    expect(ENTERPRISE_IDENTITY_ERA13_POLICY_ID).toBe("era13-enterprise-identity-recert-v1");
    expect(ENTERPRISE_IDENTITY_ERA13_DELIVERY_DECISION).toBe("roadmap_only");
    expect(ENTERPRISE_IDENTITY_ERA13_SSO_DELIVERY_STATUS).toBe("not_implemented");
    expect(ENTERPRISE_IDENTITY_ERA13_R2_PILOT_STATUS).toBe("not_started");
  });
});
