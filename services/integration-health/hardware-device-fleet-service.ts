import { formatStripeTerminalDeviceLabel } from "@/lib/payments/stripe-terminal-hardware-types";
import {
  HARDWARE_DEVICE_FLEET_MANAGE_HARDWARE_ROUTE,
  HARDWARE_DEVICE_FLEET_MANAGE_REGISTERS_ROUTE,
  HARDWARE_DEVICE_FLEET_POLICY_ID,
  summarizeHardwareFleet,
  type HardwareDeviceFleetModel,
  type HardwareFleetDeviceRow,
} from "@/lib/integration-health/hardware-device-fleet-policy";
import { prisma } from "@/lib/prisma";
import { ownerScopedAnd } from "@/lib/scope/workspace-resource-scope";
import { getStripeTerminalHardwareDashboard } from "@/services/payments/stripe-terminal-hardware-service";

export async function loadHardwareDeviceFleetModel(userId: string): Promise<HardwareDeviceFleetModel> {
  const registerWhere = await ownerScopedAnd(userId, {});
  const [registers, terminals, hardware] = await Promise.all([
    prisma.pOSRegister.findMany({
      where: registerWhere,
      orderBy: { name: "asc" },
      include: {
        location: { select: { name: true } },
        terminal: { select: { id: true, name: true, deviceLabel: true, status: true } },
      },
    }),
    prisma.pOSTerminal.findMany({
      where: { userId },
      orderBy: { name: "asc" },
      include: { location: { select: { name: true } } },
    }),
    getStripeTerminalHardwareDashboard(userId),
  ]);

  const registerNameById = new Map(registers.map((r) => [r.id, r.name]));
  const devices: HardwareFleetDeviceRow[] = [];

  for (const register of registers) {
    const printerBits = [register.receiptPrinterName, register.kitchenPrinterName].filter(Boolean);
    devices.push({
      id: `register:${register.id}`,
      kind: "pos_register",
      label: register.name,
      deviceType: "POS register",
      locationName: register.location?.name ?? null,
      status: register.status === "ACTIVE" ? "active" : "inactive",
      linkedTo: register.terminal?.name ?? null,
      detail: printerBits.length
        ? `Printers: ${printerBits.join(", ")}`
        : register.cashTrackingEnabled
          ? "Cash tracking enabled"
          : null,
      manageHref: HARDWARE_DEVICE_FLEET_MANAGE_REGISTERS_ROUTE,
    });
  }

  for (const terminal of terminals) {
    const linkedRegisterCount = registers.filter((r) => r.posTerminalId === terminal.id).length;
    devices.push({
      id: `terminal:${terminal.id}`,
      kind: "pos_terminal",
      label: terminal.deviceLabel?.trim() || terminal.name,
      deviceType: `POS terminal · ${terminal.mode.toLowerCase()}`,
      locationName: terminal.location?.name ?? null,
      status: terminal.status === "ACTIVE" ? "active" : "inactive",
      linkedTo: linkedRegisterCount > 0 ? `${linkedRegisterCount} register(s)` : null,
      detail: terminal.name !== terminal.deviceLabel ? terminal.name : null,
      manageHref: "/dashboard/pos/settings",
    });
  }

  for (const reader of hardware.readers) {
    devices.push({
      id: `reader:${reader.id}`,
      kind: "stripe_reader",
      label: reader.label,
      deviceType: formatStripeTerminalDeviceLabel(reader.deviceType),
      locationName: hardware.stripeLocationId ? "Stripe Terminal location" : null,
      status: reader.status,
      linkedTo: reader.registerId ? (registerNameById.get(reader.registerId) ?? "Unknown register") : null,
      detail: reader.serialNumber ? `SN ${reader.serialNumber}` : reader.stripeReaderId,
      manageHref: HARDWARE_DEVICE_FLEET_MANAGE_HARDWARE_ROUTE,
    });
  }

  return {
    policyId: HARDWARE_DEVICE_FLEET_POLICY_ID,
    summary: {
      ...summarizeHardwareFleet(devices),
      stripeConfigured: hardware.stripeConfigured,
    },
    devices,
  };
}
