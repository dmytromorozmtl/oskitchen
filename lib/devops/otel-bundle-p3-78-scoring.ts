import {
  OTEL_BUNDLE_P3_78_SCENARIO_COUNT,
  OTEL_BUNDLE_P3_78_SERVER_EXTERNAL_PACKAGES,
} from "@/lib/devops/otel-bundle-p3-78-policy";

export type OtelBundleBenchmarkInputP378 = {
  bundleAnalyzerWired: boolean;
  analyzeScriptPresent: boolean;
  serverExternalComplete: boolean;
  noStaticImportsInHotPaths: boolean;
  instrumentationLazyInit: boolean;
  experimentTraceIsolated: boolean;
};

export type OtelBundleBenchmarkP378Result = {
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

export function buildOtelBundleCorpusP378(
  input: OtelBundleBenchmarkInputP378,
): ReturnType<typeof scenario>[] {
  return [
    scenario("ob-01-bundle-analyzer", "@next/bundle-analyzer wired with ANALYZE=true", () => {
      if (!input.bundleAnalyzerWired) {
        return { passed: false, message: "bundle-analyzer not wired in next.config.ts" };
      }
      return { passed: true };
    }),
    scenario("ob-02-analyze-script", "npm run analyze script present", () => {
      if (!input.analyzeScriptPresent) {
        return { passed: false, message: "analyze npm script missing" };
      }
      return { passed: true };
    }),
    scenario("ob-03-server-external", "serverExternalPackages covers OTel stack", () => {
      if (!input.serverExternalComplete) {
        return {
          passed: false,
          message: `Missing packages from serverExternalPackages (${OTEL_BUNDLE_P3_78_SERVER_EXTERNAL_PACKAGES.length} required)`,
        };
      }
      return { passed: true };
    }),
    scenario("ob-04-no-static-hot-paths", "No static OTel imports in hot paths", () => {
      if (!input.noStaticImportsInHotPaths) {
        return { passed: false, message: "Static @opentelemetry import in hot path" };
      }
      return { passed: true };
    }),
    scenario("ob-05-instrumentation-lazy", "instrumentation.ts lazy-init OTel SDK", () => {
      if (!input.instrumentationLazyInit) {
        return { passed: false, message: "instrumentation.ts missing dynamic OTel init" };
      }
      return { passed: true };
    }),
    scenario("ob-06-trace-isolated", "experiment-trace isolated from OTel SDK", () => {
      if (!input.experimentTraceIsolated) {
        return { passed: false, message: "experiment-trace.ts pulls OTel SDK statically" };
      }
      return { passed: true };
    }),
  ];
}

export function runOtelBundleBenchmarkP378(
  input: OtelBundleBenchmarkInputP378,
): OtelBundleBenchmarkP378Result {
  const scenarios = buildOtelBundleCorpusP378(input);
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
      scenarios.length === OTEL_BUNDLE_P3_78_SCENARIO_COUNT &&
      passedCount === scenarios.length,
    scenarioScores,
  };
}
