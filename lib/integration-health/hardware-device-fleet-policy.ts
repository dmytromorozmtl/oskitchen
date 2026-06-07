/**
 * Absolute Final Task 40 — hardware device fleet in Integration Health Center.
 */

export const HARDWARE_DEVICE_FLEET_POLICY_ID =
  "hardware-device-fleet-absolute-final-v1" as const;

export const HARDWARE_DEVICE_FLEET_PANEL_PATH =
  "components/dashboard/integration-health/hardware-device-fleet-panel.tsx" as const;

export const HARDWARE_DEVICE_FLEET_SERVICE_PATH =
  "services/integration-health/hardware-device-fleet-service.ts" as const;

export const HARDWARE_DEVICE_FLEET_INTEGRATION_HEALTH_ROUTE =
  "/dashboard/integration-health" as const;

export const HARDWARE_DEVICE_FLEET_MANAGE_HARDWARE_ROUTE =
  "/dashboard/pos/settings/hardware" as const;

export const HARDWARE_DEVICE_FLEET_MANAGE_REGISTERS_ROUTE = "/dashboard/pos/settings" as const;

export const HARDWARE_DEVICE_FLEET_DEVICE_KINDS = [
  "pos_register",
  "pos_terminal",
  "stripe_reader",
] as const;

export type HardwareFleetDeviceKind = (typeof HARDWARE_DEVICE_FLEET_DEVICE_KINDS)[number];

export const HARDWARE_DEVICE_FLEET_CI_SCRIPTS = ["test:ci:hardware-device-fleet"] as const;

export type HardwareFleetDeviceStatus =
  | "active"
  | "inactive"
  | "online"
  | "offline"
  | "pending";

export type HardwareFleetDeviceRow = {
  id: string;
  kind: HardwareFleetDeviceKind;
  label: string;
  deviceType: string;
  locationName: string | null;
  status: HardwareFleetDeviceStatus;
  linkedTo: string | null;
  detail: string | null;
  manageHref: string;
};

export type HardwareDeviceFleetSummary = {
  totalDevices: number;
  onlineCount: number;
  offlineCount: number;
  needsAttentionCount: number;
  stripeConfigured: boolean;
  registerCount: number;
  readerCount: number;
};

export type HardwareDeviceFleetModel = {
  policyId: typeof HARDWARE_DEVICE_FLEET_POLICY_ID;
  summary: HardwareDeviceFleetSummary;
  devices: HardwareFleetDeviceRow[];
};

export function summarizeHardwareFleet(devices: HardwareFleetDeviceRow[]): HardwareDeviceFleetSummary {
  const onlineCount = devices.filter((d) => d.status === "online" || d.status === "active").length;
  const offlineCount = devices.filter((d) => d.status === "offline" || d.status === "inactive").length;
  const needsAttentionCount = devices.filter(
    (d) => d.status === "offline" || d.status === "pending" || d.status === "inactive",
  ).length;

  return {
    totalDevices: devices.length,
    onlineCount,
    offlineCount,
    needsAttentionCount,
    stripeConfigured: devices.some((d) => d.kind === "stripe_reader"),
    registerCount: devices.filter((d) => d.kind === "pos_register").length,
    readerCount: devices.filter((d) => d.kind === "stripe_reader").length,
  };
}
