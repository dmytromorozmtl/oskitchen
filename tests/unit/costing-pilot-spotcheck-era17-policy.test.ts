import { describe, expect, it } from "vitest";

import {
  COSTING_PILOT_SPOTCHECK_ERA17_BACKLOG_ID,
  COSTING_PILOT_SPOTCHECK_ERA17_FORBIDDEN_CLAIMS,
  COSTING_PILOT_SPOTCHECK_ERA17_POLICY_ID,
  COSTING_PILOT_SPOTCHECK_ERA17_PROOF_STATUS,
  COSTING_PILOT_SPOTCHECK_ERA17_REQUIRED_PERMISSION,
} from "@/lib/costing/costing-pilot-spotcheck-era17-policy";

describe("costing pilot spotcheck era17 policy", () => {
  it("locks era17 costing pilot spotcheck policy id", () => {
    expect(COSTING_PILOT_SPOTCHECK_ERA17_POLICY_ID).toBe(
      "era17-costing-pilot-spotcheck-v1",
    );
    expect(COSTING_PILOT_SPOTCHECK_ERA17_PROOF_STATUS).toBe(
      "pilot_menu_margin_spotcheck_documented",
    );
    expect(COSTING_PILOT_SPOTCHECK_ERA17_BACKLOG_ID).toBe("KOS-E17-030");
    expect(COSTING_PILOT_SPOTCHECK_ERA17_REQUIRED_PERMISSION).toBe(
      "reports.read.financial",
    );
  });

  it("forbids accountant-certified costing claims", () => {
    expect(COSTING_PILOT_SPOTCHECK_ERA17_FORBIDDEN_CLAIMS).toContain(
      "accountant-certified food cost",
    );
  });
});
