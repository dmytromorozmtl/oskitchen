import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, normalize } from "node:path";

import {
  auditErrorStateModule,
  type ErrorStateModuleAudit,
} from "@/lib/design/error-state-audit-policy";
import {
  ERROR_STATE_FLEET_AUDIT_POLICY_ID,
  ERROR_STATE_REEXPORT_PATTERN,
} from "@/lib/design/error-state-patterns";

/**
 * DES-34 — fleet audit for all dashboard route error.tsx boundaries.
 */

export type ErrorStateFleetAuditReport = {
  policyId: typeof ERROR_STATE_FLEET_AUDIT_POLICY_ID;
  modules: ErrorStateModuleAudit[];
  passed: boolean;
  totalRoutes: number;
};

function collectDashboardErrorRoutes(root: string): string[] {
  const dashboardRoot = join(root, "app/dashboard");
  const results: string[] = [];

  function walk(dir: string) {
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
      const absolutePath = join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(absolutePath);
        continue;
      }
      if (entry.name === "error.tsx") {
        results.push(absolutePath.slice(root.length + 1));
      }
    }
  }

  walk(dashboardRoot);
  return results.sort();
}

function resolveReexportTarget(modulePath: string, root: string): string | null {
  const absolutePath = join(root, modulePath);
  if (!existsSync(absolutePath)) return null;
  const source = readFileSync(absolutePath, "utf8");
  const match = source.match(ERROR_STATE_REEXPORT_PATTERN);
  if (!match) return null;
  const target = normalize(join(dirname(modulePath), match[1]));
  const withExtension = target.endsWith(".tsx") ? target : `${target}.tsx`;
  return withExtension;
}

export function auditErrorStateFleetModule(
  modulePath: string,
  root = process.cwd(),
): ErrorStateModuleAudit {
  const direct = auditErrorStateModule(modulePath, root);
  if (direct.passed) return direct;

  const reexportTarget = resolveReexportTarget(modulePath, root);
  if (!reexportTarget) return direct;

  const delegated = auditErrorStateModule(reexportTarget, root);
  return {
    module: modulePath,
    usesErrorStatePrimitive: delegated.usesErrorStatePrimitive,
    isException: delegated.isException,
    passed: delegated.passed,
  };
}

export function auditErrorStateFleet(root = process.cwd()): ErrorStateFleetAuditReport {
  const modulePaths = collectDashboardErrorRoutes(root);
  const modules = modulePaths.map((modulePath) => auditErrorStateFleetModule(modulePath, root));
  return {
    policyId: ERROR_STATE_FLEET_AUDIT_POLICY_ID,
    modules,
    passed: modules.every((m) => m.passed),
    totalRoutes: modules.length,
  };
}
