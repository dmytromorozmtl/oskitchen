import {
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_MAX_HALLUCINATION_PCT,
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_MIN_RECALL_PCT,
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_MIN_ROUTE_ACCURACY_PCT,
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_SCENARIO_COUNT,
  AI_BRIEFING_INSIGHT_ACTION_ROUTES,
} from "@/lib/ai/ai-briefing-accuracy-benchmark-p2-61-policy";
import {
  buildAiBriefingAccuracyCorpusP261,
  type AiBriefingAccuracyScenario,
} from "@/lib/ai/ai-briefing-accuracy-benchmark-p2-61-corpus";
import { buildDeterministicInsightsFromOverview } from "@/lib/ai/deterministic-insights-from-overview";

export type AiBriefingAccuracyScenarioScore = {
  scenarioId: string;
  expectedCount: number;
  matchedCount: number;
  recallPct: number;
  unexpectedTypes: string[];
  routeMatches: number;
  routeTotal: number;
};

export type AiBriefingAccuracyBenchmarkP261Result = {
  scenarioCount: number;
  insightRecallPct: number;
  routeAccuracyPct: number;
  hallucinationPct: number;
  passed: boolean;
  thresholdRecallPct: number;
  thresholdRoutePct: number;
  maxHallucinationPct: number;
  scenarioScores: AiBriefingAccuracyScenarioScore[];
};

function scoreScenario(scenario: AiBriefingAccuracyScenario): AiBriefingAccuracyScenarioScore {
  const snapshot = buildDeterministicInsightsFromOverview(scenario.overview);
  const actualTypes = snapshot.insights.map((i) => i.type);
  const expectedSet = new Set(scenario.expectedInsightTypes);
  const matchedCount = scenario.expectedInsightTypes.filter((t) => actualTypes.includes(t)).length;
  const unexpectedTypes = actualTypes.filter((t) => !expectedSet.has(t));

  let routeMatches = 0;
  let routeTotal = 0;
  for (const insight of snapshot.insights) {
    if (!expectedSet.has(insight.type)) continue;
    routeTotal += 1;
    const expectedRoute =
      AI_BRIEFING_INSIGHT_ACTION_ROUTES[
        insight.type as keyof typeof AI_BRIEFING_INSIGHT_ACTION_ROUTES
      ];
    if (expectedRoute && insight.actionRoute === expectedRoute) {
      routeMatches += 1;
    }
  }

  const recallPct =
    scenario.expectedInsightTypes.length === 0
      ? 100
      : Math.round((matchedCount / scenario.expectedInsightTypes.length) * 100);

  return {
    scenarioId: scenario.id,
    expectedCount: scenario.expectedInsightTypes.length,
    matchedCount,
    recallPct,
    unexpectedTypes,
    routeMatches,
    routeTotal,
  };
}

export function runAiBriefingAccuracyBenchmarkP261(
  scenarios: AiBriefingAccuracyScenario[] = buildAiBriefingAccuracyCorpusP261(),
): AiBriefingAccuracyBenchmarkP261Result {
  const scenarioScores = scenarios.map(scoreScenario);

  const totalExpected = scenarioScores.reduce((sum, s) => sum + s.expectedCount, 0);
  const totalMatched = scenarioScores.reduce((sum, s) => sum + s.matchedCount, 0);
  const insightRecallPct =
    totalExpected === 0 ? 0 : Math.round((totalMatched / totalExpected) * 100);

  const totalRoutes = scenarioScores.reduce((sum, s) => sum + s.routeTotal, 0);
  const matchedRoutes = scenarioScores.reduce((sum, s) => sum + s.routeMatches, 0);
  const routeAccuracyPct =
    totalRoutes === 0 ? 100 : Math.round((matchedRoutes / totalRoutes) * 100);

  const hallucinationScenarios = scenarioScores.filter((s) => s.unexpectedTypes.length > 0).length;
  const hallucinationPct =
    scenarios.length === 0
      ? 100
      : Math.round((hallucinationScenarios / scenarios.length) * 100);

  const passed =
    scenarios.length >= AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_SCENARIO_COUNT &&
    insightRecallPct >= AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_MIN_RECALL_PCT &&
    routeAccuracyPct >= AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_MIN_ROUTE_ACCURACY_PCT &&
    hallucinationPct <= AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_MAX_HALLUCINATION_PCT;

  return {
    scenarioCount: scenarios.length,
    insightRecallPct,
    routeAccuracyPct,
    hallucinationPct,
    passed,
    thresholdRecallPct: AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_MIN_RECALL_PCT,
    thresholdRoutePct: AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_MIN_ROUTE_ACCURACY_PCT,
    maxHallucinationPct: AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_MAX_HALLUCINATION_PCT,
    scenarioScores,
  };
}

/** Inject a fake insight type to prove the benchmark gate fails on hallucination. */
export function buildDegradedAiBriefingAccuracyP261Scenarios(
  scenarios: AiBriefingAccuracyScenario[],
): AiBriefingAccuracyScenario[] {
  return scenarios.map((scenario, index) =>
    index === 0
      ? {
          ...scenario,
          expectedInsightTypes: [...scenario.expectedInsightTypes, "fabricated_margin_spike"],
        }
      : scenario,
  );
}
