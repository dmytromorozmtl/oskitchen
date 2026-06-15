import {
  NATIVE_TABLET_UX_P3_145_CAPABILITY_COUNT,
  NATIVE_TABLET_UX_P3_145_MIN_TOUCH_PX,
  NATIVE_TABLET_UX_P3_145_NATIVE_HUB_ROUTE,
  NATIVE_TABLET_UX_P3_145_ROUTE,
  NATIVE_TABLET_UX_P3_145_TABLET_POS_ROUTE,
  NATIVE_TABLET_UX_P3_145_TABS_ROUTE,
  type NativeTabletUxP3_145CapabilityId,
} from "@/lib/design/native-tablet-ux-p3-145-policy";

export const NATIVE_TABLET_UX_P3_145_EYEBROW =
  "TouchBistro parity · native tablet UX" as const;

export const NATIVE_TABLET_UX_P3_145_SUBLINE =
  "Three tablet-native surfaces — iPad orientation layouts, bar quick-add on tabs, and floor table/tabs polish with 44px touch targets. BETA baseline — verify Safari PWA install before claiming TouchBistro floor parity." as const;

export type NativeTabletUxTouchbistroCapability = {
  id: NativeTabletUxP3_145CapabilityId;
  label: string;
  route: string;
  testId: string;
  touchbistroTypical: string;
  osKitchenStatus: string;
};

export const NATIVE_TABLET_UX_P3_145_CAPABILITIES: readonly NativeTabletUxTouchbistroCapability[] =
  [
    {
      id: "ipad_layouts",
      label: "iPad layouts",
      route: NATIVE_TABLET_UX_P3_145_TABLET_POS_ROUTE,
      testId: "native-tablet-ipad-layouts",
      touchbistroTypical: "Portrait dining-room POS + sticky cart",
      osKitchenStatus: "shipped",
    },
    {
      id: "bar_mode",
      label: "Bar mode",
      route: NATIVE_TABLET_UX_P3_145_TABS_ROUTE,
      testId: "native-tablet-bar-mode",
      touchbistroTypical: "One-tap beer/wine/cocktail on open tabs",
      osKitchenStatus: "shipped",
    },
    {
      id: "table_tabs",
      label: "Table / tabs polish",
      route: "/dashboard/pos/table-service",
      testId: "native-tablet-table-tabs",
      touchbistroTypical: "Floor tabs, split bills, merge tables",
      osKitchenStatus: "shipped",
    },
  ] as const;

export function assertNativeTabletUxTouchbistroCapabilityCount(): boolean {
  return (
    NATIVE_TABLET_UX_P3_145_CAPABILITIES.length === NATIVE_TABLET_UX_P3_145_CAPABILITY_COUNT
  );
}

export const NATIVE_TABLET_UX_P3_145_OPERATOR_LINKS = [
  { label: "Design hub", href: NATIVE_TABLET_UX_P3_145_ROUTE },
  { label: "Tablet POS", href: NATIVE_TABLET_UX_P3_145_TABLET_POS_ROUTE },
  { label: "Native tablet hub", href: NATIVE_TABLET_UX_P3_145_NATIVE_HUB_ROUTE },
  { label: "Bar & tabs", href: NATIVE_TABLET_UX_P3_145_TABS_ROUTE },
] as const;

export { NATIVE_TABLET_UX_P3_145_MIN_TOUCH_PX };
