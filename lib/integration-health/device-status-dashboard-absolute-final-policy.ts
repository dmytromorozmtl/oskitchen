/**
 * Absolute Final Task 90 — device status dashboard (Clover parity).
 *
 * @see app/dashboard/devices/page.tsx
 * @see components/dashboard/devices/device-status-dashboard.tsx
 */

import type {
  HardwareFleetDeviceKind,
  HardwareFleetDeviceStatus,
} from "@/lib/integration-health/hardware-device-fleet-policy";

export const DEVICE_STATUS_DASHBOARD_ABSOLUTE_FINAL_POLICY_ID =
  "device-status-dashboard-absolute-final-v1" as const;

export const DEVICE_STATUS_DASHBOARD_ROUTE = "/dashboard/devices" as const;

export const DEVICE_STATUS_DASHBOARD_PAGE_PATH = "app/dashboard/devices/page.tsx" as const;

export const DEVICE_STATUS_DASHBOARD_COMPONENT_PATH =
  "components/dashboard/devices/device-status-dashboard.tsx" as const;

export const DEVICE_STATUS_DASHBOARD_SERVICE_PATH =
  "services/integration-health/device-status-dashboard-service.ts" as const;

export const DEVICE_STATUS_DASHBOARD_STRIP_PATH =
  "components/dashboard/integration-health/device-status-dashboard-strip.tsx" as const;

export const DEVICE_STATUS_DASHBOARD_INTEGRATION_HEALTH_ROUTE =
  "/dashboard/integration-health" as const;

export const DEVICE_STATUS_DASHBOARD_CLOVER_PARITY_PILLARS = [
  "location_grouped_grid",
  "online_offline_badges",
  "attention_alerts",
  "last_seen_labels",
  "device_category_breakdown",
] as const;

export type DeviceStatusConnectivity = "online" | "offline" | "configured" | "inactive" | "pending";

export type DeviceStatusAlertLevel = "none" | "warning" | "critical";

export type DeviceStatusCard = {
  id: string;
  label: string;
  kind: HardwareFleetDeviceKind;
  deviceType: string;
  locationName: string | null;
  connectivity: DeviceStatusConnectivity;
  lastSeenLabel: string;
  alertLevel: DeviceStatusAlertLevel;
  manageHref: string;
  detail: string | null;
};

export type DeviceStatusLocationGroup = {
  locationName: string;
  devices: DeviceStatusCard[];
};

export type DeviceStatusDashboardSummary = {
  totalDevices: number;
  onlineCount: number;
  offlineCount: number;
  configuredCount: number;
  needsAttentionCount: number;
  registerCount: number;
  terminalCount: number;
  readerCount: number;
  stripeConfigured: boolean;
};

export type DeviceStatusDashboardModel = {
  policyId: typeof DEVICE_STATUS_DASHBOARD_ABSOLUTE_FINAL_POLICY_ID;
  summary: DeviceStatusDashboardSummary;
  groups: DeviceStatusLocationGroup[];
  refreshedAt: string;
};

export const DEVICE_STATUS_DASHBOARD_REQUIRED_MARKERS = [
  'data-testid="device-status-dashboard"',
  "DeviceStatusDashboard",
] as const;

export const DEVICE_STATUS_DASHBOARD_HONESTY_MARKERS = [
  "Configuration only",
  "not proprietary hub telemetry",
  "Stripe",
  "Clover parity",
] as const;

export const DEVICE_STATUS_DASHBOARD_WIRING_PATHS = [
  DEVICE_STATUS_DASHBOARD_PAGE_PATH,
  DEVICE_STATUS_DASHBOARD_COMPONENT_PATH,
  DEVICE_STATUS_DASHBOARD_SERVICE_PATH,
  DEVICE_STATUS_DASHBOARD_STRIP_PATH,
  "lib/integration-health/device-status-dashboard-absolute-final-policy.ts",
  "lib/integration-health/device-status-dashboard-audit.ts",
  "tests/unit/device-status-dashboard-absolute-final.test.ts",
] as const;

export const DEVICE_STATUS_DASHBOARD_UNIT_TEST =
  "tests/unit/device-status-dashboard-absolute-final.test.ts" as const;

export const DEVICE_STATUS_DASHBOARD_CI_SCRIPTS = [
  "test:ci:device-status-dashboard",
  "test:ci:device-status-dashboard:cert",
] as const;

export function mapFleetStatusToConnectivity(
  status: HardwareFleetDeviceStatus,
  kind: HardwareFleetDeviceKind,
): DeviceStatusConnectivity {
  if (status === "online") return "online";
  if (status === "offline") return "offline";
  if (status === "pending") return "pending";
  if (status === "active") {
    return kind === "stripe_reader" ? "online" : "configured";
  }
  return "inactive";
}

export function computeDeviceAlertLevel(connectivity: DeviceStatusConnectivity): DeviceStatusAlertLevel {
  if (connectivity === "offline") return "critical";
  if (connectivity === "pending" || connectivity === "inactive") return "warning";
  return "none";
}

export function formatDeviceLastSeenLabel(
  connectivity: DeviceStatusConnectivity,
  lastSeenAt: string | null | undefined,
): string {
  if (connectivity === "configured" || connectivity === "inactive") {
    return "Configuration only — no live heartbeat";
  }
  if (lastSeenAt) {
    return `Last seen ${lastSeenAt}`;
  }
  if (connectivity === "online") {
    return "Online on last Stripe sync";
  }
  if (connectivity === "offline") {
    return "Offline on last Stripe sync";
  }
  return "Status unknown — pair device to refresh";
}

export function summarizeDeviceStatusDashboard(cards: DeviceStatusCard[]): DeviceStatusDashboardSummary {
  const onlineCount = cards.filter((c) => c.connectivity === "online").length;
  const offlineCount = cards.filter((c) => c.connectivity === "offline").length;
  const configuredCount = cards.filter((c) => c.connectivity === "configured").length;
  const needsAttentionCount = cards.filter((c) => c.alertLevel !== "none").length;

  return {
    totalDevices: cards.length,
    onlineCount,
    offlineCount,
    configuredCount,
    needsAttentionCount,
    registerCount: cards.filter((c) => c.kind === "pos_register").length,
    terminalCount: cards.filter((c) => c.kind === "pos_terminal").length,
    readerCount: cards.filter((c) => c.kind === "stripe_reader").length,
    stripeConfigured: cards.some((c) => c.kind === "stripe_reader"),
  };
}

export function groupDeviceStatusCardsByLocation(cards: DeviceStatusCard[]): DeviceStatusLocationGroup[] {
  const byLocation = new Map<string, DeviceStatusCard[]>();

  for (const card of cards) {
    const key = card.locationName?.trim() || "Unassigned location";
    const bucket = byLocation.get(key) ?? [];
    bucket.push(card);
    byLocation.set(key, bucket);
  }

  return [...byLocation.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([locationName, devices]) => ({
      locationName,
      devices: devices.sort((a, b) => a.label.localeCompare(b.label)),
    }));
}
