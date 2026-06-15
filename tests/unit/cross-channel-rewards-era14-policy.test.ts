import { describe, expect, it } from "vitest";

import {
  CROSS_CHANNEL_REWARDS_ERA14_POLICY_ID,
  CROSS_CHANNEL_REWARDS_ERA14_UNIFICATION_STATUS,
  CROSS_CHANNEL_REWARDS_ERA14_UNIFIED_PLAYWRIGHT_E2E,
} from "@/lib/rewards/cross-channel-rewards-era14-policy";

describe("cross-channel rewards era14 policy", () => {
  it("locks era14 cross-channel rewards recert policy id", () => {
    expect(CROSS_CHANNEL_REWARDS_ERA14_POLICY_ID).toBe(
      "era14-cross-channel-rewards-recert-v1",
    );
    expect(CROSS_CHANNEL_REWARDS_ERA14_UNIFICATION_STATUS).toBe("deferred_locked");
  });

  it("does not claim unified cross-channel playwright e2e", () => {
    expect(CROSS_CHANNEL_REWARDS_ERA14_UNIFIED_PLAYWRIGHT_E2E.certified).toBe(false);
    expect(CROSS_CHANNEL_REWARDS_ERA14_UNIFIED_PLAYWRIGHT_E2E.inDefaultCi).toBe(false);
  });
});
