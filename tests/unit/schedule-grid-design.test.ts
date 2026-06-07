import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditScheduleGridDesignWiring } from "@/lib/labor/schedule-grid-design-audit";
import {
  buildScheduleGridCellLaborOverlay,
  buildScheduleGridDayLaborOverlays,
  resolveScheduleGridLaborHeat,
  scheduleGridLaborHeatBarClass,
  scheduleGridLaborHeatCellClass,
  summarizeScheduleGridDesignConflicts,
} from "@/lib/labor/schedule-grid-design-data";
import {
  SCHEDULE_GRID_DESIGN_CI_SCRIPTS,
  SCHEDULE_GRID_DESIGN_FEATURES,
  SCHEDULE_GRID_DESIGN_POLICY_ID,
  SCHEDULE_GRID_DESIGN_ROUTE,
  SCHEDULE_GRID_DESIGN_TEST_ID,
  SCHEDULE_GRID_DESIGN_UNIT_TEST,
  SCHEDULE_GRID_DESIGN_UPSTREAM_POLICY_ID,
} from "@/lib/labor/schedule-grid-design-policy";

const ROOT = process.cwd();

describe("schedule grid design (Absolute Final Task 61)", () => {
  it("locks design policy extending drag-drop", () => {
    expect(SCHEDULE_GRID_DESIGN_POLICY_ID).toBe("schedule-grid-design-absolute-final-v1");
    expect(SCHEDULE_GRID_DESIGN_UPSTREAM_POLICY_ID).toBe("schedule-grid-drag-drop-absolute-final-v1");
    expect(SCHEDULE_GRID_DESIGN_ROUTE).toBe("/dashboard/staff/schedule");
    expect(SCHEDULE_GRID_DESIGN_TEST_ID).toBe("schedule-grid-design");
    expect(SCHEDULE_GRID_DESIGN_FEATURES).toContain("daily_labor_overlay");
    expect(SCHEDULE_GRID_DESIGN_FEATURES).toContain("overlap_conflict_highlight");
  });

  it("builds day and cell labour heat overlays", () => {
    const days = ["2026-06-02", "2026-06-03", "2026-06-04"];
    const overlays = buildScheduleGridDayLaborOverlays({
      days,
      dailyLaborTotals: { "2026-06-02": 400, "2026-06-03": 1200, "2026-06-04": 200 },
      weekLaborTotal: 1800,
    });
    expect(overlays[1]?.heat).toBe("high");
    expect(overlays[1]?.sharePercent).toBeGreaterThan(18);

    expect(resolveScheduleGridLaborHeat(8)).toBe("low");
    expect(buildScheduleGridCellLaborOverlay(150, 1000).heat).toBe("medium");
    expect(scheduleGridLaborHeatCellClass("high")).toContain("violet");
    expect(scheduleGridLaborHeatBarClass("medium")).toContain("violet");
  });

  it("summarizes overlap and overtime conflicts", () => {
    const summary = summarizeScheduleGridDesignConflicts([
      { kind: "overlap", shiftId: "a", message: "overlap" },
      { kind: "weekly_overtime", shiftId: "b", message: "ot" },
    ]);
    expect(summary.overlapCount).toBe(1);
    expect(summary.overtimeCount).toBe(1);
    expect(summary.hasBlockingConflict).toBe(true);
  });

  it("audits schedule grid design wiring in panel", () => {
    const audit = auditScheduleGridDesignWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);

    const panel = readFileSync(
      join(ROOT, "components/dashboard/staff/schedule-grid-drag-drop.tsx"),
      "utf8",
    );
    expect(panel).toContain("SCHEDULE_GRID_LABOR_OVERLAY_TEST_ID");
    expect(existsSync(join(ROOT, "lib/labor/schedule-grid-design-data.ts"))).toBe(true);
  });

  it("ships npm cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of SCHEDULE_GRID_DESIGN_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(SCHEDULE_GRID_DESIGN_UNIT_TEST).toBe("tests/unit/schedule-grid-design.test.ts");
  });
});
