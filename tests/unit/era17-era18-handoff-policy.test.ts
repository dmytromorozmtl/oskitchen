import { describe, expect, it } from "vitest";

import {
  ERA17_ERA18_HANDOFF_BACKLOG_ID,
  ERA17_ERA18_HANDOFF_BLENDED_SCORE,
  ERA17_ERA18_HANDOFF_DOC,
  ERA17_ERA18_HANDOFF_ERA18_THEME,
  ERA17_ERA18_HANDOFF_ERA17_STATUS,
  ERA17_ERA18_HANDOFF_GOVERNANCE_SCORE,
  ERA17_ERA18_HANDOFF_POLICY_ID,
  ERA17_ERA18_HANDOFF_P0_CARRY_FORWARD,
  ERA17_ERA18_HANDOFF_REAUDIT_DECISION,
  ERA17_ERA18_HANDOFF_SUCCESS_CRITERIA_MET,
} from "@/lib/governance/era17-era18-handoff-policy";

describe("era17 era18 handoff policy", () => {
  it("locks era17 era18 handoff policy id", () => {
    expect(ERA17_ERA18_HANDOFF_POLICY_ID).toBe("era17-era18-handoff-input-v1");
  });

  it("documents era17 complete with p0 ops proof still blocked", () => {
    expect(ERA17_ERA18_HANDOFF_ERA17_STATUS).toBe("era17_complete_awaiting_p0_ops_proof");
    expect(ERA17_ERA18_HANDOFF_SUCCESS_CRITERIA_MET).toBe(false);
    expect(ERA17_ERA18_HANDOFF_ERA18_THEME).toBe("staging_proof_and_first_paid_pilot");
    expect(ERA17_ERA18_HANDOFF_DOC).toBe("docs/next-master-prompt-input-2026-05-28-era18.md");
    expect(ERA17_ERA18_HANDOFF_BACKLOG_ID).toBe("KOS-E17-038");
  });

  it("carries forward five p0 items and honest scores", () => {
    expect(ERA17_ERA18_HANDOFF_P0_CARRY_FORWARD).toHaveLength(5);
    expect(ERA17_ERA18_HANDOFF_GOVERNANCE_SCORE).toBe(100);
    expect(ERA17_ERA18_HANDOFF_BLENDED_SCORE).toBe(89);
    expect(ERA17_ERA18_HANDOFF_REAUDIT_DECISION.fullReauditRequiredAtEra18Start).toBe(false);
  });
});
