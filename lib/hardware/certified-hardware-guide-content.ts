import type { CertifiedHardwareGuideCategoryId } from "@/lib/hardware/certified-hardware-guide-policy";

export type CertifiedHardwareGuideCategory = {
  id: CertifiedHardwareGuideCategoryId;
  label: string;
  tier: "certified" | "browser_compatible" | "external" | "roadmap";
  summary: string;
  exampleDevices: readonly string[];
  operatorRoute: string;
  honestCaveat: string;
};

/** Seven operator hardware categories for certified deployment guides. */
export const CERTIFIED_HARDWARE_GUIDE_CATEGORIES: readonly CertifiedHardwareGuideCategory[] = [
  {
    id: "ipad_tablets",
    label: "iPad & tablets",
    tier: "certified",
    summary:
      "Browser POS and KDS on iPad (Safari) or Android tablets — no proprietary OS Kitchen terminal required.",
    exampleDevices: [
      "Apple iPad (10th gen+) — tablet POS at /dashboard/pos/tablet",
      "Apple iPad Pro — expo KDS fullscreen at /dashboard/kitchen",
      "Samsung Galaxy Tab A9 — Android tablet POS + handheld waiter",
    ],
    operatorRoute: "/dashboard/pos/tablet",
    honestCaveat:
      "Not a native iOS app — Safari PWA/browser. Offline card EMV is not certified; verify network for card capture.",
  },
  {
    id: "receipt_printers",
    label: "Receipt printers",
    tier: "browser_compatible",
    summary:
      "Epson and Star Micronics thermal receipt printers via OS print dialog — 58/80mm counter receipts.",
    exampleDevices: [
      "Epson TM-T88VI — USB/Ethernet 80mm workhorse",
      "Epson TM-m30III — compact Bluetooth counter",
      "Star Micronics TSP143IV — USB/Ethernet receipt",
      "Star Micronics mC-Print3 — mobile receipt + optional display",
    ],
    operatorRoute: "/dashboard/pos/terminal",
    honestCaveat:
      "Browser print today — native ESC/POS USB driver is roadmap. Cash-drawer kick via printer pulse not wired yet.",
  },
  {
    id: "kitchen_screens",
    label: "Kitchen screens (KDS)",
    tier: "certified",
    summary:
      "Any HDMI/monitor or wall-mounted tablet running kitchen display — bump, recall, station routing in browser.",
    exampleDevices: [
      "24\" commercial display + mini PC — grill station KDS",
      "iPad wall mount — expo bump screen",
      "Android tablet — cold/packing line display",
    ],
    operatorRoute: "/dashboard/kitchen",
    honestCaveat:
      "Web KDS refresh interval applies — rush-hour SLA not certified. verify connection bar before rush service.",
  },
  {
    id: "cash_drawers",
    label: "Cash drawers",
    tier: "roadmap",
    summary:
      "Manual cash drawer today; printer-kick pulse planned when ESC/POS adapter ships.",
    exampleDevices: [
      "APG Vasario / Series 100 — RJ11 kick from receipt printer (manual open until pulse wired)",
      "MMF Val-U-Line — under-counter drawer with manual key",
    ],
    operatorRoute: "/dashboard/pos/terminal",
    honestCaveat:
      "Auto-open on cash sale is placeholder — operators open drawer manually. Do not claim printer-kick certified.",
  },
  {
    id: "barcode_scanners",
    label: "Barcode scanners",
    tier: "certified",
    summary:
      "USB or Bluetooth keyboard-wedge scanners — scan into POS search adds product by barcode.",
    exampleDevices: [
      "Honeywell Voyager 1470g — USB wedge",
      "Zebra DS2208 — USB HID wedge",
      "Socket Mobile S700 — Bluetooth wedge for iPad handheld",
    ],
    operatorRoute: "/dashboard/pos/handheld",
    honestCaveat:
      "Serial RS-232 scanners without keyboard emulation are not supported. Camera-only scan requires manual entry.",
  },
  {
    id: "label_printers",
    label: "Label printers",
    tier: "browser_compatible",
    summary:
      "Packing and delivery labels via browser print — meal-prep bag labels, expo chits, allergen stickers.",
    exampleDevices: [
      "Epson TM-L100 — linerless label/chit printer",
      "Zebra ZD421 — 2\" shipping/ bag labels (browser print queue)",
      "Brother QL-820NWB — kitchen prep labels via OS print",
    ],
    operatorRoute: "/dashboard/packing",
    honestCaveat:
      "Native ZPL/EPL direct driver is roadmap — typical workflow uses browser print until adapter ships.",
  },
  {
    id: "payment_terminals",
    label: "Payment terminals",
    tier: "certified",
    summary:
      "Stripe Terminal in-app capture (M2, WisePOS E, P400) or external PAX lane with mark-paid workflow.",
    exampleDevices: [
      "Stripe Reader M2 — Bluetooth card-present (certified in-app)",
      "BBPOS WisePOS E — counter Wi-Fi reader",
      "Verifone P400 — fixed Ethernet lane",
      "PAX A920 Pro — external capture, mark paid in POS",
    ],
    operatorRoute: "/dashboard/settings/hardware",
    honestCaveat:
      "PAX in-app SDK is not shipped — external capture only. Stripe Terminal requires vault keys; verify smoke artifact before LIVE claims.",
  },
] as const;

export const CERTIFIED_HARDWARE_GUIDE_HEADLINE =
  "Certified hardware guide — deploy OS Kitchen without proprietary terminals" as const;

export const CERTIFIED_HARDWARE_GUIDE_SUBLINE =
  "Seven operator categories: iPad, receipt printers, kitchen screens, cash drawers, scanners, label printers, and payment terminals. Browser-first — hardware is optional, not a lock-in bundle." as const;
