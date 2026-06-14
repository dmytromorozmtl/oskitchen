import {
  CATERING_BEO_FORMAT_P2_64_MIN_SECTION_COMPLETENESS_PCT,
  CATERING_BEO_FORMAT_P2_64_MIN_TIMELINE_ENTRIES,
  CATERING_BEO_FORMAT_P2_64_SCENARIO_COUNT,
} from "@/lib/catering/catering-beo-p2-64-policy";
import { buildCateringBeoFromQuote } from "@/lib/catering/catering-beo-p2-64-builder";
import {
  buildCateringBeoFormatCorpusP264,
  type CateringBeoFormatScenario,
} from "@/lib/catering/catering-beo-p2-64-corpus";
import type { CateringBeoDocument } from "@/lib/catering/catering-beo-p2-64-types";

export type CateringBeoScenarioScore = {
  scenarioId: string;
  sectionChecks: number;
  sectionPassed: number;
  completenessPct: number;
  failedChecks: string[];
};

export type CateringBeoFormatBenchmarkP264Result = {
  scenarioCount: number;
  sectionCompletenessPct: number;
  passed: boolean;
  thresholdPct: number;
  scenarioScores: CateringBeoScenarioScore[];
};

function scoreBeoDocument(
  beo: CateringBeoDocument,
  scenario: CateringBeoFormatScenario,
): CateringBeoScenarioScore {
  const checks: Array<{ label: string; ok: boolean }> = [
    { label: "layout.roomSetup", ok: beo.layout.roomSetup.trim().length > 0 },
    { label: "layout.tableConfiguration", ok: beo.layout.tableConfiguration.trim().length > 0 },
    {
      label: "layout.guestCount",
      ok: scenario.expectsLayoutGuestCount ? beo.layout.guestCount != null && beo.layout.guestCount > 0 : true,
    },
    {
      label: "menu.sections",
      ok: beo.menu.length >= scenario.expectedMenuSections,
    },
    {
      label: "timeline.entries",
      ok: beo.timeline.length >= scenario.minTimelineEntries,
    },
    {
      label: "timeline.minGlobal",
      ok: beo.timeline.length >= CATERING_BEO_FORMAT_P2_64_MIN_TIMELINE_ENTRIES,
    },
    { label: "beoNumber", ok: beo.beoNumber.trim().length > 0 },
    { label: "client.name", ok: beo.client.name.trim().length > 0 },
  ];

  const sectionPassed = checks.filter((c) => c.ok).length;
  const completenessPct = Math.round((sectionPassed / checks.length) * 100);

  return {
    scenarioId: scenario.id,
    sectionChecks: checks.length,
    sectionPassed,
    completenessPct,
    failedChecks: checks.filter((c) => !c.ok).map((c) => c.label),
  };
}

export function runCateringBeoFormatBenchmarkP264(
  scenarios: CateringBeoFormatScenario[] = buildCateringBeoFormatCorpusP264(),
): CateringBeoFormatBenchmarkP264Result {
  const scenarioScores = scenarios.map((scenario) =>
    scoreBeoDocument(buildCateringBeoFromQuote(scenario.input), scenario),
  );

  const totalChecks = scenarioScores.reduce((sum, s) => sum + s.sectionChecks, 0);
  const totalPassed = scenarioScores.reduce((sum, s) => sum + s.sectionPassed, 0);
  const sectionCompletenessPct =
    totalChecks === 0 ? 0 : Math.round((totalPassed / totalChecks) * 100);

  const passed =
    scenarios.length >= CATERING_BEO_FORMAT_P2_64_SCENARIO_COUNT &&
    sectionCompletenessPct >= CATERING_BEO_FORMAT_P2_64_MIN_SECTION_COMPLETENESS_PCT;

  return {
    scenarioCount: scenarios.length,
    sectionCompletenessPct,
    passed,
    thresholdPct: CATERING_BEO_FORMAT_P2_64_MIN_SECTION_COMPLETENESS_PCT,
    scenarioScores,
  };
}

export function buildDegradedCateringBeoFormatP264Scenarios(
  scenarios: CateringBeoFormatScenario[],
): CateringBeoFormatScenario[] {
  return scenarios.map((scenario, index) =>
    index === 0
      ? {
          ...scenario,
          input: { ...scenario.input, items: [] },
          expectedMenuSections: 99,
        }
      : scenario,
  );
}
