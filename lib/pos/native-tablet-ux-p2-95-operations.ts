/**
 * Pure helpers for native tablet UX (Blueprint P2-95).
 */

import {
  BAR_MODE_QUICK_ITEMS,
  type BarModeQuickItem,
} from "@/lib/pos/table-service-depth-operations";
import {
  posTabletCartPanelClass,
  posTabletMainLayoutClass,
  posTabletShellClass,
  type TabletOrientation,
} from "@/lib/pos/pos-tablet-layout";
import { POS_WCAG_FLOOR_PX } from "@/lib/pos/touch-targets";

export const NATIVE_TABLET_UX_MIN_TOUCH_PX = POS_WCAG_FLOOR_PX;

export type NativeTabletLayoutSnapshot = {
  orientation: TabletOrientation;
  shellClass: string;
  mainLayoutClass: string;
  cartPanelClass: string;
  stickyCart: boolean;
};

export type TableTabsPolishHint = {
  id: string;
  label: string;
  detail: string;
  route: string;
};

export type NativeTabletUxReport = {
  minTouchPx: number;
  layout: NativeTabletLayoutSnapshot;
  barQuickItems: readonly BarModeQuickItem[];
  tableTabsHints: TableTabsPolishHint[];
  openTabCount: number;
  recommendedRoute: string;
};

export function resolveNativeTabletLayoutSnapshot(
  orientation: TabletOrientation,
): NativeTabletLayoutSnapshot {
  return {
    orientation,
    shellClass: posTabletShellClass(orientation),
    mainLayoutClass: posTabletMainLayoutClass(orientation, true),
    cartPanelClass: posTabletCartPanelClass(orientation, true),
    stickyCart: orientation === "portrait",
  };
}

export function buildTableTabsPolishHints(): TableTabsPolishHint[] {
  return [
    {
      id: "open-tab",
      label: "Open bar or table tab",
      detail: "Name tabs with server prefix for banking — e.g. Alex - Table 4.",
      route: "/dashboard/pos/tabs",
    },
    {
      id: "split-bill",
      label: "Split bill on tablet",
      detail: "Equal, seat, or item split via BillSplitPanel — 44px touch targets.",
      route: "/dashboard/pos/tabs",
    },
    {
      id: "merge-table",
      label: "Merge tables",
      detail: "Combine two open party checks from floor plan or table-service hub.",
      route: "/dashboard/pos/table-service",
    },
    {
      id: "floor-plan",
      label: "Floor plan",
      detail: "Tap table to open tab — tablet landscape recommended for dining room.",
      route: "/dashboard/tables",
    },
  ];
}

export function resolveNativeTabletRecommendedRoute(openTabCount: number): string {
  if (openTabCount > 0) return "/dashboard/pos/tabs";
  return "/dashboard/pos/tablet";
}

export function buildNativeTabletUxReport(input: {
  orientation: TabletOrientation;
  openTabCount: number;
}): NativeTabletUxReport {
  return {
    minTouchPx: NATIVE_TABLET_UX_MIN_TOUCH_PX,
    layout: resolveNativeTabletLayoutSnapshot(input.orientation),
    barQuickItems: BAR_MODE_QUICK_ITEMS,
    tableTabsHints: buildTableTabsPolishHints(),
    openTabCount: input.openTabCount,
    recommendedRoute: resolveNativeTabletRecommendedRoute(input.openTabCount),
  };
}

export function meetsNativeTabletTouchFloor(sizePx: number): boolean {
  return sizePx >= NATIVE_TABLET_UX_MIN_TOUCH_PX;
}
