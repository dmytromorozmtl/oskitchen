import { expect, test } from "@playwright/test";

import {
  LOYALTY_EARN_REDEEM_E2E_FLOW_STEPS,
  LOYALTY_EARN_REDEEM_E2E_POLICY_ID,
  LOYALTY_EARN_REDEEM_E2E_REDEEM_POINTS,
  LOYALTY_BALANCE_TEST_ID,
  LOYALTY_REDEEM_INPUT_TEST_ID,
} from "@/lib/loyalty/loyalty-earn-redeem-e2e-policy";
import { redeemDiscountFromPoints } from "@/services/loyalty/loyalty-service";

import { runLoyaltyEarnRedeemE2EFlow } from "./helpers/loyalty-earn-redeem-e2e-flow";
import {
  skipLoyaltyEarnRedeemE2EIfGateDisabled,
  skipLoyaltyEarnRedeemE2EIfNoDb,
  skipLoyaltyEarnRedeemE2EIfNotAuthed,
} from "./helpers/loyalty-earn-redeem-e2e-ready";

/**
 * Loyalty earn/redeem E2E — POS checkout earn → redeem → balance updated.
 *
 * @see e2e/restaurant-loyalty.spec.ts
 * @see e2e/pos-checkout-e2e.spec.ts
 */

test.describe("loyalty earn/redeem e2e policy", () => {
  test("exports five-step earn redeem flow", () => {
    expect(LOYALTY_EARN_REDEEM_E2E_POLICY_ID).toBe("loyalty-earn-redeem-e2e-p2-31-v1");
    expect(LOYALTY_EARN_REDEEM_E2E_FLOW_STEPS).toEqual([
      "seed_customer",
      "place_order_earn",
      "verify_crm_points",
      "redeem_next_order",
      "verify_balance_updated",
    ]);
    expect(LOYALTY_REDEEM_INPUT_TEST_ID).toBe("pos-loyalty-redeem-input");
    expect(LOYALTY_BALANCE_TEST_ID).toBe("pos-loyalty-balance");
  });

  test("redeem discount math matches program threshold", () => {
    const discount = redeemDiscountFromPoints(LOYALTY_EARN_REDEEM_E2E_REDEEM_POINTS, {
      redeemPointsThreshold: 100,
      redeemValueCents: 500,
    });
    expect(discount).toBe(5);
  });
});

test.describe("loyalty earn/redeem e2e (chromium-authed)", () => {
  test.beforeEach(({ }, testInfo) => {
    test.skip(
      testInfo.project.name !== "chromium-authed",
      "Loyalty earn/redeem E2E runs in chromium-authed project only",
    );
    skipLoyaltyEarnRedeemE2EIfGateDisabled();
    skipLoyaltyEarnRedeemE2EIfNotAuthed();
    skipLoyaltyEarnRedeemE2EIfNoDb();
  });

  test("earn points redeem at checkout balance updated", async ({ page }) => {
    const result = await runLoyaltyEarnRedeemE2EFlow(page);
    expect(result.steps).toEqual(LOYALTY_EARN_REDEEM_E2E_FLOW_STEPS);
    expect(result.balanceAfterEarn).toBeGreaterThanOrEqual(LOYALTY_EARN_REDEEM_E2E_REDEEM_POINTS);
    expect(result.balanceAfterRedeem).toBeLessThan(result.balanceAfterEarn);
  });
});
