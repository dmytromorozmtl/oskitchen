import { describe, expect, it } from "vitest";

import {
  POS_TERMINAL_TOUCH_TARGETS_POLICY_ID,
  auditPosTerminalTouchTargets,
  findPosTerminalTouchViolations,
} from "@/lib/pos/pos-terminal-touch-targets-policy";
import { POS_WCAG_FLOOR_PX } from "@/lib/pos/touch-targets";

describe("POS terminal touch targets policy (DES-14)", () => {
  it("locks DES-14 policy id and WCAG floor", () => {
    expect(POS_TERMINAL_TOUCH_TARGETS_POLICY_ID).toBe("pos-terminal-touch-targets-des14-v1");
    expect(POS_WCAG_FLOOR_PX).toBe(44);
  });

  it("passes audit on live pos-terminal-client (no sub-44px interactive classes)", () => {
    const audit = auditPosTerminalTouchTargets();
    expect(audit.violations).toEqual([]);
    expect(audit.passed).toBe(true);
  });

  it("detects forbidden h-9 pattern in synthetic source", () => {
    const violations = findPosTerminalTouchViolations(`
      <Button className="h-9 w-full rounded-lg text-xs" />
    `);
    expect(violations.some((v) => v.pattern === "h-9")).toBe(true);
  });

  it("allows h-auto when posTouchCompactClass is present", () => {
    const violations = findPosTerminalTouchViolations(`
      <Button className={cn("h-auto", posTouchCompactClass)} />
    `);
    expect(violations.filter((v) => v.pattern === "h-auto-button")).toHaveLength(0);
  });
});
