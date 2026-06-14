import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditFloorPlanEditorP265,
  formatFloorPlanEditorP265AuditLines,
} from "@/lib/restaurant/floor-plan-editor-p2-65-audit";
import { buildFloorPlanEditorCorpusP265 } from "@/lib/restaurant/floor-plan-editor-p2-65-corpus";
import {
  FLOOR_PLAN_EDITOR_P2_65_ARTIFACT,
  FLOOR_PLAN_EDITOR_P2_65_CHECK_NPM_SCRIPT,
  FLOOR_PLAN_EDITOR_P2_65_CI_NPM_SCRIPT,
  FLOOR_PLAN_EDITOR_P2_65_CI_WORKFLOW,
  FLOOR_PLAN_EDITOR_P2_65_DOC,
  FLOOR_PLAN_EDITOR_P2_65_FLOW_STEPS,
  FLOOR_PLAN_EDITOR_P2_65_MIN_CAPABILITY_COVERAGE_PCT,
  FLOOR_PLAN_EDITOR_P2_65_POLICY_ID,
  FLOOR_PLAN_EDITOR_P2_65_SCENARIO_COUNT,
  FLOOR_PLAN_EDITOR_P2_65_TABLE_MANAGEMENT_CAPABILITIES,
  FLOOR_PLAN_EDITOR_P2_65_UNIT_TEST,
  FLOOR_PLAN_EDITOR_P2_65_WIRING_PATHS,
} from "@/lib/restaurant/floor-plan-editor-p2-65-policy";
import {
  buildDegradedFloorPlanEditorP265Scenarios,
  runFloorPlanEditorBenchmarkP265,
} from "@/lib/restaurant/floor-plan-editor-p2-65-scoring";
import {
  computeCapabilityCoveragePct,
  isAllowedTableStatusTransition,
  listAllowedNextStatuses,
} from "@/lib/restaurant/floor-plan-table-management-p2-65";

const ROOT = process.cwd();

describe("Floor plan editor — Lightspeed parity (P2-65)", () => {
  it("locks P2-65 policy, 12 scenarios, and editor flow steps", () => {
    expect(FLOOR_PLAN_EDITOR_P2_65_POLICY_ID).toBe("floor-plan-editor-p2-65-v1");
    expect(FLOOR_PLAN_EDITOR_P2_65_SCENARIO_COUNT).toBe(12);
    expect(FLOOR_PLAN_EDITOR_P2_65_MIN_CAPABILITY_COVERAGE_PCT).toBe(100);
    expect(FLOOR_PLAN_EDITOR_P2_65_TABLE_MANAGEMENT_CAPABILITIES).toHaveLength(8);
    expect(FLOOR_PLAN_EDITOR_P2_65_FLOW_STEPS).toEqual([
      "visual-canvas",
      "drag-reposition",
      "table-management-panel",
      "realtime-sync",
    ]);
  });

  it("validates table status transitions for real-time management", () => {
    expect(isAllowedTableStatusTransition("AVAILABLE", "OCCUPIED")).toBe(true);
    expect(isAllowedTableStatusTransition("OCCUPIED", "DIRTY")).toBe(true);
    expect(isAllowedTableStatusTransition("DIRTY", "AVAILABLE")).toBe(false);
    expect(listAllowedNextStatuses("DIRTY")).toContain("CLEANING");
  });

  it("passes 12-scenario corpus at 100% capability coverage", () => {
    const corpus = buildFloorPlanEditorCorpusP265();
    expect(corpus.length).toBe(12);

    const result = runFloorPlanEditorBenchmarkP265(corpus);
    expect(result.capabilityCoveragePct).toBe(100);
    expect(result.uncoveredCapabilities).toEqual([]);
    expect(result.realtimeScenarioCount).toBeGreaterThanOrEqual(6);
    expect(result.passed).toBe(true);
  });

  it("fails degraded corpus with incomplete capability coverage", () => {
    const degraded = buildDegradedFloorPlanEditorP265Scenarios();
    const coverage = computeCapabilityCoveragePct(
      degraded.flatMap((s) => s.capabilities),
    );
    expect(coverage).toBeLessThan(100);
    expect(runFloorPlanEditorBenchmarkP265(degraded).passed).toBe(false);
  });

  it("passes full wiring audit", () => {
    const audit = auditFloorPlanEditorP265(ROOT);
    expect(audit.passed, formatFloorPlanEditorP265AuditLines(audit).join("\n")).toBe(true);
  });

  it("registers CI scripts and wiring paths", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[FLOOR_PLAN_EDITOR_P2_65_CHECK_NPM_SCRIPT]).toBeTruthy();
    expect(pkg.scripts?.[FLOOR_PLAN_EDITOR_P2_65_CI_NPM_SCRIPT]).toBeTruthy();
    expect(FLOOR_PLAN_EDITOR_P2_65_UNIT_TEST).toBe(
      "tests/unit/floor-plan-editor-p2-65.test.ts",
    );

    for (const rel of FLOOR_PLAN_EDITOR_P2_65_WIRING_PATHS) {
      expect(existsSync(join(ROOT, rel)), `missing ${rel}`).toBe(true);
    }

    const ci = readFileSync(join(ROOT, FLOOR_PLAN_EDITOR_P2_65_CI_WORKFLOW), "utf8");
    expect(ci).toContain(FLOOR_PLAN_EDITOR_P2_65_CHECK_NPM_SCRIPT);

    const artifact = JSON.parse(
      readFileSync(join(ROOT, FLOOR_PLAN_EDITOR_P2_65_ARTIFACT), "utf8"),
    ) as { policyId: string; capabilityCoveragePct: number };
    expect(artifact.policyId).toBe(FLOOR_PLAN_EDITOR_P2_65_POLICY_ID);
    expect(artifact.capabilityCoveragePct).toBe(100);

    const doc = readFileSync(join(ROOT, FLOOR_PLAN_EDITOR_P2_65_DOC), "utf8");
    expect(doc).toContain("Lightspeed");
  });
});
