import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  TABLE_CARD_CRITICAL_MODULES,
  TABLE_CARD_EXCEPTION_MARKER,
  TABLE_CARD_EXCEPTION_MODULES,
  TABLE_CARD_PATTERNS_POLICY_ID,
  TABLE_CARD_PRIMITIVE_PATTERN,
  TABLE_CARD_RESPONSIVE_IMPORT,
  TABLE_CARD_SHELL_IMPORT,
} from "@/lib/design/table-card-patterns";

/**
 * DES-31 — table/card list consistency audit policy.
 */

export const TABLE_CARD_AUDIT_POLICY_ID = TABLE_CARD_PATTERNS_POLICY_ID;

export type TableCardModuleAudit = {
  module: string;
  usesTableCardPrimitive: boolean;
  isException: boolean;
  passed: boolean;
};

export type TableCardAuditReport = {
  policyId: typeof TABLE_CARD_AUDIT_POLICY_ID;
  modules: TableCardModuleAudit[];
  passed: boolean;
};

export function auditTableCardModule(
  modulePath: string,
  root = process.cwd(),
): TableCardModuleAudit {
  const source = readFileSync(join(root, modulePath), "utf8");
  const isException =
    (TABLE_CARD_EXCEPTION_MODULES as readonly string[]).includes(modulePath) ||
    source.includes(TABLE_CARD_EXCEPTION_MARKER);
  const usesTableCardPrimitive =
    TABLE_CARD_PRIMITIVE_PATTERN.test(source) ||
    source.includes(TABLE_CARD_SHELL_IMPORT) ||
    source.includes(TABLE_CARD_RESPONSIVE_IMPORT);
  const passed = isException || usesTableCardPrimitive;

  return {
    module: modulePath,
    usesTableCardPrimitive,
    isException,
    passed,
  };
}

export function auditTableCard(root = process.cwd()): TableCardAuditReport {
  const modules = TABLE_CARD_CRITICAL_MODULES.map((modulePath) =>
    auditTableCardModule(modulePath, root),
  );
  return {
    policyId: TABLE_CARD_AUDIT_POLICY_ID,
    modules,
    passed: modules.every((m) => m.passed),
  };
}
