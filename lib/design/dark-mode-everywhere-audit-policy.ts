import { readFileSync } from "node:fs";
import { join } from "node:path";

import {
  findDarkModeLightOnlyViolations,
  hasLegacyDarkColorBridge,
} from "@/lib/design/dark-mode-consistency-audit-policy";
import { DARK_MODE_TOKEN_PATTERN } from "@/lib/design/dark-mode-consistency-policy";
import {
  DARK_MODE_EVERYWHERE_MODULES,
  DARK_MODE_EVERYWHERE_PATTERN_IMPORT,
  DARK_MODE_EVERYWHERE_POLICY_ID,
  DARK_MODE_EVERYWHERE_ROLE_MODULES,
} from "@/lib/design/dark-mode-everywhere-policy";

export type DarkModeEverywhereModuleAudit = {
  module: (typeof DARK_MODE_EVERYWHERE_MODULES)[number];
  violations: ReturnType<typeof findDarkModeLightOnlyViolations>;
  usesDarkModePatterns: boolean;
  tokenReferences: number;
  passed: boolean;
};

export type DarkModeEverywhereReport = {
  policyId: typeof DARK_MODE_EVERYWHERE_POLICY_ID;
  moduleCount: number;
  roleModuleCount: number;
  legacyDarkBridgePresent: boolean;
  modules: DarkModeEverywhereModuleAudit[];
  passed: boolean;
};

function isRoleModule(modulePath: string): boolean {
  return (DARK_MODE_EVERYWHERE_ROLE_MODULES as readonly string[]).includes(modulePath);
}

export function auditDarkModeEverywhereModule(
  modulePath: (typeof DARK_MODE_EVERYWHERE_MODULES)[number],
  root = process.cwd(),
): DarkModeEverywhereModuleAudit {
  const source = readFileSync(join(root, modulePath), "utf8");
  const violations = findDarkModeLightOnlyViolations(source);
  const usesDarkModePatterns = source.includes(DARK_MODE_EVERYWHERE_PATTERN_IMPORT);
  const tokenReferences = (source.match(DARK_MODE_TOKEN_PATTERN) ?? []).length;

  const rolePanel =
    modulePath.startsWith("components/roles/") && modulePath.endsWith("-role-panel.tsx");
  const rolePage = modulePath.startsWith("app/dashboard/roles/") && modulePath.endsWith("/page.tsx");

  const passed =
    violations.length === 0 &&
    (rolePanel
      ? usesDarkModePatterns && source.includes("roleTileToneClass")
      : rolePage
        ? usesDarkModePatterns || tokenReferences > 0
        : violations.length === 0);

  return {
    module: modulePath,
    violations,
    usesDarkModePatterns,
    tokenReferences,
    passed,
  };
}

export function auditDarkModeEverywhere(root = process.cwd()): DarkModeEverywhereReport {
  const modules = DARK_MODE_EVERYWHERE_MODULES.map((modulePath) =>
    auditDarkModeEverywhereModule(modulePath, root),
  );
  const legacyDarkBridgePresent = hasLegacyDarkColorBridge(
    readFileSync(join(root, "app/globals.css"), "utf8"),
  );

  return {
    policyId: DARK_MODE_EVERYWHERE_POLICY_ID,
    moduleCount: modules.length,
    roleModuleCount: DARK_MODE_EVERYWHERE_ROLE_MODULES.length,
    legacyDarkBridgePresent,
    modules,
    passed: modules.every((m) => m.passed) && legacyDarkBridgePresent,
  };
}

/** @internal */
export function darkModeEverywhereRoleModuleCount(): number {
  return DARK_MODE_EVERYWHERE_ROLE_MODULES.length;
}
