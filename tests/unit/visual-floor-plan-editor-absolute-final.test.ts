import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditVisualFloorPlanEditorWiring } from "@/lib/restaurant/visual-floor-plan-editor-audit";
import {
  listFloorPlanSections,
  normalizeFloorPlanSection,
  resolveTableShapeClass,
  tableMatchesSectionFilter,
  VISUAL_FLOOR_PLAN_EDITOR_ABSOLUTE_FINAL_POLICY_ID,
  VISUAL_FLOOR_PLAN_EDITOR_CI_SCRIPTS,
  VISUAL_FLOOR_PLAN_EDITOR_MICROS_PARITY_PILLARS,
  VISUAL_FLOOR_PLAN_EDITOR_ROUTE,
  VISUAL_FLOOR_PLAN_EDITOR_UNIT_TEST,
  VISUAL_FLOOR_PLAN_TABLE_SHAPES,
} from "@/lib/restaurant/visual-floor-plan-editor-absolute-final-policy";

const ROOT = process.cwd();

describe("Visual floor plan editor (Absolute Final Task 92)", () => {
  it("locks absolute final policy and /dashboard/floor-plans route", () => {
    expect(VISUAL_FLOOR_PLAN_EDITOR_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "visual-floor-plan-editor-absolute-final-v1",
    );
    expect(VISUAL_FLOOR_PLAN_EDITOR_ROUTE).toBe("/dashboard/floor-plans");
    expect(VISUAL_FLOOR_PLAN_EDITOR_MICROS_PARITY_PILLARS).toHaveLength(7);
    expect(VISUAL_FLOOR_PLAN_TABLE_SHAPES).toEqual(["RECTANGLE", "CIRCLE", "SQUARE"]);
  });

  it("resolves MICROS table shapes and section zones", () => {
    expect(resolveTableShapeClass("CIRCLE")).toContain("rounded-full");
    expect(resolveTableShapeClass("SQUARE")).toContain("rounded-md");
    expect(resolveTableShapeClass("RECTANGLE")).toContain("rounded-xl");
    expect(normalizeFloorPlanSection(null)).toBe("Main dining");
    expect(normalizeFloorPlanSection(" Patio ")).toBe("Patio");

    const sections = listFloorPlanSections([
      { section: "Bar" },
      { section: null },
      { section: "Patio" },
    ]);
    expect(sections).toEqual(["Bar", "Main dining", "Patio"]);
    expect(tableMatchesSectionFilter("Bar", "Bar")).toBe(true);
    expect(tableMatchesSectionFilter("Bar", null)).toBe(true);
    expect(tableMatchesSectionFilter(null, "Main dining")).toBe(true);
  });

  it("passes wiring audit", () => {
    const audit = auditVisualFloorPlanEditorWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("registers CI cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of VISUAL_FLOOR_PLAN_EDITOR_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(VISUAL_FLOOR_PLAN_EDITOR_UNIT_TEST).toBe(
      "tests/unit/visual-floor-plan-editor-absolute-final.test.ts",
    );
  });
});
