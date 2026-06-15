/**
 * Mobile POS — phone-as-terminal with swipe gestures and one-hand thumb zone.
 */

import { POS_MIN_TOUCH_PX } from "@/lib/pos/touch-targets";

export const POS_MOBILE_POS_POLICY_ID = "pos-mobile-pos-v1" as const;

export const POS_MOBILE_POS_ROUTE = "/dashboard/pos/mobile" as const;

export const POS_MOBILE_POS_MANIFEST_ROUTE =
  "/dashboard/pos/mobile/manifest.webmanifest" as const;

export const MOBILE_PWA_SCOPE = "/dashboard/pos/mobile/" as const;

export const POS_MOBILE_POS_DOC = "docs/pos-mobile-pos.md" as const;

export const POS_MOBILE_POS_CLIENT_MODULE = "components/pos/pos-mobile-client.tsx" as const;

export const POS_MOBILE_POS_MIN_TOUCH_PX = POS_MIN_TOUCH_PX;

export const POS_MOBILE_SWIPE_MIN_DISTANCE_PX = 48 as const;
