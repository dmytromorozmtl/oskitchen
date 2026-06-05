/**
 * Tablet POS — iPad/Android counter layout with 44px touch floor.
 */

import { POS_WCAG_FLOOR_PX } from "@/lib/pos/touch-targets";

export const POS_TABLET_POS_POLICY_ID = "pos-tablet-pos-v1" as const;

export const POS_TABLET_POS_ROUTE = "/dashboard/pos/tablet" as const;

export const POS_TABLET_POS_MANIFEST_ROUTE =
  "/dashboard/pos/tablet/manifest.webmanifest" as const;

export const POS_TABLET_POS_DOC = "docs/pos-tablet-pos.md" as const;

export const POS_TABLET_POS_CLIENT_MODULE = "components/pos/pos-tablet-client.tsx" as const;

export const POS_TABLET_POS_MIN_TOUCH_PX = POS_WCAG_FLOOR_PX;

export const POS_TABLET_POS_ORIENTATION_MODES = ["portrait", "landscape"] as const;

export const TABLET_PWA_SCOPE = "/dashboard/pos/tablet/" as const;
