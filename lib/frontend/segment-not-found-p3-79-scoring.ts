import { SEGMENT_NOT_FOUND_P3_79_SCENARIO_COUNT } from "@/lib/frontend/segment-not-found-p3-79-policy";

export type SegmentNotFoundBenchmarkInputP379 = {
  allSegmentFilesPresent: boolean;
  allTestIdsPresent: boolean;
  allPrimaryCtasPresent: boolean;
  rootFallbackPresent: boolean;
  upstreamP133Aligned: boolean;
  segmentLayoutsPresent: boolean;
};

export type SegmentNotFoundBenchmarkP379Result = {
  scenarioCount: number;
  passedCount: number;
  passPct: number;
  passed: boolean;
  scenarioScores: Array<{ scenarioId: string; passed: boolean; message?: string }>;
};

function scenario(
  id: string,
  label: string,
  run: () => { passed: boolean; message?: string },
) {
  return { id, label, run };
}

export function buildSegmentNotFoundCorpusP379(
  input: SegmentNotFoundBenchmarkInputP379,
): ReturnType<typeof scenario>[] {
  return [
    scenario("sn-01-segment-files", "dashboard/, vendor/, s/ not-found.tsx present", () => {
      if (!input.allSegmentFilesPresent) {
        return { passed: false, message: "Missing segment not-found.tsx file" };
      }
      return { passed: true };
    }),
    scenario("sn-02-test-ids", "Each segment exposes data-testid", () => {
      if (!input.allTestIdsPresent) {
        return { passed: false, message: "Missing segment-not-found data-testid" };
      }
      return { passed: true };
    }),
    scenario("sn-03-primary-ctas", "Each segment has contextual primary CTA", () => {
      if (!input.allPrimaryCtasPresent) {
        return { passed: false, message: "Missing primary href in segment not-found" };
      }
      return { passed: true };
    }),
    scenario("sn-04-root-fallback", "Root app/not-found.tsx fallback present", () => {
      if (!input.rootFallbackPresent) {
        return { passed: false, message: "app/not-found.tsx missing" };
      }
      return { passed: true };
    }),
    scenario("sn-05-upstream-p133", "P1-33 upstream artifact aligned", () => {
      if (!input.upstreamP133Aligned) {
        return { passed: false, message: "P1-33 artifact segments mismatch" };
      }
      return { passed: true };
    }),
    scenario("sn-06-segment-layouts", "Dashboard and vendor layouts present", () => {
      if (!input.segmentLayoutsPresent) {
        return { passed: false, message: "Missing dashboard or vendor layout.tsx" };
      }
      return { passed: true };
    }),
  ];
}

export function runSegmentNotFoundBenchmarkP379(
  input: SegmentNotFoundBenchmarkInputP379,
): SegmentNotFoundBenchmarkP379Result {
  const scenarios = buildSegmentNotFoundCorpusP379(input);
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
      scenarios.length === SEGMENT_NOT_FOUND_P3_79_SCENARIO_COUNT &&
      passedCount === scenarios.length,
    scenarioScores,
  };
}
