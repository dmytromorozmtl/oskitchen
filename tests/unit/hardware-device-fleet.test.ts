import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

import {
  HARDWARE_DEVICE_FLEET_DEVICE_KINDS,
  HARDWARE_DEVICE_FLEET_INTEGRATION_HEALTH_ROUTE,
  HARDWARE_DEVICE_FLEET_MANAGE_HARDWARE_ROUTE,
  HARDWARE_DEVICE_FLEET_MANAGE_REGISTERS_ROUTE,
  HARDWARE_DEVICE_FLEET_PANEL_PATH,
  HARDWARE_DEVICE_FLEET_POLICY_ID,
  HARDWARE_DEVICE_FLEET_SERVICE_PATH,
  summarizeHardwareFleet,
  type HardwareFleetDeviceRow,
} from "@/lib/integration-health/hardware-device-fleet-policy";

const ROOT = process.cwd();

describe("hardware device fleet (Absolute Final Task 40)", () => {
  it("locks fleet policy id, paths, and three device kinds", () => {
    expect(HARDWARE_DEVICE_FLEET_POLICY_ID).toBe("hardware-device-fleet-absolute-final-v1");
    expect(HARDWARE_DEVICE_FLEET_PANEL_PATH).toBe(
      "components/dashboard/integration-health/hardware-device-fleet-panel.tsx",
    );
    expect(HARDWARE_DEVICE_FLEET_SERVICE_PATH).toBe(
      "services/integration-health/hardware-device-fleet-service.ts",
    );
    expect(HARDWARE_DEVICE_FLEET_DEVICE_KINDS).toEqual([
      "pos_register",
      "pos_terminal",
      "stripe_reader",
    ]);
    expect(HARDWARE_DEVICE_FLEET_INTEGRATION_HEALTH_ROUTE).toBe("/dashboard/integration-health");
  });

  it("summarizes online, offline, and attention counts", () => {
    const devices: HardwareFleetDeviceRow[] = [
      {
        id: "register:1",
        kind: "pos_register",
        label: "Front counter",
        deviceType: "POS register",
        locationName: "Main",
        status: "active",
        linkedTo: "Terminal A",
        detail: null,
        manageHref: HARDWARE_DEVICE_FLEET_MANAGE_REGISTERS_ROUTE,
      },
      {
        id: "reader:1",
        kind: "stripe_reader",
        label: "Reader 1",
        deviceType: "Stripe Reader M2",
        locationName: null,
        status: "offline",
        linkedTo: "Front counter",
        detail: "SN abc",
        manageHref: HARDWARE_DEVICE_FLEET_MANAGE_HARDWARE_ROUTE,
      },
      {
        id: "terminal:1",
        kind: "pos_terminal",
        label: "Terminal A",
        deviceType: "POS terminal · counter",
        locationName: "Main",
        status: "pending",
        linkedTo: null,
        detail: null,
        manageHref: "/dashboard/pos/settings",
      },
    ];

    const summary = summarizeHardwareFleet(devices);
    expect(summary.totalDevices).toBe(3);
    expect(summary.onlineCount).toBe(1);
    expect(summary.offlineCount).toBe(1);
    expect(summary.needsAttentionCount).toBe(2);
    expect(summary.registerCount).toBe(1);
    expect(summary.readerCount).toBe(1);
    expect(summary.stripeConfigured).toBe(true);
  });

  it("wires fleet panel into Integration Health Center page", () => {
    const pageSource = readFileSync(
      join(ROOT, "app/dashboard/integration-health/page.tsx"),
      "utf8",
    );
    expect(pageSource).toContain("HardwareDeviceFleetPanel");
    expect(pageSource).toContain("loadHardwareDeviceFleetModel");
    expect(pageSource).toContain("<HardwareDeviceFleetPanel model={hardwareFleet} />");
  });

  it("exposes fleet panel test id and honest manage routes", () => {
    const panelSource = readFileSync(join(ROOT, HARDWARE_DEVICE_FLEET_PANEL_PATH), "utf8");
    expect(panelSource).toContain('data-testid="hardware-device-fleet-panel"');
    expect(panelSource).toContain(HARDWARE_DEVICE_FLEET_MANAGE_HARDWARE_ROUTE);
    expect(panelSource).toContain(HARDWARE_DEVICE_FLEET_MANAGE_REGISTERS_ROUTE);
    expect(panelSource).toContain("not proprietary hub telemetry");
  });

  it("loads registers, terminals, and Stripe readers in fleet service", () => {
    const serviceSource = readFileSync(join(ROOT, HARDWARE_DEVICE_FLEET_SERVICE_PATH), "utf8");
    expect(serviceSource).toContain("prisma.pOSRegister.findMany");
    expect(serviceSource).toContain("prisma.pOSTerminal.findMany");
    expect(serviceSource).toContain("getStripeTerminalHardwareDashboard");
    expect(serviceSource).toContain("HARDWARE_DEVICE_FLEET_POLICY_ID");
  });
});
