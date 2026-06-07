import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import { auditDeviceStatusDashboardWiring } from "@/lib/integration-health/device-status-dashboard-audit";
import {
  computeDeviceAlertLevel,
  DEVICE_STATUS_DASHBOARD_ABSOLUTE_FINAL_POLICY_ID,
  DEVICE_STATUS_DASHBOARD_CI_SCRIPTS,
  DEVICE_STATUS_DASHBOARD_CLOVER_PARITY_PILLARS,
  DEVICE_STATUS_DASHBOARD_ROUTE,
  DEVICE_STATUS_DASHBOARD_UNIT_TEST,
  formatDeviceLastSeenLabel,
  groupDeviceStatusCardsByLocation,
  mapFleetStatusToConnectivity,
  summarizeDeviceStatusDashboard,
  type DeviceStatusCard,
} from "@/lib/integration-health/device-status-dashboard-absolute-final-policy";

const ROOT = process.cwd();

describe("Device status dashboard (Absolute Final Task 90)", () => {
  it("locks absolute final policy and /dashboard/devices route", () => {
    expect(DEVICE_STATUS_DASHBOARD_ABSOLUTE_FINAL_POLICY_ID).toBe(
      "device-status-dashboard-absolute-final-v1",
    );
    expect(DEVICE_STATUS_DASHBOARD_ROUTE).toBe("/dashboard/devices");
    expect(DEVICE_STATUS_DASHBOARD_CLOVER_PARITY_PILLARS).toHaveLength(5);
  });

  it("maps fleet statuses to Clover-style connectivity labels", () => {
    expect(mapFleetStatusToConnectivity("online", "stripe_reader")).toBe("online");
    expect(mapFleetStatusToConnectivity("offline", "stripe_reader")).toBe("offline");
    expect(mapFleetStatusToConnectivity("active", "pos_register")).toBe("configured");
    expect(mapFleetStatusToConnectivity("inactive", "pos_terminal")).toBe("inactive");
    expect(computeDeviceAlertLevel("offline")).toBe("critical");
    expect(computeDeviceAlertLevel("configured")).toBe("none");
  });

  it("formats last-seen labels with honest configuration posture", () => {
    expect(formatDeviceLastSeenLabel("configured", null)).toContain("Configuration only");
    expect(formatDeviceLastSeenLabel("online", "2026-06-06T12:00:00.000Z")).toContain("Last seen");
    expect(formatDeviceLastSeenLabel("offline", null)).toContain("Stripe sync");
  });

  it("groups devices by location and summarizes attention counts", () => {
    const cards: DeviceStatusCard[] = [
      {
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
      },
      {
        id: "reader:1",
        label: "Reader 1",
        kind: "stripe_reader",
        deviceType: "Stripe Reader M2",
        locationName: "Main",
        connectivity: "offline",
        lastSeenLabel: "Offline on last Stripe sync",
        alertLevel: "critical",
        manageHref: "/dashboard/pos/settings/hardware",
        detail: "SN abc",
      },
      {
        id: "terminal:1",
        label: "Terminal A",
        kind: "pos_terminal",
        deviceType: "POS terminal · counter",
        locationName: null,
        connectivity: "inactive",
        lastSeenLabel: "Configuration only — no live heartbeat",
        alertLevel: "warning",
        manageHref: "/dashboard/pos/settings",
        detail: null,
      },
    ];

    const summary = summarizeDeviceStatusDashboard(cards);
    expect(summary.totalDevices).toBe(3);
    expect(summary.needsAttentionCount).toBe(2);
    expect(summary.configuredCount).toBe(1);

    const groups = groupDeviceStatusCardsByLocation(cards);
    expect(groups).toHaveLength(2);
    expect(groups.find((g) => g.locationName === "Main")?.devices).toHaveLength(2);
    expect(groups.find((g) => g.locationName === "Unassigned location")?.devices).toHaveLength(1);
  });

  it("passes wiring audit", () => {
    const audit = auditDeviceStatusDashboardWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);
  });

  it("registers CI cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of DEVICE_STATUS_DASHBOARD_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(DEVICE_STATUS_DASHBOARD_UNIT_TEST).toBe(
      "tests/unit/device-status-dashboard-absolute-final.test.ts",
    );
  });
});
