import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { buildLaborForecastingCorpusP266 } from "@/lib/labor/labor-forecasting-ai-p2-66-corpus";
import {
  LABOR_FORECASTING_AI_P2_66_ARTIFACT,
  LABOR_FORECASTING_AI_P2_66_BUILDER,
  LABOR_FORECASTING_AI_P2_66_DEMAND_TABLE_TEST_ID,
  LABOR_FORECASTING_AI_P2_66_DOC,
  LABOR_FORECASTING_AI_P2_66_PANEL,
  LABOR_FORECASTING_AI_P2_66_PAGE,
  LABOR_FORECASTING_AI_P2_66_PANEL_TEST_ID,
  LABOR_FORECASTING_AI_P2_66_POLICY_ID,
  LABOR_FORECASTING_AI_P2_66_SCENARIO_COUNT,
  LABOR_FORECASTING_AI_P2_66_SCHEDULING_SERVICE,
  LABOR_FORECASTING_AI_P2_66_SERVICE,
  LABOR_FORECASTING_AI_P2_66_SUMMARY_TEST_ID,
  LABOR_FORECASTING_AI_P2_66_SEVENSHIFTS_PARITY_NOTE,
  LABOR_FORECASTING_AI_P2_66_WIRING_PATHS,
} from "@/lib/labor/labor-forecasting-ai-p2-66-policy";
import { runLaborForecastingBenchmarkP266 } from "@/lib/labor/labor-forecasting-ai-p2-66-scoring";

export type LaborForecastingAiP266AuditSummary = {
  policyId: typeof LABOR_FORECASTING_AI_P2_66_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  builderWired: boolean;
  serviceWired: boolean;
  schedulingServiceWired: boolean;
  panelWired: boolean;
  pageWired: boolean;
  corpusLoaded: boolean;
  scoringPassed: boolean;
  capabilityCoveragePct: number;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditLaborForecastingAiP266(
  root = process.cwd(),
): LaborForecastingAiP266AuditSummary {
  const wiringComplete = LABOR_FORECASTING_AI_P2_66_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, LABOR_FORECASTING_AI_P2_66_DOC))) {
    const source = readFileSync(join(root, LABOR_FORECASTING_AI_P2_66_DOC), "utf8");
    docWired =
      source.includes(LABOR_FORECASTING_AI_P2_66_POLICY_ID) &&
      source.includes("7shifts") &&
      source.includes(String(LABOR_FORECASTING_AI_P2_66_SCENARIO_COUNT));
  }

  let builderWired = false;
  if (existsSync(join(root, LABOR_FORECASTING_AI_P2_66_BUILDER))) {
    const source = readFileSync(join(root, LABOR_FORECASTING_AI_P2_66_BUILDER), "utf8");
    builderWired =
      source.includes("buildDeepLaborForecast") &&
      source.includes("buildAiSchedulePlan");
  }

  let serviceWired = false;
  if (existsSync(join(root, LABOR_FORECASTING_AI_P2_66_SERVICE))) {
    const source = readFileSync(join(root, LABOR_FORECASTING_AI_P2_66_SERVICE), "utf8");
    serviceWired =
      source.includes("buildDeepLaborForecast") &&
      !source.includes("Placeholder deterministic");
  }

  let schedulingServiceWired = false;
  if (existsSync(join(root, LABOR_FORECASTING_AI_P2_66_SCHEDULING_SERVICE))) {
    const source = readFileSync(join(root, LABOR_FORECASTING_AI_P2_66_SCHEDULING_SERVICE), "utf8");
    schedulingServiceWired =
      source.includes("buildAiSchedulePlan") &&
      source.includes("aggregateDemandByDayOfWeek");
  }

  let panelWired = false;
  if (existsSync(join(root, LABOR_FORECASTING_AI_P2_66_PANEL))) {
    const source = readFileSync(join(root, LABOR_FORECASTING_AI_P2_66_PANEL), "utf8");
    panelWired =
      source.includes(LABOR_FORECASTING_AI_P2_66_PANEL_TEST_ID) &&
      source.includes(LABOR_FORECASTING_AI_P2_66_SUMMARY_TEST_ID) &&
      source.includes(LABOR_FORECASTING_AI_P2_66_DEMAND_TABLE_TEST_ID) &&
      source.includes("7shifts");
  }

  let pageWired = false;
  if (existsSync(join(root, LABOR_FORECASTING_AI_P2_66_PAGE))) {
    const source = readFileSync(join(root, LABOR_FORECASTING_AI_P2_66_PAGE), "utf8");
    pageWired =
      source.includes("AiSchedulePanel") && source.includes("7shifts");
  }

  const corpus = buildLaborForecastingCorpusP266();
  const result = runLaborForecastingBenchmarkP266(corpus);
  const artifactPresent = existsSync(join(root, LABOR_FORECASTING_AI_P2_66_ARTIFACT));

  const passed =
    wiringComplete &&
    docWired &&
    builderWired &&
    serviceWired &&
    schedulingServiceWired &&
    panelWired &&
    pageWired &&
    corpus.length === LABOR_FORECASTING_AI_P2_66_SCENARIO_COUNT &&
    result.passed &&
    artifactPresent;

  return {
    policyId: LABOR_FORECASTING_AI_P2_66_POLICY_ID,
    wiringComplete,
    docWired,
    builderWired,
    serviceWired,
    schedulingServiceWired,
    panelWired,
    pageWired,
    corpusLoaded: corpus.length === LABOR_FORECASTING_AI_P2_66_SCENARIO_COUNT,
    scoringPassed: result.passed,
    capabilityCoveragePct: result.capabilityCoveragePct,
    artifactPresent,
    passed,
  };
}

export function formatLaborForecastingAiP266AuditLines(
  summary: LaborForecastingAiP266AuditSummary,
): string[] {
  return [
    `Labor forecasting AI (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"}`,
    `Builder: ${summary.builderWired ? "wired" : "missing"}`,
    `Labor forecast service: ${summary.serviceWired ? "wired" : "missing"}`,
    `AI scheduling service: ${summary.schedulingServiceWired ? "wired" : "missing"}`,
    `Panel: ${summary.panelWired ? "wired" : "missing"}`,
    `Page: ${summary.pageWired ? "yes" : "no"}`,
    `Corpus: ${summary.corpusLoaded ? "yes" : "no"} (${LABOR_FORECASTING_AI_P2_66_SCENARIO_COUNT} scenarios)`,
    `Capability coverage: ${summary.capabilityCoveragePct}%`,
    `Scoring passed: ${summary.scoringPassed ? "yes" : "no"}`,
    `Artifact: ${summary.artifactPresent ? "present" : "missing"}`,
    `7shifts parity: ${LABOR_FORECASTING_AI_P2_66_SEVENSHIFTS_PARITY_NOTE}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
