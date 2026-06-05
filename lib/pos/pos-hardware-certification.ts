/**
 * Certified POS hardware catalog — mirrors docs/hardware-compatibility.md.
 * Browser-first integrations only; native ESC/POS and PAX SDK adapters are roadmap.
 */
export const POS_HARDWARE_COMPATIBILITY_DOC = "docs/hardware-compatibility.md";

export type HardwareCertificationTier = "certified" | "browser_compatible" | "external" | "roadmap";

export type HardwareDeviceCategory =
  | "barcode_scanner"
  | "receipt_printer"
  | "kitchen_printer"
  | "payment_terminal";

export type CertifiedHardwareDevice = {
  vendor: string;
  model: string;
  category: HardwareDeviceCategory;
  tier: HardwareCertificationTier;
  notes: string;
};

export const POS_CERTIFIED_HARDWARE_VENDORS = [
  "Epson",
  "PAX",
  "Star Micronics",
] as const;

export const POS_CERTIFIED_HARDWARE_DEVICES: CertifiedHardwareDevice[] = [
  {
    vendor: "Honeywell",
    model: "Voyager 1470g",
    category: "barcode_scanner",
    tier: "certified",
    notes: "USB keyboard wedge — focus POS search, scan sends digits + Enter.",
  },
  {
    vendor: "Zebra",
    model: "DS2208",
    category: "barcode_scanner",
    tier: "certified",
    notes: "USB HID keyboard wedge; works on terminal, tablet, and handheld POS.",
  },
  {
    vendor: "Socket Mobile",
    model: "S700",
    category: "barcode_scanner",
    tier: "certified",
    notes: "Bluetooth keyboard wedge for iPad/Android handheld ordering.",
  },
  {
    vendor: "Epson",
    model: "TM-T88VI",
    category: "receipt_printer",
    tier: "browser_compatible",
    notes: "58/80mm thermal — browser print dialog; no ESC/POS USB driver yet.",
  },
  {
    vendor: "Epson",
    model: "TM-m30III",
    category: "receipt_printer",
    tier: "browser_compatible",
    notes: "Compact counter receipt — share as system printer, print from POS receipt.",
  },
  {
    vendor: "Epson",
    model: "TM-L100",
    category: "kitchen_printer",
    tier: "browser_compatible",
    notes: "Label/chit printer — kitchen tickets via browser print until native adapter.",
  },
  {
    vendor: "Star Micronics",
    model: "TSP143IV",
    category: "receipt_printer",
    tier: "browser_compatible",
    notes: "USB/Ethernet receipt — browser print; StarPRNT native adapter on roadmap.",
  },
  {
    vendor: "Star Micronics",
    model: "mC-Print3",
    category: "receipt_printer",
    tier: "browser_compatible",
    notes: "Mobile receipt + optional customer display — browser print path today.",
  },
  {
    vendor: "Star Micronics",
    model: "SP742",
    category: "kitchen_printer",
    tier: "browser_compatible",
    notes: "Impact kitchen chit — browser print; pulse cash-drawer kick not wired.",
  },
  {
    vendor: "PAX",
    model: "A920 Pro",
    category: "payment_terminal",
    tier: "external",
    notes: "Semi-integrated lane terminal — capture on device, mark PAID_EXTERNALLY in POS.",
  },
  {
    vendor: "PAX",
    model: "A80",
    category: "payment_terminal",
    tier: "external",
    notes: "Countertop Android terminal — external acquirer app; no in-browser PAX SDK yet.",
  },
  {
    vendor: "PAX",
    model: "A35",
    category: "payment_terminal",
    tier: "roadmap",
    notes: "Pinpad — native PAX payment adapter planned; use Stripe Terminal meanwhile.",
  },
  {
    vendor: "Stripe",
    model: "Reader M2",
    category: "payment_terminal",
    tier: "certified",
    notes: "Bluetooth card-present — pair at /dashboard/settings/hardware.",
  },
  {
    vendor: "Stripe",
    model: "WisePOS E",
    category: "payment_terminal",
    tier: "certified",
    notes: "Counter Wi-Fi/Ethernet reader — Stripe Terminal SDK from POS terminal.",
  },
  {
    vendor: "Stripe",
    model: "Verifone P400",
    category: "payment_terminal",
    tier: "certified",
    notes: "Fixed lane Ethernet reader — card terminal payment mode in POS.",
  },
];

export function certifiedDevicesByCategory(
  category: HardwareDeviceCategory,
): CertifiedHardwareDevice[] {
  return POS_CERTIFIED_HARDWARE_DEVICES.filter((device) => device.category === category);
}

export function certifiedDevicesByVendor(vendor: string): CertifiedHardwareDevice[] {
  const needle = vendor.trim().toLowerCase();
  return POS_CERTIFIED_HARDWARE_DEVICES.filter((device) => device.vendor.toLowerCase() === needle);
}
