/**
 * Absolute Final Task 56 — mobile-first redesign: POS mobile + KDS tablet landscape.
 *
 * Extends DES-25 (375px / 44px) with operator field surfaces:
 * - Phone POS at `/dashboard/pos/mobile`
 * - KDS tablet landscape at `/dashboard/kitchen`
 *
 * @see lib/design/mobile-first-redesign-policy.ts
 * @see lib/kitchen/kds-tablet-landscape-layout.ts
 * @see lib/pos/pos-mobile-pos-policy.ts
 */

import {
  MOBILE_FIRST_REDESIGN_POLICY_ID,
  MOBILE_FIRST_TOUCH_FLOOR_PX,
  MOBILE_FIRST_VIEWPORT_PX,
} from "@/lib/design/mobile-first-redesign-policy";
import {
  KDS_TABLET_LANDSCAPE_HEIGHT_PX,
  KDS_TABLET_LANDSCAPE_WIDTH_PX,
} from "@/lib/kitchen/kds-tablet-landscape-layout";
import {
  POS_MOBILE_POS_CLIENT_MODULE,
  POS_MOBILE_POS_ROUTE,
} from "@/lib/pos/pos-mobile-pos-policy";

export const MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_POLICY_ID =
  "mobile-first-redesign-absolute-final-v1" as const;

export const MOBILE_FIRST_REDESIGN_UPSTREAM_POLICY_ID = MOBILE_FIRST_REDESIGN_POLICY_ID;

export const MOBILE_FIRST_REDESIGN_POS_VIEWPORT_PX = MOBILE_FIRST_VIEWPORT_PX;

export const MOBILE_FIRST_REDESIGN_POS_ROUTE = POS_MOBILE_POS_ROUTE;

export const MOBILE_FIRST_REDESIGN_KDS_ROUTE = "/dashboard/kitchen" as const;

export const MOBILE_FIRST_REDESIGN_KDS_TABLET_ALIAS_ROUTE =
  "/dashboard/kitchen/tablet" as const;

export const MOBILE_FIRST_REDESIGN_KDS_VIEWPORT = {
  width: KDS_TABLET_LANDSCAPE_WIDTH_PX,
  height: KDS_TABLET_LANDSCAPE_HEIGHT_PX,
} as const;

export const MOBILE_FIRST_REDESIGN_TOUCH_FLOOR_PX = MOBILE_FIRST_TOUCH_FLOOR_PX;

export const MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_SURFACES = [
  {
    id: "pos_mobile",
    label: "POS mobile",
    route: POS_MOBILE_POS_ROUTE,
    viewportPx: MOBILE_FIRST_VIEWPORT_PX,
    clientModule: POS_MOBILE_POS_CLIENT_MODULE,
    shellTestId: "pos-mobile-shell",
  },
  {
    id: "kds_tablet_landscape",
    label: "KDS tablet landscape",
    route: MOBILE_FIRST_REDESIGN_KDS_ROUTE,
    viewportPx: KDS_TABLET_LANDSCAPE_WIDTH_PX,
    clientModule: "components/kitchen/kds-daily-service.tsx",
    shellTestId: "kds-tablet-landscape-shell",
  },
] as const;

export const MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_WIRING_PATHS = [
  "lib/design/mobile-first-redesign-absolute-final-policy.ts",
  "lib/kitchen/kds-tablet-landscape-layout.ts",
  POS_MOBILE_POS_CLIENT_MODULE,
  "components/kitchen/kds-daily-service.tsx",
  "app/dashboard/kitchen/kds-kitchen-daily-client.tsx",
  "e2e/mobile-first-redesign-pos-kds.spec.ts",
  ".github/workflows/e2e-mobile-first-redesign-pos-kds.yml",
] as const;

export const MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_E2E_SPEC =
  "e2e/mobile-first-redesign-pos-kds.spec.ts" as const;

export const MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_WORKFLOW =
  ".github/workflows/e2e-mobile-first-redesign-pos-kds.yml" as const;

export const MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_CI_SCRIPTS = [
  "test:ci:mobile-first-redesign-absolute-final",
  "test:ci:mobile-first-redesign-absolute-final:cert",
  "test:e2e:mobile-first-redesign-pos-kds",
] as const;

export const MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_UNIT_TEST =
  "tests/unit/mobile-first-redesign-absolute-final.test.ts" as const;

export type MobileFirstRedesignAbsoluteFinalSurface =
  (typeof MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_SURFACES)[number]["id"];

export function mobileFirstRedesignAbsoluteFinalSurfaceIds(): MobileFirstRedesignAbsoluteFinalSurface[] {
  return MOBILE_FIRST_REDESIGN_ABSOLUTE_FINAL_SURFACES.map((surface) => surface.id);
}
