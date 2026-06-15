import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  auditNinetyDaySprintBoardP3_140,
  formatNinetyDaySprintBoardP3_140AuditLines,
} from "@/lib/pm/ninety-day-sprint-board-p3-140-audit";
import {
  loadNinetyDaySprintBoardPmRegistry,
  validateNinetyDaySprintBoardPmRegistry,
} from "@/lib/pm/ninety-day-sprint-board-p3-140-operations";
import {
  NINETY_DAY_SPRINT_BOARD_P3_140_CI_WORKFLOW,
  NINETY_DAY_SPRINT_BOARD_P3_140_DOC,
  NINETY_DAY_SPRINT_BOARD_P3_140_NPM_SCRIPT,
  NINETY_DAY_SPRINT_BOARD_P3_140_POLICY_ID,
  NINETY_DAY_SPRINT_BOARD_P3_140_SPRINT_COUNT,
  NINETY_DAY_SPRINT_BOARD_P3_140_SPRINT_DURATION_WEEKS,
  NINETY_DAY_SPRINT_BOARD_P3_140_TOTAL_WEEKS,
  NINETY_DAY_SPRINT_BOARD_P3_140_UNIT_TEST,
} from "@/lib/pm/ninety-day-sprint-board-p3-140-policy";

const ROOT = process.cwd();

describe("90-day sprint board PM (P3-140)", () => {
  it("locks policy id, 12 weeks, and 6 two-week sprints", () => {
    expect(NINETY_DAY_SPRINT_BOARD_P3_140_POLICY_ID).toBe("ninety-day-sprint-board-p3-140-v1");
    expect(NINETY_DAY_SPRINT_BOARD_P3_140_TOTAL_WEEKS).toBe(12);
    expect(NINETY_DAY_SPRINT_BOARD_P3_140_SPRINT_COUNT).toBe(6);
    expect(NINETY_DAY_SPRINT_BOARD_P3_140_SPRINT_DURATION_WEEKS).toBe(2);
  });

  it("validates registry with zero active pilots", () => {
    const registry = loadNinetyDaySprintBoardPmRegistry(ROOT);
    const validation = validateNinetyDaySprintBoardPmRegistry(registry);
    expect(validation.valid).toBe(true);
    expect(validation.zeroActivePilot).toBe(true);
    expect(registry.activePilotCount).toBe(0);
    expect(registry.weeks).toHaveLength(12);
    expect(registry.sprints).toHaveLength(6);
  });

  it("passes full 90-day sprint board PM audit", () => {
    const summary = auditNinetyDaySprintBoardP3_140(ROOT);
    expect(summary.wiringComplete).toBe(true);
    expect(summary.docWired).toBe(true);
    expect(summary.registryValid).toBe(true);
    expect(summary.livePilotMetricsPassed).toBe(true);
    expect(summary.relatedDocsReferenced).toBe(true);
    expect(summary.weeksDocumented).toBe(true);
    expect(summary.sprintsDocumented).toBe(true);
    expect(summary.honestyMarkersPresent).toBe(true);
    expect(summary.passed).toBe(true);
  });

  it("registers audit script, npm script, and deploy gate", () => {
    expect(existsSync(join(ROOT, NINETY_DAY_SPRINT_BOARD_P3_140_DOC))).toBe(true);
    expect(existsSync(join(ROOT, NINETY_DAY_SPRINT_BOARD_P3_140_UNIT_TEST))).toBe(true);

    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    expect(pkg.scripts?.[NINETY_DAY_SPRINT_BOARD_P3_140_NPM_SCRIPT]).toContain(
      "audit-ninety-day-sprint-board-p3-140.ts",
    );
    expect(pkg.scripts?.["test:ci:ninety-day-sprint-board-p3-140"]).toContain(
      NINETY_DAY_SPRINT_BOARD_P3_140_UNIT_TEST,
    );

    const workflow = readFileSync(join(ROOT, NINETY_DAY_SPRINT_BOARD_P3_140_CI_WORKFLOW), "utf8");
    expect(workflow).toContain("audit:ninety-day-sprint-board-p3-140");
  });

  it("formats audit lines", () => {
    const summary = auditNinetyDaySprintBoardP3_140(ROOT);
    const lines = formatNinetyDaySprintBoardP3_140AuditLines(summary);
    expect(lines.some((line) => line.includes(NINETY_DAY_SPRINT_BOARD_P3_140_POLICY_ID))).toBe(
      true,
    );
    expect(lines.some((line) => line.includes("Passed: YES"))).toBe(true);
  });
});
