/** Stripe Terminal device types supported by OS Kitchen. */
export const STRIPE_TERMINAL_DEVICE_TYPES = [
  "stripe_m2",
  "bbpos_wisepos_e",
  "verifone_p400",
] as const;

export type StripeTerminalDeviceType = (typeof STRIPE_TERMINAL_DEVICE_TYPES)[number];

export type StripeTerminalDeviceCatalogEntry = {
  type: StripeTerminalDeviceType;
  label: string;
  shortLabel: string;
  description: string;
  connectivity: string;
  recommended: boolean;
};

export const STRIPE_TERMINAL_DEVICE_CATALOG: StripeTerminalDeviceCatalogEntry[] = [
  {
    type: "stripe_m2",
    label: "Stripe Reader M2",
    shortLabel: "M2",
    description: "Mobile Bluetooth reader for counter and line-busting.",
    connectivity: "Bluetooth",
    recommended: true,
  },
  {
    type: "bbpos_wisepos_e",
    label: "BBPOS WisePOS E",
    shortLabel: "WisePOS E",
    description: "Countertop Wi‑Fi / Ethernet reader with display.",
    connectivity: "Wi‑Fi / Ethernet",
    recommended: false,
  },
  {
    type: "verifone_p400",
    label: "Verifone P400",
    shortLabel: "P400",
    description: "Countertop reader for fixed checkout lanes.",
    connectivity: "Ethernet",
    recommended: false,
  },
];

export type RegisteredStripeReaderRecord = {
  id: string;
  label: string;
  deviceType: StripeTerminalDeviceType;
  stripeReaderId: string | null;
  serialNumber: string | null;
  registerId: string | null;
  status: "pending" | "online" | "offline";
  isDefault: boolean;
  pairedAt: string;
  lastSeenAt: string | null;
};

export type StripeTerminalHardwareSettings = {
  stripeLocationId: string | null;
  readers: RegisteredStripeReaderRecord[];
};

export const DEFAULT_STRIPE_TERMINAL_HARDWARE_SETTINGS: StripeTerminalHardwareSettings = {
  stripeLocationId: null,
  readers: [],
};

export function isStripeTerminalDeviceType(value: string): value is StripeTerminalDeviceType {
  return (STRIPE_TERMINAL_DEVICE_TYPES as readonly string[]).includes(value);
}

export function catalogEntryForDeviceType(
  deviceType: string | null | undefined,
): StripeTerminalDeviceCatalogEntry | null {
  if (!deviceType) return null;
  const normalized = deviceType.toLowerCase();
  return (
    STRIPE_TERMINAL_DEVICE_CATALOG.find(
      (e) => e.type === normalized || normalized.includes(e.type.replace(/_/g, "")),
    ) ?? null
  );
}

export function formatStripeTerminalDeviceLabel(deviceType: string | null | undefined): string {
  const entry = catalogEntryForDeviceType(deviceType);
  if (entry) return entry.shortLabel;
  if (!deviceType) return "Reader";
  return deviceType.replace(/_/g, " ");
}
