import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditAiBriefingAccuracyBenchmarkP261,
  formatAiBriefingAccuracyBenchmarkP261AuditLines,
} from "@/lib/ai/ai-briefing-accuracy-benchmark-p2-61-audit";
import { buildAiBriefingAccuracyCorpusP261 } from "@/lib/ai/ai-briefing-accuracy-benchmark-p2-61-corpus";
import {
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_ARTIFACT,
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_CHECK_NPM_SCRIPT,
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_CI_NPM_SCRIPT,
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_CI_WORKFLOW,
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_DOC,
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_MAX_HALLUCINATION_PCT,
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_MIN_RECALL_PCT,
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_MIN_ROUTE_ACCURACY_PCT,
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_POLICY_ID,
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_SCENARIO_COUNT,
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_UNIT_TEST,
  AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_WIRING_PATHS,
} from "@/lib/ai/ai-briefing-accuracy-benchmark-p2-61-policy";
import {
  buildDegradedAiBriefingAccuracyP261Scenarios,
  runAiBriefingAccuracyBenchmarkP261,
} from "@/lib/ai/ai-briefing-accuracy-benchmark-p2-61-scoring";

const ROOT = process.cwd();

describe("AI briefing accuracy benchmarks — Toast IQ parity (P2-61)", () => {
  it("locks P2-61 policy, 25 scenarios, and thresholds", () => {
    expect(AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_POLICY_ID).toBe(
      "ai-briefing-accuracy-benchmark-p2-61-v1",
    );
    expect(AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_SCENARIO_COUNT).toBe(25);
    expect(AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_MIN_RECALL_PCT).toBe(95);
    expect(AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_MIN_ROUTE_ACCURACY_PCT).toBe(95);
    expect(AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_MAX_HALLUCINATION_PCT).toBe(0);
  });

  it("passes 25-scenario golden corpus at 100% recall and routes", () => {
    const corpus = buildAiBriefingAccuracyCorpusP261();
    expect(corpus.length).toBe(25);

    const result = runAiBriefingAccuracyBenchmarkP261(corpus);
    expect(result.insightRecallPct).toBe(100);
    expect(result.routeAccuracyPct).toBe(100);
    expect(result.hallucinationPct).toBe(0);
    expect(result.passed).toBe(true);
  });

  it("fails when degraded scenarios inject fabricated insight types", () => {
    const degraded = buildDegradedAiBriefingAccuracyP261Scenarios(
      buildAiBriefingAccuracyCorpusP261(),
    );
    const result = runAiBriefingAccuracyBenchmarkP261(degraded);
    expect(result.passed).toBe(false);
  });

  it("passes full P2-61 AI briefing accuracy audit", () => {
    const summary = auditAiBriefingAccuracyBenchmarkP261(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.corpusLoaded).toBe(true);
    expect(summary.scoringPassed).toBe(true);
    expect(summary.insightRecallPct).toBeGreaterThanOrEqual(95);
    expect(summary.routeAccuracyPct).toBeGreaterThanOrEqual(95);
    expect(summary.hallucinationPct).toBe(0);
    expect(summary.artifactPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P2-61 wiring paths, CI gate, and artifact", () => {
    for (const path of AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_CHECK_NPM_SCRIPT]).toContain(
      AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_UNIT_TEST,
    );
    expect(pkg.scripts?.[AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_CI_NPM_SCRIPT]).toContain(
      AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_CI_WORKFLOW), "utf8");
    expect(ci).toContain(AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_ARTIFACT), "utf8"),
    );
    expect(artifact.policyId).toBe(AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_POLICY_ID);
    expect(artifact.scenarioCount).toBe(25);
    expect(artifact.insightRecallPct).toBeGreaterThanOrEqual(95);

    const doc = readFileSync(join(ROOT, AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_DOC), "utf8");
    expect(doc).toContain(AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_POLICY_ID);
    expect(doc).toContain("Toast IQ");
  });

  it("formats audit lines", () => {
    const summary = auditAiBriefingAccuracyBenchmarkP261(ROOT);
    const lines = formatAiBriefingAccuracyBenchmarkP261AuditLines(summary);
    expect(lines.some((line) => line.includes(AI_BRIEFING_ACCURACY_BENCHMARK_P2_61_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
