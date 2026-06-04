import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  PAGE_HEADER_IMPORT,
  PAGE_LAYOUT_CRITICAL_MODULES,
  PAGE_LAYOUT_EXCEPTION_MARKER,
  PAGE_LAYOUT_EXCEPTION_MODULES,
  PAGE_LAYOUT_PATTERNS_POLICY_ID,
  PAGE_SHELL_IMPORT,
} from "@/lib/design/page-layout-patterns";

/**
 * DES-27 — PageHeader/PageShell layout consistency audit policy.
 */

export const PAGE_LAYOUT_AUDIT_POLICY_ID = PAGE_LAYOUT_PATTERNS_POLICY_ID;

export type PageLayoutModuleAudit = {
  module: string;
  usesPageHeader: boolean;
  usesPageShell: boolean;
  isException: boolean;
  passed: boolean;
};

export type PageLayoutAuditReport = {
  policyId: typeof PAGE_LAYOUT_AUDIT_POLICY_ID;
  modules: PageLayoutModuleAudit[];
  passed: boolean;
};

function sourceUsesLayoutPrimitive(source: string, importPath: string): boolean {
  return source.includes(importPath) || source.includes("PageHeader") || source.includes("PageShell");
}

export function auditPageLayoutModule(
  modulePath: string,
  root = process.cwd(),
): PageLayoutModuleAudit {
  const source = readFileSync(join(root, modulePath), "utf8");
  const isException =
    (PAGE_LAYOUT_EXCEPTION_MODULES as readonly string[]).includes(modulePath) ||
    source.includes(PAGE_LAYOUT_EXCEPTION_MARKER);
  const usesPageHeader = source.includes("PageHeader") || source.includes(PAGE_HEADER_IMPORT);
  const usesPageShell = source.includes("PageShell") || source.includes(PAGE_SHELL_IMPORT);
  const passed = isException || usesPageHeader;

  return {
    module: modulePath,
    usesPageHeader,
    usesPageShell,
    isException,
    passed,
  };
}

export function auditPageLayout(root = process.cwd()): PageLayoutAuditReport {
  const modules = PAGE_LAYOUT_CRITICAL_MODULES.map((modulePath) =>
    auditPageLayoutModule(modulePath, root),
  );
  return {
    policyId: PAGE_LAYOUT_AUDIT_POLICY_ID,
    modules,
    passed: modules.every((m) => m.passed),
  };
}
