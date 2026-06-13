import {
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ROADMAP_ITEM_COUNT,
  HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ROUTE,
  type HardwareCompatibilityRoadmapP2_37ItemId,
} from "@/lib/hardware/hardware-compatibility-roadmap-p2-37-policy";

export type HardwareCompatibilityRoadmapP2_37Item = {
  id: HardwareCompatibilityRoadmapP2_37ItemId;
  label: string;
  toastTypical: string;
  osKitchenPath: string;
  phase: "shipped" | "baseline" | "roadmap";
  connection?: "usb" | "bluetooth" | "mount" | "software";
};

export const HARDWARE_COMPATIBILITY_ROADMAP_P2_37_DISCLAIMER =
  "Internal roadmap — not Toast-certified hardware. Browser-first POS on BYOD iPad/tablets. Native ESC/POS USB/Bluetooth drivers are roadmap items; verify compat center audits before field claims." as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P2_37_USB_PRINTERS = [
  { vendor: "Epson", model: "TM-T88VI", role: "receipt", connection: "usb" as const },
  { vendor: "Epson", model: "TM-m30III", role: "receipt", connection: "usb" as const },
  { vendor: "Star", model: "TSP143IV", role: "receipt", connection: "usb" as const },
] as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P2_37_BLUETOOTH_PRINTERS = [
  { vendor: "Epson", model: "TM-m30III", role: "receipt", connection: "bluetooth" as const },
  { vendor: "Star", model: "mC-Print3", role: "receipt", connection: "bluetooth" as const },
  { vendor: "Star", model: "SM-L200", role: "mobile receipt", connection: "bluetooth" as const },
] as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P2_37_IPAD_MOUNTS = [
  { vendor: "Heckler Design", model: "Windfall Stand", fit: "iPad 10.9\" / Pro 11\"", tier: "baseline" as const },
  { vendor: "Bouncepad", model: "Floorstanding Kiosk", fit: "iPad Pro 12.9\"", tier: "baseline" as const },
  { vendor: "Kensington", model: "Secure Tablet Stand", fit: "Universal tablet", tier: "baseline" as const },
  { vendor: "Toast Tap", model: "Proprietary mount + reader", fit: "Toast lease only", tier: "not_supported" as const },
] as const;

export const HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ITEMS: readonly HardwareCompatibilityRoadmapP2_37Item[] =
  [
    {
      id: "usb_receipt_printer",
      label: "USB receipt printer",
      toastTypical: "Toast-certified Epson/Star with field install",
      osKitchenPath:
        "Browser print via OS driver queue — Epson TM-T88VI, TM-m30III, Star TSP143IV (USB)",
      phase: "shipped",
      connection: "usb",
    },
    {
      id: "bluetooth_receipt_printer",
      label: "Bluetooth receipt printer",
      toastTypical: "Toast Go + wireless kitchen/receipt lanes",
      osKitchenPath:
        "Pair to iPad/tablet host — Epson TM-m30III BT, Star mC-Print3; browser print today, native BT ESC/POS roadmap",
      phase: "baseline",
      connection: "bluetooth",
    },
    {
      id: "ipad_counter_mount",
      label: "iPad counter mount / holder",
      toastTypical: "Toast Tap proprietary counter mount + reader",
      osKitchenPath:
        "BYOD iPad + third-party stand (Heckler, Bouncepad, Kensington) — Safari PWA at /dashboard/pos/tablet",
      phase: "baseline",
      connection: "mount",
    },
    {
      id: "toast_go_handheld",
      label: "Handheld order & pay",
      toastTypical: "Toast Go 2/3 handheld with built-in printer",
      osKitchenPath: "Phone/tablet POS — /dashboard/pos/handheld + optional Socket Mobile S700 scanner",
      phase: "shipped",
      connection: "software",
    },
    {
      id: "printer_diagnostics",
      label: "Printer compatibility tests",
      toastTypical: "Toast field rep certified install + support",
      osKitchenPath: "Works with OS Kitchen compat center — printer + cash-drawer diagnostic tiers",
      phase: "shipped",
    },
    {
      id: "native_escpos_roadmap",
      label: "Native ESC/POS driver",
      toastTypical: "Day-one USB/BT driver + cash-drawer pulse",
      osKitchenPath: "Roadmap — WebUSB / StarPRNT / Epson ePOS adapter; cash-drawer kick placeholder",
      phase: "roadmap",
    },
  ] as const;

export function assertHardwareCompatibilityRoadmapP2_37ItemCount(): boolean {
  return (
    HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ITEMS.length ===
    HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ROADMAP_ITEM_COUNT
  );
}

export const HARDWARE_COMPATIBILITY_ROADMAP_P2_37_OPERATOR_LINKS = [
  { label: "Compatibility center", href: HARDWARE_COMPATIBILITY_ROADMAP_P2_37_ROUTE },
  { label: "Tablet POS", href: "/dashboard/pos/tablet" },
  { label: "POS hardware settings", href: "/dashboard/pos/settings/hardware" },
] as const;
