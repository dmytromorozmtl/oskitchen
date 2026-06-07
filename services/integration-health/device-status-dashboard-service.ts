import {
  computeDeviceAlertLevel,
  DEVICE_STATUS_DASHBOARD_ABSOLUTE_FINAL_POLICY_ID,
  formatDeviceLastSeenLabel,
  groupDeviceStatusCardsByLocation,
  mapFleetStatusToConnectivity,
  summarizeDeviceStatusDashboard,
  type DeviceStatusCard,
  type DeviceStatusDashboardModel,
} from "@/lib/integration-health/device-status-dashboard-absolute-final-policy";
import { loadHardwareDeviceFleetModel } from "@/services/integration-health/hardware-device-fleet-service";
import { getStripeTerminalHardwareDashboard } from "@/services/payments/stripe-terminal-hardware-service";

export async function loadDeviceStatusDashboardModel(
  userId: string,
): Promise<DeviceStatusDashboardModel> {
  const [fleet, hardware] = await Promise.all([
    loadHardwareDeviceFleetModel(userId),
    getStripeTerminalHardwareDashboard(userId),
  ]);

  const lastSeenByReaderId = new Map(
    hardware.readers.map((reader) => [reader.id, reader.lastSeenAt]),
  );

  const cards: DeviceStatusCard[] = fleet.devices.map((device) => {
    const readerId = device.kind === "stripe_reader" ? device.id.replace(/^reader:/, "") : null;
    const lastSeenAt = readerId ? lastSeenByReaderId.get(readerId) : null;
    const connectivity = mapFleetStatusToConnectivity(device.status, device.kind);

    return {
      id: device.id,
      label: device.label,
      kind: device.kind,
      deviceType: device.deviceType,
      locationName: device.locationName,
      connectivity,
      lastSeenLabel: formatDeviceLastSeenLabel(connectivity, lastSeenAt),
      alertLevel: computeDeviceAlertLevel(connectivity),
      manageHref: device.manageHref,
      detail: device.detail,
    };
  });

  return {
    policyId: DEVICE_STATUS_DASHBOARD_ABSOLUTE_FINAL_POLICY_ID,
    summary: {
      ...summarizeDeviceStatusDashboard(cards),
      stripeConfigured: hardware.stripeConfigured,
    },
    groups: groupDeviceStatusCardsByLocation(cards),
    refreshedAt: new Date().toISOString(),
  };
}
