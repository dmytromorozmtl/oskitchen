import { randomUUID } from "node:crypto";

import type {
  RegisteredStripeReaderRecord,
  StripeTerminalHardwareSettings,
} from "@/lib/payments/stripe-terminal-hardware-types";
import { DEFAULT_STRIPE_TERMINAL_HARDWARE_SETTINGS } from "@/lib/payments/stripe-terminal-hardware-types";

export function stripeTerminalHardwareFromSettingsCenter(
  settingsCenterJson: unknown,
): StripeTerminalHardwareSettings {
  if (!settingsCenterJson || typeof settingsCenterJson !== "object") {
    return { ...DEFAULT_STRIPE_TERMINAL_HARDWARE_SETTINGS };
  }
  const raw = (settingsCenterJson as Record<string, unknown>).stripeTerminalHardware;
  if (!raw || typeof raw !== "object") {
    return { ...DEFAULT_STRIPE_TERMINAL_HARDWARE_SETTINGS };
  }
  const o = raw as Record<string, unknown>;
  const readers = Array.isArray(o.readers)
    ? (o.readers as RegisteredStripeReaderRecord[]).filter(
        (r) => r && typeof r.id === "string" && typeof r.label === "string",
      )
    : [];
  return {
    stripeLocationId:
      typeof o.stripeLocationId === "string" && o.stripeLocationId.trim()
        ? o.stripeLocationId.trim()
        : null,
    readers,
  };
}

export function mergeStripeTerminalHardwareIntoSettingsCenter(
  settingsCenterJson: unknown,
  hardware: StripeTerminalHardwareSettings,
): Record<string, unknown> {
  const base =
    settingsCenterJson && typeof settingsCenterJson === "object"
      ? { ...(settingsCenterJson as Record<string, unknown>) }
      : {};
  base.stripeTerminalHardware = hardware;
  return base;
}

export function newLocalReaderRecord(input: {
  label: string;
  deviceType: RegisteredStripeReaderRecord["deviceType"];
  registerId?: string | null;
  stripeReaderId?: string | null;
  serialNumber?: string | null;
  status?: RegisteredStripeReaderRecord["status"];
}): RegisteredStripeReaderRecord {
  const now = new Date().toISOString();
  return {
    id: randomUUID(),
    label: input.label.trim().slice(0, 120),
    deviceType: input.deviceType,
    stripeReaderId: input.stripeReaderId ?? null,
    serialNumber: input.serialNumber ?? null,
    registerId: input.registerId ?? null,
    status: input.status ?? (input.stripeReaderId ? "online" : "pending"),
    isDefault: false,
    pairedAt: now,
    lastSeenAt: input.stripeReaderId ? now : null,
  };
}
