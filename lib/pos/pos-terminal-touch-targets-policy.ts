import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  POS_TOUCH_TARGET_CONSUMERS,
  POS_WCAG_FLOOR_PX,
  posCheckoutButtonClass,
  posTouchCompactClass,
  posTouchInputClass,
  posTouchSelectClass,
  posTouchSelectLargeClass,
} from "@/lib/pos/touch-targets";

/**
 * DES-14 — POS terminal 44px touch target policy.
 *
 * @see components/dashboard/pos-terminal-client.tsx
 */

export const POS_TERMINAL_TOUCH_TARGETS_POLICY_ID = "pos-terminal-touch-targets-des14-v1" as const;

export const POS_TERMINAL_TOUCH_MODULE = "components/dashboard/pos-terminal-client.tsx" as const;

/** Interactive class patterns below WCAG 44px floor — forbidden on POS terminal. */
export const POS_TERMINAL_FORBIDDEN_TOUCH_PATTERNS = [
  /\bh-8\b/,
  /\bh-9\b/,
  /\bh-10\b/,
  /Button[^>]*className="[^"]*\bh-auto\b(?!.*posTouch)/,
] as const;

export const POS_TERMINAL_REQUIRED_TOUCH_IMPORTS = [
  "posTouchCompactClass",
  "posTouchTileClass",
  "posCheckoutButtonClass",
] as const;

export type PosTerminalTouchViolation = {
  pattern: string;
  line: number;
  excerpt: string;
};

export function findPosTerminalTouchViolations(
  source = readFileSync(join(process.cwd(), POS_TERMINAL_TOUCH_MODULE), "utf8"),
): PosTerminalTouchViolation[] {
  const violations: PosTerminalTouchViolation[] = [];
  const lines = source.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const lineNo = i + 1;

    if (/\bh-8\b/.test(line) && !line.includes("min-h-[calc")) {
      violations.push({ pattern: "h-8", line: lineNo, excerpt: line.trim() });
    }
    if (/\bh-9\b/.test(line)) {
      violations.push({ pattern: "h-9", line: lineNo, excerpt: line.trim() });
    }
    if (/\bh-10\b/.test(line)) {
      violations.push({ pattern: "h-10", line: lineNo, excerpt: line.trim() });
    }
    if (
      line.includes("Button") &&
      /\bh-auto\b/.test(line) &&
      !line.includes("posTouchCompactClass") &&
      !line.includes("posTouchButtonClass")
    ) {
      violations.push({ pattern: "h-auto-button", line: lineNo, excerpt: line.trim() });
    }
  }

  return violations;
}

export type PosTerminalTouchAudit = {
  policyId: typeof POS_TERMINAL_TOUCH_TARGETS_POLICY_ID;
  wcagFloorPx: typeof POS_WCAG_FLOOR_PX;
  module: typeof POS_TERMINAL_TOUCH_MODULE;
  consumerCount: number;
  violations: PosTerminalTouchViolation[];
  passed: boolean;
};

export function auditPosTerminalTouchTargets(
  source = readFileSync(join(process.cwd(), POS_TERMINAL_TOUCH_MODULE), "utf8"),
): PosTerminalTouchAudit {
  const violations = findPosTerminalTouchViolations(source);
  return {
    policyId: POS_TERMINAL_TOUCH_TARGETS_POLICY_ID,
    wcagFloorPx: POS_WCAG_FLOOR_PX,
    module: POS_TERMINAL_TOUCH_MODULE,
    consumerCount: POS_TOUCH_TARGET_CONSUMERS.length,
    violations,
    passed: violations.length === 0,
  };
}

export const POS_TERMINAL_TOUCH_CLASS_TOKENS = {
  compact: posTouchCompactClass,
  input: posTouchInputClass,
  select: posTouchSelectClass,
  selectLarge: posTouchSelectLargeClass,
  checkout: posCheckoutButtonClass,
} as const;
