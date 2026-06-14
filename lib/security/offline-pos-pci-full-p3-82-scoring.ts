import { OFFLINE_POS_PCI_FULL_P3_82_SCENARIO_COUNT } from "@/lib/security/offline-pos-pci-full-p3-82-policy";

export type OfflinePosPciFullBenchmarkInputP382 = {
  fullReviewDocComplete: boolean;
  aesGcmImplementationPassed: boolean;
  upstreamP244Passed: boolean;
  upstreamP135E2EChainWired: boolean;
  qsaSignoffArtifactComplete: boolean;
  pciReviewDocCrossLinked: boolean;
};

export type OfflinePosPciFullBenchmarkP382Result = {
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

export function buildOfflinePosPciFullCorpusP382(
  input: OfflinePosPciFullBenchmarkInputP382,
): ReturnType<typeof scenario>[] {
  return [
    scenario("pci-01-full-review-doc", "Full PCI review doc complete", () => {
      if (!input.fullReviewDocComplete) {
        return { passed: false, message: "Full review doc incomplete" };
      }
      return { passed: true };
    }),
    scenario("pci-02-aes-gcm-implementation", "AES-GCM implementation audit passed", () => {
      if (!input.aesGcmImplementationPassed) {
        return { passed: false, message: "AES-GCM implementation audit failed" };
      }
      return { passed: true };
    }),
    scenario("pci-03-upstream-p2-44", "Upstream P2-44 noop-v1 gate passed", () => {
      if (!input.upstreamP244Passed) {
        return { passed: false, message: "P2-44 upstream gate failed" };
      }
      return { passed: true };
    }),
    scenario("pci-04-upstream-p1-35", "Upstream P1-35 E2E chain wired", () => {
      if (!input.upstreamP135E2EChainWired) {
        return { passed: false, message: "P1-35 E2E chain not wired" };
      }
      return { passed: true };
    }),
    scenario("pci-05-qsa-signoff-artifact", "QSA sign-off artifact complete", () => {
      if (!input.qsaSignoffArtifactComplete) {
        return { passed: false, message: "QSA sign-off artifact incomplete" };
      }
      return { passed: true };
    }),
    scenario("pci-06-pci-review-crosslink", "PCI review doc cross-linked", () => {
      if (!input.pciReviewDocCrossLinked) {
        return { passed: false, message: "PCI review doc not cross-linked" };
      }
      return { passed: true };
    }),
  ];
}

export function runOfflinePosPciFullBenchmarkP382(
  input: OfflinePosPciFullBenchmarkInputP382,
): OfflinePosPciFullBenchmarkP382Result {
  const scenarios = buildOfflinePosPciFullCorpusP382(input);
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
      scenarios.length === OFFLINE_POS_PCI_FULL_P3_82_SCENARIO_COUNT &&
      passedCount === scenarios.length,
    scenarioScores,
  };
}
