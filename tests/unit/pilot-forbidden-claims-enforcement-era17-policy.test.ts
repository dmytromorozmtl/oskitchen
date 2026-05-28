import { describe, expect, it } from "vitest";

import {
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_FORBIDDEN_SALES_CLAIMS,
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_POLICY_ID,
  PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_PROOF_STATUS,
} from "@/lib/commercial/pilot-forbidden-claims-enforcement-era17-policy";

describe("pilot forbidden-claims enforcement era17 policy", () => {
  it("locks era17 forbidden-claims enforcement policy id", () => {
    expect(PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_POLICY_ID).toBe(
      "era17-pilot-forbidden-claims-enforcement-v1",
    );
  });

  it("does not auto-pass before release branch enforcement", () => {
    expect(PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_PROOF_STATUS).toBe(
      "awaiting_forbidden_claims_enforcement_pass",
    );
  });

  it("lists Era 17 forbidden sales claims", () => {
    expect(PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_FORBIDDEN_SALES_CLAIMS).toContain(
      "production SSO",
    );
    expect(PILOT_FORBIDDEN_CLAIMS_ENFORCEMENT_ERA17_FORBIDDEN_SALES_CLAIMS).toContain(
      "SOC2 Type II",
    );
  });
});
