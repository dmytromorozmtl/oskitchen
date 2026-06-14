import type { GiftCardStatus } from "@prisma/client";

export type GiftCardRegressionStep =
  | { type: "issue"; amount: number; code?: string }
  | { type: "assert_balance"; balance: number; status: GiftCardStatus }
  | {
      type: "redeem";
      amount: number;
      applied: number;
      remainingBalance: number;
      status: GiftCardStatus;
    }
  | { type: "redeem_expect_error"; amount: number; errorIncludes: string };

export type GiftCardRegressionScenarioP270 = {
  id: string;
  label: string;
  steps: GiftCardRegressionStep[];
};

export function buildGiftCardRegressionCorpusP270(): GiftCardRegressionScenarioP270[] {
  return [
    {
      id: "gc-01-partial-then-remaining",
      label: "Issue → partial redeem → balance → redeem remaining",
      steps: [
        { type: "issue", amount: 100, code: "GC100" },
        { type: "assert_balance", balance: 100, status: "ACTIVE" },
        { type: "redeem", amount: 35, applied: 35, remainingBalance: 65, status: "PARTIALLY_REDEEMED" },
        { type: "assert_balance", balance: 65, status: "PARTIALLY_REDEEMED" },
        { type: "redeem", amount: 65, applied: 65, remainingBalance: 0, status: "REDEEMED" },
        { type: "assert_balance", balance: 0, status: "REDEEMED" },
      ],
    },
    {
      id: "gc-02-single-full-redeem",
      label: "Issue → full redeem in one step",
      steps: [
        { type: "issue", amount: 50 },
        { type: "assert_balance", balance: 50, status: "ACTIVE" },
        { type: "redeem", amount: 50, applied: 50, remainingBalance: 0, status: "REDEEMED" },
      ],
    },
    {
      id: "gc-03-over-redeem-clamped",
      label: "Redeem above balance clamps to available",
      steps: [
        { type: "issue", amount: 80 },
        { type: "redeem", amount: 150, applied: 80, remainingBalance: 0, status: "REDEEMED" },
      ],
    },
    {
      id: "gc-04-triple-partial",
      label: "Three partial redemptions drain balance",
      steps: [
        { type: "issue", amount: 100 },
        { type: "redeem", amount: 25, applied: 25, remainingBalance: 75, status: "PARTIALLY_REDEEMED" },
        { type: "redeem", amount: 25, applied: 25, remainingBalance: 50, status: "PARTIALLY_REDEEMED" },
        { type: "redeem", amount: 50, applied: 50, remainingBalance: 0, status: "REDEEMED" },
      ],
    },
    {
      id: "gc-05-small-partial",
      label: "Small partial then remaining on low denomination",
      steps: [
        { type: "issue", amount: 10 },
        { type: "redeem", amount: 3, applied: 3, remainingBalance: 7, status: "PARTIALLY_REDEEMED" },
        { type: "assert_balance", balance: 7, status: "PARTIALLY_REDEEMED" },
        { type: "redeem", amount: 7, applied: 7, remainingBalance: 0, status: "REDEEMED" },
      ],
    },
    {
      id: "gc-06-redeemed-card-blocked",
      label: "Fully redeemed card rejects further redemption",
      steps: [
        { type: "issue", amount: 20 },
        { type: "redeem", amount: 20, applied: 20, remainingBalance: 0, status: "REDEEMED" },
        { type: "redeem_expect_error", amount: 5, errorIncludes: "inactive" },
      ],
    },
    {
      id: "gc-07-partial-over-request",
      label: "Partial redeem with request above balance clamps",
      steps: [
        { type: "issue", amount: 60 },
        { type: "redeem", amount: 40, applied: 40, remainingBalance: 20, status: "PARTIALLY_REDEEMED" },
        { type: "redeem", amount: 999, applied: 20, remainingBalance: 0, status: "REDEEMED" },
      ],
    },
    {
      id: "gc-08-custom-code",
      label: "Custom code preserved through partial redemption chain",
      steps: [
        { type: "issue", amount: 75, code: "HOLIDAY75" },
        { type: "assert_balance", balance: 75, status: "ACTIVE" },
        { type: "redeem", amount: 30, applied: 30, remainingBalance: 45, status: "PARTIALLY_REDEEMED" },
        { type: "redeem", amount: 45, applied: 45, remainingBalance: 0, status: "REDEEMED" },
      ],
    },
  ];
}
