import {
  LABOR_FORECASTING_AI_P2_66_FORECASTING_CAPABILITIES,
  LABOR_FORECASTING_AI_P2_66_MIN_CAPABILITY_COVERAGE_PCT,
  LABOR_FORECASTING_AI_P2_66_SCENARIO_COUNT,
  type LaborForecastingCapability,
} from "@/lib/labor/labor-forecasting-ai-p2-66-policy";
import { buildDeepLaborForecast } from "@/lib/labor/labor-forecasting-ai-p2-66-builder";
import {
  buildLaborForecastingCorpusP266,
  type LaborForecastingScenarioP266,
} from "@/lib/labor/labor-forecasting-ai-p2-66-corpus";
import type { DowDemand } from "@/services/labor/ai-scheduling-service";

export type LaborForecastingScenarioScoreP266 = {
  scenarioId: string;
  capabilityCount: number;
  forecastPassed: boolean;
  blendedLaborPct: number;
};

export type LaborForecastingBenchmarkP266Result = {
  scenarioCount: number;
  capabilityCoveragePct: number;
  passed: boolean;
  thresholdPct: number;
  uncoveredCapabilities: LaborForecastingCapability[];
  scenarioScores: LaborForecastingScenarioScoreP266[];
};

function buildDowDemandForScenario(scenario: LaborForecastingScenarioP266): DowDemand[] {
  const baseRevenue = scenario.weekendBoost ? 1400 : 900;
  const baseOrders = scenario.weekendBoost ? 55 : 35;
  const sampleWeeks = scenario.id.includes("new-location") ? 1 : 4;

  return Array.from({ length: 7 }, (_, dayOfWeek) => {
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const boost = scenario.weekendBoost && isWeekend ? 1.3 : 1;
    return {
      dayOfWeek,
      avgRevenue: Math.round(baseRevenue * boost),
      avgOrders: Math.round(baseOrders * boost),
      sampleWeeks,
    };
  });
}

function scoreScenario(scenario: LaborForecastingScenarioP266): LaborForecastingScenarioScoreP266 {
  const weekStart = new Date("2026-06-02T00:00:00.000Z");
  const forecast = buildDeepLaborForecast({
    weekStart,
    dowDemand: buildDowDemandForScenario(scenario),
    targetLaborPct: scenario.targetLaborPct,
    avgHourlyRate: scenario.avgHourlyRate,
    staffCount: scenario.staffCount,
  });

  const forecastPassed =
    forecast.days.length === 7 &&
    forecast.summary.totalProjectedRevenue >= 0 &&
    forecast.summary.confidence.length > 0 &&
    forecast.days.every((d) => d.recommendedHeadcount >= 0);

  return {
    scenarioId: scenario.id,
    capabilityCount: scenario.capabilities.length,
    forecastPassed,
    blendedLaborPct: forecast.summary.blendedLaborPct,
  };
}

export function runLaborForecastingBenchmarkP266(
  scenarios: LaborForecastingScenarioP266[] = buildLaborForecastingCorpusP266(),
): LaborForecastingBenchmarkP266Result {
  const covered = new Set<LaborForecastingCapability>();
  for (const scenario of scenarios) {
    for (const capability of scenario.capabilities) {
      covered.add(capability);
    }
  }

  const uncoveredCapabilities = LABOR_FORECASTING_AI_P2_66_FORECASTING_CAPABILITIES.filter(
    (c) => !covered.has(c),
  );

  const total = LABOR_FORECASTING_AI_P2_66_FORECASTING_CAPABILITIES.length;
  const capabilityCoveragePct =
    total === 0 ? 0 : Math.round((covered.size / total) * 100);

  const scenarioScores = scenarios.map(scoreScenario);
  const allForecastsPassed = scenarioScores.every((s) => s.forecastPassed);

  const passed =
    scenarios.length === LABOR_FORECASTING_AI_P2_66_SCENARIO_COUNT &&
    capabilityCoveragePct >= LABOR_FORECASTING_AI_P2_66_MIN_CAPABILITY_COVERAGE_PCT &&
    uncoveredCapabilities.length === 0 &&
    allForecastsPassed;

  return {
    scenarioCount: scenarios.length,
    capabilityCoveragePct,
    passed,
    thresholdPct: LABOR_FORECASTING_AI_P2_66_MIN_CAPABILITY_COVERAGE_PCT,
    uncoveredCapabilities,
    scenarioScores,
  };
}

export function buildDegradedLaborForecastingP266Scenarios(): LaborForecastingScenarioP266[] {
  return buildLaborForecastingCorpusP266().slice(0, 3);
}
