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
  VISUAL_FLOOR_PLAN_EDITOR_HONESTY_MARKERS,
  VISUAL_FLOOR_PLAN_EDITOR_MICROS_PARITY_PILLARS,
  VISUAL_FLOOR_PLAN_EDITOR_ROUTE,
  VISUAL_FLOOR_PLAN_TABLE_SHAPES,
} from "@/lib/restaurant/visual-floor-plan-editor-absolute-final-policy";
import { auditQaFullCoverageSlot } from "@/lib/qa/absolute-final-qa-full-coverage-audit";
import {
  getQaFullCoverageSlot,
  QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/qa/absolute-final-qa-full-coverage-policy";

const ROOT = process.cwd();
/** Absolute Final Task 107 — QA full coverage for feature 92 visual floor plan editor */
const TASK = 107;
const FEATURE = 92;

describe(`QA full coverage — visual floor plan editor (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks QA registry slot 107 → feature 92 Oracle MICROS floor plan editor", () => {
    expect(QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-qa-full-coverage-v1");
    const slot = getQaFullCoverageSlot(TASK);
    expect(slot?.featureKey).toBe("visual-floor-plan-editor");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.baseCertTest).toBe("tests/unit/visual-floor-plan-editor-absolute-final.test.ts");
    expect(VISUAL_FLOOR_PLAN_EDITOR_MICROS_PARITY_PILLARS).toHaveLength(7);
    expect(VISUAL_FLOOR_PLAN_EDITOR_ROUTE).toBe("/dashboard/floor-plans");
  });

  it("resolves all MICROS table shapes and section zone helpers", () => {
    for (const shape of VISUAL_FLOOR_PLAN_TABLE_SHAPES) {
      expect(resolveTableShapeClass(shape).length).toBeGreaterThan(0);
    }
    expect(normalizeFloorPlanSection("  Bar  ")).toBe("Bar");
    expect(listFloorPlanSections([{ section: "Patio" }, { section: null }])).toEqual([
      "Main dining",
      "Patio",
    ]);
    expect(tableMatchesSectionFilter("Patio", "Bar")).toBe(false);
    expect(tableMatchesSectionFilter(null, "Main dining")).toBe(true);
  });

  it("documents honesty markers — BETA, not certified live occupancy, Supabase Realtime", () => {
    const component = readFileSync(
      join(ROOT, "components/restaurant/floor-plan-editor.tsx"),
      "utf8",
    );
    const page = readFileSync(join(ROOT, "app/dashboard/floor-plans/page.tsx"), "utf8");
    const combined = `${component}\n${page}`;
    for (const marker of VISUAL_FLOOR_PLAN_EDITOR_HONESTY_MARKERS) {
      expect(combined.includes(marker) || combined.toLowerCase().includes(marker.toLowerCase())).toBe(
        true,
      );
    }
  });

  it("wires MICROS parity UI — canvas, sections, shapes, status legend, order links", () => {
    const component = readFileSync(
      join(ROOT, "components/restaurant/floor-plan-editor.tsx"),
      "utf8",
    );
    expect(component).toContain('data-testid="visual-floor-plan-editor"');
    expect(component).toContain('data-testid="floor-plan-canvas"');
    expect(component).toContain('data-testid="floor-plan-section-zones"');
    expect(component).toContain('data-testid="floor-plan-connection-status"');
    expect(component).toContain('data-testid="floor-plan-order-link"');
    expect(component).toContain("VISUAL_FLOOR_PLAN_TABLE_SHAPES");
    expect(component).toContain("STATUS_LABELS");
    expect(component).toContain("updateTablePosition");
    expect(component).toContain("handlePointerDown");
  });

  it("wires Supabase Realtime hook with polling fallback", () => {
    const component = readFileSync(
      join(ROOT, "components/restaurant/floor-plan-editor.tsx"),
      "utf8",
    );
    const hook = readFileSync(join(ROOT, "hooks/use-floor-plan-realtime.ts"), "utf8");
    const policy = readFileSync(join(ROOT, "lib/restaurant/floor-plan-realtime-policy.ts"), "utf8");

    expect(component).toContain("useFloorPlanRealtime");
    expect(hook).toContain("subscribeFloorPlanUpdates");
    expect(hook).toContain("polling");
    expect(policy).toContain("getFloorPlanConnectionStatusLabel");
  });

  it("wires floor-plans page with location context and network map back-link", () => {
    const page = readFileSync(join(ROOT, "app/dashboard/floor-plans/page.tsx"), "utf8");
    expect(page).toContain("FloorPlanEditor");
    expect(page).toContain("locationId");
    expect(page).toContain('data-testid="floor-plan-location-context"');
    expect(page).toContain("multiLocationMapViewHref");
    expect(page).toContain("getTablesForWorkspace");
  });

  it("revalidates table mutations on /dashboard/floor-plans", () => {
    const actions = readFileSync(join(ROOT, "actions/restaurant/tables.ts"), "utf8");
    expect(actions).toContain("revalidatePath('/dashboard/floor-plans')");
    expect(actions).toContain("updateTablePosition");
    expect(actions).toContain("updateTableShapeAction");
  });

  it("passes base wiring audit and QA slot 107 audit gate", () => {
    const wiring = auditVisualFloorPlanEditorWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);

    const qa = auditQaFullCoverageSlot(TASK, ROOT);
    expect(qa.ok, qa.failures.join("; ")).toBe(true);
    expect(qa.slot?.qaTest).toBe(
      "tests/unit/absolute-final-qa-full-coverage-07-floor-plan.test.ts",
    );
    expect(VISUAL_FLOOR_PLAN_EDITOR_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "visual-floor-plan-editor-absolute-final-v1",
    );
  });
});
