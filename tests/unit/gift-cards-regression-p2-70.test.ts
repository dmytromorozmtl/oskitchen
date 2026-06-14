import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditGiftCardsRegressionP270,
  formatGiftCardsRegressionP270AuditLines,
} from "@/lib/gift-cards/gift-cards-regression-p2-70-audit";
import { buildGiftCardRegressionCorpusP270 } from "@/lib/gift-cards/gift-cards-regression-p2-70-corpus";
import {
  GIFT_CARDS_REGRESSION_P2_70_ARTIFACT,
  GIFT_CARDS_REGRESSION_P2_70_CHECK_NPM_SCRIPT,
  GIFT_CARDS_REGRESSION_P2_70_CI_NPM_SCRIPT,
  GIFT_CARDS_REGRESSION_P2_70_CI_WORKFLOW,
  GIFT_CARDS_REGRESSION_P2_70_DOC,
  GIFT_CARDS_REGRESSION_P2_70_FLOW_STEPS,
  GIFT_CARDS_REGRESSION_P2_70_POLICY_ID,
  GIFT_CARDS_REGRESSION_P2_70_SCENARIO_COUNT,
  GIFT_CARDS_REGRESSION_P2_70_UNIT_TEST,
  GIFT_CARDS_REGRESSION_P2_70_WIRING_PATHS,
} from "@/lib/gift-cards/gift-cards-regression-p2-70-policy";
import {
  buildDegradedGiftCardRegressionP270Scenarios,
  runGiftCardRegressionBenchmarkP270,
} from "@/lib/gift-cards/gift-cards-regression-p2-70-scoring";

const ROOT = process.cwd();

describe("Gift cards issue/redeem regression (P2-70)", () => {
  it("locks P2-70 policy, flow steps, and scenario count", () => {
    expect(GIFT_CARDS_REGRESSION_P2_70_POLICY_ID).toBe("gift-cards-regression-p2-70-v1");
    expect(GIFT_CARDS_REGRESSION_P2_70_SCENARIO_COUNT).toBe(8);
    expect(GIFT_CARDS_REGRESSION_P2_70_FLOW_STEPS).toEqual([
      "issue",
      "balance_check",
      "redeem_partial",
      "balance_after_partial",
      "redeem_remaining",
    ]);
  });

  it("passes 8-scenario golden corpus at 100%", () => {
    const corpus = buildGiftCardRegressionCorpusP270();
    expect(corpus.length).toBe(8);

    const result = runGiftCardRegressionBenchmarkP270(corpus);
    expect(result.passPct).toBe(100);
    expect(result.passedCount).toBe(8);
    expect(result.passed).toBe(true);
  });

  it("fails when degraded scenarios corrupt expected applied amounts", () => {
    const degraded = buildDegradedGiftCardRegressionP270Scenarios(
      buildGiftCardRegressionCorpusP270(),
    );
    const result = runGiftCardRegressionBenchmarkP270(degraded);
    expect(result.passed).toBe(false);
  });

  it("passes full P2-70 gift cards regression audit", () => {
    const summary = auditGiftCardsRegressionP270(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.flowWired).toBe(true);
    expect(summary.giftCardServiceWired).toBe(true);
    expect(summary.posCheckoutWired).toBe(true);
    expect(summary.dashboardWired).toBe(true);
    expect(summary.issueFormWired).toBe(true);
    expect(summary.corpusLoaded).toBe(true);
    expect(summary.scoringPassed).toBe(true);
    expect(summary.passPct).toBe(100);
    expect(summary.artifactPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P2-70 wiring paths, CI gate, and artifact", () => {
    for (const path of GIFT_CARDS_REGRESSION_P2_70_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[GIFT_CARDS_REGRESSION_P2_70_CHECK_NPM_SCRIPT]).toContain(
      GIFT_CARDS_REGRESSION_P2_70_UNIT_TEST,
    );
    expect(pkg.scripts?.[GIFT_CARDS_REGRESSION_P2_70_CI_NPM_SCRIPT]).toContain(
      GIFT_CARDS_REGRESSION_P2_70_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, GIFT_CARDS_REGRESSION_P2_70_CI_WORKFLOW), "utf8");
    expect(ci).toContain(GIFT_CARDS_REGRESSION_P2_70_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, GIFT_CARDS_REGRESSION_P2_70_ARTIFACT), "utf8"),
    );
    expect(artifact.policyId).toBe(GIFT_CARDS_REGRESSION_P2_70_POLICY_ID);
    expect(artifact.scenarioCount).toBe(8);
    expect(artifact.passPct).toBe(100);

    const doc = readFileSync(join(ROOT, GIFT_CARDS_REGRESSION_P2_70_DOC), "utf8");
    expect(doc).toContain(GIFT_CARDS_REGRESSION_P2_70_POLICY_ID);
    expect(doc).toContain("redeem partial");
  });

  it("formats audit lines", () => {
    const summary = auditGiftCardsRegressionP270(ROOT);
    const lines = formatGiftCardsRegressionP270AuditLines(summary);
    expect(lines.some((line) => line.includes(GIFT_CARDS_REGRESSION_P2_70_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
