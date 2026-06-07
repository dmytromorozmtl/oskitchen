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
import { auditDeviceStatusDashboardWiring } from "@/lib/integration-health/device-status-dashboard-audit";
import {
  DEVICE_STATUS_DASHBOARD_CLOVER_PARITY_PILLARS,
  DEVICE_STATUS_DASHBOARD_COMPONENT_PATH,
  DEVICE_STATUS_DASHBOARD_HONESTY_MARKERS,
  DEVICE_STATUS_DASHBOARD_PAGE_PATH,
  DEVICE_STATUS_DASHBOARD_ROUTE,
} from "@/lib/integration-health/device-status-dashboard-absolute-final-policy";

const ROOT = process.cwd();
/** Absolute Final Task 120 — Design full polish for feature 90 device status dashboard */
const TASK = 120;
const FEATURE = 90;

describe(`Design full polish — device status (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks design polish registry slot 120 → feature 90 device status dashboard", () => {
    expect(DESIGN_FULL_POLISH_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "absolute-final-design-full-polish-v1",
    );
    const slot = getDesignFullPolishSlot(TASK);
    expect(slot?.featureKey).toBe("device-status-dashboard");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.targetKind).toBe("component");
    expect(slot?.targetPath).toBe(DEVICE_STATUS_DASHBOARD_COMPONENT_PATH);
  });

  it("applies design polish card, hero, and row tokens to the device status dashboard", () => {
    const component = readFileSync(join(ROOT, DEVICE_STATUS_DASHBOARD_COMPONENT_PATH), "utf8");
    for (const token of DESIGN_POLISH_TOKEN_NAMES) {
      expect(component, `missing ${token}`).toContain(token);
    }
    expect(component).toContain("absolute-final-design-polish-tokens");
    expect(component).toContain("DESIGN_POLISH_STRIPE_OK_CLASS");
    expect(component).toContain("DESIGN_POLISH_ABSOLUTE_FINAL_POLICY_ID");
  });

  it("includes dark mode polish tokens on cards and footer surfaces", () => {
    const component = readFileSync(join(ROOT, DEVICE_STATUS_DASHBOARD_COMPONENT_PATH), "utf8");
    const tokens = readFileSync(
      join(ROOT, "lib/design/absolute-final-design-polish-tokens.ts"),
      "utf8",
    );
    expect(component).toContain("dark:text-muted-foreground/90");
    expect(component).toContain("dark:border-destructive/40");
    expect(component).toContain("dark:bg-destructive/10");
    expect(tokens).toContain(DESIGN_POLISH_DARK_MODE_TOKENS[0]);
  });

  it("shows hero banner with Clover parity and configuration-only honesty", () => {
    const component = readFileSync(join(ROOT, DEVICE_STATUS_DASHBOARD_COMPONENT_PATH), "utf8");
    for (const marker of DEVICE_STATUS_DASHBOARD_HONESTY_MARKERS) {
      expect(component).toContain(marker);
    }
    expect(component).toContain("Configuration only");
    expect(component).toContain('role="note"');
    expect(DEVICE_STATUS_DASHBOARD_CLOVER_PARITY_PILLARS.length).toBe(5);
  });

  it("wires devices page to the polished dashboard component", () => {
    const page = readFileSync(join(ROOT, DEVICE_STATUS_DASHBOARD_PAGE_PATH), "utf8");
    expect(page).toContain("DeviceStatusDashboard");
    expect(DEVICE_STATUS_DASHBOARD_ROUTE).toBe("/dashboard/devices");
  });

  it("preserves Clover parity UI test ids after polish", () => {
    const component = readFileSync(join(ROOT, DEVICE_STATUS_DASHBOARD_COMPONENT_PATH), "utf8");
    expect(component).toContain('data-testid="device-status-dashboard"');
    expect(component).toContain('data-testid="device-status-location-group"');
    expect(component).toContain('data-testid="device-status-card"');
    expect(component).toContain('data-testid="device-status-attention-banner"');
    expect(component).toContain("Needs attention");
  });

  it("passes base device status wiring audit after component polish", () => {
    const wiring = auditDeviceStatusDashboardWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);
  });

  it("passes design polish slot 120 audit gate", () => {
    const audit = auditDesignFullPolishSlot(TASK, ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
    expect(audit.slot?.polishTest).toBe(
      "tests/unit/absolute-final-design-full-polish-05-device-status.test.ts",
    );
  });
});
