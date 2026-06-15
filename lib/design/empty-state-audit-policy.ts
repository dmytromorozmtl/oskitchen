import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  EMPTY_STATE_CRITICAL_MODULES,
  EMPTY_STATE_EXCEPTION_MARKER,
  EMPTY_STATE_EXCEPTION_MODULES,
  EMPTY_STATE_IMPORT,
  EMPTY_STATE_PATTERNS_POLICY_ID,
  EMPTY_STATE_PRIMITIVE_PATTERN,
  EMPTY_STATE_REEXPORT_IMPORT,
} from "@/lib/design/empty-state-patterns";

/**
 * DES-34 — EmptyState consistency audit policy.
 */

export const EMPTY_STATE_AUDIT_POLICY_ID = EMPTY_STATE_PATTERNS_POLICY_ID;

export type EmptyStateModuleAudit = {
  module: string;
  usesEmptyStatePrimitive: boolean;
  isException: boolean;
  passed: boolean;
};

export type EmptyStateAuditReport = {
  policyId: typeof EMPTY_STATE_AUDIT_POLICY_ID;
  modules: EmptyStateModuleAudit[];
  passed: boolean;
};

export function auditEmptyStateModule(
  modulePath: string,
  root = process.cwd(),
): EmptyStateModuleAudit {
  const source = readFileSync(join(root, modulePath), "utf8");
  const isException =
    (EMPTY_STATE_EXCEPTION_MODULES as readonly string[]).includes(modulePath) ||
    source.includes(EMPTY_STATE_EXCEPTION_MARKER);
  const usesEmptyStatePrimitive =
    EMPTY_STATE_PRIMITIVE_PATTERN.test(source) ||
    source.includes(EMPTY_STATE_IMPORT) ||
    source.includes(EMPTY_STATE_REEXPORT_IMPORT);
  const passed = isException || usesEmptyStatePrimitive;

  return {
    module: modulePath,
    usesEmptyStatePrimitive,
    isException,
    passed,
  };
}

export function auditEmptyState(root = process.cwd()): EmptyStateAuditReport {
  const modules = EMPTY_STATE_CRITICAL_MODULES.map((modulePath) =>
    auditEmptyStateModule(modulePath, root),
  );
  return {
    policyId: EMPTY_STATE_AUDIT_POLICY_ID,
    modules,
    passed: modules.every((m) => m.passed),
  };
}
