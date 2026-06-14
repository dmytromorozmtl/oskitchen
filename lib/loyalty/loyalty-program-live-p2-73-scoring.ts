import { LOYALTY_PROGRAM_LIVE_P2_73_SCENARIO_COUNT } from "@/lib/loyalty/loyalty-program-live-p2-73-policy";
import {
  earnPosLoyaltyPoints,
  earnStorefrontLoyaltyPoints,
  redeemPosLoyaltyPoints,
  redeemStorefrontLoyaltyPoints,
  type LoyaltyAccountSim,
} from "@/lib/loyalty/loyalty-program-live-p2-73-flow";

export type LoyaltyProgramLiveScenarioP273 = {
  id: string;
  channel: "pos" | "storefront";
  label: string;
  run: () => { passed: boolean; message?: string };
};

function scenario(
  id: string,
  channel: "pos" | "storefront",
  label: string,
  run: () => { passed: boolean; message?: string },
): LoyaltyProgramLiveScenarioP273 {
  return { id, channel, label, run };
}

export function buildLoyaltyProgramLiveCorpusP273(): LoyaltyProgramLiveScenarioP273[] {
  return [
    scenario("lp-01-pos-earn-redeem", "pos", "POS earn → redeem on next order", () => {
      let account: LoyaltyAccountSim = { balance: 0 };
      account = earnPosLoyaltyPoints(account, 50);
      if (account.balance !== 500) {
        return { passed: false, message: `Expected 500 pts, got ${account.balance}` };
      }
      const redeem = redeemPosLoyaltyPoints(account, 100);
      if ("error" in redeem) return { passed: false, message: redeem.error };
      if (redeem.account.balance !== 400 || redeem.discount !== 1) {
        return {
          passed: false,
          message: `Expected balance 400 / $1 discount, got ${redeem.account.balance} / ${redeem.discount}`,
        };
      }
      return { passed: true };
    }),
    scenario("lp-02-pos-insufficient", "pos", "POS redeem blocked when insufficient", () => {
      const account: LoyaltyAccountSim = { balance: 50 };
      const redeem = redeemPosLoyaltyPoints(account, 100);
      if (!("error" in redeem)) return { passed: false, message: "Expected insufficient error" };
      return { passed: true };
    }),
    scenario("lp-03-storefront-earn-apply", "storefront", "Storefront earn → apply at checkout", () => {
      let account: LoyaltyAccountSim = { balance: 0 };
      account = earnStorefrontLoyaltyPoints(account, 25);
      if (account.balance !== 250) {
        return { passed: false, message: `Expected 250 pts, got ${account.balance}` };
      }
      const redeem = redeemStorefrontLoyaltyPoints(account, 200);
      if ("error" in redeem) return { passed: false, message: redeem.error };
      if (redeem.pointsUsed !== 200 || redeem.creditAmount !== 2) {
        return { passed: false, message: "Unexpected storefront redeem quote" };
      }
      if (redeem.account.balance !== 50) {
        return { passed: false, message: `Expected balance 50, got ${redeem.account.balance}` };
      }
      return { passed: true };
    }),
    scenario("lp-04-storefront-min-block", "storefront", "Storefront below minimum redeem blocked", () => {
      const account: LoyaltyAccountSim = { balance: 80 };
      const redeem = redeemStorefrontLoyaltyPoints(account, 80);
      if (!("error" in redeem)) return { passed: false, message: "Expected minimum points error" };
      return { passed: true };
    }),
    scenario("lp-05-pos-multi-earn", "pos", "POS multi-order earn accumulation", () => {
      let account: LoyaltyAccountSim = { balance: 0 };
      account = earnPosLoyaltyPoints(account, 10);
      account = earnPosLoyaltyPoints(account, 15);
      if (account.balance !== 250) {
        return { passed: false, message: `Expected 250 pts, got ${account.balance}` };
      }
      return { passed: true };
    }),
    scenario("lp-06-full-chain-crm", "pos", "Full chain: order → CRM balance → apply next", () => {
      let account: LoyaltyAccountSim = { balance: 0 };
      account = earnPosLoyaltyPoints(account, 30);
      const crmBalance = account.balance;
      if (crmBalance !== 300) return { passed: false, message: "CRM balance mismatch" };
      const redeem = redeemPosLoyaltyPoints(account, 100);
      if ("error" in redeem) return { passed: false, message: redeem.error };
      if (redeem.account.balance !== 200) {
        return { passed: false, message: "Balance not updated after apply" };
      }
      return { passed: true };
    }),
  ];
}

export type LoyaltyProgramLiveBenchmarkP273Result = {
  scenarioCount: number;
  passedCount: number;
  passPct: number;
  passed: boolean;
  scenarioScores: Array<{ scenarioId: string; passed: boolean; message?: string }>;
};

export function runLoyaltyProgramLiveBenchmarkP273(
  scenarios: LoyaltyProgramLiveScenarioP273[] = buildLoyaltyProgramLiveCorpusP273(),
): LoyaltyProgramLiveBenchmarkP273Result {
  const scenarioScores = scenarios.map((scenarioItem) => {
    const outcome = scenarioItem.run();
    return {
      scenarioId: scenarioItem.id,
      passed: outcome.passed,
      message: outcome.message,
    };
  });
  const passedCount = scenarioScores.filter((score) => score.passed).length;
  const passPct =
    scenarios.length === 0 ? 0 : Math.round((passedCount / scenarios.length) * 100);

  return {
    scenarioCount: scenarios.length,
    passedCount,
    passPct,
    passed:
      scenarios.length === LOYALTY_PROGRAM_LIVE_P2_73_SCENARIO_COUNT && passedCount === scenarios.length,
    scenarioScores,
  };
}

export function buildDegradedLoyaltyProgramLiveP273Scenarios(
  scenarios: LoyaltyProgramLiveScenarioP273[] = buildLoyaltyProgramLiveCorpusP273(),
): LoyaltyProgramLiveScenarioP273[] {
  return scenarios.map((scenarioItem, index) =>
    index === 0
      ? {
          ...scenarioItem,
          run: () => ({ passed: false, message: "Degraded scenario" }),
        }
      : scenarioItem,
  );
}
