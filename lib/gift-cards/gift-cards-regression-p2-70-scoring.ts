import {
  GIFT_CARDS_REGRESSION_P2_70_SCENARIO_COUNT,
} from "@/lib/gift-cards/gift-cards-regression-p2-70-policy";
import {
  buildGiftCardRegressionCorpusP270,
  type GiftCardRegressionScenarioP270,
  type GiftCardRegressionStep,
} from "@/lib/gift-cards/gift-cards-regression-p2-70-corpus";
import {
  issueGiftCardSim,
  redeemGiftCardSim,
  type SimGiftCard,
} from "@/lib/gift-cards/gift-cards-regression-p2-70-flow";

export type GiftCardRegressionScenarioScoreP270 = {
  scenarioId: string;
  passed: boolean;
  failedStep?: string;
  message?: string;
};

export type GiftCardRegressionBenchmarkP270Result = {
  scenarioCount: number;
  passedCount: number;
  passPct: number;
  passed: boolean;
  scenarioScores: GiftCardRegressionScenarioScoreP270[];
};

function runStep(
  card: SimGiftCard | null,
  step: GiftCardRegressionStep,
): { card: SimGiftCard | null; error?: string } {
  if (step.type === "issue") {
    return { card: issueGiftCardSim({ amount: step.amount, code: step.code }) };
  }

  if (!card) {
    return { card: null, error: "No card issued before step" };
  }

  if (step.type === "assert_balance") {
    if (card.balance !== step.balance || card.status !== step.status) {
      return {
        card,
        error: `Expected balance ${step.balance} / ${step.status}, got ${card.balance} / ${card.status}`,
      };
    }
    return { card };
  }

  if (step.type === "redeem_expect_error") {
    const result = redeemGiftCardSim(card, step.amount);
    if (result.ok) {
      return { card, error: "Expected redeem error but succeeded" };
    }
    if (!result.error.toLowerCase().includes(step.errorIncludes.toLowerCase())) {
      return {
        card,
        error: `Expected error containing "${step.errorIncludes}", got "${result.error}"`,
      };
    }
    return { card };
  }

  const result = redeemGiftCardSim(card, step.amount);
  if (!result.ok) {
    return { card, error: result.error };
  }

  if (
    result.applied !== step.applied ||
    result.remainingBalance !== step.remainingBalance ||
    result.card.status !== step.status
  ) {
    return {
      card: result.card,
      error: `Redeem mismatch: applied ${result.applied} (exp ${step.applied}), remaining ${result.remainingBalance} (exp ${step.remainingBalance}), status ${result.card.status} (exp ${step.status})`,
    };
  }

  return { card: result.card };
}

export function runGiftCardRegressionScenarioP270(
  scenario: GiftCardRegressionScenarioP270,
): GiftCardRegressionScenarioScoreP270 {
  let card: SimGiftCard | null = null;

  for (const step of scenario.steps) {
    const outcome = runStep(card, step);
    card = outcome.card;
    if (outcome.error) {
      return {
        scenarioId: scenario.id,
        passed: false,
        failedStep: step.type,
        message: outcome.error,
      };
    }
  }

  return { scenarioId: scenario.id, passed: true };
}

export function runGiftCardRegressionBenchmarkP270(
  scenarios: GiftCardRegressionScenarioP270[] = buildGiftCardRegressionCorpusP270(),
): GiftCardRegressionBenchmarkP270Result {
  const scenarioScores = scenarios.map(runGiftCardRegressionScenarioP270);
  const passedCount = scenarioScores.filter((score) => score.passed).length;
  const passPct =
    scenarios.length === 0 ? 0 : Math.round((passedCount / scenarios.length) * 100);

  return {
    scenarioCount: scenarios.length,
    passedCount,
    passPct,
    passed:
      scenarios.length >= GIFT_CARDS_REGRESSION_P2_70_SCENARIO_COUNT && passedCount === scenarios.length,
    scenarioScores,
  };
}

export function buildDegradedGiftCardRegressionP270Scenarios(
  scenarios: GiftCardRegressionScenarioP270[] = buildGiftCardRegressionCorpusP270(),
): GiftCardRegressionScenarioP270[] {
  return scenarios.map((scenario, index) =>
    index === 0
      ? {
          ...scenario,
          steps: scenario.steps.map((step) =>
            step.type === "redeem" ? { ...step, applied: step.applied + 1 } : step,
          ),
        }
      : scenario,
  );
}
