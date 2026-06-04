import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  PERMISSION_DENIED_CARD_IMPORT,
  PERMISSION_DENIED_CRITICAL_MODULES,
  PERMISSION_DENIED_EXCEPTION_MARKER,
  PERMISSION_DENIED_EXCEPTION_MODULES,
  PERMISSION_DENIED_PATTERNS_POLICY_ID,
  PERMISSION_DENIED_PRIMITIVE_PATTERN,
  PERMISSION_DENIED_SURFACE_IMPORT,
} from "@/lib/design/permission-denied-patterns";

/**
 * DES-37 — permission-denied surface consistency audit policy.
 */

export const PERMISSION_DENIED_AUDIT_POLICY_ID = PERMISSION_DENIED_PATTERNS_POLICY_ID;

export type PermissionDeniedModuleAudit = {
  module: string;
  usesPermissionDeniedPrimitive: boolean;
  isException: boolean;
  passed: boolean;
};

export type PermissionDeniedAuditReport = {
  policyId: typeof PERMISSION_DENIED_AUDIT_POLICY_ID;
  modules: PermissionDeniedModuleAudit[];
  passed: boolean;
};

export function auditPermissionDeniedModule(
  modulePath: string,
  root = process.cwd(),
): PermissionDeniedModuleAudit {
  const source = readFileSync(join(root, modulePath), "utf8");
  const isException =
    (PERMISSION_DENIED_EXCEPTION_MODULES as readonly string[]).includes(modulePath) ||
    source.includes(PERMISSION_DENIED_EXCEPTION_MARKER);
  const usesPermissionDeniedPrimitive =
    modulePath === "components/ui/permission-denied-card.tsx" ||
    PERMISSION_DENIED_PRIMITIVE_PATTERN.test(source) ||
    source.includes(PERMISSION_DENIED_CARD_IMPORT) ||
    source.includes(PERMISSION_DENIED_SURFACE_IMPORT);
  const passed = isException || usesPermissionDeniedPrimitive;

  return {
    module: modulePath,
    usesPermissionDeniedPrimitive,
    isException,
    passed,
  };
}

export function auditPermissionDenied(root = process.cwd()): PermissionDeniedAuditReport {
  const modules = PERMISSION_DENIED_CRITICAL_MODULES.map((modulePath) =>
    auditPermissionDeniedModule(modulePath, root),
  );
  return {
    policyId: PERMISSION_DENIED_AUDIT_POLICY_ID,
    modules,
    passed: modules.every((m) => m.passed),
  };
}
