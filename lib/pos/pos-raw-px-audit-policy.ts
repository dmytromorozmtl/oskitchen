import { readFileSync } from "node:fs";
import { join } from "node:path";

import { POS_RAW_PX_CLEANUP_MODULES } from "@/lib/pos/pos-spacing-tokens";

/**
 * DES-22 — POS raw px cleanup audit policy.
 *
 * @see lib/pos/pos-spacing-tokens.ts
 * @see lib/pos/touch-targets.ts
 */

export const POS_RAW_PX_AUDIT_POLICY_ID = "pos-raw-px-audit-des22-v1" as const;

/** Forbidden arbitrary Tailwind px classes in POS consumer modules. */
export const POS_FORBIDDEN_ARBITRARY_PX_PATTERN =
  /\b(?:text|min-h|min-w|max-h|max-w|h|w|gap|p|px|py|pt|pb|pl|pr|m|mx|my|mt|mb|ml|mr|top|left|right|bottom)-\[\d+px\]/g;

/** Allowed token references that satisfy DES-22. */
export const POS_SPACING_TOKEN_PATTERN =
  /pos(?:Meta|Badge|Subcaption|Product|Tile|Table|Touch)|POS_PRODUCT_TILE|POS_TABLE_MIN|min-h-pos-tile|min-w-pos-table-min|posProductTileLayoutClass|posTilePaddingClass|posCashierSpeedProductTileClass/g;

export type PosRawPxViolation = {
  pattern: string;
  line: number;
  excerpt: string;
};

export type PosRawPxModuleAudit = {
  module: (typeof POS_RAW_PX_CLEANUP_MODULES)[number];
  violations: PosRawPxViolation[];
  tokenReferences: number;
  passed: boolean;
};

export type PosRawPxAuditReport = {
  policyId: typeof POS_RAW_PX_AUDIT_POLICY_ID;
  modules: PosRawPxModuleAudit[];
  passed: boolean;
};

export function findPosRawPxViolations(source: string): PosRawPxViolation[] {
  const violations: PosRawPxViolation[] = [];
  const lines = source.split("\n");

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const lineNo = i + 1;
    const matches = line.match(POS_FORBIDDEN_ARBITRARY_PX_PATTERN);
    if (!matches) continue;
    for (const pattern of matches) {
      violations.push({ pattern, line: lineNo, excerpt: line.trim() });
    }
  }

  return violations;
}

export function auditPosRawPxModule(
  modulePath: (typeof POS_RAW_PX_CLEANUP_MODULES)[number],
  root = process.cwd(),
): PosRawPxModuleAudit {
  const source = readFileSync(join(root, modulePath), "utf8");
  const violations = findPosRawPxViolations(source);
  const tokenReferences = (source.match(POS_SPACING_TOKEN_PATTERN) ?? []).length;

  return {
    module: modulePath,
    violations,
    tokenReferences,
    passed: violations.length === 0,
  };
}

export function auditPosRawPxCleanup(root = process.cwd()): PosRawPxAuditReport {
  const modules = POS_RAW_PX_CLEANUP_MODULES.map((modulePath) => auditPosRawPxModule(modulePath, root));
  return {
    policyId: POS_RAW_PX_AUDIT_POLICY_ID,
    modules,
    passed: modules.every((m) => m.passed),
  };
}
