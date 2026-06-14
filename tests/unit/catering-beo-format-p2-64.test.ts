import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import { buildCateringBeoFromQuote } from "@/lib/catering/catering-beo-p2-64-builder";
import {
  auditCateringBeoFormatP264,
  formatCateringBeoFormatP264AuditLines,
} from "@/lib/catering/catering-beo-p2-64-audit";
import { buildCateringBeoFormatCorpusP264 } from "@/lib/catering/catering-beo-p2-64-corpus";
import {
  CATERING_BEO_FORMAT_P2_64_ARTIFACT,
  CATERING_BEO_FORMAT_P2_64_CHECK_NPM_SCRIPT,
  CATERING_BEO_FORMAT_P2_64_CI_NPM_SCRIPT,
  CATERING_BEO_FORMAT_P2_64_CI_WORKFLOW,
  CATERING_BEO_FORMAT_P2_64_DOC,
  CATERING_BEO_FORMAT_P2_64_FLOW_STEPS,
  CATERING_BEO_FORMAT_P2_64_MIN_SECTION_COMPLETENESS_PCT,
  CATERING_BEO_FORMAT_P2_64_MIN_TIMELINE_ENTRIES,
  CATERING_BEO_FORMAT_P2_64_POLICY_ID,
  CATERING_BEO_FORMAT_P2_64_SCENARIO_COUNT,
  CATERING_BEO_FORMAT_P2_64_UNIT_TEST,
  CATERING_BEO_FORMAT_P2_64_WIRING_PATHS,
} from "@/lib/catering/catering-beo-p2-64-policy";
import {
  buildDegradedCateringBeoFormatP264Scenarios,
  runCateringBeoFormatBenchmarkP264,
} from "@/lib/catering/catering-beo-p2-64-scoring";

const ROOT = process.cwd();

describe("Catering BEO format — Tripleseat parity (P2-64)", () => {
  it("locks P2-64 policy, 10 scenarios, and BEO flow steps", () => {
    expect(CATERING_BEO_FORMAT_P2_64_POLICY_ID).toBe("catering-beo-format-p2-64-v1");
    expect(CATERING_BEO_FORMAT_P2_64_SCENARIO_COUNT).toBe(10);
    expect(CATERING_BEO_FORMAT_P2_64_MIN_SECTION_COMPLETENESS_PCT).toBe(95);
    expect(CATERING_BEO_FORMAT_P2_64_MIN_TIMELINE_ENTRIES).toBe(4);
    expect(CATERING_BEO_FORMAT_P2_64_FLOW_STEPS).toEqual([
      "quote-to-beo",
      "layout-section",
      "menu-section",
      "timeline-section",
    ]);
  });

  it("builds layout, menu, and timeline from a quote fixture", () => {
    const [scenario] = buildCateringBeoFormatCorpusP264();
    expect(scenario).toBeDefined();
    const beo = buildCateringBeoFromQuote(scenario!.input);
    expect(beo.layout.roomSetup).toContain("Corporate lunch");
    expect(beo.menu.length).toBeGreaterThanOrEqual(2);
    expect(beo.timeline.length).toBeGreaterThanOrEqual(CATERING_BEO_FORMAT_P2_64_MIN_TIMELINE_ENTRIES);
    expect(beo.specialInstructions.length).toBeGreaterThan(0);
  });

  it("passes 10-scenario golden corpus at 100% section completeness", () => {
    const corpus = buildCateringBeoFormatCorpusP264();
    expect(corpus.length).toBe(10);

    const result = runCateringBeoFormatBenchmarkP264(corpus);
    expect(result.sectionCompletenessPct).toBe(100);
    expect(result.passed).toBe(true);
  });

  it("fails when degraded scenarios drop menu sections", () => {
    const degraded = buildDegradedCateringBeoFormatP264Scenarios(
      buildCateringBeoFormatCorpusP264(),
    );
    const result = runCateringBeoFormatBenchmarkP264(degraded);
    expect(result.passed).toBe(false);
  });

  it("passes full P2-64 catering BEO format audit", () => {
    const summary = auditCateringBeoFormatP264(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.builderWired).toBe(true);
    expect(summary.serviceWired).toBe(true);
    expect(summary.componentWired).toBe(true);
    expect(summary.pageWired).toBe(true);
    expect(summary.quoteDetailWired).toBe(true);
    expect(summary.corpusLoaded).toBe(true);
    expect(summary.scoringPassed).toBe(true);
    expect(summary.sectionCompletenessPct).toBeGreaterThanOrEqual(95);
    expect(summary.artifactPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("P2-64 wiring paths, CI gate, and artifact", () => {
    for (const path of CATERING_BEO_FORMAT_P2_64_WIRING_PATHS) {
      expect(existsSync(join(ROOT, path)), `missing: ${path}`).toBe(true);
    }

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[CATERING_BEO_FORMAT_P2_64_CHECK_NPM_SCRIPT]).toContain(
      CATERING_BEO_FORMAT_P2_64_UNIT_TEST,
    );
    expect(pkg.scripts?.[CATERING_BEO_FORMAT_P2_64_CI_NPM_SCRIPT]).toContain(
      CATERING_BEO_FORMAT_P2_64_UNIT_TEST,
    );

    const ci = readFileSync(join(ROOT, CATERING_BEO_FORMAT_P2_64_CI_WORKFLOW), "utf8");
    expect(ci).toContain(CATERING_BEO_FORMAT_P2_64_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, CATERING_BEO_FORMAT_P2_64_ARTIFACT), "utf8"),
    );
    expect(artifact.policyId).toBe(CATERING_BEO_FORMAT_P2_64_POLICY_ID);
    expect(artifact.scenarioCount).toBe(10);

    const doc = readFileSync(join(ROOT, CATERING_BEO_FORMAT_P2_64_DOC), "utf8");
    expect(doc).toContain(CATERING_BEO_FORMAT_P2_64_POLICY_ID);
    expect(doc).toContain("Tripleseat");
  });

  it("formats audit lines", () => {
    const summary = auditCateringBeoFormatP264(ROOT);
    const lines = formatCateringBeoFormatP264AuditLines(summary);
    expect(lines.some((line) => line.includes(CATERING_BEO_FORMAT_P2_64_POLICY_ID))).toBe(true);
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
