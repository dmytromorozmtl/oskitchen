import {
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ROADMAP_ITEM_COUNT,
  HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ROUTE,
  type HardwareCompatibilityRoadmapItemId,
} from "@/lib/hardware/hardware-compatibility-roadmap-p3-146-policy";

export type HardwareCompatibilityRoadmapItem = {
  id: HardwareCompatibilityRoadmapItemId;
  label: string;
  cloverTypical: string;
  osKitchenPath: string;
  phase: string;
};

export const HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ITEMS: readonly HardwareCompatibilityRoadmapItem[] =
  [
    {
      id: "clover_station",
      label: "Counter station",
      cloverTypical: "Clover Station all-in-one",
      osKitchenPath: "BYOD iPad/Android tablet POS — /dashboard/pos/tablet",
      phase: "shipped",
    },
    {
      id: "clover_mini",
      label: "Compact counter",
      cloverTypical: "Clover Mini countertop",
      osKitchenPath: "Compact tablet shell + portrait sticky cart",
      phase: "shipped",
    },
    {
      id: "clover_flex",
      label: "Mobile handheld",
      cloverTypical: "Clover Flex portable",
      osKitchenPath: "Mobile browser POS — tablet + phone layouts",
      phase: "shipped",
    },
    {
      id: "fiserv_payments",
      label: "Payments bundle",
      cloverTypical: "Fiserv-backed Clover payments lease",
      osKitchenPath: "Optional Stripe Terminal M2/WisePOS — BETA, not required",
      phase: "baseline",
    },
    {
      id: "printer_diagnostics",
      label: "Printer + drawer tests",
      cloverTypical: "Certified install + field rep",
      osKitchenPath: "Browser print + compat center printer/cash-drawer diagnostics",
      phase: "shipped",
    },
    {
      id: "compat_center",
      label: "Compatibility center",
      cloverTypical: "Clover App Market hardware partners",
      osKitchenPath: "Works with OS Kitchen hub — printer, drawer, KDS, network tests",
      phase: "shipped",
    },
  ] as const;

export function assertHardwareCompatibilityRoadmapItemCount(): boolean {
  return (
    HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ITEMS.length ===
    HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ROADMAP_ITEM_COUNT
  );
}

export const HARDWARE_COMPATIBILITY_ROADMAP_P3_146_OPERATOR_LINKS = [
  { label: "Compatibility center", href: HARDWARE_COMPATIBILITY_ROADMAP_P3_146_ROUTE },
  { label: "Tablet POS", href: "/dashboard/pos/tablet" },
  { label: "Native tablet hub", href: "/dashboard/pos/native-tablet" },
] as const;
