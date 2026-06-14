import {
  FLOOR_PLAN_EDITOR_P2_65_MIN_CAPABILITY_COVERAGE_PCT,
  FLOOR_PLAN_EDITOR_P2_65_SCENARIO_COUNT,
  FLOOR_PLAN_EDITOR_P2_65_TABLE_MANAGEMENT_CAPABILITIES,
  type FloorPlanTableManagementCapability,
} from "@/lib/restaurant/floor-plan-editor-p2-65-policy";
import {
  buildFloorPlanEditorCorpusP265,
  type FloorPlanEditorScenarioP265,
} from "@/lib/restaurant/floor-plan-editor-p2-65-corpus";
import { computeCapabilityCoveragePct } from "@/lib/restaurant/floor-plan-table-management-p2-65";

export type FloorPlanEditorScenarioScoreP265 = {
  scenarioId: string;
  capabilityCount: number;
  expectsRealtime: boolean;
};

export type FloorPlanEditorBenchmarkP265Result = {
  scenarioCount: number;
  capabilityCoveragePct: number;
  realtimeScenarioCount: number;
  passed: boolean;
  thresholdPct: number;
  uncoveredCapabilities: FloorPlanTableManagementCapability[];
  scenarioScores: FloorPlanEditorScenarioScoreP265[];
};

export function runFloorPlanEditorBenchmarkP265(
  scenarios: FloorPlanEditorScenarioP265[] = buildFloorPlanEditorCorpusP265(),
): FloorPlanEditorBenchmarkP265Result {
  const covered = new Set<FloorPlanTableManagementCapability>();
  for (const scenario of scenarios) {
    for (const capability of scenario.capabilities) {
      covered.add(capability);
    }
  }

  const uncoveredCapabilities = FLOOR_PLAN_EDITOR_P2_65_TABLE_MANAGEMENT_CAPABILITIES.filter(
    (c) => !covered.has(c),
  );

  const capabilityCoveragePct = computeCapabilityCoveragePct([...covered]);
  const realtimeScenarioCount = scenarios.filter((s) => s.expectsRealtime).length;

  const scenarioScores = scenarios.map((scenario) => ({
    scenarioId: scenario.id,
    capabilityCount: scenario.capabilities.length,
    expectsRealtime: scenario.expectsRealtime,
  }));

  const passed =
    scenarios.length === FLOOR_PLAN_EDITOR_P2_65_SCENARIO_COUNT &&
    capabilityCoveragePct >= FLOOR_PLAN_EDITOR_P2_65_MIN_CAPABILITY_COVERAGE_PCT &&
    uncoveredCapabilities.length === 0 &&
    realtimeScenarioCount >= 6;

  return {
    scenarioCount: scenarios.length,
    capabilityCoveragePct,
    realtimeScenarioCount,
    passed,
    thresholdPct: FLOOR_PLAN_EDITOR_P2_65_MIN_CAPABILITY_COVERAGE_PCT,
    uncoveredCapabilities,
    scenarioScores,
  };
}

export function buildDegradedFloorPlanEditorP265Scenarios(): FloorPlanEditorScenarioP265[] {
  return buildFloorPlanEditorCorpusP265().slice(0, 3);
}
