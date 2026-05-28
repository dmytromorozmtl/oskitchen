import { describe, expect, it } from "vitest";

import {
  CROSS_CHANNEL_REWARDS_POLICY_ID,
  POS_REWARDS_CHECKOUT_CERTIFIED,
  STOREFRONT_REWARDS_HONEST_SCOPE,
} from "@/lib/rewards/cross-channel-rewards-policy";

describe("cross-channel rewards policy", () => {
  it("locks era4 cross-channel rewards honesty policy", () => {
    expect(CROSS_CHANNEL_REWARDS_POLICY_ID).toBe("era4-cross-channel-rewards-v1");
    expect(POS_REWARDS_CHECKOUT_CERTIFIED.giftCardRedeem).toBe(true);
    expect(STOREFRONT_REWARDS_HONEST_SCOPE.separateGiftCardTable).toBe(true);
    expect(STOREFRONT_REWARDS_HONEST_SCOPE.posCodesValidOnStorefront).toBe(false);
  });
});
