import {
  COPILOT_ACCURACY_BENCHMARK_P2_69_MAX_HALLUCINATION_PCT,
  COPILOT_ACCURACY_BENCHMARK_P2_69_MIN_ACCURACY_PCT,
  COPILOT_ACCURACY_BENCHMARK_P2_69_SCENARIO_COUNT,
} from "@/lib/ai/copilot-accuracy-benchmark-p2-69-policy";
import {
  answerCopilotQuestionFromSnapshot,
  detectCopilotAnswerHallucination,
} from "@/lib/ai/copilot-accuracy-benchmark-p2-69-builder";
import {
  buildCopilotAccuracyCorpusP269,
  type CopilotAccuracyScenarioP269,
} from "@/lib/ai/copilot-accuracy-benchmark-p2-69-corpus";
import { buildDeterministicInsightsFromOverview } from "@/lib/ai/deterministic-insights-from-overview";

export type CopilotAccuracyScenarioScoreP269 = {
  scenarioId: string;
  accuracyPassed: boolean;
  hallucinationDetected: boolean;
  missingKeywords: string[];
};

export type CopilotAccuracyBenchmarkP269Result = {
  scenarioCount: number;
  answerAccuracyPct: number;
  hallucinationPct: number;
  passed: boolean;
  thresholdAccuracyPct: number;
  maxHallucinationPct: number;
  scenarioScores: CopilotAccuracyScenarioScoreP269[];
};

function scoreScenario(scenario: CopilotAccuracyScenarioP269): CopilotAccuracyScenarioScoreP269 {
  const snapshot = buildDeterministicInsightsFromOverview(scenario.overview);
  const result = answerCopilotQuestionFromSnapshot(scenario.question, snapshot);
  const answerLower = result.answer.toLowerCase();

  const missingKeywords = scenario.expectedKeywords.filter(
    (keyword) => !answerLower.includes(keyword.toLowerCase()),
  );

  let accuracyPassed = missingKeywords.length === 0 && result.grounded;

  if (scenario.expectedSourceType) {
    accuracyPassed =
      accuracyPassed && result.sourceTypes.includes(scenario.expectedSourceType);
  }

  const hallucinationDetected = detectCopilotAnswerHallucination(result.answer);

  return {
    scenarioId: scenario.id,
    accuracyPassed,
    hallucinationDetected,
    missingKeywords,
  };
}

export function runCopilotAccuracyBenchmarkP269(
  scenarios: CopilotAccuracyScenarioP269[] = buildCopilotAccuracyCorpusP269(),
): CopilotAccuracyBenchmarkP269Result {
  const scenarioScores = scenarios.map(scoreScenario);

  const accuracyPassedCount = scenarioScores.filter((s) => s.accuracyPassed).length;
  const answerAccuracyPct =
    scenarios.length === 0 ? 0 : Math.round((accuracyPassedCount / scenarios.length) * 100);

  const hallucinationCount = scenarioScores.filter((s) => s.hallucinationDetected).length;
  const hallucinationPct =
    scenarios.length === 0 ? 100 : Math.round((hallucinationCount / scenarios.length) * 100);

  const passed =
    scenarios.length >= COPILOT_ACCURACY_BENCHMARK_P2_69_SCENARIO_COUNT &&
    answerAccuracyPct >= COPILOT_ACCURACY_BENCHMARK_P2_69_MIN_ACCURACY_PCT &&
    hallucinationPct <= COPILOT_ACCURACY_BENCHMARK_P2_69_MAX_HALLUCINATION_PCT;

  return {
    scenarioCount: scenarios.length,
    answerAccuracyPct,
    hallucinationPct,
    passed,
    thresholdAccuracyPct: COPILOT_ACCURACY_BENCHMARK_P2_69_MIN_ACCURACY_PCT,
    maxHallucinationPct: COPILOT_ACCURACY_BENCHMARK_P2_69_MAX_HALLUCINATION_PCT,
    scenarioScores,
  };
}

export function buildDegradedCopilotAccuracyP269Scenarios(
  scenarios: CopilotAccuracyScenarioP269[] = buildCopilotAccuracyCorpusP269(),
): CopilotAccuracyScenarioP269[] {
  return scenarios.map((scenario, index) =>
    index === 0
      ? { ...scenario, expectedKeywords: [...scenario.expectedKeywords, "fabricated_metric_xyz"] }
      : scenario,
  );
}
