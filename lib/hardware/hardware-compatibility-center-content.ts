import {
  HARDWARE_COMPATIBILITY_CENTER_DIAGNOSTIC_COUNT,
  HARDWARE_COMPATIBILITY_CENTER_HEADLINE,
  HARDWARE_COMPATIBILITY_CENTER_ROUTE,
  HARDWARE_COMPATIBILITY_CENTER_TAGLINE,
} from "@/lib/hardware/hardware-compatibility-center-policy";

export const HARDWARE_COMPATIBILITY_CENTER_EYEBROW =
  "Field diagnostics · browser-first hardware" as const;

export const HARDWARE_COMPATIBILITY_CENTER_SUBLINE =
  "Run printer, cash drawer, KDS, and network checks before rush service. No proprietary OS Kitchen terminal required — verify results on each station." as const;

export const HARDWARE_COMPATIBILITY_CENTER_DIAGNOSTICS = [
  {
    id: "hardware-test-printer",
    label: "Printer test",
    description:
      "Opens a test receipt in the browser print dialog — confirms Epson/Star browser_compatible path.",
    honestCaveat: "Native ESC/POS USB driver is placeholder — typical setup uses OS print queue.",
  },
  {
    id: "hardware-test-cash-drawer",
    label: "Cash drawer test",
    description:
      "Manual open checklist — auto kick via printer pulse is not wired in this release.",
    honestCaveat: "Cash drawer kick-out remains placeholder until ESC/POS adapter ships.",
  },
  {
    id: "hardware-test-kds",
    label: "KDS test",
    description:
      "Pings kitchen route latency and links to open KDS on the kitchen display.",
    honestCaveat: "Web KDS refresh is BETA — rush-hour SLA not certified.",
  },
  {
    id: "hardware-test-network",
    label: "Network diagnostic",
    description:
      "Checks online status and /api/health round-trip for POS sync readiness.",
    honestCaveat: "verify latency under 500ms typical for counter POS; warn above 2s.",
  },
] as const;

export const HARDWARE_COMPATIBILITY_CENTER_DASHBOARD_LINKS = [
  { label: "POS hardware matrix", href: "/dashboard/pos/settings/hardware" },
  { label: "Stripe Terminal pairing", href: "/dashboard/settings/hardware" },
  { label: "Kitchen display (KDS)", href: "/dashboard/kitchen" },
  { label: "Certified hardware guide", href: "/works-with-os-kitchen#guide" },
] as const;

export {
  HARDWARE_COMPATIBILITY_CENTER_DIAGNOSTIC_COUNT,
  HARDWARE_COMPATIBILITY_CENTER_HEADLINE,
  HARDWARE_COMPATIBILITY_CENTER_ROUTE,
  HARDWARE_COMPATIBILITY_CENTER_TAGLINE,
};
