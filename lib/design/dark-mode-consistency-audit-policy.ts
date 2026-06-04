import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  DARK_MODE_CONSISTENCY_MODULES,
  DARK_MODE_CONSISTENCY_POLICY_ID,
  DARK_MODE_FORBIDDEN_LIGHT_ONLY_PATTERN,
  DARK_MODE_TOKEN_PATTERN,
} from "@/lib/design/dark-mode-consistency-policy";

export type DarkModeConsistencyViolation = {
  pattern: string;
  line: number;
  excerpt: string;
};

export type DarkModeModuleAudit = {
  module: (typeof DARK_MODE_CONSISTENCY_MODULES)[number];
  violations: DarkModeConsistencyViolation[];
  tokenReferences: number;
  passed: boolean;
};

export type DarkModeConsistencyReport = {
  policyId: typeof DARK_MODE_CONSISTENCY_POLICY_ID;
  modules: DarkModeModuleAudit[];
  legacyDarkBridgePresent: boolean;
  passed: boolean;
};

export function findDarkModeLightOnlyViolations(source: string): DarkModeConsistencyViolation[] {
  const violations: DarkModeConsistencyViolation[] = [];
  const lines = source.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const matches = line.match(DARK_MODE_FORBIDDEN_LIGHT_ONLY_PATTERN);
    if (!matches) continue;
    for (const pattern of matches) {
      violations.push({ pattern, line: i + 1, excerpt: line.trim() });
    }
  }

  return violations;
}

export function auditDarkModeModule(
  modulePath: (typeof DARK_MODE_CONSISTENCY_MODULES)[number],
  root = process.cwd(),
): DarkModeModuleAudit {
  const source = readFileSync(join(root, modulePath), "utf8");
  const violations = findDarkModeLightOnlyViolations(source);
  const tokenReferences = (source.match(DARK_MODE_TOKEN_PATTERN) ?? []).length;

  return {
    module: modulePath,
    violations,
    tokenReferences,
    passed: violations.length === 0,
  };
}

export function hasLegacyDarkColorBridge(
  globalsCss = readFileSync(join(process.cwd(), "app/globals.css"), "utf8"),
): boolean {
  return (
    globalsCss.includes(".dark {") &&
    globalsCss.includes("--color-bg: var(--dark-bg)") &&
    globalsCss.includes("--color-text: var(--dark-text)")
  );
}

export function auditDarkModeConsistency(root = process.cwd()): DarkModeConsistencyReport {
  const modules = DARK_MODE_CONSISTENCY_MODULES.map((modulePath) =>
    auditDarkModeModule(modulePath, root),
  );
  const legacyDarkBridgePresent = hasLegacyDarkColorBridge(
    readFileSync(join(root, "app/globals.css"), "utf8"),
  );

  return {
    policyId: DARK_MODE_CONSISTENCY_POLICY_ID,
    modules,
    legacyDarkBridgePresent,
    passed: modules.every((m) => m.passed) && legacyDarkBridgePresent,
  };
}
