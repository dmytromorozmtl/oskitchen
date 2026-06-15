import { readFileSync } from "node:fs";
import { join } from "node:path";

import { APP_ICON_SIZES, ICON_SYSTEM_MODULES } from "@/lib/design/icon-system";

/**
 * DES-25 — icon system audit policy.
 *
 * @see lib/design/icon-system.ts
 */

export const ICON_SYSTEM_AUDIT_POLICY_ID = "icon-system-des25-v1" as const;

/** Raw Tailwind icon dimensions — use `appIcon*Class` instead. */
export const ICON_SYSTEM_FORBIDDEN_SIZE_PATTERN =
  /\bh-3 w-3\b|\bh-3\.5 w-3\.5\b|\bh-4 w-4\b|\bh-5 w-5\b|\bh-6 w-6\b/g;

export const ICON_SYSTEM_TOKEN_PATTERN =
  /\bappIcon(?:Xs|Sm|Md|Lg|Xl|Nav|Badge|Header|Hero|Tile)Class\b|\bAPP_ICON_SIZES\b|\bappIconSizeClass\b|\bAppIcon\b|\bSIZE_CLASS\b/g;

export type IconSystemViolation = {
  pattern: string;
  line: number;
  excerpt: string;
};

export type IconSystemModuleAudit = {
  module: (typeof ICON_SYSTEM_MODULES)[number];
  violations: IconSystemViolation[];
  tokenReferences: number;
  passed: boolean;
};

export type IconSystemAuditReport = {
  policyId: typeof ICON_SYSTEM_AUDIT_POLICY_ID;
  sizes: typeof APP_ICON_SIZES;
  modules: IconSystemModuleAudit[];
  passed: boolean;
};

export function findIconSystemViolations(source: string): IconSystemViolation[] {
  const violations: IconSystemViolation[] = [];
  const lines = source.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const matches = line.match(ICON_SYSTEM_FORBIDDEN_SIZE_PATTERN);
    if (!matches) continue;
    for (const pattern of matches) {
      violations.push({ pattern, line: i + 1, excerpt: line.trim() });
    }
  }

  return violations;
}

export function auditIconSystemModule(
  modulePath: (typeof ICON_SYSTEM_MODULES)[number],
  root = process.cwd(),
): IconSystemModuleAudit {
  const source = readFileSync(join(root, modulePath), "utf8");
  const violations = findIconSystemViolations(source);
  const tokenReferences = (source.match(ICON_SYSTEM_TOKEN_PATTERN) ?? []).length;

  return {
    module: modulePath,
    violations,
    tokenReferences,
    passed: violations.length === 0,
  };
}

export function auditIconSystem(root = process.cwd()): IconSystemAuditReport {
  const modules = ICON_SYSTEM_MODULES.map((modulePath) => auditIconSystemModule(modulePath, root));
  return {
    policyId: ICON_SYSTEM_AUDIT_POLICY_ID,
    sizes: APP_ICON_SIZES,
    modules,
    passed: modules.every((m) => m.passed),
  };
}
