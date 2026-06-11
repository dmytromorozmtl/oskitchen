import { readFileSync } from "node:fs";
import { join } from "node:path";

import { describe, expect, it } from "vitest";

import {
  KDS_TOUCH_TARGET_CONSUMERS,
  kdsBumpButtonClass,
  kdsTouchPillClass,
  KDS_WCAG_FLOOR_PX,
} from "@/lib/kitchen/kds-touch-targets";
import {
  MOBILE_POS_KDS_HAPTIC_MODULES,
  MOBILE_POS_KDS_MODULES,
  MOBILE_POS_KDS_POLICY_ID,
  MOBILE_POS_KDS_TOUCH_FLOOR_PX,
} from "@/lib/ux/mobile-pos-kds-policy";
import { posTouchCompactClass } from "@/lib/pos/touch-targets";

const ROOT = process.cwd();

describe("mobile POS/KDS policy (P1-27)", () => {
  it("locks policy id and 44px touch floor", () => {
    expect(MOBILE_POS_KDS_POLICY_ID).toBe("mobile-pos-kds-p1-27-v1");
    expect(MOBILE_POS_KDS_TOUCH_FLOOR_PX).toBe(44);
    expect(KDS_WCAG_FLOOR_PX).toBe(44);
  });

  it("KDS bump and pill classes meet touch floor", () => {
    expect(kdsBumpButtonClass).toContain("min-h-14");
    expect(kdsBumpButtonClass).toContain("touch-manipulation");
    expect(kdsTouchPillClass).toContain("min-h-11");
    expect(kdsTouchPillClass).toContain("min-w-11");
    expect(posTouchCompactClass).toContain("min-h-11");
  });

  it.each(MOBILE_POS_KDS_MODULES)("module %s uses touch-manipulation or touch helpers", (modulePath) => {
    const source = readFileSync(join(ROOT, modulePath), "utf8");
    const hasTouch =
      source.includes("touch-manipulation") ||
      source.includes("posTouch") ||
      source.includes("kdsBump") ||
      source.includes("kdsRecall") ||
      source.includes("kdsTouch") ||
      source.includes("min-h-11") ||
      source.includes("min-h-12") ||
      source.includes("min-h-14");
    expect(hasTouch, modulePath).toBe(true);
  });

  it.each(MOBILE_POS_KDS_HAPTIC_MODULES)("module %s wires haptic triggers", (modulePath) => {
    const source = readFileSync(join(ROOT, modulePath), "utf8");
    expect(
      source.includes("triggerIpadNativePosHaptic") ||
        source.includes("triggerKdsHaptic") ||
        source.includes("kds-haptics") ||
        source.includes("ipad-native-pos-haptics"),
      modulePath,
    ).toBe(true);
  });

  it("documents KDS touch consumers", () => {
    expect(KDS_TOUCH_TARGET_CONSUMERS.length).toBeGreaterThanOrEqual(3);
  });
});
