import {
  NATIVE_TABLET_UX_P2_95_CAPABILITY_COUNT,
  NATIVE_TABLET_UX_P2_95_ROUTE,
  NATIVE_TABLET_UX_P2_95_TABLET_POS_ROUTE,
  NATIVE_TABLET_UX_P2_95_TABS_ROUTE,
} from "@/lib/pos/native-tablet-ux-p2-95-policy";

export const NATIVE_TABLET_UX_P2_95_EYEBROW = "Native tablet UX · iPad & Android" as const;

export const NATIVE_TABLET_UX_P2_95_HEADLINE =
  "iPad layouts, bar mode quick-add, and table/tabs floor polish" as const;

export const NATIVE_TABLET_UX_P2_95_SUBLINE =
  "Three tablet-native POS surfaces — orientation-aware catalog/cart, bar quick items, and floor tabs with 44px touch targets. BETA: verify Safari PWA install — not certified Apple POS hardware audit." as const;

export const NATIVE_TABLET_UX_P2_95_CAPABILITIES = [
  {
    id: "native-tablet-ipad-layouts",
    label: "iPad layouts",
    description:
      "Portrait sticky cart + landscape split via pos-tablet-layout — haptic and swipe on /dashboard/pos/tablet.",
    module: "lib/pos/pos-tablet-layout.ts",
    route: NATIVE_TABLET_UX_P2_95_TABLET_POS_ROUTE,
  },
  {
    id: "native-tablet-bar-mode",
    label: "Bar mode polish",
    description:
      "One-tap beer/wine/cocktail quick items on open tabs — posTouchButtonClass 44px floor on tab-panel.",
    module: "components/pos/tab-panel.tsx",
    route: NATIVE_TABLET_UX_P2_95_TABS_ROUTE,
  },
  {
    id: "native-tablet-table-tabs",
    label: "Table / tabs polish",
    description:
      "Floor tabs, split bills, merge tables — tablet-friendly links to tabs and table-service depth.",
    module: "lib/pos/table-service-depth-operations.ts",
    route: "/dashboard/pos/table-service",
  },
] as const;

export const NATIVE_TABLET_UX_P2_95_OPERATOR_LINKS = [
  { label: "Tablet POS", href: NATIVE_TABLET_UX_P2_95_TABLET_POS_ROUTE },
  { label: "Bar & table tabs", href: NATIVE_TABLET_UX_P2_95_TABS_ROUTE },
  { label: "Table service", href: "/dashboard/pos/table-service" },
] as const;

export { NATIVE_TABLET_UX_P2_95_CAPABILITY_COUNT, NATIVE_TABLET_UX_P2_95_ROUTE };
