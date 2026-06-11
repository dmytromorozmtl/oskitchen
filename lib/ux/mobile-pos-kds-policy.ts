/**
 * Blueprint P1-27 — mobile/tablet POS + KDS: 44px touch floor, haptic feedback.
 */

import { KDS_TOUCH_TARGET_CONSUMERS, KDS_WCAG_FLOOR_PX } from "@/lib/kitchen/kds-touch-targets";
import { POS_MOBILE_POS_CLIENT_MODULE, POS_MOBILE_POS_MIN_TOUCH_PX } from "@/lib/pos/pos-mobile-pos-policy";
import {
  POS_TABLET_POS_CLIENT_MODULE,
  POS_TABLET_POS_MIN_TOUCH_PX,
} from "@/lib/pos/pos-tablet-pos-policy";
import { POS_TOUCH_TARGET_CONSUMERS, POS_WCAG_FLOOR_PX } from "@/lib/pos/touch-targets";

export const MOBILE_POS_KDS_POLICY_ID = "mobile-pos-kds-p1-27-v1" as const;

export const MOBILE_POS_KDS_TOUCH_FLOOR_PX = POS_WCAG_FLOOR_PX;

export const MOBILE_POS_KDS_MODULES = [
  POS_TABLET_POS_CLIENT_MODULE,
  POS_MOBILE_POS_CLIENT_MODULE,
  "components/dashboard/pos-terminal-client.tsx",
  ...KDS_TOUCH_TARGET_CONSUMERS,
] as const;

export const MOBILE_POS_KDS_HAPTIC_MODULES = [
  "lib/pos/ipad-native-pos-haptics.ts",
  "lib/kitchen/kds-haptics.ts",
  "components/dashboard/pos-terminal-client.tsx",
  "components/pos/pos-mobile-client.tsx",
  "components/kitchen/kds-daily-service.tsx",
  "components/kitchen/kds-bump-next-strip.tsx",
] as const;

export const MOBILE_POS_KDS_CAPABILITIES = [
  `${POS_TABLET_POS_MIN_TOUCH_PX}px tablet POS touch floor`,
  `${POS_MOBILE_POS_MIN_TOUCH_PX}px mobile POS primary targets`,
  `${KDS_WCAG_FLOOR_PX}px KDS bump/recall targets`,
  "haptic tap/success/error on POS mobile + tablet checkout",
  "haptic bump/recall/error on KDS expo line",
] as const;

export const MOBILE_POS_KDS_CI_SCRIPTS = ["test:ci:mobile-pos-kds"] as const;
