import { describe, expect, it } from "vitest";

import {
  posTabletCartPanelClass,
  posTabletMainLayoutClass,
  posTabletShellClass,
} from "@/lib/pos/pos-tablet-layout";
import {
  POS_TABLET_POS_CLIENT_MODULE,
  POS_TABLET_POS_MIN_TOUCH_PX,
  POS_TABLET_POS_POLICY_ID,
  POS_TABLET_POS_ROUTE,
  TABLET_PWA_SCOPE,
} from "@/lib/pos/pos-tablet-pos-policy";
import { POS_TOUCH_TARGET_CONSUMERS } from "@/lib/pos/touch-targets";

describe("tablet POS", () => {
  it("locks policy constants", () => {
    expect(POS_TABLET_POS_POLICY_ID).toBe("pos-tablet-pos-v1");
    expect(POS_TABLET_POS_ROUTE).toBe("/dashboard/pos/tablet");
    expect(TABLET_PWA_SCOPE).toBe("/dashboard/pos/tablet/");
    expect(POS_TABLET_POS_MIN_TOUCH_PX).toBe(44);
    expect(POS_TABLET_POS_CLIENT_MODULE).toBe("components/pos/pos-tablet-client.tsx");
  });

  it("applies portrait and landscape shell classes", () => {
    expect(posTabletShellClass("portrait")).toContain("pos-tablet-portrait");
    expect(posTabletShellClass("landscape")).toContain("pos-tablet-landscape");
  });

  it("switches main layout between portrait column and landscape row", () => {
    expect(posTabletMainLayoutClass("portrait", true)).toContain("flex-col");
    expect(posTabletMainLayoutClass("landscape", true)).toContain("md:flex-row");
  });

  it("sticks cart panel in portrait tablet mode", () => {
    expect(posTabletCartPanelClass("portrait", true)).toContain("sticky");
    expect(posTabletCartPanelClass("landscape", true)).toContain("md:max-w-md");
  });

  it("registers tablet client in touch target consumers", () => {
    expect(POS_TOUCH_TARGET_CONSUMERS).toContain("components/pos/pos-tablet-client.tsx");
  });
});
