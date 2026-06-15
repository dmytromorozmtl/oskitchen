import { describe, expect, it } from "vitest";

import {
  CROSS_CHANNEL_REWARDS_ERA10_POLICY_ID,
  CROSS_CHANNEL_REWARDS_ERA10_POS_CERTIFIED,
  CROSS_CHANNEL_REWARDS_ERA10_SCHEMA_MODELS,
} from "@/lib/rewards/cross-channel-rewards-era10-policy";

describe("cross-channel rewards era10 policy", () => {
  it("locks era10 cross-channel rewards recert policy", () => {
    expect(CROSS_CHANNEL_REWARDS_ERA10_POLICY_ID).toBe(
      "era10-cross-channel-rewards-recert-v1",
    );
    expect(CROSS_CHANNEL_REWARDS_ERA10_POS_CERTIFIED.length).toBe(3);
    expect(CROSS_CHANNEL_REWARDS_ERA10_SCHEMA_MODELS.length).toBe(4);
  });
});
