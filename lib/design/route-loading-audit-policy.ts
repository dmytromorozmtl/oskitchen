import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  ROUTE_LOADING_CRITICAL_MODULES,
  ROUTE_LOADING_EXCEPTION_MARKER,
  ROUTE_LOADING_EXCEPTION_MODULES,
  ROUTE_LOADING_IMPORT,
  ROUTE_LOADING_PATTERNS_POLICY_ID,
  ROUTE_LOADING_PILOT_IMPORT,
  ROUTE_LOADING_PRIMITIVE_PATTERN,
  ROUTE_LOADING_STATES_IMPORT,
} from "@/lib/design/route-loading-patterns";

/**
 * DES-36 — route loading spinner consistency audit policy.
 */

export const ROUTE_LOADING_AUDIT_POLICY_ID = ROUTE_LOADING_PATTERNS_POLICY_ID;

export type RouteLoadingModuleAudit = {
  module: string;
  usesRouteLoadingPrimitive: boolean;
  isException: boolean;
  passed: boolean;
};

export type RouteLoadingAuditReport = {
  policyId: typeof ROUTE_LOADING_AUDIT_POLICY_ID;
  modules: RouteLoadingModuleAudit[];
  passed: boolean;
};

export function auditRouteLoadingModule(
  modulePath: string,
  root = process.cwd(),
): RouteLoadingModuleAudit {
  const source = readFileSync(join(root, modulePath), "utf8");
  const isException =
    (ROUTE_LOADING_EXCEPTION_MODULES as readonly string[]).includes(modulePath) ||
    source.includes(ROUTE_LOADING_EXCEPTION_MARKER);
  const usesRouteLoadingPrimitive =
    modulePath === "components/feedback/loading-state.tsx" ||
    ROUTE_LOADING_PRIMITIVE_PATTERN.test(source) ||
    source.includes(ROUTE_LOADING_IMPORT) ||
    source.includes(ROUTE_LOADING_STATES_IMPORT) ||
    source.includes(ROUTE_LOADING_PILOT_IMPORT);
  const passed = isException || usesRouteLoadingPrimitive;

  return {
    module: modulePath,
    usesRouteLoadingPrimitive,
    isException,
    passed,
  };
}

export function auditRouteLoading(root = process.cwd()): RouteLoadingAuditReport {
  const modules = ROUTE_LOADING_CRITICAL_MODULES.map((modulePath) =>
    auditRouteLoadingModule(modulePath, root),
  );
  return {
    policyId: ROUTE_LOADING_AUDIT_POLICY_ID,
    modules,
    passed: modules.every((m) => m.passed),
  };
}
