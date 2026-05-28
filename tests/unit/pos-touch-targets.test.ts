import { describe, expect, it } from "vitest";

import {
  POS_MIN_TOUCH_PX,
  POS_TOUCH_TARGET_CONSUMERS,
  posTouchButtonClass,
  posTouchCompactClass,
  posTouchTileClass,
} from "@/lib/pos/touch-targets";

describe("POS touch targets (WCAG 2.5.5)", () => {
  it("enforces 48px minimum on primary tap buttons", () => {
    expect(POS_MIN_TOUCH_PX).toBe(48);
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

  it("documents touch target consumer surfaces for era17 cert", () => {
    expect(POS_TOUCH_TARGET_CONSUMERS).toContain("components/dashboard/pos-terminal-client.tsx");
    expect(POS_TOUCH_TARGET_CONSUMERS.length).toBeGreaterThanOrEqual(3);
  });
});
