import { describe, expect, it } from "vitest";

import {
  PILOT_TIER_PREFLIGHT_ERA17_POLICY_ID,
  PILOT_TIER_PREFLIGHT_ERA17_PROOF_STATUS,
  PILOT_TIER_PREFLIGHT_ERA17_TIER0_COMMANDS,
  PILOT_TIER_PREFLIGHT_ERA17_TIER1_COMMANDS,
} from "@/lib/commercial/pilot-tier-preflight-era17-policy";

describe("pilot tier preflight era17 policy", () => {
  it("locks era17 pilot tier preflight policy id", () => {
    expect(PILOT_TIER_PREFLIGHT_ERA17_POLICY_ID).toBe("era17-pilot-tier-preflight-v1");
  });

  it("does not claim tier preflight pass without evidence", () => {
    expect(PILOT_TIER_PREFLIGHT_ERA17_PROOF_STATUS).toBe("awaiting_tier_preflight_pass");
  });

  it("lists tier 0 and tier 1 commands aligned with commercial runbook", () => {
    expect(PILOT_TIER_PREFLIGHT_ERA17_TIER0_COMMANDS).toContain("test:ci:governance-bundles");
    expect(PILOT_TIER_PREFLIGHT_ERA17_TIER1_COMMANDS).toContain("verify-claims");
    expect(PILOT_TIER_PREFLIGHT_ERA17_TIER1_COMMANDS).toContain(
      "test:ci:pilot-preflight-claims:cert",
    );
  });
});
