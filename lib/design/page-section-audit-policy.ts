import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  PAGE_SECTION_CRITICAL_MODULES,
  PAGE_SECTION_EXCEPTION_MARKER,
  PAGE_SECTION_EXCEPTION_MODULES,
  PAGE_SECTION_IMPORT,
  PAGE_SECTION_PATTERNS_POLICY_ID,
  PAGE_SECTION_PRIMITIVE_PATTERN,
} from "@/lib/design/page-section-patterns";

/**
 * DES-29 — PageSection layout consistency audit policy.
 */

export const PAGE_SECTION_AUDIT_POLICY_ID = PAGE_SECTION_PATTERNS_POLICY_ID;

export type PageSectionModuleAudit = {
  module: string;
  usesPageSection: boolean;
  isException: boolean;
  passed: boolean;
};

export type PageSectionAuditReport = {
  policyId: typeof PAGE_SECTION_AUDIT_POLICY_ID;
  modules: PageSectionModuleAudit[];
  passed: boolean;
};

export function auditPageSectionModule(
  modulePath: string,
  root = process.cwd(),
): PageSectionModuleAudit {
  const source = readFileSync(join(root, modulePath), "utf8");
  const isException =
    (PAGE_SECTION_EXCEPTION_MODULES as readonly string[]).includes(modulePath) ||
    source.includes(PAGE_SECTION_EXCEPTION_MARKER);
  const usesPageSection =
    PAGE_SECTION_PRIMITIVE_PATTERN.test(source) || source.includes(PAGE_SECTION_IMPORT);
  const passed = isException || usesPageSection;

  return {
    module: modulePath,
    usesPageSection,
    isException,
    passed,
  };
}

export function auditPageSection(root = process.cwd()): PageSectionAuditReport {
  const modules = PAGE_SECTION_CRITICAL_MODULES.map((modulePath) =>
    auditPageSectionModule(modulePath, root),
  );
  return {
    policyId: PAGE_SECTION_AUDIT_POLICY_ID,
    modules,
    passed: modules.every((m) => m.passed),
  };
}
