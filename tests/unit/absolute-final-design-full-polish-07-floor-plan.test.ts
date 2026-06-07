import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditDesignFullPolishSlot } from "@/lib/design/absolute-final-design-full-polish-audit";
import {
  DESIGN_FULL_POLISH_ABSOLUTE_FINAL_POLICY_ID,
  getDesignFullPolishSlot,
} from "@/lib/design/absolute-final-design-full-polish-policy";
import {
  DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID,
  DESIGN_POLISH_DARK_MODE_TOKENS,
  DESIGN_POLISH_TOKEN_NAMES,
} from "@/lib/design/absolute-final-design-polish-tokens";
import { auditVisualFloorPlanEditorWiring } from "@/lib/restaurant/visual-floor-plan-editor-audit";
import {
  VISUAL_FLOOR_PLAN_EDITOR_COMPONENT_PATH,
  VISUAL_FLOOR_PLAN_EDITOR_HONESTY_MARKERS,
  VISUAL_FLOOR_PLAN_EDITOR_MICROS_PARITY_PILLARS,
  VISUAL_FLOOR_PLAN_EDITOR_PAGE_PATH,
  VISUAL_FLOOR_PLAN_EDITOR_ROUTE,
  VISUAL_FLOOR_PLAN_TABLE_SHAPES,
} from "@/lib/restaurant/visual-floor-plan-editor-absolute-final-policy";

const ROOT = process.cwd();
/** Absolute Final Task 122 — Design full polish for feature 92 visual floor plan editor */
const TASK = 122;
const FEATURE = 92;

describe(`Design full polish — floor plan editor (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks design polish registry slot 122 → feature 92 visual floor plan editor", () => {
    expect(DESIGN_FULL_POLISH_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-design-full-polish-v1",
    );
    const slot = getDesignFullPolishSlot(TASK);
    expect(slot?.featureKey).toBe("visual-floor-plan-editor");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetKind).toBe("component");
    expect(slot?.targetPath).toBe(VISUAL_FLOOR_PLAN_EDITOR_COMPONENT_PATH);
  });

  it("applies design polish card, hero, and row tokens to the floor plan editor", () => {
    const component = readFileSync(join(ROOT, VISUAL_FLOOR_PLAN_EDITOR_COMPONENT_PATH), "utf8");
    for (const token of DESIGN_POLISH_TOKEN_NAMES) {
      expect(component, `missing ${token}`).toContain(token);
    }
    expect(component).toContain("absolute-final-design-polish-tokens");
    expect(component).toContain("DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID");
  });

  it("includes dark mode polish tokens on canvas and form surfaces", () => {
    const component = readFileSync(join(ROOT, VISUAL_FLOOR_PLAN_EDITOR_COMPONENT_PATH), "utf8");
    const tokens = readFileSync(
      join(ROOT, "lib/design/absolute-final-design-polish-tokens.ts"),
      "utf8",
    );
    expect(component).toContain("dark:text-muted-foreground/90");
    expect(component).toContain("dark:border-border/60");
    expect(component).toContain("dark:bg-background/95");
    expect(component).toContain("dark:bg-muted/10");
    expect(tokens).toContain(DESIGN_POLISH_DARK_MODE_TOKENS[0]);
  });

  it("shows hero banner with Oracle MICROS parity and occupancy honesty", () => {
    const component = readFileSync(join(ROOT, VISUAL_FLOOR_PLAN_EDITOR_COMPONENT_PATH), "utf8");
    for (const marker of VISUAL_FLOOR_PLAN_EDITOR_HONESTY_MARKERS) {
      expect(component).toContain(marker);
    }
    expect(component).toContain('role="note"');
    expect(VISUAL_FLOOR_PLAN_EDITOR_MICROS_PARITY_PILLARS.length).toBe(7);
  });

  it("wires floor-plans page to the polished editor component", () => {
    const page = readFileSync(join(ROOT, VISUAL_FLOOR_PLAN_EDITOR_PAGE_PATH), "utf8");
    expect(page).toContain("FloorPlanEditor");
    expect(VISUAL_FLOOR_PLAN_EDITOR_ROUTE).toBe("/dashboard/floor-plans");
    expect(VISUAL_FLOOR_PLAN_TABLE_SHAPES).toHaveLength(3);
  });

  it("preserves MICROS parity UI test ids after polish", () => {
    const component = readFileSync(join(ROOT, VISUAL_FLOOR_PLAN_EDITOR_COMPONENT_PATH), "utf8");
    expect(component).toContain('data-testid="visual-floor-plan-editor"');
    expect(component).toContain('data-testid="floor-plan-canvas"');
    expect(component).toContain('data-testid="floor-plan-section-zones"');
    expect(component).toContain('data-testid="floor-plan-connection-status"');
    expect(component).toContain('data-testid="floor-plan-order-link"');
    expect(component).toContain("handlePointerDown");
  });

  it("passes base visual floor plan wiring audit after component polish", () => {
    const wiring = auditVisualFloorPlanEditorWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
  });

  it("passes design polish slot 122 audit gate", () => {
    const audit = auditDesignFullPolishSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.polishTest).toBe(
      "tests/unit/absolute-final-design-full-polish-07-floor-plan.test.ts",
    );
    expect(DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-design-polish-tokens-v1");
  });
});
