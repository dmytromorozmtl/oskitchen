import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it, vi } from "vitest";

import { auditIpadNativePosPolishWiring } from "@/lib/pos/ipad-native-pos-polish-audit";
import {
  IPAD_NATIVE_POS_POLISH_CAPABILITIES,
  IPAD_NATIVE_POS_POLISH_CI_SCRIPTS,
  IPAD_NATIVE_POS_POLISH_MIN_TOUCH_PX,
  IPAD_NATIVE_POS_POLISH_POLICY_ID,
  IPAD_NATIVE_POS_POLISH_ROUTE,
  IPAD_NATIVE_POS_POLISH_SHELL_TEST_ID,
  IPAD_NATIVE_POS_POLISH_UPSTREAM_POLICY_ID,
  IPAD_NATIVE_POS_POLISH_UNIT_TEST,
} from "@/lib/pos/ipad-native-pos-polish-policy";
import {
  IPAD_NATIVE_POS_HAPTIC_SUCCESS_PATTERN,
  IPAD_NATIVE_POS_HAPTIC_TAP_MS,
  isIpadNativePosHapticSupported,
  triggerIpadNativePosHaptic,
} from "@/lib/pos/ipad-native-pos-haptics";
import {
  createPosTabletSwipeHandlers,
  IPAD_NATIVE_POS_SWIPE_MIN_PX,
} from "@/lib/pos/ipad-native-pos-swipe";
import { posIpadNativeProductTileClass, posIpadNativeShellClass } from "@/lib/pos/pos-tablet-layout";

const ROOT = process.cwd();

describe("iPad-native POS polish (Absolute Final Task 58)", () => {
  it("locks tablet route, touch floor, and upstream era168 policy", () => {
    expect(IPAD_NATIVE_POS_POLISH_POLICY_ID).toBe("ipad-native-pos-polish-absolute-final-v1");
    expect(IPAD_NATIVE_POS_POLISH_UPSTREAM_POLICY_ID).toBe("era168-pos-tablet-terminal-v1");
    expect(IPAD_NATIVE_POS_POLISH_ROUTE).toBe("/dashboard/pos/tablet");
    expect(IPAD_NATIVE_POS_POLISH_MIN_TOUCH_PX).toBe(44);
    expect(IPAD_NATIVE_POS_POLISH_CAPABILITIES).toHaveLength(4);
    expect(IPAD_NATIVE_POS_POLISH_SHELL_TEST_ID).toBe("pos-tablet-shell");
  });

  it("fires haptic patterns when Vibration API is available", () => {
    const vibrate = vi.fn().mockReturnValue(true);
    vi.stubGlobal("navigator", { vibrate });

    expect(isIpadNativePosHapticSupported()).toBe(true);
    expect(triggerIpadNativePosHaptic("tap")).toBe(true);
    expect(vibrate).toHaveBeenCalledWith(IPAD_NATIVE_POS_HAPTIC_TAP_MS);
    triggerIpadNativePosHaptic("success");
    expect(vibrate).toHaveBeenCalledWith(IPAD_NATIVE_POS_HAPTIC_SUCCESS_PATTERN);

    vi.unstubAllGlobals();
  });

  it("creates tablet swipe handlers with 56px minimum", () => {
    expect(IPAD_NATIVE_POS_SWIPE_MIN_PX).toBe(56);
    const handlers = createPosTabletSwipeHandlers({ onTap: () => undefined });
    expect(handlers.touchAction).toBe("pan-y");
    expect(typeof handlers.onPointerDown).toBe("function");
  });

  it("exports iPad-native layout polish classes", () => {
    expect(posIpadNativeShellClass()).toContain("pos-ipad-native");
    expect(posIpadNativeShellClass()).toContain("touch-manipulation");
    expect(posIpadNativeProductTileClass()).toContain("active:scale-[0.98]");
  });

  it("audits pos-tablet-client and pos-terminal-client wiring", () => {
    const audit = auditIpadNativePosPolishWiring(ROOT);
    expect(audit.ok, audit.failures.join("; ")).toBe(true);

    const terminal = readFileSync(
      join(ROOT, "components/dashboard/pos-terminal-client.tsx"),
      "utf8",
    );
    expect(terminal).toContain("data-ipad-native-polish");
    expect(existsSync(join(ROOT, "components/pos/pos-tablet-client.tsx"))).toBe(true);
  });

  it("ships npm cert scripts", () => {
    const pkg = JSON.parse(readFileSync(join(ROOT, "package.json"), "utf8")) as {
      scripts?: Record<string, string>;
    };
    for (const script of IPAD_NATIVE_POS_POLISH_CI_SCRIPTS) {
      expect(pkg.scripts?.[script]).toBeTruthy();
    }
    expect(IPAD_NATIVE_POS_POLISH_UNIT_TEST).toBe("tests/unit/ipad-native-pos-polish.test.ts");
  });
});
