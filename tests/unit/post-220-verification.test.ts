import { describe, expect, it } from "vitest";

import { auditPost220Verification } from "@/lib/execution/audit-post-220-verification";
import { POST_220_VERIFICATION_POLICY_ID } from "@/lib/execution/post-220-verification-policy";

describe("POST-220 program verification", () => {
  it("certifies 220/220 closure and surfaces P0/GO as next ops", () => {
    const report = auditPost220Verification();
    expect(report.policyId).toBe(POST_220_VERIFICATION_POLICY_ID);
    expect(report.programClosurePassed).toBe(true);
    expect(report.canonicalSlotsDone).toBe(220);
    expect(report.trackerDoneCount).toBe(report.trackerTotalCount);
    expect(report.ready).toBe(false);
    expect(report.goDecision).toBe("NO-GO");
    expect(report.passed).toBe(true);
    expect(report.nextOpsPriority).toContain("QA-01");
  });
});
