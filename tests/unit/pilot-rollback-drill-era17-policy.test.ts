import { describe, expect, it } from "vitest";

import {
  PILOT_ROLLBACK_DRILL_ERA17_POLICY_ID,
  PILOT_ROLLBACK_DRILL_ERA17_PROOF_STATUS,
} from "@/lib/commercial/pilot-rollback-drill-era17-policy";

describe("pilot rollback drill era17 policy", () => {
  it("locks era17 pilot rollback drill policy id", () => {
    expect(PILOT_ROLLBACK_DRILL_ERA17_POLICY_ID).toBe("era17-pilot-rollback-drill-v1");
  });

  it("does not claim rollback drill without operator evidence", () => {
    expect(PILOT_ROLLBACK_DRILL_ERA17_PROOF_STATUS).toBe("awaiting_rollback_drill_execution");
  });
});
