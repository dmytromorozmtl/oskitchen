import { readFileSync } from "node:fs";
import { join } from "node:path";

import { Z_INDEX_CLEANUP_MODULES, Z_INDEX_SCALE } from "@/lib/design/z-index-scale";

/**
 * DES-23 — z-index scale audit policy.
 *
 * @see lib/design/z-index-scale.ts
 */

export const Z_INDEX_AUDIT_POLICY_ID = "z-index-scale-des23-v1" as const;

export const Z_INDEX_FORBIDDEN_ARBITRARY_PATTERN = /\bz-\[\d+\]/g;

export const Z_INDEX_TOKEN_PATTERN =
  /\bz-(?:sticky|sticky-header|chrome|drawer|overlay|floating|tour|tour-highlight|tour-card|kitchen-fullscreen)\b|z(?:Sticky|StickyHeader|Chrome|Drawer|Overlay|Floating|Tour|KitchenFullscreen)Class|Z_INDEX_SCALE/g;

export type ZIndexViolation = {
  pattern: string;
  line: number;
  excerpt: string;
};

export type ZIndexModuleAudit = {
  module: (typeof Z_INDEX_CLEANUP_MODULES)[number];
  violations: ZIndexViolation[];
  tokenReferences: number;
  passed: boolean;
};

export type ZIndexAuditReport = {
  policyId: typeof Z_INDEX_AUDIT_POLICY_ID;
  scale: typeof Z_INDEX_SCALE;
  modules: ZIndexModuleAudit[];
  passed: boolean;
};

export function findZIndexViolations(source: string): ZIndexViolation[] {
  const violations: ZIndexViolation[] = [];
  const lines = source.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const matches = line.match(Z_INDEX_FORBIDDEN_ARBITRARY_PATTERN);
    if (!matches) continue;
    for (const pattern of matches) {
      violations.push({ pattern, line: i + 1, excerpt: line.trim() });
    }
  }

  return violations;
}

export function auditZIndexModule(
  modulePath: (typeof Z_INDEX_CLEANUP_MODULES)[number],
  root = process.cwd(),
): ZIndexModuleAudit {
  const source = readFileSync(join(root, modulePath), "utf8");
  const violations = findZIndexViolations(source);
  const tokenReferences = (source.match(Z_INDEX_TOKEN_PATTERN) ?? []).length;

  return {
    module: modulePath,
    violations,
    tokenReferences,
    passed: violations.length === 0,
  };
}

export function auditZIndexScale(root = process.cwd()): ZIndexAuditReport {
  const modules = Z_INDEX_CLEANUP_MODULES.map((modulePath) => auditZIndexModule(modulePath, root));
  return {
    policyId: Z_INDEX_AUDIT_POLICY_ID,
    scale: Z_INDEX_SCALE,
    modules,
    passed: modules.every((m) => m.passed),
  };
}
