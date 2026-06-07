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
import { auditKdsExpediteScreenWiring } from "@/lib/kitchen/kds-expedite-screen-audit";
import {
  KDS_EXPEDITE_SCREEN_COMPONENT_PATH,
  KDS_EXPEDITE_SCREEN_HONESTY_MARKERS,
  KDS_EXPEDITE_SCREEN_MIN_TOUCH_PX,
  KDS_EXPEDITE_SCREEN_PAGE_PATH,
  KDS_EXPEDITE_SCREEN_POLISH_PILLARS,
  KDS_EXPEDITE_SCREEN_ROUTE,
} from "@/lib/kitchen/kds-expedite-screen-absolute-final-policy";

const ROOT = process.cwd();
/** Absolute Final Task 124 — Design full polish for feature 94 expedite screen */
const TASK = 124;
const FEATURE = 94;

describe(`Design full polish — expedite screen (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks design polish registry slot 124 → feature 94 expedite screen", () => {
    expect(DESIGN_FULL_POLISH_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-design-full-polish-v1",
    );
    const slot = getDesignFullPolishSlot(TASK);
    expect(slot?.featureKey).toBe("kds-expedite-screen");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetKind).toBe("component");
    expect(slot?.targetPath).toBe(KDS_EXPEDITE_SCREEN_COMPONENT_PATH);
  });

  it("applies design polish card, hero, and badge tokens to the expedite screen", () => {
    const component = readFileSync(join(ROOT, KDS_EXPEDITE_SCREEN_COMPONENT_PATH), "utf8");
    for (const token of DESIGN_POLISH_TOKEN_NAMES) {
      expect(component, `missing ${token}`).toContain(token);
    }
    expect(component).toContain("absolute-final-design-polish-tokens");
    expect(component).toContain("DESIGN_POLISH_STRIPE_OK_CLASS");
    expect(component).toContain("DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID");
  });

  it("includes dark mode polish tokens on hero, queue, and rush surfaces", () => {
    const component = readFileSync(join(ROOT, KDS_EXPEDITE_SCREEN_COMPONENT_PATH), "utf8");
    const tokens = readFileSync(
      join(ROOT, "lib/design/absolute-final-design-polish-tokens.ts"),
      "utf8",
    );
    expect(component).toContain("dark:text-muted-foreground/90");
    expect(component).toContain("dark:border-rose-800/60");
    expect(component).toContain("landscape:");
    expect(tokens).toContain(DESIGN_POLISH_DARK_MODE_TOKENS[0]);
  });

  it("shows hero banner with BETA and priority routing honesty", () => {
    const component = readFileSync(join(ROOT, KDS_EXPEDITE_SCREEN_COMPONENT_PATH), "utf8");
    for (const marker of KDS_EXPEDITE_SCREEN_HONESTY_MARKERS) {
      expect(component).toContain(marker);
    }
    expect(component).toContain('role="note"');
    expect(KDS_EXPEDITE_SCREEN_POLISH_PILLARS.length).toBe(5);
  });

  it("wires expedite page and preserves 44px touch targets", () => {
    const page = readFileSync(join(ROOT, KDS_EXPEDITE_SCREEN_PAGE_PATH), "utf8");
    const component = readFileSync(join(ROOT, KDS_EXPEDITE_SCREEN_COMPONENT_PATH), "utf8");
    expect(page).toContain("KdsExpediteScreen");
    expect(component).toContain("KDS_EXPEDITE_SCREEN_MIN_TOUCH_PX");
    expect(component).toContain("min-h-[44px]");
    expect(KDS_EXPEDITE_SCREEN_ROUTE).toBe("/dashboard/kitchen/expedite");
    expect(KDS_EXPEDITE_SCREEN_MIN_TOUCH_PX).toBe(44);
  });

  it("preserves expedite UI test ids and RushMode wiring after polish", () => {
    const component = readFileSync(join(ROOT, KDS_EXPEDITE_SCREEN_COMPONENT_PATH), "utf8");
    expect(component).toContain('data-testid="kds-expedite-screen"');
    expect(component).toContain('data-testid="kds-expedite-hero"');
    expect(component).toContain('data-testid="kds-expedite-queue"');
    expect(component).toContain('data-testid="kds-expedite-hero-empty"');
    expect(component).toContain("RushMode");
    expect(component).toContain("formatKdsPriorityReasonLabel");
  });

  it("passes base expedite screen wiring audit after component polish", () => {
    const wiring = auditKdsExpediteScreenWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
  });

  it("passes design polish slot 124 audit gate", () => {
    const audit = auditDesignFullPolishSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.polishTest).toBe(
      "tests/unit/absolute-final-design-full-polish-09-kds-expedite.test.ts",
    );
    expect(DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-design-polish-tokens-v1");
  });
});
