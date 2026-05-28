import { describe, expect, it } from "vitest";

import {
  ERA20_POS_MONEY_PATH_FLOW_PROOF_BACKLOG_ID,
  ERA20_POS_MONEY_PATH_FLOW_PROOF_CI_SCRIPTS,
  ERA20_POS_MONEY_PATH_FLOW_PROOF_HOP_IDS,
  ERA20_POS_MONEY_PATH_FLOW_PROOF_POLICY_ID,
} from "@/lib/commercial/era20-pos-money-path-flow-proof-era20-policy";

describe("era20-pos-money-path-flow-proof-cert-live", () => {
  it("locks era20 POS money path cert bundle", () => {
    expect(ERA20_POS_MONEY_PATH_FLOW_PROOF_POLICY_ID).toBe("era20-pos-money-path-flow-proof-v1");
    expect(ERA20_POS_MONEY_PATH_FLOW_PROOF_BACKLOG_ID).toBe("KOS-E20-012");
    expect(ERA20_POS_MONEY_PATH_FLOW_PROOF_HOP_IDS).toHaveLength(5);
    expect(ERA20_POS_MONEY_PATH_FLOW_PROOF_CI_SCRIPTS).toContain(
      "test:ci:era20-pos-money-path-flow-proof",
    );
  });
});
