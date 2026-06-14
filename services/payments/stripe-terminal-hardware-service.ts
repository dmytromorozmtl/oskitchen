import type { Prisma } from "@prisma/client";

import {
  catalogEntryForDeviceType,
  formatStripeTerminalDeviceLabel,
  isStripeTerminalDeviceType,
  STRIPE_TERMINAL_DEVICE_CATALOG,
  type RegisteredStripeReaderRecord,
  type StripeTerminalDeviceType,
  type StripeTerminalHardwareSettings,
} from "@/lib/payments/stripe-terminal-hardware-types";
import {
  mergeStripeTerminalHardwareIntoSettingsCenter,
  newLocalReaderRecord,
  stripeTerminalHardwareFromSettingsCenter,
} from "@/lib/payments/stripe-terminal-hardware-settings";
import { prisma } from "@/lib/prisma";
import { getStripe } from "@/lib/stripe";

export {
  STRIPE_TERMINAL_DEVICE_CATALOG,
  formatStripeTerminalDeviceLabel,
  catalogEntryForDeviceType,
};

export type StripeTerminalHardwareDashboard = {
  stripeConfigured: boolean;
  stripeLocationId: string | null;
  readers: RegisteredStripeReaderRecord[];
  catalog: typeof STRIPE_TERMINAL_DEVICE_CATALOG;
};

async function loadHardwareSettings(userId: string): Promise<{
  settingsCenterJson: unknown;
  hardware: StripeTerminalHardwareSettings;
}> {
  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { settingsCenterJson: true, businessName: true },
  });
  return {
    settingsCenterJson: kitchen?.settingsCenterJson,
    hardware: stripeTerminalHardwareFromSettingsCenter(kitchen?.settingsCenterJson),
  };
}

async function saveHardwareSettings(
  userId: string,
  settingsCenterJson: unknown,
  hardware: StripeTerminalHardwareSettings,
): Promise<void> {
  const merged = mergeStripeTerminalHardwareIntoSettingsCenter(settingsCenterJson, hardware);
  await prisma.kitchenSettings.upsert({
    where: { userId },
    create: {
      userId,
      settingsCenterJson: merged as Prisma.InputJsonValue,
    },
    update: { settingsCenterJson: merged as Prisma.InputJsonValue },
  });
}

export async function getStripeTerminalHardwareDashboard(
  userId: string,
): Promise<StripeTerminalHardwareDashboard> {
  const { hardware } = await loadHardwareSettings(userId);
  return {
    stripeConfigured: Boolean(getStripe()),
    stripeLocationId: hardware.stripeLocationId,
    readers: hardware.readers,
    catalog: STRIPE_TERMINAL_DEVICE_CATALOG,
  };
}

export async function ensureStripeTerminalLocation(userId: string): Promise<string> {
  const stripe = getStripe();
  if (!stripe) throw new Error("Stripe is not configured.");

  const { settingsCenterJson, hardware } = await loadHardwareSettings(userId);
  if (hardware.stripeLocationId) {
    try {
      await stripe.terminal.locations.retrieve(hardware.stripeLocationId);
      return hardware.stripeLocationId;
    } catch {
      // stale id — recreate below
    }
  }

  const kitchen = await prisma.kitchenSettings.findUnique({
    where: { userId },
    select: { businessName: true },
  });
  const displayName = kitchen?.businessName?.trim() || "OS Kitchen location";

  const location = await stripe.terminal.locations.create({
    display_name: displayName.slice(0, 255),
    address: {
      line1: "100 Market Street",
      city: "San Francisco",
      state: "CA",
      country: "US",
      postal_code: "94105",
    },
  });

  const next: StripeTerminalHardwareSettings = {
    ...hardware,
    stripeLocationId: location.id,
  };
  await saveHardwareSettings(userId, settingsCenterJson, next);
  return location.id;
}

export type RegisterPhysicalReaderInput = {
  userId: string;
  registrationCode: string;
  label: string;
  deviceType: StripeTerminalDeviceType;
  registerId?: string | null;
};

export type RegisterPhysicalReaderResult =
  | { ok: true; reader: RegisteredStripeReaderRecord }
  | { ok: false; error: string };

export async function registerPhysicalReader(
  input: RegisterPhysicalReaderInput,
): Promise<RegisterPhysicalReaderResult> {
  const stripe = getStripe();
  if (!stripe) {
    return { ok: false, error: "Stripe is not configured. Add STRIPE_SECRET_KEY in production." };
  }
  if (!isStripeTerminalDeviceType(input.deviceType)) {
    return { ok: false, error: "Unsupported reader model." };
  }

  const code = input.registrationCode.trim();
  if (code.length < 6) {
    return { ok: false, error: "Enter the pairing code shown on the reader display." };
  }

  try {
    const locationId = await ensureStripeTerminalLocation(input.userId);
    const stripeReader = await stripe.terminal.readers.create({
      registration_code: code,
      label: input.label.trim().slice(0, 255) || catalogEntryForDeviceType(input.deviceType)?.label || "POS reader",
      location: locationId,
    });

    const { settingsCenterJson, hardware } = await loadHardwareSettings(input.userId);
    const record = newLocalReaderRecord({
      label: stripeReader.label ?? input.label,
      deviceType: input.deviceType,
      registerId: input.registerId ?? null,
      stripeReaderId: stripeReader.id,
      serialNumber: stripeReader.serial_number ?? null,
      status: stripeReader.status === "online" ? "online" : "offline",
    });

    const readers = hardware.readers.filter((r) => r.stripeReaderId !== stripeReader.id);
    if (readers.length === 0) record.isDefault = true;
    readers.push(record);

    await saveHardwareSettings(input.userId, settingsCenterJson, {
      ...hardware,
      stripeLocationId: locationId,
      readers,
    });

    await prisma.pOSAuditEvent.create({
      data: {
        userId: input.userId,
        registerId: input.registerId ?? undefined,
        action: "pos.terminal.reader_registered",
        metadataJson: {
          deviceType: input.deviceType,
          stripeReaderId: stripeReader.id,
          serialNumber: stripeReader.serial_number,
        },
      },
    });

    return { ok: true, reader: record };
  } catch (e) {
    return {
      ok: false,
      error: e instanceof Error ? e.message : "Could not register reader with Stripe.",
    };
  }
}

export async function syncReadersFromStripe(userId: string): Promise<RegisteredStripeReaderRecord[]> {
  const stripe = getStripe();
  if (!stripe) return [];

  const locationId = await ensureStripeTerminalLocation(userId);
  const listed = await stripe.terminal.readers.list({ location: locationId, limit: 100 });

  const { settingsCenterJson, hardware } = await loadHardwareSettings(userId);
  const byStripeId = new Map(hardware.readers.map((r) => [r.stripeReaderId, r]));

  const merged: RegisteredStripeReaderRecord[] = listed.data.map((sr) => {
    const deviceTypeRaw = sr.device_type?.toLowerCase() ?? "";
    const deviceType: StripeTerminalDeviceType = isStripeTerminalDeviceType(deviceTypeRaw)
      ? deviceTypeRaw
      : deviceTypeRaw.includes("wisepos")
        ? "bbpos_wisepos_e"
        : deviceTypeRaw.includes("p400")
          ? "verifone_p400"
          : "stripe_m2";

    const existing = byStripeId.get(sr.id);
    const now = new Date().toISOString();
    if (existing) {
      return {
        ...existing,
        label: sr.label ?? existing.label,
        serialNumber: sr.serial_number ?? existing.serialNumber,
        status: sr.status === "online" ? "online" : "offline",
        lastSeenAt: now,
      };
    }
    return newLocalReaderRecord({
      label: sr.label ?? formatStripeTerminalDeviceLabel(deviceType),
      deviceType,
      stripeReaderId: sr.id,
      serialNumber: sr.serial_number ?? null,
      status: sr.status === "online" ? "online" : "offline",
    });
  });

  const defaultReader = merged.find((r) => r.isDefault) ?? merged[0];
  if (defaultReader) {
    for (const r of merged) r.isDefault = r.id === defaultReader.id;
  }

  await saveHardwareSettings(userId, settingsCenterJson, {
    stripeLocationId: locationId,
    readers: merged,
  });

  return merged;
}

export async function setDefaultStripeReader(
  userId: string,
  localReaderId: string,
): Promise<boolean> {
  const { settingsCenterJson, hardware } = await loadHardwareSettings(userId);
  if (!hardware.readers.some((r) => r.id === localReaderId)) return false;
  const readers = hardware.readers.map((r) => ({
    ...r,
    isDefault: r.id === localReaderId,
  }));
  await saveHardwareSettings(userId, settingsCenterJson, { ...hardware, readers });
  return true;
}

export async function unregisterStripeReader(
  userId: string,
  localReaderId: string,
): Promise<{ ok: boolean; error?: string }> {
  const stripe = getStripe();
  const { settingsCenterJson, hardware } = await loadHardwareSettings(userId);
  const target = hardware.readers.find((r) => r.id === localReaderId);
  if (!target) return { ok: false, error: "Reader not found." };

  if (stripe && target.stripeReaderId) {
    try {
      await stripe.terminal.readers.del(target.stripeReaderId);
    } catch (e) {
      const message = e instanceof Error ? e.message : "Stripe delete failed.";
      return { ok: false, error: message };
    }
  }

  const readers = hardware.readers.filter((r) => r.id !== localReaderId);
  if (readers.length > 0 && !readers.some((r) => r.isDefault)) {
    readers[0]!.isDefault = true;
  }

  await saveHardwareSettings(userId, settingsCenterJson, { ...hardware, readers });
  return { ok: true };
}
