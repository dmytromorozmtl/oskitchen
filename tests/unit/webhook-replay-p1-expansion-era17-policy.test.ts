import { describe, expect, it } from "vitest";

import {
  WEBHOOK_REPLAY_P1_EXPANSION_ERA17_EXPANDED_ROUTES,
  WEBHOOK_REPLAY_P1_EXPANSION_ERA17_POLICY_ID,
  WEBHOOK_REPLAY_P1_EXPANSION_ERA17_PROOF_STATUS,
} from "@/lib/security/webhook-replay-p1-expansion-era17-policy";

describe("webhook replay p1 expansion era17 policy", () => {
  it("locks era17 webhook replay p1 expansion policy id", () => {
    expect(WEBHOOK_REPLAY_P1_EXPANSION_ERA17_POLICY_ID).toBe(
      "era17-webhook-replay-p1-expansion-v1",
    );
  });

  it("expands two matrix P1 routes", () => {
    expect(WEBHOOK_REPLAY_P1_EXPANSION_ERA17_EXPANDED_ROUTES).toHaveLength(2);
    expect(WEBHOOK_REPLAY_P1_EXPANSION_ERA17_PROOF_STATUS).toBe(
      "p1_ingress_dedupe_expanded",
    );
  });
});
