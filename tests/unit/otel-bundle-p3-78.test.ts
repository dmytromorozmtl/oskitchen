import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditOtelBundleP378,
  formatOtelBundleP378AuditLines,
  hasStaticOtelImport,
} from "@/lib/devops/otel-bundle-p3-78-audit";
import {
  OTEL_BUNDLE_P3_78_ARTIFACT,
  OTEL_BUNDLE_P3_78_CHECK_NPM_SCRIPT,
  OTEL_BUNDLE_P3_78_CI_WORKFLOW,
  OTEL_BUNDLE_P3_78_DOC,
  OTEL_BUNDLE_P3_78_POLICY_ID,
  OTEL_BUNDLE_P3_78_SERVER_EXTERNAL_PACKAGES,
  OTEL_BUNDLE_P3_78_UNIT_TEST,
  OTEL_BUNDLE_P3_78_WIRING_PATHS,
} from "@/lib/devops/otel-bundle-p3-78-policy";
import { runOtelBundleBenchmarkP378 } from "@/lib/devops/otel-bundle-p3-78-scoring";

const ROOT = process.cwd();

describe("OpenTelemetry bundle analysis (P3-78)", () => {
  it("locks P3-78 policy constants", () => {
    expect(OTEL_BUNDLE_P3_78_POLICY_ID).toBe("otel-bundle-p3-78-v1");
    expect(OTEL_BUNDLE_P3_78_SERVER_EXTERNAL_PACKAGES.length).toBe(6);
  });

  it("detects static vs dynamic OTel imports", () => {
    expect(hasStaticOtelImport('import { trace } from "@opentelemetry/api"')).toBe(true);
    expect(hasStaticOtelImport('const api = await import("@opentelemetry/api")')).toBe(false);
    expect(
      hasStaticOtelImport('api: typeof import("@opentelemetry/api"),\n  const x = await import("@opentelemetry/api")'),
    ).toBe(false);
  });

  it("passes OTel bundle benchmark with live wiring", () => {
    const nextConfig = readFileSync(join(ROOT, "next.config.ts"), "utf8");
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    const instrumentation = readFileSync(join(ROOT, "instrumentation.ts"), "utf8");
    const experimentTrace = readFileSync(join(ROOT, "lib/storefront/experiment-trace.ts"), "utf8");

    const benchmark = runOtelBundleBenchmarkP378({
      bundleAnalyzerWired:
        nextConfig.includes("@next/bundle-analyzer") &&
        nextConfig.includes('process.env.ANALYZE === "true"'),
      analyzeScriptPresent: (pkg.scripts?.analyze ?? "").includes("ANALYZE=true"),
      serverExternalComplete: OTEL_BUNDLE_P3_78_SERVER_EXTERNAL_PACKAGES.every((name) =>
        nextConfig.includes(name),
      ),
      noStaticImportsInHotPaths: !hasStaticOtelImport(experimentTrace),
      instrumentationLazyInit: instrumentation.includes("experiment-otel-init"),
      experimentTraceIsolated: experimentTrace.includes("experiment-otel-span"),
    });

    expect(benchmark.passPct).toBe(100);
    expect(benchmark.passed).toBe(true);
  });

  it("passes full P3-78 OTel bundle audit", () => {
    const summary = auditOtelBundleP378(ROOT);
    expect(summary.bundleAnalyzerWired).toBe(true);
    expect(summary.serverExternalComplete).toBe(true);
    expect(summary.noStaticImportsInHotPaths).toBe(true);
    expect(summary.scoringPassed).toBe(true);
    expect(summary.artifactPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P3-78 wiring paths, CI gate, and artifact", () => {
    for (const path of OTEL_BUNDLE_P3_78_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[OTEL_BUNDLE_P3_78_CHECK_NPM_SCRIPT]).toContain(OTEL_BUNDLE_P3_78_UNIT_TEST);

    const ci = readFileSync(join(ROOT, OTEL_BUNDLE_P3_78_CI_WORKFLOW), "utf8");
    expect(ci).toContain(OTEL_BUNDLE_P3_78_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(readFileSync(join(ROOT, OTEL_BUNDLE_P3_78_ARTIFACT), "utf8"));
    expect(artifact.policyId).toBe(OTEL_BUNDLE_P3_78_POLICY_ID);

    const doc = readFileSync(join(ROOT, OTEL_BUNDLE_P3_78_DOC), "utf8");
    expect(doc).toContain(OTEL_BUNDLE_P3_78_POLICY_ID);
  });

  it("formats audit lines", () => {
    const summary = auditOtelBundleP378(ROOT);
    const lines = formatOtelBundleP378AuditLines(summary);
    expect(lines.some((line) => line.includes(OTEL_BUNDLE_P3_78_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
