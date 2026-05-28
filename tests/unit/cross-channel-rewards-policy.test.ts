import { describe, expect, it } from "vitest";

import {
  CROSS_CHANNEL_REWARDS_GTM_LOCK_ID,
  CROSS_CHANNEL_REWARDS_POLICY_ID,
  CROSS_CHANNEL_REWARDS_UNIFIED_CLAIM_ALLOWED,
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

  it("locks era6 permanent dual-ledger GTM decision", () => {
    expect(CROSS_CHANNEL_REWARDS_GTM_LOCK_ID).toBe("era6-dual-ledger-gtm-lock-v1");
    expect(CROSS_CHANNEL_REWARDS_UNIFIED_CLAIM_ALLOWED).toBe(false);
  });
});
