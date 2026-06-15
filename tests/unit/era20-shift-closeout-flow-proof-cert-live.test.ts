import { describe, expect, it } from "vitest";

import {
  ERA20_SHIFT_CLOSEOUT_FLOW_PROOF_BACKLOG_ID,
  ERA20_SHIFT_CLOSEOUT_FLOW_PROOF_CI_SCRIPTS,
  ERA20_SHIFT_CLOSEOUT_FLOW_PROOF_HOP_IDS,
} from "@/lib/commercial/era20-shift-closeout-flow-proof-era20-policy";

describe("era20-shift-closeout-flow-proof-cert-live", () => {
  it("locks cert bundle", () => {
    expect(ERA20_SHIFT_CLOSEOUT_FLOW_PROOF_BACKLOG_ID).toBe("KOS-E20-016");
    expect(ERA20_SHIFT_CLOSEOUT_FLOW_PROOF_HOP_IDS).toHaveLength(5);
    expect(ERA20_SHIFT_CLOSEOUT_FLOW_PROOF_CI_SCRIPTS).toContain(
      "test:ci:era20-shift-closeout-flow-proof",
    );
  });
});
