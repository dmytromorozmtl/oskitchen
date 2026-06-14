import { PEN_TEST_SCHEDULING_P3_81_SCENARIO_COUNT } from "@/lib/security/pen-test-scheduling-p3-81-policy";

export type PenTestSchedulingBenchmarkInputP381 = {
  schedulingDocComplete: boolean;
  artifactScheduled: boolean;
  vendorSelected: boolean;
  qsaTrackScheduled: boolean;
  enterpriseGatesDefined: boolean;
  upstreamDocsPresent: boolean;
};

export type PenTestSchedulingBenchmarkP381Result = {
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

export function buildPenTestSchedulingCorpusP381(
  input: PenTestSchedulingBenchmarkInputP381,
): ReturnType<typeof scenario>[] {
  return [
    scenario("pt-01-scheduling-doc", "Pen test scheduling doc complete", () => {
      if (!input.schedulingDocComplete) {
        return { passed: false, message: "Scheduling doc incomplete" };
      }
      return { passed: true };
    }),
    scenario("pt-02-artifact-scheduled", "Scheduling artifact marks engagement scheduled", () => {
      if (!input.artifactScheduled) {
        return { passed: false, message: "Artifact not scheduled" };
      }
      return { passed: true };
    }),
    scenario("pt-03-vendor-selected", "Primary vendor Cobalt selected", () => {
      if (!input.vendorSelected) {
        return { passed: false, message: "Vendor not selected" };
      }
      return { passed: true };
    }),
    scenario("pt-04-qsa-track", "QSA/PCI counsel track scheduled", () => {
      if (!input.qsaTrackScheduled) {
        return { passed: false, message: "QSA track not scheduled" };
      }
      return { passed: true };
    }),
    scenario("pt-05-enterprise-gates", "Enterprise promotion gates defined", () => {
      if (!input.enterpriseGatesDefined) {
        return { passed: false, message: "Enterprise gates missing" };
      }
      return { passed: true };
    }),
    scenario("pt-06-upstream-docs", "Upstream pen test + PCI docs present", () => {
      if (!input.upstreamDocsPresent) {
        return { passed: false, message: "Upstream docs missing" };
      }
      return { passed: true };
    }),
  ];
}

export function runPenTestSchedulingBenchmarkP381(
  input: PenTestSchedulingBenchmarkInputP381,
): PenTestSchedulingBenchmarkP381Result {
  const scenarios = buildPenTestSchedulingCorpusP381(input);
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
      scenarios.length === PEN_TEST_SCHEDULING_P3_81_SCENARIO_COUNT &&
      passedCount === scenarios.length,
    scenarioScores,
  };
}
