import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { buildFloorPlanEditorCorpusP265 } from "@/lib/restaurant/floor-plan-editor-p2-65-corpus";
import {
  FLOOR_PLAN_EDITOR_P2_65_ARTIFACT,
  FLOOR_PLAN_EDITOR_P2_65_CANVAS_TEST_ID,
  FLOOR_PLAN_EDITOR_P2_65_COMPONENT,
  FLOOR_PLAN_EDITOR_P2_65_CONNECTION_TEST_ID,
  FLOOR_PLAN_EDITOR_P2_65_DOC,
  FLOOR_PLAN_EDITOR_P2_65_EDITOR_TEST_ID,
  FLOOR_PLAN_EDITOR_P2_65_LIGHTSPEED_PARITY_NOTE,
  FLOOR_PLAN_EDITOR_P2_65_PAGE,
  FLOOR_PLAN_EDITOR_P2_65_POLICY_ID,
  FLOOR_PLAN_EDITOR_P2_65_REALTIME_HOOK,
  FLOOR_PLAN_EDITOR_P2_65_SCENARIO_COUNT,
  FLOOR_PLAN_EDITOR_P2_65_TABLE_MGMT_TEST_ID,
  FLOOR_PLAN_EDITOR_P2_65_WIRING_PATHS,
} from "@/lib/restaurant/floor-plan-editor-p2-65-policy";
import { runFloorPlanEditorBenchmarkP265 } from "@/lib/restaurant/floor-plan-editor-p2-65-scoring";

export type FloorPlanEditorP265AuditSummary = {
  policyId: typeof FLOOR_PLAN_EDITOR_P2_65_POLICY_ID;
  wiringComplete: boolean;
  docWired: boolean;
  componentWired: boolean;
  pageWired: boolean;
  realtimeHookWired: boolean;
  corpusLoaded: boolean;
  scoringPassed: boolean;
  capabilityCoveragePct: number;
  artifactPresent: boolean;
  passed: boolean;
};

export function auditFloorPlanEditorP265(root = process.cwd()): FloorPlanEditorP265AuditSummary {
  const wiringComplete = FLOOR_PLAN_EDITOR_P2_65_WIRING_PATHS.every((rel) =>
    existsSync(join(root, rel)),
  );

  let docWired = false;
  if (existsSync(join(root, FLOOR_PLAN_EDITOR_P2_65_DOC))) {
    const source = readFileSync(join(root, FLOOR_PLAN_EDITOR_P2_65_DOC), "utf8");
    docWired =
      source.includes(FLOOR_PLAN_EDITOR_P2_65_POLICY_ID) &&
      source.includes("Lightspeed") &&
      source.includes(String(FLOOR_PLAN_EDITOR_P2_65_SCENARIO_COUNT));
  }

  let componentWired = false;
  if (existsSync(join(root, FLOOR_PLAN_EDITOR_P2_65_COMPONENT))) {
    const source = readFileSync(join(root, FLOOR_PLAN_EDITOR_P2_65_COMPONENT), "utf8");
    componentWired =
      source.includes(FLOOR_PLAN_EDITOR_P2_65_EDITOR_TEST_ID) &&
      source.includes(FLOOR_PLAN_EDITOR_P2_65_CANVAS_TEST_ID) &&
      source.includes(FLOOR_PLAN_EDITOR_P2_65_TABLE_MGMT_TEST_ID) &&
      source.includes(FLOOR_PLAN_EDITOR_P2_65_CONNECTION_TEST_ID) &&
      source.includes("useFloorPlanRealtime") &&
      source.includes("handleStatusChange") &&
      source.includes("Lightspeed parity");
  }

  let pageWired = false;
  if (existsSync(join(root, FLOOR_PLAN_EDITOR_P2_65_PAGE))) {
    const source = readFileSync(join(root, FLOOR_PLAN_EDITOR_P2_65_PAGE), "utf8");
    pageWired =
      source.includes("FloorPlanEditor") && source.includes("Lightspeed");
  }

  let realtimeHookWired = false;
  if (existsSync(join(root, FLOOR_PLAN_EDITOR_P2_65_REALTIME_HOOK))) {
    const source = readFileSync(join(root, FLOOR_PLAN_EDITOR_P2_65_REALTIME_HOOK), "utf8");
    realtimeHookWired =
      source.includes("useFloorPlanRealtime") &&
      source.includes("subscribeFloorPlanUpdates");
  }

  const corpus = buildFloorPlanEditorCorpusP265();
  const result = runFloorPlanEditorBenchmarkP265(corpus);
  const artifactPresent = existsSync(join(root, FLOOR_PLAN_EDITOR_P2_65_ARTIFACT));

  const passed =
    wiringComplete &&
    docWired &&
    componentWired &&
    pageWired &&
    realtimeHookWired &&
    corpus.length === FLOOR_PLAN_EDITOR_P2_65_SCENARIO_COUNT &&
    result.passed &&
    artifactPresent;

  return {
    policyId: FLOOR_PLAN_EDITOR_P2_65_POLICY_ID,
    wiringComplete,
    docWired,
    componentWired,
    pageWired,
    realtimeHookWired,
    corpusLoaded: corpus.length === FLOOR_PLAN_EDITOR_P2_65_SCENARIO_COUNT,
    scoringPassed: result.passed,
    capabilityCoveragePct: result.capabilityCoveragePct,
    artifactPresent,
    passed,
  };
}

export function formatFloorPlanEditorP265AuditLines(
  summary: FloorPlanEditorP265AuditSummary,
): string[] {
  return [
    `Floor plan editor (${summary.policyId})`,
    `Wiring paths: ${summary.wiringComplete ? "yes" : "no"}`,
    `Doc: ${summary.docWired ? "yes" : "no"}`,
    `Component: ${summary.componentWired ? "wired" : "missing"}`,
    `Page: ${summary.pageWired ? "yes" : "no"}`,
    `Realtime hook: ${summary.realtimeHookWired ? "wired" : "missing"}`,
    `Corpus: ${summary.corpusLoaded ? "yes" : "no"} (${FLOOR_PLAN_EDITOR_P2_65_SCENARIO_COUNT} scenarios)`,
    `Capability coverage: ${summary.capabilityCoveragePct}%`,
    `Scoring passed: ${summary.scoringPassed ? "yes" : "no"}`,
    `Artifact: ${summary.artifactPresent ? "present" : "missing"}`,
    `Lightspeed parity: ${FLOOR_PLAN_EDITOR_P2_65_LIGHTSPEED_PARITY_NOTE}`,
    `Passed: ${summary.passed ? "YES" : "NO"}`,
  ];
}
