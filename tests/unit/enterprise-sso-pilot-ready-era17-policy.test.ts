import { describe, expect, it } from "vitest";

import {
  ENTERPRISE_SSO_PILOT_READY_ERA17_BACKLOG_ID,
  ENTERPRISE_SSO_PILOT_READY_ERA17_DEFAULT_SSO_DELIVERY_STATUS,
  ENTERPRISE_SSO_PILOT_READY_ERA17_POLICY_ID,
  ENTERPRISE_SSO_PILOT_READY_ERA17_PROOF_STATUS,
  ENTERPRISE_SSO_PILOT_READY_ERA17_QUALIFIED_DELIVERY_STATUS,
} from "@/lib/enterprise/enterprise-sso-pilot-ready-era17-policy";

describe("enterprise SSO pilot ready era17 policy", () => {
  it("locks era17 enterprise SSO pilot_ready gate policy id", () => {
    expect(ENTERPRISE_SSO_PILOT_READY_ERA17_POLICY_ID).toBe(
      "era17-enterprise-sso-pilot-ready-v1",
    );
  });

  it("defaults to pilot_foundation until Cycle 2 proof_passed", () => {
    expect(ENTERPRISE_SSO_PILOT_READY_ERA17_PROOF_STATUS).toBe("awaiting_idp_login_proof");
    expect(ENTERPRISE_SSO_PILOT_READY_ERA17_DEFAULT_SSO_DELIVERY_STATUS).toBe("pilot_foundation");
    expect(ENTERPRISE_SSO_PILOT_READY_ERA17_QUALIFIED_DELIVERY_STATUS).toBe("pilot_ready");
    expect(ENTERPRISE_SSO_PILOT_READY_ERA17_BACKLOG_ID).toBe("KOS-E17-044");
  });
});
