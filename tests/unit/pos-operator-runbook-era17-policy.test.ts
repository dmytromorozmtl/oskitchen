import { describe, expect, it } from "vitest";

import {
  POS_OPERATOR_RUNBOOK_ERA17_BACKLOG_ID,
  POS_OPERATOR_RUNBOOK_ERA17_GOLDEN_PATH_STEPS,
  POS_OPERATOR_RUNBOOK_ERA17_POLICY_ID,
  POS_OPERATOR_RUNBOOK_ERA17_PROOF_STATUS,
} from "@/lib/pos/pos-operator-runbook-era17-policy";

describe("POS operator runbook era17 policy", () => {
  it("locks policy id and proof status", () => {
    expect(POS_OPERATOR_RUNBOOK_ERA17_POLICY_ID).toBe("era17-pos-operator-runbook-v1");
    expect(POS_OPERATOR_RUNBOOK_ERA17_PROOF_STATUS).toBe("operator_runbook_ready");
    expect(POS_OPERATOR_RUNBOOK_ERA17_BACKLOG_ID).toBe("KOS-E17-024");
  });

  it("defines golden path steps for daily counter service", () => {
    expect(POS_OPERATOR_RUNBOOK_ERA17_GOLDEN_PATH_STEPS.length).toBeGreaterThanOrEqual(7);
    expect(POS_OPERATOR_RUNBOOK_ERA17_GOLDEN_PATH_STEPS.join(" ")).toMatch(/shift/i);
    expect(POS_OPERATOR_RUNBOOK_ERA17_GOLDEN_PATH_STEPS.join(" ")).toMatch(/receipt/i);
  });
});
