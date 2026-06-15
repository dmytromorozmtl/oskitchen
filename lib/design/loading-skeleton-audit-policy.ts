import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  LOADING_SKELETON_CRITICAL_MODULES,
  LOADING_SKELETON_EXCEPTION_MARKER,
  LOADING_SKELETON_EXCEPTION_MODULES,
  LOADING_SKELETON_IMPORT,
  LOADING_SKELETON_PATTERNS_POLICY_ID,
  LOADING_SKELETON_PRIMITIVE_PATTERN,
} from "@/lib/design/loading-skeleton-patterns";

/**
 * DES-28 — loading skeleton audit policy.
 */

export const LOADING_SKELETON_AUDIT_POLICY_ID = LOADING_SKELETON_PATTERNS_POLICY_ID;

export type LoadingSkeletonModuleAudit = {
  module: string;
  usesSkeletonPrimitive: boolean;
  isException: boolean;
  passed: boolean;
};

export type LoadingSkeletonAuditReport = {
  policyId: typeof LOADING_SKELETON_AUDIT_POLICY_ID;
  modules: LoadingSkeletonModuleAudit[];
  passed: boolean;
};

export function auditLoadingSkeletonModule(
  modulePath: string,
  root = process.cwd(),
): LoadingSkeletonModuleAudit {
  const source = readFileSync(join(root, modulePath), "utf8");
  const isException =
    (LOADING_SKELETON_EXCEPTION_MODULES as readonly string[]).includes(modulePath) ||
    source.includes(LOADING_SKELETON_EXCEPTION_MARKER);
  const usesSkeletonPrimitive =
    LOADING_SKELETON_PRIMITIVE_PATTERN.test(source) || source.includes(LOADING_SKELETON_IMPORT);
  const passed = isException || usesSkeletonPrimitive;

  return {
    module: modulePath,
    usesSkeletonPrimitive,
    isException,
    passed,
  };
}

export function auditLoadingSkeleton(root = process.cwd()): LoadingSkeletonAuditReport {
  const modules = LOADING_SKELETON_CRITICAL_MODULES.map((modulePath) =>
    auditLoadingSkeletonModule(modulePath, root),
  );
  return {
    policyId: LOADING_SKELETON_AUDIT_POLICY_ID,
    modules,
    passed: modules.every((m) => m.passed),
  };
}
