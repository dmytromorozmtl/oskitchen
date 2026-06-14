import {
  NOT_FOUND_AUDIT_P3_99_SCENARIO_COUNT,
  NOT_FOUND_AUDIT_P3_99_VERTICAL_COUNT,
} from "@/lib/frontend/not-found-audit-p3-99-policy";

export type NotFoundAuditBenchmarkInputP399 = {
  allSegmentFilesPresent: boolean;
  allTestIdsPresent: boolean;
  allPrimaryCtasPresent: boolean;
  rootFallbackPresent: boolean;
  upstreamP379Aligned: boolean;
  segmentLayoutsPresent: boolean;
  verticalCountMet: boolean;
  uniqueTestIds: boolean;
};

export type NotFoundAuditBenchmarkP399Result = {
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

export function buildNotFoundAuditCorpusP399(
  input: NotFoundAuditBenchmarkInputP399,
): ReturnType<typeof scenario>[] {
  return [
    scenario("nf-01-segment-files", "All 8 vertical not-found.tsx files present", () => {
      if (!input.allSegmentFilesPresent) {
        return { passed: false, message: "Missing vertical not-found.tsx file" };
      }
      return { passed: true };
    }),
    scenario("nf-02-test-ids", "Each vertical exposes data-testid", () => {
      if (!input.allTestIdsPresent) {
        return { passed: false, message: "Missing segment-not-found data-testid" };
      }
      return { passed: true };
    }),
    scenario("nf-03-primary-ctas", "Each vertical has contextual primary CTA", () => {
      if (!input.allPrimaryCtasPresent) {
        return { passed: false, message: "Missing primary href in vertical not-found" };
      }
      return { passed: true };
    }),
    scenario("nf-04-root-fallback", "Root app/not-found.tsx fallback present", () => {
      if (!input.rootFallbackPresent) {
        return { passed: false, message: "app/not-found.tsx missing" };
      }
      return { passed: true };
    }),
    scenario("nf-05-upstream-p379", "P3-79 upstream three segments still aligned", () => {
      if (!input.upstreamP379Aligned) {
        return { passed: false, message: "P3-79 artifact segments mismatch" };
      }
      return { passed: true };
    }),
    scenario("nf-06-segment-layouts", "Vertical layouts present where required", () => {
      if (!input.segmentLayoutsPresent) {
        return { passed: false, message: "Missing vertical layout.tsx" };
      }
      return { passed: true };
    }),
    scenario("nf-07-vertical-count", "Eight vertical segments registered", () => {
      if (!input.verticalCountMet) {
        return {
          passed: false,
          message: `Expected ${NOT_FOUND_AUDIT_P3_99_VERTICAL_COUNT} verticals`,
        };
      }
      return { passed: true };
    }),
    scenario("nf-08-unique-test-ids", "No duplicate segment-not-found test IDs", () => {
      if (!input.uniqueTestIds) {
        return { passed: false, message: "Duplicate data-testid across verticals" };
      }
      return { passed: true };
    }),
  ];
}

export function runNotFoundAuditBenchmarkP399(
  input: NotFoundAuditBenchmarkInputP399,
): NotFoundAuditBenchmarkP399Result {
  const scenarios = buildNotFoundAuditCorpusP399(input);
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
      scenarios.length === NOT_FOUND_AUDIT_P3_99_SCENARIO_COUNT &&
      passedCount === scenarios.length,
    scenarioScores,
  };
}
