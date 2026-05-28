import { describe, expect, it } from "vitest";

import {
  POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_BACKLOG_ID,
  POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_EDGE_CASES,
  POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_POLICY_ID,
  POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_PROOF_STATUS,
} from "@/lib/pos/pos-receipt-shift-spotcheck-era17-policy";

describe("POS receipt shift spotcheck era17 policy", () => {
  it("locks policy id and proof status", () => {
    expect(POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_POLICY_ID).toBe(
      "era17-pos-receipt-shift-spotcheck-v1",
    );
    expect(POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_PROOF_STATUS).toBe(
      "closeout_math_spotcheck_documented",
    );
    expect(POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_BACKLOG_ID).toBe("KOS-E17-025");
  });

  it("documents closeout edge cases", () => {
    expect(POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_EDGE_CASES.join(" ")).toMatch(/CASH/i);
    expect(POS_RECEIPT_SHIFT_SPOTCHECK_ERA17_EDGE_CASES.join(" ")).toMatch(/variance/i);
  });
});
