import { readFileSync } from "node:fs";
import { join } from "node:path";

import { findDarkModeLightOnlyViolations } from "@/lib/design/dark-mode-consistency-audit-policy";
import {
  ERROR_SKELETON_DARK_MODE_AUDIT_POLICY_ID,
  ERROR_SKELETON_DARK_MODE_MODULES,
  SKELETON_DARK_MODE_TOKENS,
  SKELETON_PULSE_CLASS,
  SKELETON_SURFACE_CLASS,
  SKELETON_WIZARD_SURFACE_CLASS,
} from "@/lib/design/loading-skeleton-patterns";
import {
  ERROR_STATE_CARD_CLASS,
  ERROR_STATE_DARK_MODE_TOKENS,
  ERROR_STATE_IMPORT,
} from "@/lib/design/error-state-patterns";

/**
 * DES-37 — dark mode audit for error boundaries and async skeletons (Task 25).
 */

export const ERROR_SKELETON_DARK_MODE_POLICY_ID = ERROR_SKELETON_DARK_MODE_AUDIT_POLICY_ID;

const DARK_MODE_SIGNAL_PATTERN =
  /dark:|ERROR_STATE_CARD_CLASS|ERROR_STATE_DARK_MODE_TOKENS|ERROR_STATE_ROUTE_WRAPPER_CLASS|SKELETON_SURFACE_CLASS|SKELETON_WIZARD_SURFACE_CLASS|SKELETON_PULSE_CLASS|<ErrorState\b/;

export type ErrorSkeletonDarkModeViolation = {
  kind: "light-only" | "missing-dark-signal";
  line?: number;
  excerpt: string;
};

export type ErrorSkeletonDarkModeModuleAudit = {
  module: (typeof ERROR_SKELETON_DARK_MODE_MODULES)[number];
  violations: ErrorSkeletonDarkModeViolation[];
  passed: boolean;
};

export type ErrorSkeletonDarkModeReport = {
  policyId: typeof ERROR_SKELETON_DARK_MODE_POLICY_ID;
  modules: ErrorSkeletonDarkModeModuleAudit[];
  passed: boolean;
};

export function findErrorSkeletonDarkModeViolations(source: string): ErrorSkeletonDarkModeViolation[] {
  const violations: ErrorSkeletonDarkModeViolation[] = [];

  for (const lightOnly of findDarkModeLightOnlyViolations(source)) {
    violations.push({
      kind: "light-only",
      line: lightOnly.line,
      excerpt: lightOnly.excerpt,
    });
  }

  if (!DARK_MODE_SIGNAL_PATTERN.test(source) && !source.includes(ERROR_STATE_IMPORT)) {
    violations.push({
      kind: "missing-dark-signal",
      excerpt: "missing dark: variant or shared ERROR/SKELETON dark-mode pattern import",
    });
  }

  return violations;
}

export function auditErrorSkeletonDarkModeModule(
  modulePath: (typeof ERROR_SKELETON_DARK_MODE_MODULES)[number],
  root = process.cwd(),
): ErrorSkeletonDarkModeModuleAudit {
  const source = readFileSync(join(root, modulePath), "utf8");
  const violations = findErrorSkeletonDarkModeViolations(source);
  return {
    module: modulePath,
    violations,
    passed: violations.length === 0,
  };
}

export function auditErrorSkeletonDarkMode(root = process.cwd()): ErrorSkeletonDarkModeReport {
  const modules = ERROR_SKELETON_DARK_MODE_MODULES.map((modulePath) =>
    auditErrorSkeletonDarkModeModule(modulePath, root),
  );
  return {
    policyId: ERROR_SKELETON_DARK_MODE_POLICY_ID,
    modules,
    passed: modules.every((m) => m.passed),
  };
}

export const ERROR_SKELETON_DARK_MODE_PATTERN_EXPORTS = {
  errorCard: ERROR_STATE_CARD_CLASS,
  errorTokens: ERROR_STATE_DARK_MODE_TOKENS,
  skeletonSurface: SKELETON_SURFACE_CLASS,
  skeletonWizard: SKELETON_WIZARD_SURFACE_CLASS,
  skeletonPulse: SKELETON_PULSE_CLASS,
  skeletonTokens: SKELETON_DARK_MODE_TOKENS,
} as const;
