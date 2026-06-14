import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditLaborForecastingAiP266,
  formatLaborForecastingAiP266AuditLines,
} from "@/lib/labor/labor-forecasting-ai-p2-66-audit";
import { buildDeepLaborForecast } from "@/lib/labor/labor-forecasting-ai-p2-66-builder";
import { buildLaborForecastingCorpusP266 } from "@/lib/labor/labor-forecasting-ai-p2-66-corpus";
import {
  LABOR_FORECASTING_AI_P2_66_ARTIFACT,
  LABOR_FORECASTING_AI_P2_66_CHECK_NPM_SCRIPT,
  LABOR_FORECASTING_AI_P2_66_CI_NPM_SCRIPT,
  LABOR_FORECASTING_AI_P2_66_CI_WORKFLOW,
  LABOR_FORECASTING_AI_P2_66_DOC,
  LABOR_FORECASTING_AI_P2_66_FLOW_STEPS,
  LABOR_FORECASTING_AI_P2_66_FORECASTING_CAPABILITIES,
  LABOR_FORECASTING_AI_P2_66_MIN_CAPABILITY_COVERAGE_PCT,
  LABOR_FORECASTING_AI_P2_66_POLICY_ID,
  LABOR_FORECASTING_AI_P2_66_SCENARIO_COUNT,
  LABOR_FORECASTING_AI_P2_66_UNIT_TEST,
  LABOR_FORECASTING_AI_P2_66_WIRING_PATHS,
} from "@/lib/labor/labor-forecasting-ai-p2-66-policy";
import {
  buildDegradedLaborForecastingP266Scenarios,
  runLaborForecastingBenchmarkP266,
} from "@/lib/labor/labor-forecasting-ai-p2-66-scoring";
import { buildLaborForecastStub } from "@/services/forecast/labor-forecast-service";

const ROOT = process.cwd();

describe("Labor forecasting AI — 7shifts parity (P2-66)", () => {
  it("locks P2-66 policy, 12 scenarios, and forecast flow steps", () => {
    expect(LABOR_FORECASTING_AI_P2_66_POLICY_ID).toBe("labor-forecasting-ai-p2-66-v1");
    expect(LABOR_FORECASTING_AI_P2_66_SCENARIO_COUNT).toBe(12);
    expect(LABOR_FORECASTING_AI_P2_66_MIN_CAPABILITY_COVERAGE_PCT).toBe(100);
    expect(LABOR_FORECASTING_AI_P2_66_FORECASTING_CAPABILITIES).toHaveLength(7);
    expect(LABOR_FORECASTING_AI_P2_66_FLOW_STEPS).toEqual([
      "demand-by-dow",
      "headcount-recommendation",
      "labor-cost-projection",
      "shift-suggestions",
    ]);
  });

  it("builds deep labor forecast with 7-day horizon", () => {
    const forecast = buildDeepLaborForecast({
      weekStart: new Date("2026-06-02T00:00:00.000Z"),
      dowDemand: [
        { dayOfWeek: 1, avgRevenue: 1000, avgOrders: 40, sampleWeeks: 4 },
        { dayOfWeek: 2, avgRevenue: 900, avgOrders: 36, sampleWeeks: 4 },
        { dayOfWeek: 3, avgRevenue: 850, avgOrders: 34, sampleWeeks: 4 },
        { dayOfWeek: 4, avgRevenue: 950, avgOrders: 38, sampleWeeks: 4 },
        { dayOfWeek: 5, avgRevenue: 1200, avgOrders: 50, sampleWeeks: 4 },
        { dayOfWeek: 6, avgRevenue: 1400, avgOrders: 60, sampleWeeks: 4 },
        { dayOfWeek: 0, avgRevenue: 800, avgOrders: 30, sampleWeeks: 4 },
      ],
      targetLaborPct: 28,
      avgHourlyRate: 20,
      staffCount: 5,
    });

    expect(forecast.days).toHaveLength(7);
    expect(forecast.summary.totalProjectedRevenue).toBeGreaterThan(0);
    expect(forecast.summary.totalProjectedLaborHours).toBeGreaterThan(0);
    expect(forecast.summary.confidence).toBe("high");
  });

  it("delegates legacy stub to deep forecast builder", () => {
    const forecast = buildLaborForecastStub({ recentShiftHoursAvg: 24, horizonDays: 7 });
    expect(forecast.horizonDays).toBe(7);
    expect(forecast.days.length).toBe(7);
    expect(forecast.summary.notes.some((n) => n.includes("7shifts"))).toBe(true);
  });

  it("passes 12-scenario corpus at 100% capability coverage", () => {
    const corpus = buildLaborForecastingCorpusP266();
    expect(corpus.length).toBe(12);

    const result = runLaborForecastingBenchmarkP266(corpus);
    expect(result.capabilityCoveragePct).toBe(100);
    expect(result.uncoveredCapabilities).toEqual([]);
    expect(result.passed).toBe(true);
  });

  it("fails degraded corpus with incomplete capability coverage", () => {
    const degraded = buildDegradedLaborForecastingP266Scenarios();
    expect(runLaborForecastingBenchmarkP266(degraded).passed).toBe(false);
  });

  it("passes full wiring audit", () => {
    const audit = auditLaborForecastingAiP266(ROOT);
    expect(audit.passed, formatLaborForecastingAiP266AuditLines(audit).join("\n")).toBe(true);
  });

  it("registers CI scripts and wiring paths", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[LABOR_FORECASTING_AI_P2_66_CHECK_NPM_SCRIPT]).toBeTruthy();
    expect(pkg.scripts?.[LABOR_FORECASTING_AI_P2_66_CI_NPM_SCRIPT]).toBeTruthy();

    for (const rel of LABOR_FORECASTING_AI_P2_66_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), `missing ${rel}`).toBe(true);
    }

    const ci = readFileSync(join(ROOT, LABOR_FORECASTING_AI_P2_66_CI_WORKFLOW), "utf8");
    expect(ci).toContain(LABOR_FORECASTING_AI_P2_66_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, LABOR_FORECASTING_AI_P2_66_ARTIFACT), "utf8"),
    ) as { policyId: string };
    expect(artifact.policyId).toBe(LABOR_FORECASTING_AI_P2_66_POLICY_ID);

    const doc = readFileSync(join(ROOT, LABOR_FORECASTING_AI_P2_66_DOC), "utf8");
    expect(doc).toContain("7shifts");
  });
});
