import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditCopilotAccuracyBenchmarkP269,
  formatCopilotAccuracyBenchmarkP269AuditLines,
} from "@/lib/ai/copilot-accuracy-benchmark-p2-69-audit";
import { buildCopilotAccuracyCorpusP269 } from "@/lib/ai/copilot-accuracy-benchmark-p2-69-corpus";
import {
  COPILOT_ACCURACY_BENCHMARK_P2_69_ARTIFACT,
  COPILOT_ACCURACY_BENCHMARK_P2_69_CHECK_NPM_SCRIPT,
  COPILOT_ACCURACY_BENCHMARK_P2_69_CI_NPM_SCRIPT,
  COPILOT_ACCURACY_BENCHMARK_P2_69_CI_WORKFLOW,
  COPILOT_ACCURACY_BENCHMARK_P2_69_DOC,
  COPILOT_ACCURACY_BENCHMARK_P2_69_MAX_HALLUCINATION_PCT,
  COPILOT_ACCURACY_BENCHMARK_P2_69_MIN_ACCURACY_PCT,
  COPILOT_ACCURACY_BENCHMARK_P2_69_POLICY_ID,
  COPILOT_ACCURACY_BENCHMARK_P2_69_SCENARIO_COUNT,
  COPILOT_ACCURACY_BENCHMARK_P2_69_UNIT_TEST,
  COPILOT_ACCURACY_BENCHMARK_P2_69_WIRING_PATHS,
} from "@/lib/ai/copilot-accuracy-benchmark-p2-69-policy";
import {
  buildDegradedCopilotAccuracyP269Scenarios,
  runCopilotAccuracyBenchmarkP269,
} from "@/lib/ai/copilot-accuracy-benchmark-p2-69-scoring";

const ROOT = process.cwd();

describe("AI co-pilot accuracy benchmarks (P2-69)", () => {
  it("locks P2-69 policy, 25 scenarios, and thresholds", () => {
    expect(COPILOT_ACCURACY_BENCHMARK_P2_69_POLICY_ID).toBe(
      "copilot-accuracy-benchmark-p2-69-v1",
    );
    expect(COPILOT_ACCURACY_BENCHMARK_P2_69_SCENARIO_COUNT).toBe(25);
    expect(COPILOT_ACCURACY_BENCHMARK_P2_69_MIN_ACCURACY_PCT).toBe(95);
    expect(COPILOT_ACCURACY_BENCHMARK_P2_69_MAX_HALLUCINATION_PCT).toBe(0);
  });

  it("passes 25-scenario golden corpus at 100% accuracy with zero hallucination", () => {
    const corpus = buildCopilotAccuracyCorpusP269();
    expect(corpus.length).toBe(25);

    const result = runCopilotAccuracyBenchmarkP269(corpus);
    expect(result.answerAccuracyPct).toBe(100);
    expect(result.hallucinationPct).toBe(0);
    expect(result.passed).toBe(true);
  });

  it("fails when degraded scenarios inject fabricated expected keywords", () => {
    const degraded = buildDegradedCopilotAccuracyP269Scenarios(
      buildCopilotAccuracyCorpusP269(),
    );
    const result = runCopilotAccuracyBenchmarkP269(degraded);
    expect(result.passed).toBe(false);
  });

  it("passes full P2-69 co-pilot accuracy audit", () => {
    const summary = auditCopilotAccuracyBenchmarkP269(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.builderWired).toBe(true);
    expect(summary.copilotServiceWired).toBe(true);
    expect(summary.corpusLoaded).toBe(true);
    expect(summary.scoringPassed).toBe(true);
    expect(summary.answerAccuracyPct).toBeGreaterThanOrEqual(95);
    expect(summary.hallucinationPct).toBe(0);
    expect(summary.artifactPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P2-69 wiring paths, CI gate, and artifact", () => {
    for (const path of COPILOT_ACCURACY_BENCHMARK_P2_69_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[COPILOT_ACCURACY_BENCHMARK_P2_69_CHECK_NPM_SCRIPT]).toContain(
      COPILOT_ACCURACY_BENCHMARK_P2_69_UNIT_TEST,
    );
    expect(pkg.scripts?.[COPILOT_ACCURACY_BENCHMARK_P2_69_CI_NPM_SCRIPT]).toContain(
      COPILOT_ACCURACY_BENCHMARK_P2_69_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, COPILOT_ACCURACY_BENCHMARK_P2_69_CI_WORKFLOW), "utf8");
    expect(ci).toContain(COPILOT_ACCURACY_BENCHMARK_P2_69_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, COPILOT_ACCURACY_BENCHMARK_P2_69_ARTIFACT), "utf8"),
    );
    expect(artifact.policyId).toBe(COPILOT_ACCURACY_BENCHMARK_P2_69_POLICY_ID);
    expect(artifact.scenarioCount).toBe(25);
    expect(artifact.answerAccuracyPct).toBeGreaterThanOrEqual(95);

    const doc = readFileSync(join(ROOT, COPILOT_ACCURACY_BENCHMARK_P2_69_DOC), "utf8");
    expect(doc).toContain(COPILOT_ACCURACY_BENCHMARK_P2_69_POLICY_ID);
    expect(doc).toContain("hallucination");
  });

  it("formats audit lines", () => {
    const summary = auditCopilotAccuracyBenchmarkP269(ROOT);
    const lines = formatCopilotAccuracyBenchmarkP269AuditLines(summary);
    expect(lines.some((line) => line.includes(COPILOT_ACCURACY_BENCHMARK_P2_69_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
