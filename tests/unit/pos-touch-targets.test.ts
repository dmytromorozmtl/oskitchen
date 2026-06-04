import { describe, expect, it } from "vitest";

import {
  POS_MIN_TOUCH_PX,
  POS_TOUCH_TARGET_CONSUMERS,
  POS_WCAG_FLOOR_PX,
  posCheckoutButtonClass,
  posTouchButtonClass,
  posTouchCompactClass,
  posTouchInputClass,
  posTouchSelectClass,
  posTouchTileClass,
} from "@/lib/pos/touch-targets";

describe("POS touch targets (WCAG 2.5.5)", () => {
  it("documents 44px WCAG floor and 48px primary target", () => {
    expect(POS_WCAG_FLOOR_PX).toBe(44);
    expect(POS_MIN_TOUCH_PX).toBe(48);
  });

  it("enforces 48px minimum on primary tap buttons", () => {
    expect(posTouchButtonClass).toContain("min-h-12");
    expect(posTouchButtonClass).toContain("min-w-12");
    expect(posTouchButtonClass).toContain("touch-manipulation");
  });

  it("product tiles use large kitchen-friendly height", () => {
    expect(posTouchTileClass).toContain("min-h-[120px]");
  });

  it("compact targets meet 44px floor for secondary actions", () => {
    expect(posTouchCompactClass).toContain("min-h-11");
    expect(posTouchCompactClass).toContain("min-w-11");
  });

  it("input and select helpers meet 44px floor", () => {
    expect(posTouchInputClass).toContain("min-h-11");
    expect(posTouchSelectClass).toContain("min-h-11");
  });

  it("checkout CTA exceeds WCAG floor for gloved use", () => {
    expect(posCheckoutButtonClass).toContain("min-h-14");
    expect(posCheckoutButtonClass).toContain("touch-manipulation");
  });

  it("documents touch target consumer surfaces for era17 cert", () => {
    expect(POS_TOUCH_TARGET_CONSUMERS).toContain("components/dashboard/pos-terminal-client.tsx");
    expect(POS_TOUCH_TARGET_CONSUMERS.length).toBeGreaterThanOrEqual(3);
  });
});
