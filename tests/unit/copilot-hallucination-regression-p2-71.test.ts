import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditCopilotHallucinationRegressionP271,
  formatCopilotHallucinationRegressionP271AuditLines,
} from "@/lib/ai/copilot-hallucination-regression-p2-71-audit";
import { buildCopilotHallucinationCorpusP271 } from "@/lib/ai/copilot-hallucination-regression-p2-71-corpus";
import {
  COPILOT_HALLUCINATION_REGRESSION_P2_71_ARTIFACT,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_CHECK_NPM_SCRIPT,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_CI_NPM_SCRIPT,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_CI_WORKFLOW,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_DOC,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_MAX_HALLUCINATION_PCT,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_MIN_PASS_PCT,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_OPERATIONAL_COUNT,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_POLICY_ID,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_SCENARIO_COUNT,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_TRAP_COUNT,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_UNIT_TEST,
  COPILOT_HALLUCINATION_REGRESSION_P2_71_WIRING_PATHS,
} from "@/lib/ai/copilot-hallucination-regression-p2-71-policy";
import {
  buildDegradedCopilotHallucinationP271Scenarios,
  runCopilotHallucinationRegressionP271,
} from "@/lib/ai/copilot-hallucination-regression-p2-71-scoring";

const ROOT = process.cwd();

describe("Co-pilot hallucination regression (P2-71)", () => {
  it("locks P2-71 policy, 50 scenarios, and thresholds", () => {
    expect(COPILOT_HALLUCINATION_REGRESSION_P2_71_POLICY_ID).toBe(
      "copilot-hallucination-regression-p2-71-v1",
    );
    expect(COPILOT_HALLUCINATION_REGRESSION_P2_71_SCENARIO_COUNT).toBe(50);
    expect(COPILOT_HALLUCINATION_REGRESSION_P2_71_OPERATIONAL_COUNT).toBe(30);
    expect(COPILOT_HALLUCINATION_REGRESSION_P2_71_TRAP_COUNT).toBe(20);
    expect(COPILOT_HALLUCINATION_REGRESSION_P2_71_MIN_PASS_PCT).toBe(100);
    expect(COPILOT_HALLUCINATION_REGRESSION_P2_71_MAX_HALLUCINATION_PCT).toBe(0);
  });

  it("passes 50-scenario corpus at 100% with zero hallucination", () => {
    const corpus = buildCopilotHallucinationCorpusP271();
    expect(corpus.length).toBe(50);
    expect(corpus.filter((s) => s.safeFallback).length).toBe(20);

    const result = runCopilotHallucinationRegressionP271(corpus);
    expect(result.passPct).toBe(100);
    expect(result.hallucinationPct).toBe(0);
    expect(result.passed).toBe(true);
  });

  it("fails when degraded scenarios inject fabricated expected keywords", () => {
    const degraded = buildDegradedCopilotHallucinationP271Scenarios(
      buildCopilotHallucinationCorpusP271(),
    );
    const result = runCopilotHallucinationRegressionP271(degraded);
    expect(result.passed).toBe(false);
  });

  it("passes full P2-71 co-pilot hallucination regression audit", () => {
    const summary = auditCopilotHallucinationRegressionP271(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.patternsWired).toBe(true);
    expect(summary.builderWired).toBe(true);
    expect(summary.copilotServiceWired).toBe(true);
    expect(summary.guardrailsWired).toBe(true);
    expect(summary.noHallucinationWired).toBe(true);
    expect(summary.corpusLoaded).toBe(true);
    expect(summary.scoringPassed).toBe(true);
    expect(summary.passPct).toBe(100);
    expect(summary.hallucinationPct).toBe(0);
    expect(summary.artifactPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P2-71 wiring paths, CI gate, and artifact", () => {
    for (const path of COPILOT_HALLUCINATION_REGRESSION_P2_71_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[COPILOT_HALLUCINATION_REGRESSION_P2_71_CHECK_NPM_SCRIPT]).toContain(
      COPILOT_HALLUCINATION_REGRESSION_P2_71_UNIT_TEST,
    );
    expect(pkg.scripts?.[COPILOT_HALLUCINATION_REGRESSION_P2_71_CI_NPM_SCRIPT]).toContain(
      COPILOT_HALLUCINATION_REGRESSION_P2_71_UNIT_TEST,
    );

    const ci = readFileSync(
      join(ROOT, COPILOT_HALLUCINATION_REGRESSION_P2_71_CI_WORKFLOW),
      "utf8",
    );
    expect(ci).toContain(COPILOT_HALLUCINATION_REGRESSION_P2_71_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, COPILOT_HALLUCINATION_REGRESSION_P2_71_ARTIFACT), "utf8"),
    );
    expect(artifact.policyId).toBe(COPILOT_HALLUCINATION_REGRESSION_P2_71_POLICY_ID);
    expect(artifact.scenarioCount).toBe(50);
    expect(artifact.passPct).toBe(100);

    const doc = readFileSync(join(ROOT, COPILOT_HALLUCINATION_REGRESSION_P2_71_DOC), "utf8");
    expect(doc).toContain(COPILOT_HALLUCINATION_REGRESSION_P2_71_POLICY_ID);
    expect(doc).toContain("adversarial");
  });

  it("formats audit lines", () => {
    const summary = auditCopilotHallucinationRegressionP271(ROOT);
    const lines = formatCopilotHallucinationRegressionP271AuditLines(summary);
    expect(
      lines.some((line) => line.includes(COPILOT_HALLUCINATION_REGRESSION_P2_71_POLICY_ID)),
    ).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
