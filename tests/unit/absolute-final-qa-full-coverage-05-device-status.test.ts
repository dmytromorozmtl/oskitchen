import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditDeviceStatusDashboardWiring } from "@/lib/integration-health/device-status-dashboard-audit";
import {
  computeDeviceAlertLevel,
  DEVICE_STATUS_DASHBOARD_ABSOLUTE_FINAL_POLICY_ID,
  DEVICE_STATUS_DASHBOARD_CLOVER_PARITY_PILLARS,
  DEVICE_STATUS_DASHBOARD_HONESTY_MARKERS,
  DEVICE_STATUS_DASHBOARD_INTEGRATION_HEALTH_ROUTE,
  DEVICE_STATUS_DASHBOARD_ROUTE,
  formatDeviceLastSeenLabel,
  groupDeviceStatusCardsByLocation,
  mapFleetStatusToConnectivity,
  summarizeDeviceStatusDashboard,
  type DeviceStatusCard,
} from "@/lib/integration-health/device-status-dashboard-absolute-final-policy";
import { auditQaFullCoverageSlot } from "@/lib/qa/absolute-final-qa-full-coverage-audit";
import {
  getQaFullCoverageSlot,
  QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID,
} from "@/lib/qa/absolute-final-qa-full-coverage-policy";

const ROOT = process.cwd();
/** Absolute Final Task 105 — QA full coverage for feature 90 device status dashboard */
const TASK = 105;
const FEATURE = 90;

function card(overrides: Partial<DeviceStatusCard> = {}): DeviceStatusCard {
  return {
    id: "register:1",
    label: "Front counter",
    kind: "pos_register",
    deviceType: "POS register",
    locationName: "Main",
    connectivity: "configured",
    lastSeenLabel: "Configuration only — no live heartbeat",
    alertLevel: "none",
    manageHref: "/dashboard/pos/settings",
    detail: null,
    ...overrides,
  };
}

describe(`QA full coverage — device status dashboard (Absolute Final Task ${TASK}, feature ${FEATURE})`, () => {
  it("locks QA registry slot 105 → feature 90 device status dashboard", () => {
    expect(QA_FULL_COVERAGE_ABSOLUTE_FINAL_POLICY_ID).toBe("absolute-final-qa-full-coverage-v1");
    const slot = getQaFullCoverageSlot(TASK);
    expect(slot?.featureKey).toBe("device-status-dashboard");
    expect(slot?.featureTaskNumber).toBe(FEATURE);
    expect(slot?.baseCertTest).toBe("tests/unit/device-status-dashboard-absolute-final.test.ts");
    expect(DEVICE_STATUS_DASHBOARD_CLOVER_PARITY_PILLARS).toHaveLength(5);
    expect(DEVICE_STATUS_DASHBOARD_ROUTE).toBe("/dashboard/devices");
  });

  it("maps fleet statuses with Clover-style connectivity semantics", () => {
    expect(mapFleetStatusToConnectivity("active", "stripe_reader")).toBe("online");
    expect(mapFleetStatusToConnectivity("active", "pos_register")).toBe("configured");
    expect(mapFleetStatusToConnectivity("pending", "stripe_reader")).toBe("pending");
    expect(computeDeviceAlertLevel("pending")).toBe("warning");
    expect(computeDeviceAlertLevel("offline")).toBe("critical");
    expect(formatDeviceLastSeenLabel("pending", null)).toContain("Status unknown");
  });

  it("summarizes category breakdown and attention counts", () => {
    const summary = summarizeDeviceStatusDashboard([
      card({ kind: "pos_register" }),
      card({ id: "terminal:1", kind: "pos_terminal", connectivity: "inactive", alertLevel: "warning" }),
      card({
        id: "reader:1",
        kind: "stripe_reader",
        connectivity: "offline",
        alertLevel: "critical",
      }),
    ]);
    expect(summary.totalDevices).toBe(3);
    expect(summary.registerCount).toBe(1);
    expect(summary.terminalCount).toBe(1);
    expect(summary.readerCount).toBe(1);
    expect(summary.needsAttentionCount).toBe(2);
    expect(summary.stripeConfigured).toBe(true);
  });

  it("groups devices by location with stable sort order", () => {
    const groups = groupDeviceStatusCardsByLocation([
      card({ label: "B register", locationName: "Main" }),
      card({ id: "r2", label: "A register", locationName: "Main" }),
      card({ id: "r3", label: "Back", locationName: null }),
    ]);
    expect(groups.map((g) => g.locationName)).toEqual(["Main", "Unassigned location"]);
    expect(groups[0]?.devices.map((d) => d.label)).toEqual(["A register", "B register"]);
  });

  it("wires honesty markers — configuration-only posture, not hub telemetry", () => {
    const component = readFileSync(
      join(ROOT, "components/dashboard/devices/device-status-dashboard.tsx"),
      "utf8",
    );
    for (const marker of DEVICE_STATUS_DASHBOARD_HONESTY_MARKERS) {
      expect(component).toContain(marker);
    }
    expect(component).toContain("Configuration only");
    expect(component).toContain(DEVICE_STATUS_DASHBOARD_INTEGRATION_HEALTH_ROUTE);
  });

  it("wires Clover parity UI — location groups, cards, attention banner", () => {
    const component = readFileSync(
      join(ROOT, "components/dashboard/devices/device-status-dashboard.tsx"),
      "utf8",
    );
    expect(component).toContain('data-testid="device-status-dashboard"');
    expect(component).toContain('data-testid="device-status-location-group"');
    expect(component).toContain('data-testid="device-status-card"');
    expect(component).toContain('data-testid="device-status-attention-banner"');
    expect(component).toContain("Needs attention");
    expect(component).toContain("registerCount");
    expect(component).toContain("readerCount");
  });

  it("wires service fleet loader, strip, and integration health page", () => {
    const service = readFileSync(
      join(ROOT, "services/integration-health/device-status-dashboard-service.ts"),
      "utf8",
    );
    const strip = readFileSync(
      join(ROOT, "components/dashboard/integration-health/device-status-dashboard-strip.tsx"),
      "utf8",
    );
    const integrationHealth = readFileSync(
      join(ROOT, "app/dashboard/integration-health/page.tsx"),
      "utf8",
    );

    expect(service).toContain("loadHardwareDeviceFleetModel");
    expect(service).toContain("getStripeTerminalHardwareDashboard");
    expect(service).toContain("DEVICE_STATUS_DASHBOARD_ABSOLUTE_FINAL_POLICY_ID");
    expect(strip).toContain(DEVICE_STATUS_DASHBOARD_ROUTE);
    expect(integrationHealth).toContain("DeviceStatusDashboardStrip");
  });

  it("passes base wiring audit and QA slot 105 audit gate", () => {
    const wiring = auditDeviceStatusDashboardWiring(ROOT);
    expect(wiring.ok, wiring.failures.join("; ")).toBe(true);

    const qa = auditQaFullCoverageSlot(TASK, ROOT);
    expect(qa.ok, qa.failures.join("; ")).toBe(true);
    expect(qa.slot?.qaTest).toBe(
      "tests/unit/absolute-final-qa-full-coverage-05-device-status.test.ts",
    );
  });
});
