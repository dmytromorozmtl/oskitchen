import {
  CERTIFIED_DEVICES_IPAD_P2_39_HANDHELD_ROUTE,
  CERTIFIED_DEVICES_IPAD_P2_39_KDS_ROUTE,
  CERTIFIED_DEVICES_IPAD_P2_39_MIN_IOS,
  CERTIFIED_DEVICES_IPAD_P2_39_MODEL_COUNT,
  CERTIFIED_DEVICES_IPAD_P2_39_TABLET_POS_ROUTE,
} from "@/lib/hardware/certified-devices-ipad-p2-39-policy";

export type CertifiedIpadTier = "certified" | "baseline" | "legacy";

export type CertifiedIpadUseCase = "counter_pos" | "kds_expo" | "handheld_waiter" | "packing_line";

export type CertifiedIpadModel = {
  id: string;
  model: string;
  screenInches: number;
  tier: CertifiedIpadTier;
  minIos: string;
  primaryUse: CertifiedIpadUseCase;
  route: string;
  notes: string;
};

export const CERTIFIED_DEVICES_IPAD_P2_39_DISCLAIMER =
  "Browser-first POS — Safari PWA at listed routes. Not a native iOS App Store app. Offline card EMV is not certified; verify network for Stripe Terminal capture." as const;

export const CERTIFIED_DEVICES_IPAD_P2_39_MODELS: readonly CertifiedIpadModel[] = [
  {
    id: "ipad-pro-13-m4",
    model: 'iPad Pro 13" (M4, 2024)',
    screenInches: 13,
    tier: "certified",
    minIos: "17",
    primaryUse: "kds_expo",
    route: CERTIFIED_DEVICES_IPAD_P2_39_KDS_ROUTE,
    notes: "Recommended expo / bump screen — large readable tickets in rush service.",
  },
  {
    id: "ipad-pro-11-m4",
    model: 'iPad Pro 11" (M4, 2024)',
    screenInches: 11,
    tier: "certified",
    minIos: "17",
    primaryUse: "counter_pos",
    route: CERTIFIED_DEVICES_IPAD_P2_39_TABLET_POS_ROUTE,
    notes: "Primary counter POS — portrait sticky cart, Stripe Terminal Bluetooth pairing.",
  },
  {
    id: "ipad-air-13-m2",
    model: 'iPad Air 13" (M2, 2024)',
    screenInches: 13,
    tier: "certified",
    minIos: CERTIFIED_DEVICES_IPAD_P2_39_MIN_IOS,
    primaryUse: "kds_expo",
    route: CERTIFIED_DEVICES_IPAD_P2_39_KDS_ROUTE,
    notes: "Cost-effective KDS wall mount — full-screen kitchen display.",
  },
  {
    id: "ipad-air-11-m2",
    model: 'iPad Air 11" (M2, 2024)',
    screenInches: 11,
    tier: "certified",
    minIos: CERTIFIED_DEVICES_IPAD_P2_39_MIN_IOS,
    primaryUse: "counter_pos",
    route: CERTIFIED_DEVICES_IPAD_P2_39_TABLET_POS_ROUTE,
    notes: "Lightweight counter tablet — Heckler/Bouncepad stand compatible.",
  },
  {
    id: "ipad-11-a16",
    model: "iPad (A16, 11th generation, 2025)",
    screenInches: 11,
    tier: "certified",
    minIos: CERTIFIED_DEVICES_IPAD_P2_39_MIN_IOS,
    primaryUse: "counter_pos",
    route: CERTIFIED_DEVICES_IPAD_P2_39_TABLET_POS_ROUTE,
    notes: "Budget-friendly counter POS — same Safari PWA workflow as Pro.",
  },
  {
    id: "ipad-10-2022",
    model: "iPad (10th generation, 2022)",
    screenInches: 10.9,
    tier: "certified",
    minIos: CERTIFIED_DEVICES_IPAD_P2_39_MIN_IOS,
    primaryUse: "counter_pos",
    route: CERTIFIED_DEVICES_IPAD_P2_39_TABLET_POS_ROUTE,
    notes: "Most common pilot tablet — USB-C, landscape/portrait POS layouts.",
  },
  {
    id: "ipad-mini-7-a17",
    model: "iPad mini (A17 Pro, 7th generation, 2024)",
    screenInches: 8.3,
    tier: "certified",
    minIos: "17",
    primaryUse: "handheld_waiter",
    route: CERTIFIED_DEVICES_IPAD_P2_39_HANDHELD_ROUTE,
    notes: "Pocketable floor ordering — pair Socket Mobile S700 Bluetooth scanner.",
  },
  {
    id: "ipad-mini-6",
    model: "iPad mini (6th generation, 2021)",
    screenInches: 8.3,
    tier: "baseline",
    minIos: CERTIFIED_DEVICES_IPAD_P2_39_MIN_IOS,
    primaryUse: "handheld_waiter",
    route: CERTIFIED_DEVICES_IPAD_P2_39_HANDHELD_ROUTE,
    notes: "Handheld waiter mode — verify iOS 16+ before rush deployment.",
  },
  {
    id: "ipad-pro-129-m2",
    model: 'iPad Pro 12.9" (6th generation, M2, 2022)',
    screenInches: 12.9,
    tier: "baseline",
    minIos: CERTIFIED_DEVICES_IPAD_P2_39_MIN_IOS,
    primaryUse: "kds_expo",
    route: CERTIFIED_DEVICES_IPAD_P2_39_KDS_ROUTE,
    notes: "Legacy expo screen — supported; prefer M4 13\" for new installs.",
  },
  {
    id: "ipad-9-2021",
    model: "iPad (9th generation, 2021)",
    screenInches: 10.2,
    tier: "legacy",
    minIos: CERTIFIED_DEVICES_IPAD_P2_39_MIN_IOS,
    primaryUse: "packing_line",
    route: "/dashboard/packing",
    notes: "Minimum supported iPad — packing line display only; not recommended for new counter POS.",
  },
] as const;

export function assertCertifiedDevicesIpadP2_39ModelCount(): boolean {
  return CERTIFIED_DEVICES_IPAD_P2_39_MODELS.length === CERTIFIED_DEVICES_IPAD_P2_39_MODEL_COUNT;
}

export function countCertifiedDevicesIpadP2_39ByTier(tier: CertifiedIpadTier): number {
  return CERTIFIED_DEVICES_IPAD_P2_39_MODELS.filter((m) => m.tier === tier).length;
}
