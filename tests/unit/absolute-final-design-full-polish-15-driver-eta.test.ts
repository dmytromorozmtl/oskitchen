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
import { auditKdsDriverEtaTrackingWiring } from "@/lib/kitchen/kds-driver-eta-tracking-audit";
import {
  KDS_DRIVER_ETA_MIN_TOUCH_PX,
  KDS_DRIVER_ETA_TRACKING_COMPONENT_PATH,
  KDS_DRIVER_ETA_TRACKING_HONESTY_MARKERS,
  KDS_DRIVER_ETA_TRACKING_PAGE_PATH,
  KDS_DRIVER_ETA_TRACKING_PILLARS,
  KDS_DRIVER_ETA_TRACKING_ROUTE,
} from "@/lib/kitchen/kds-driver-eta-tracking-absolute-final-policy";

const ROOT = process.cwd();
/** Absolute Final Task 130 — Design full polish for feature 100 KDS driver ETA tracking */
const TASK = 130;
const FEATURE = 100;

describe(`Design full polish — KDS driver ETA (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks design polish registry slot 130 → feature 100 KDS driver ETA tracking", () => {
    expect(DESIGN_FULL_POLISH_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-design-full-polish-v1",
    );
    const slot = getDesignFullPolishSlot(TASK);
    expect(slot?.featureKey).toBe("kds-driver-eta-tracking");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetKind).toBe("component");
    expect(slot?.targetPath).toBe(KDS_DRIVER_ETA_TRACKING_COMPONENT_PATH);
  });

  it("applies design polish card, hero, and row tokens to the driver ETA screen", () => {
    const screen = readFileSync(join(ROOT, KDS_DRIVER_ETA_TRACKING_COMPONENT_PATH), "utf8");
    for (const token of DESIGN_POLISH_TOKEN_NAMES) {
      expect(screen, `missing ${token}`).toContain(token);
    }
    expect(screen).toContain("absolute-final-design-polish-tokens");
    expect(screen).toContain("DESIGN_POLISH_STRIPE_OK_CLASS");
    expect(screen).toContain("DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID");
  });

  it("includes dark mode polish tokens on ticket cards and hero banner", () => {
    const screen = readFileSync(join(ROOT, KDS_DRIVER_ETA_TRACKING_COMPONENT_PATH), "utf8");
    const tokens = readFileSync(
      join(ROOT, "lib/design/absolute-final-design-polish-tokens.ts"),
      "utf8",
    );
    expect(screen).toContain("dark:text-muted-foreground/90");
    expect(screen).toContain("dark:border-destructive/50");
    expect(screen).toContain("landscape:");
    expect(tokens).toContain(DESIGN_POLISH_DARK_MODE_TOKENS[0]);
  });

  it("shows hero banner with estimated ETA and GPS honesty markers", () => {
    const screen = readFileSync(join(ROOT, KDS_DRIVER_ETA_TRACKING_COMPONENT_PATH), "utf8");
    for (const marker of KDS_DRIVER_ETA_TRACKING_HONESTY_MARKERS) {
      expect(screen).toContain(marker);
    }
    expect(screen).toContain('role="note"');
    expect(KDS_DRIVER_ETA_TRACKING_PILLARS.length).toBe(5);
  });

  it("wires driver-eta page and preserves 44px touch targets", () => {
    const page = readFileSync(join(ROOT, KDS_DRIVER_ETA_TRACKING_PAGE_PATH), "utf8");
    const screen = readFileSync(join(ROOT, KDS_DRIVER_ETA_TRACKING_COMPONENT_PATH), "utf8");
    expect(page).toContain("KdsDriverEtaScreen");
    expect(screen).toContain("KDS_DRIVER_ETA_MIN_TOUCH_PX");
    expect(screen).toContain("min-h-[44px]");
    expect(KDS_DRIVER_ETA_TRACKING_ROUTE).toBe("/dashboard/kitchen/driver-eta");
    expect(KDS_DRIVER_ETA_MIN_TOUCH_PX).toBe(44);
  });

  it("preserves driver ETA UI test ids and pillar wiring after polish", () => {
    const screen = readFileSync(join(ROOT, KDS_DRIVER_ETA_TRACKING_COMPONENT_PATH), "utf8");
    expect(screen).toContain('data-testid="kds-driver-eta-screen"');
    expect(screen).toContain('data-testid="kds-driver-eta-ticket"');
    expect(screen).toContain("dispatch_status_badges");
    expect(screen).toContain("eta_countdown_labels");
    expect(screen).toContain("gps_freshness_indicator");
    expect(screen).toContain("kds_ticket_cross_link");
    expect(screen).toContain("large_touch_targets");
  });

  it("passes base KDS driver ETA wiring audit after component polish", () => {
    const wiring = auditKdsDriverEtaTrackingWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
  });

  it("passes design polish slot 130 audit gate — final design full polish slot", () => {
    const audit = auditDesignFullPolishSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.polishTest).toBe(
      "tests/unit/absolute-final-design-full-polish-15-driver-eta.test.ts",
    );
    expect(DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-design-polish-tokens-v1");
  });
});
