import { EXPO_MODE_CAPABILITY_COUNT, EXPO_MODE_ROUTE } from "@/lib/kitchen/expo-mode-p2-93-policy";

export const EXPO_MODE_EYEBROW = "Expo mode · pass & handoff" as const;

export const EXPO_MODE_HEADLINE =
  "Order completeness, missing items, and runner handoff checklist" as const;

export const EXPO_MODE_SUBLINE =
  "Three expo signals for typical rush-hour pass — bumped READY tickets with per-item completeness from production work items. BETA: verify handoff checklist — not certified third-party expo audit." as const;

export const EXPO_MODE_CAPABILITIES = [
  {
    id: "expo-order-completeness",
    label: "Order completeness",
    description:
      "Percent of line items marked ready at expo — 100% when all production work items are READY or PACK_HANDOFF.",
    module: "lib/kitchen/expo-mode-p2-93-operations.ts",
  },
  {
    id: "expo-missing-items",
    label: "Missing items",
    description:
      "Line items still in prep or not yet bumped to expo — surfaced before runner handoff.",
    module: "lib/kitchen/expo-mode-p2-93-operations.ts",
  },
  {
    id: "expo-handoff-checklist",
    label: "Handoff checklist",
    description:
      "Six-step runner checklist — utensils, allergens, bag seal, pickup notify — auto-checks when completeness allows.",
    module: "lib/kitchen/expo-mode-p2-93-operations.ts",
  },
] as const;

export const EXPO_MODE_OPERATOR_LINKS = [
  { label: "Kitchen display", href: "/dashboard/kitchen" },
  { label: "Bump / recall audit", href: "/dashboard/kitchen/bump-recall-audit" },
  { label: "Kitchen SLA", href: "/dashboard/kitchen/sla" },
] as const;

export { EXPO_MODE_CAPABILITY_COUNT, EXPO_MODE_ROUTE };
