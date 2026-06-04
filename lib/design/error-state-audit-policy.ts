import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";

import {
  API_ERROR_STATE_IMPORT,
  ERROR_STATE_CRITICAL_MODULES,
  ERROR_STATE_EXCEPTION_MARKER,
  ERROR_STATE_EXCEPTION_MODULES,
  ERROR_STATE_IMPORT,
  ERROR_STATE_PATTERNS_POLICY_ID,
  ERROR_STATE_PRIMITIVE_PATTERN,
  ROUTE_ERROR_IMPORT,
} from "@/lib/design/error-state-patterns";

/**
 * DES-33 — error state consistency audit policy.
 */

export const ERROR_STATE_AUDIT_POLICY_ID = ERROR_STATE_PATTERNS_POLICY_ID;

export type ErrorStateModuleAudit = {
  module: string;
  usesErrorStatePrimitive: boolean;
  isException: boolean;
  passed: boolean;
};

export type ErrorStateAuditReport = {
  policyId: typeof ERROR_STATE_AUDIT_POLICY_ID;
  modules: ErrorStateModuleAudit[];
  passed: boolean;
};

export function auditErrorStateModule(
  modulePath: string,
  root = process.cwd(),
): ErrorStateModuleAudit {
  const absolutePath = join(root, modulePath);
  if (!existsSync(absolutePath)) {
    return {
      module: modulePath,
      usesErrorStatePrimitive: false,
      isException: false,
      passed: false,
    };
  }
  const source = readFileSync(absolutePath, "utf8");
  const isException =
    (ERROR_STATE_EXCEPTION_MODULES as readonly string[]).includes(modulePath) ||
    source.includes(ERROR_STATE_EXCEPTION_MARKER);
  const usesErrorStatePrimitive =
    ERROR_STATE_PRIMITIVE_PATTERN.test(source) ||
    source.includes(ERROR_STATE_IMPORT) ||
    source.includes(API_ERROR_STATE_IMPORT) ||
    source.includes(ROUTE_ERROR_IMPORT);
  const passed = isException || usesErrorStatePrimitive;

  return {
    module: modulePath,
    usesErrorStatePrimitive,
    isException,
    passed,
  };
}

export function auditErrorState(root = process.cwd()): ErrorStateAuditReport {
  const modules = ERROR_STATE_CRITICAL_MODULES.map((modulePath) =>
    auditErrorStateModule(modulePath, root),
  );
  return {
    policyId: ERROR_STATE_AUDIT_POLICY_ID,
    modules,
    passed: modules.every((m) => m.passed),
  };
}
