import { describe, expect, it } from "vitest";

import {
  PILOT_PREFLIGHT_CLAIMS_EXTENDS_POLICY_ID,
  PILOT_PREFLIGHT_CLAIMS_POLICY_ID,
  pilotPreflightEnforcesStrictClaims,
} from "@/lib/governance/pilot-preflight-claims-policy";

describe("pilot preflight claims policy", () => {
  it("locks era8 pilot preflight strict claims policy id", () => {
    expect(PILOT_PREFLIGHT_CLAIMS_POLICY_ID).toBe("era8-pilot-preflight-claims-strict-v1");
    expect(PILOT_PREFLIGHT_CLAIMS_EXTENDS_POLICY_ID).toBe(
      "era7-marketing-claims-governance-v1",
    );
  });

  it("detects strict verify-claims wiring in shell scripts", () => {
    expect(
      pilotPreflightEnforcesStrictClaims(
        'step env MARKETING_CLAIMS_STRICT=1 "$NPM" run verify-claims',
      ),
    ).toBe(true);
    expect(pilotPreflightEnforcesStrictClaims('step "$NPM" run verify-claims')).toBe(false);
  });
});
