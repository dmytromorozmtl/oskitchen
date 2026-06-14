import {
  COPILOT_HALLUCINATION_REGRESSION_P2_71_MAX_HALLUCINATION_PCT,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_MIN_PASS_PCT,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_OPERATIONAL_COUNT,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_SCENARIO_COUNT,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_TRAP_COUNT,
} from "@/lib/ai/copilot-hallucination-regression-p2-71-policy";
import {
  buildCopilotHallucinationCorpusP271,
  type CopilotHallucinationScenarioP271,
} from "@/lib/ai/copilot-hallucination-regression-p2-71-corpus";
import { detectCopilotHallucinationRegression } from "@/lib/ai/copilot-hallucination-regression-p2-71-patterns";
import { answerCopilotQuestionFromSnapshot } from "@/lib/ai/copilot-accuracy-benchmark-p2-69-builder";
import { buildDeterministicInsightsFromOverview } from "@/lib/ai/deterministic-insights-from-overview";

export type CopilotHallucinationScenarioScoreP271 = {
  scenarioId: string;
  passed: boolean;
  hallucinationDetected: boolean;
  grounded: boolean;
  missingKeywords: string[];
  safeFallbackOk: boolean;
};

export type CopilotHallucinationRegressionP271Result = {
  scenarioCount: number;
  operationalCount: number;
  trapCount: number;
  passPct: number;
  hallucinationPct: number;
  passed: boolean;
  scenarioScores: CopilotHallucinationScenarioScoreP271[];
};

function answerBodyForHallucinationCheck(answer: string): string {
  const marker = "Your question:";
  const idx = answer.indexOf(marker);
  return idx === -1 ? answer : answer.slice(0, idx);
}

function scoreScenario(
  scenario: CopilotHallucinationScenarioP271,
): CopilotHallucinationScenarioScoreP271 {
  const snapshot = buildDeterministicInsightsFromOverview(scenario.overview);
  const result = answerCopilotQuestionFromSnapshot(scenario.question, snapshot);
  const answerLower = result.answer.toLowerCase();

  const missingKeywords = scenario.expectedKeywords.filter(
    (keyword) => !answerLower.includes(keyword.toLowerCase()),
  );

  const hallucinationDetected = detectCopilotHallucinationRegression(
    answerBodyForHallucinationCheck(result.answer),
  );

  let safeFallbackOk = true;
  if (scenario.safeFallback) {
    safeFallbackOk = answerLower.includes("scoped workspace");
  }

  let contentPassed = missingKeywords.length === 0;
  if (scenario.expectedSourceType) {
    contentPassed = contentPassed && result.sourceTypes.includes(scenario.expectedSourceType);
  }

  const passed =
    result.grounded && !hallucinationDetected && contentPassed && safeFallbackOk;

  return {
    scenarioId: scenario.id,
    passed,
    hallucinationDetected,
    grounded: result.grounded,
    missingKeywords,
    safeFallbackOk,
  };
}

export function runCopilotHallucinationRegressionP271(
  scenarios: CopilotHallucinationScenarioP271[] = buildCopilotHallucinationCorpusP271(),
): CopilotHallucinationRegressionP271Result {
  const scenarioScores = scenarios.map(scoreScenario);
  const passedCount = scenarioScores.filter((score) => score.passed).length;
  const passPct =
    scenarios.length === 0 ? 0 : Math.round((passedCount / scenarios.length) * 100);

  const hallucinationCount = scenarioScores.filter((score) => score.hallucinationDetected).length;
  const hallucinationPct =
    scenarios.length === 0 ? 100 : Math.round((hallucinationCount / scenarios.length) * 100);

  const operationalCount = scenarios.filter((s) => !s.safeFallback).length;
  const trapCount = scenarios.filter((s) => s.safeFallback).length;

  const passed =
    scenarios.length === COPILOT_HALLUCINATION_REGRESSION_P2_71_SCENARIO_COUNT &&
    operationalCount === COPILOT_HALLUCINATION_REGRESSION_P2_71_OPERATIONAL_COUNT &&
    trapCount === COPILOT_HALLUCINATION_REGRESSION_P2_71_TRAP_COUNT &&
    passPct >= COPILOT_HALLUCINATION_REGRESSION_P2_71_MIN_PASS_PCT &&
    hallucinationPct <= COPILOT_HALLUCINATION_REGRESSION_P2_71_MAX_HALLUCINATION_PCT;

  return {
    scenarioCount: scenarios.length,
    operationalCount,
    trapCount,
    passPct,
    hallucinationPct,
    passed,
    scenarioScores,
  };
}

export function buildDegradedCopilotHallucinationP271Scenarios(
  scenarios: CopilotHallucinationScenarioP271[] = buildCopilotHallucinationCorpusP271(),
): CopilotHallucinationScenarioP271[] {
  return scenarios.map((scenario, index) =>
    index === 0
      ? { ...scenario, expectedKeywords: [...scenario.expectedKeywords, "fabricated_claim_xyz"] }
      : scenario,
  );
}
