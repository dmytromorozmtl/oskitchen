import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  MOBILE_FIRST_FORBIDDEN_BUTTON_HEIGHT_PATTERN,
  MOBILE_FIRST_PATTERN_IMPORT,
  MOBILE_FIRST_REDESIGN_MODULES,
  MOBILE_FIRST_REDESIGN_POLICY_ID,
  MOBILE_FIRST_TOUCH_FLOOR_PX,
  MOBILE_FIRST_TOUCH_TOKEN_PATTERN,
  MOBILE_FIRST_VIEWPORT_PX,
} from "@/lib/design/mobile-first-redesign-policy";

export type MobileFirstViolation = {
  pattern: string;
  line: number;
  excerpt: string;
};

export type MobileFirstModuleAudit = {
  module: (typeof MOBILE_FIRST_REDESIGN_MODULES)[number];
  usesMobileFirstPatterns: boolean;
  touchTokenReferences: number;
  violations: MobileFirstViolation[];
  passed: boolean;
};

export type MobileFirstRedesignReport = {
  policyId: typeof MOBILE_FIRST_REDESIGN_POLICY_ID;
  viewportPx: typeof MOBILE_FIRST_VIEWPORT_PX;
  touchFloorPx: typeof MOBILE_FIRST_TOUCH_FLOOR_PX;
  modules: MobileFirstModuleAudit[];
  passed: boolean;
};

export function findMobileFirstSmButtonViolations(source: string): MobileFirstViolation[] {
  const violations: MobileFirstViolation[] = [];
  const lines = source.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    if (!line.includes("Button")) continue;
    if (!/\bsize="sm"/.test(line)) continue;
    if (/\bmin-h-1[12]\b/.test(line) || /\bh-auto\b/.test(line)) continue;
    violations.push({
      pattern: "button-size-sm-without-touch-floor",
      line: i + 1,
      excerpt: line.trim(),
    });
  }

  return violations;
}

export function auditMobileFirstModule(
  modulePath: (typeof MOBILE_FIRST_REDESIGN_MODULES)[number],
  root = process.cwd(),
): MobileFirstModuleAudit {
  const source = readFileSync(join(root, modulePath), "utf8");
  const usesMobileFirstPatterns = source.includes(MOBILE_FIRST_PATTERN_IMPORT);
  const touchTokenReferences = (source.match(MOBILE_FIRST_TOUCH_TOKEN_PATTERN) ?? []).length;
  const violations = findMobileFirstSmButtonViolations(source);

  const shellExempt =
    modulePath === "components/dashboard/dashboard-shell.tsx" && violations.length === 0;
  const passed =
    shellExempt ||
    (usesMobileFirstPatterns && violations.length === 0 && touchTokenReferences > 0);

  return {
    module: modulePath,
    usesMobileFirstPatterns,
    touchTokenReferences,
    violations,
    passed,
  };
}

export function auditMobileFirstRedesign(root = process.cwd()): MobileFirstRedesignReport {
  const modules = MOBILE_FIRST_REDESIGN_MODULES.map((modulePath) =>
    auditMobileFirstModule(modulePath, root),
  );

  return {
    policyId: MOBILE_FIRST_REDESIGN_POLICY_ID,
    viewportPx: MOBILE_FIRST_VIEWPORT_PX,
    touchFloorPx: MOBILE_FIRST_TOUCH_FLOOR_PX,
    modules,
    passed: modules.every((m) => m.passed),
  };
}

/** @internal — reserved for stricter CI scans */
export const MOBILE_FIRST_FORBIDDEN_BUTTON_HEIGHT_PATTERN_EXPORT =
  MOBILE_FIRST_FORBIDDEN_BUTTON_HEIGHT_PATTERN;
