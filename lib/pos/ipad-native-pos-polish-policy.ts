/**
 * Absolute Final Task 58 — iPad-native POS polish: touch targets, haptic, swipe.
 *
 * Extends era168 Tablet POS with operator-native feedback on `/dashboard/pos/tablet`.
 *
 * @see lib/pos/pos-tablet-pos-policy.ts
 * @see lib/pos/pos-tablet-terminal-era168-policy.ts
 * @see lib/pos/ipad-native-pos-haptics.ts
 * @see lib/pos/ipad-native-pos-swipe.ts
 */

import {
  POS_TABLET_POS_CLIENT_MODULE,
  POS_TABLET_POS_MIN_TOUCH_PX,
  POS_TABLET_POS_ROUTE,
} from "@/lib/pos/pos-tablet-pos-policy";
import { POS_TABLET_TERMINAL_ERA168_POLICY_ID } from "@/lib/pos/pos-tablet-terminal-era168-policy";

export const IPAD_NATIVE_POS_POLISH_POLICY_ID = "ipad-native-pos-polish-absolute-final-v1" as const;

export const IPAD_NATIVE_POS_POLISH_UPSTREAM_POLICY_ID = POS_TABLET_TERMINAL_ERA168_POLICY_ID;

export const IPAD_NATIVE_POS_POLISH_ROUTE = POS_TABLET_POS_ROUTE;

export const IPAD_NATIVE_POS_POLISH_MIN_TOUCH_PX = POS_TABLET_POS_MIN_TOUCH_PX;

export const IPAD_NATIVE_POS_POLISH_TERMINAL_MODULE =
  "components/dashboard/pos-terminal-client.tsx" as const;

export const IPAD_NATIVE_POS_POLISH_CAPABILITIES = [
  "touch_targets_44px",
  "haptic_tap_success_error",
  "swipe_right_add_product",
  "active_scale_press",
] as const;

export const IPAD_NATIVE_POS_POLISH_WIRING_PATHS = [
  "lib/pos/ipad-native-pos-polish-policy.ts",
  "lib/pos/ipad-native-pos-polish-audit.ts",
  "lib/pos/ipad-native-pos-haptics.ts",
  "lib/pos/ipad-native-pos-swipe.ts",
  POS_TABLET_POS_CLIENT_MODULE,
  IPAD_NATIVE_POS_POLISH_TERMINAL_MODULE,
  "tests/unit/ipad-native-pos-polish.test.ts",
] as const;

export const IPAD_NATIVE_POS_POLISH_UNIT_TEST =
  "tests/unit/ipad-native-pos-polish.test.ts" as const;

export const IPAD_NATIVE_POS_POLISH_CI_SCRIPTS = [
  "test:ci:ipad-native-pos-polish",
  "test:ci:ipad-native-pos-polish:cert",
] as const;

export const IPAD_NATIVE_POS_POLISH_SHELL_TEST_ID = "pos-tablet-shell" as const;

export const IPAD_NATIVE_POS_POLISH_TABLET_TILE_TEST_ID = "pos-product-tile" as const;
