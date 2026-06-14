import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  OTEL_BUNDLE_P3_78_ARTIFACT,
  OTEL_BUNDLE_P3_78_ANALYZE_NPM_SCRIPT,
  OTEL_BUNDLE_P3_78_NO_STATIC_IMPORT_PATHS,
  OTEL_BUNDLE_P3_78_POLICY_ID,
  OTEL_BUNDLE_P3_78_SERVER_EXTERNAL_PACKAGES,
  OTEL_BUNDLE_P3_78_WIRING_PATHS,
} from "@/lib/devops/otel-bundle-p3-78-policy";
import { runOtelBundleBenchmarkP378 } from "@/lib/devops/otel-bundle-p3-78-scoring";

export type OtelBundleP378AuditSummary = {
  policyId: typeof OTEL_BUNDLE_P3_78_POLICY_ID;
  wiringComplete: boolean;
  bundleAnalyzerWired: boolean;
  analyzeScriptPresent: boolean;
  serverExternalComplete: boolean;
  noStaticImportsInHotPaths: boolean;
  instrumentationLazyInit: boolean;
  experimentTraceIsolated: boolean;
  scoringPassed: boolean;
  passPct: number;
  artifactPresent: boolean;
  passed: boolean;
};

/** Detect runtime static imports of @opentelemetry (dynamic import() is allowed). */
export function hasStaticOtelImport(source: string): boolean {
  const withoutDynamic = source.replace(/import\s*\(\s*["']@opentelemetry[^)]*\)/g, "");
  const withoutTypeOnly = withoutDynamic.replace(
    /:\s*typeof\s+import\s*\(\s*["']@opentelemetry[^)]*\)/g,
    "",
  );
  return (
    /from\s+["']@opentelemetry/.test(withoutTypeOnly) ||
    /require\s*\(\s*["']@opentelemetry/.test(withoutTypeOnly)
  );
}

function readSource(root: string, rel: string): string {
  return readFileSync(join(root, rel), "utf8");
}

export function auditOtelBundleP378(root = process.cwd()): OtelBundleP378AuditSummary {
  const wiringComplete = OTEL_BUNDLE_P3_78_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  const nextConfig = readSource(root, "next.config.ts");
  const bundleAnalyzerWired =
    nextConfig.includes("@next/bundle-analyzer") &&
    nextConfig.includes('process.env.ANALYZE === "true"') &&
    nextConfig.includes("withBundleAnalyzer");

  const pkg = JSON.parse(readFileSync(join(root, "package.json"), "utf8")) as {
    scripts?: Record<string, string>;
  };
  const analyzeScript = pkg.scripts?.[OTEL_BUNDLE_P3_78_ANALYZE_NPM_SCRIPT] ?? "";
  const analyzeScriptPresent =
    analyzeScript.includes("ANALYZE=true") && analyzeScript.includes("next build");

  const serverExternalComplete = OTEL_BUNDLE_P3_78_SERVER_EXTERNAL_PACKAGES.every((pkgName) =>
    nextConfig.includes(pkgName),
  );

  const noStaticImportsInHotPaths = OTEL_BUNDLE_P3_78_NO_STATIC_IMPORT_PATHS.every(
    (rel) => !hasStaticOtelImport(readSource(root, rel)),
  );

  const instrumentation = readSource(root, "instrumentation.ts");
  const instrumentationLazyInit =
    instrumentation.includes("experiment-otel-init") &&
    instrumentation.includes("OTEL_EXPORTER_OTLP_ENDPOINT") &&
    instrumentation.includes('await import("./lib/observability/experiment-otel-init")');

  const experimentTrace = readSource(root, "lib/storefront/experiment-trace.ts");
  const experimentTraceIsolated =
    !hasStaticOtelImport(experimentTrace) &&
    !experimentTrace.includes("experiment-otel-init") &&
    experimentTrace.includes('import("@/lib/observability/experiment-otel-span")');

  const benchmark = runOtelBundleBenchmarkP378({
    bundleAnalyzerWired,
    analyzeScriptPresent,
    serverExternalComplete,
    noStaticImportsInHotPaths,
    instrumentationLazyInit,
    experimentTraceIsolated,
  });

  const artifactPresent = existsSync(join(root, OTEL_BUNDLE_P3_78_ARTIFACT));

  const passed = wiringComplete && benchmark.passed && artifactPresent;

  return {
    policyId: OTEL_BUNDLE_P3_78_POLICY_ID,
    wiringComplete,
    bundleAnalyzerWired,
    analyzeScriptPresent,
    serverExternalComplete,
    noStaticImportsInHotPaths,
    instrumentationLazyInit,
    experimentTraceIsolated,
    scoringPassed: benchmark.passed,
    passPct: benchmark.passPct,
    artifactPresent,
    passed,
  };
}

export function formatOtelBundleP378AuditLines(summary: OtelBundleP378AuditSummary): string[] {
  return [
    `OpenTelemetry bundle analysis (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Bundle analyzer: ${summary.bundleAnalyzerWired ? "yes" : "no"}`,
    `Analyze script: ${summary.analyzeScriptPresent ? "yes" : "no"}`,
    `serverExternalPackages: ${summary.serverExternalComplete ? "complete" : "incomplete"}`,
    `No static OTel in hot paths: ${summary.noStaticImportsInHotPaths ? "yes" : "no"}`,
    `Instrumentation lazy-init: ${summary.instrumentationLazyInit ? "yes" : "no"}`,
    `experiment-trace isolated: ${summary.experimentTraceIsolated ? "yes" : "no"}`,
    `Benchmark: ${summary.passPct}%`,
    `Scoring passed: ${summary.scoringPassed ? "yes" : "no"}`,
    `Artifact: ${summary.artifactPresent ? "present" : "missing"}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
