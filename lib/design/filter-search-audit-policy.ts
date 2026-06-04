import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  FILTER_SEARCH_CRITICAL_MODULES,
  FILTER_SEARCH_EXCEPTION_MARKER,
  FILTER_SEARCH_EXCEPTION_MODULES,
  FILTER_SEARCH_PATTERNS_POLICY_ID,
  FILTER_SEARCH_PRIMITIVE_PATTERN,
  FILTER_SEARCH_SHELL_IMPORT,
} from "@/lib/design/filter-search-patterns";

/**
 * DES-30 — filter/search UX consistency audit policy.
 */

export const FILTER_SEARCH_AUDIT_POLICY_ID = FILTER_SEARCH_PATTERNS_POLICY_ID;

export type FilterSearchModuleAudit = {
  module: string;
  usesFilterSearchPrimitive: boolean;
  isException: boolean;
  passed: boolean;
};

export type FilterSearchAuditReport = {
  policyId: typeof FILTER_SEARCH_AUDIT_POLICY_ID;
  modules: FilterSearchModuleAudit[];
  passed: boolean;
};

export function auditFilterSearchModule(
  modulePath: string,
  root = process.cwd(),
): FilterSearchModuleAudit {
  const source = readFileSync(join(root, modulePath), "utf8");
  const isException =
    (FILTER_SEARCH_EXCEPTION_MODULES as readonly string[]).includes(modulePath) ||
    source.includes(FILTER_SEARCH_EXCEPTION_MARKER);
  const usesFilterSearchPrimitive =
    FILTER_SEARCH_PRIMITIVE_PATTERN.test(source) || source.includes(FILTER_SEARCH_SHELL_IMPORT);
  const passed = isException || usesFilterSearchPrimitive;

  return {
    module: modulePath,
    usesFilterSearchPrimitive,
    isException,
    passed,
  };
}

export function auditFilterSearch(root = process.cwd()): FilterSearchAuditReport {
  const modules = FILTER_SEARCH_CRITICAL_MODULES.map((modulePath) =>
    auditFilterSearchModule(modulePath, root),
  );
  return {
    policyId: FILTER_SEARCH_AUDIT_POLICY_ID,
    modules,
    passed: modules.every((m) => m.passed),
  };
}
